/*
  ========== THIS FILE CONTAINES THE CORE AI LOGIC ===========
  - validates and sanitizes the incoming dahsboard paylod
  - selectes the gemini model
  - builds the prompt
  - sends thr prompt to gemini
  - returns the final AI result plus metadata
*/
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ======== 1. SETUP =============
// - loads the api keys from the .env file
dotenv.config();

// this is "blueprint" - defines what data fields the AI expects to see
const insightSchema = {
  stats: ['label', 'value', 'delta'],
  platformData: ['labels', 'addiction', 'max', 'min'],
  interactionData: ['labels', 'values'],
  scatterData: ['x', 'y'],
};

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_PATH = path.resolve(__dirname, '../../data/Teen_Mental_Health_Dataset.cleaned.csv');
const DATASET_PUBLIC_COLUMNS = [
  'age',
  'gender',
  'daily_social_media_hours',
  'platform_usage',
  'sleep_hours',
  'screen_time_before_sleep',
  'academic_performance',
  'physical_activity',
  'social_interaction_level',
  'stress_level',
  'anxiety_level',
  'addiction_level',
  'depression_label',
  'daily_social_media_hours_min_max',
];
const NUMERIC_COLUMNS = [
  'age',
  'daily_social_media_hours',
  'sleep_hours',
  'screen_time_before_sleep',
  'academic_performance',
  'physical_activity',
  'stress_level',
  'anxiety_level',
  'addiction_level',
  'depression_label',
];
const CATEGORICAL_COLUMNS = ['gender', 'platform_usage', 'social_interaction_level', 'depression_label'];
let datasetSummaryCache = null;

// ============== 2. MODEL CONFIGURATION ===========
// - decides which ai model to use and ensures the api key is valid
function getModelName() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured.');
    error.statusCode = 500;
    throw error;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: getModelName() });
}

function normalizeModelError(error, fallbackMessage) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes('429') ||
      message.includes('too many requests') ||
      message.includes('quota exceeded') ||
      message.includes('rate limit') ||
      message.includes('resource has been exhausted')
    ) {
      error.statusCode = 429;

      error.message = "The Google Gemini AI service is currently receiving too many requests from this free tier account. Please wait a minute and try again.";
    } else if (!Number.isInteger(error.statusCode)) {
      error.statusCode = 502;
    }

    return error;
  }

  const wrappedError = new Error(fallbackMessage);
  wrappedError.statusCode = 502;
  return wrappedError;
}

// =========== SANITIZATION TOOLS =============
// - helper functions, prevent the code from crashing if data is missing or "weird"
function sanitizeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function sanitizeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseCsv(csvText) {
  const [headerLine, ...lines] = csvText.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return lines
    .filter(Boolean)
    .map((line) => {
      const values = parseCsvLine(line);
      return headers.reduce((row, header, index) => {
        row[header] = values[index] ?? '';
        return row;
      }, {});
    });
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function summarizeNumericColumn(rows, column) {
  const values = rows.map((row) => toNumber(row[column])).filter((value) => value !== null);
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = values.length ? total / values.length : 0;
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  return `${column}: avg ${formatNumber(average)}, min ${formatNumber(min)}, max ${formatNumber(max)}`;
}

function countValues(rows, column) {
  const counts = new Map();

  rows.forEach((row) => {
    const value = row[column] === '' ? 'unknown' : String(row[column]);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([value, count]) => `${value}: ${count}`)
    .join(', ');
}

function summarizeGroupedRate(rows, groupColumn) {
  const groups = new Map();

  rows.forEach((row) => {
    const key = row[groupColumn] === '' ? 'unknown' : String(row[groupColumn]);
    const depression = toNumber(row.depression_label) ?? 0;
    const current = groups.get(key) ?? { count: 0, depressed: 0 };
    current.count += 1;
    current.depressed += depression === 1 ? 1 : 0;
    groups.set(key, current);
  });

  return Array.from(groups.entries())
    .sort((left, right) => right[1].count - left[1].count)
    .map(([key, value]) => {
      const percent = value.count ? (value.depressed / value.count) * 100 : 0;
      return `${key}: ${value.depressed}/${value.count} depressed (${formatNumber(percent)}%)`;
    })
    .join('; ');
}

function calculateCorrelation(rows, leftColumn, rightColumn) {
  const pairs = rows
    .map((row) => [toNumber(row[leftColumn]), toNumber(row[rightColumn])])
    .filter(([left, right]) => left !== null && right !== null);

  if (pairs.length < 2) return null;

  const leftMean = pairs.reduce((sum, [left]) => sum + left, 0) / pairs.length;
  const rightMean = pairs.reduce((sum, [, right]) => sum + right, 0) / pairs.length;
  let numerator = 0;
  let leftTotal = 0;
  let rightTotal = 0;

  pairs.forEach(([left, right]) => {
    const leftDiff = left - leftMean;
    const rightDiff = right - rightMean;
    numerator += leftDiff * rightDiff;
    leftTotal += leftDiff ** 2;
    rightTotal += rightDiff ** 2;
  });

  const denominator = Math.sqrt(leftTotal * rightTotal);
  return denominator ? numerator / denominator : null;
}

function buildDatasetSummary(rows) {
  const numericSummary = NUMERIC_COLUMNS.map((column) => summarizeNumericColumn(rows, column)).join('\n');
  const categorySummary = CATEGORICAL_COLUMNS.map((column) => `${column}: ${countValues(rows, column)}`).join('\n');
  const groupSummary = [
    `depression by platform_usage: ${summarizeGroupedRate(rows, 'platform_usage')}`,
    `depression by social_interaction_level: ${summarizeGroupedRate(rows, 'social_interaction_level')}`,
    `depression by gender: ${summarizeGroupedRate(rows, 'gender')}`,
  ].join('\n');
  const correlationSummary = [
    ['daily_social_media_hours', 'depression_label'],
    ['daily_social_media_hours', 'addiction_level'],
    ['sleep_hours', 'depression_label'],
    ['stress_level', 'depression_label'],
    ['anxiety_level', 'depression_label'],
    ['addiction_level', 'depression_label'],
    ['screen_time_before_sleep', 'sleep_hours'],
  ]
    .map(([left, right]) => {
      const correlation = calculateCorrelation(rows, left, right);
      return `${left} vs ${right}: ${correlation === null ? 'not available' : formatNumber(correlation)}`;
    })
    .join('\n');

  return `
Dataset name: MindScope Teen Mental Health cleaned dataset
Rows: ${rows.length}
Allowed columns: ${DATASET_PUBLIC_COLUMNS.join(', ')}

Numeric summary:
${numericSummary}

Category counts:
${categorySummary}

Grouped depression rates:
${groupSummary}

Pearson correlations:
${correlationSummary}
`.trim();
}

async function getDatasetSummary() {
  if (datasetSummaryCache) return datasetSummaryCache;

  const csvText = await fs.readFile(DATASET_PATH, 'utf8');
  const rows = parseCsv(csvText);
  datasetSummaryCache = buildDatasetSummary(rows);
  return datasetSummaryCache;
}

// main cleaner, trims arrays and sets to defaults so the ai not too overwhelmed
function sanitizeInsightPayload(data) {
  if (!data || typeof data !== 'object') {
    const error = new Error('Dashboard data is required.');
    error.statusCode = 400;
    throw error;
  }

  const stats = Array.isArray(data.stats)
    ? data.stats
      .slice(0, 6)
      .map((item) => ({
        label: sanitizeString(item?.label, 'Unknown metric'),
        value: sanitizeString(item?.value, 'N/A'),
        delta: sanitizeString(item?.delta, ''),
      }))
    : [];

  const platformData = {
    labels: Array.isArray(data.platformData?.labels)
      ? data.platformData.labels.slice(0, 8).map((label) => sanitizeString(label, 'Unknown'))
      : [],
    addiction: Array.isArray(data.platformData?.addiction)
      ? data.platformData.addiction.slice(0, 8).map(sanitizeNumber)
      : [],
    max: Array.isArray(data.platformData?.max)
      ? data.platformData.max.slice(0, 8).map(sanitizeNumber)
      : [],
    min: Array.isArray(data.platformData?.min)
      ? data.platformData.min.slice(0, 8).map(sanitizeNumber)
      : [],
  };

  const interactionData = {
    labels: Array.isArray(data.interactionData?.labels)
      ? data.interactionData.labels.slice(0, 6).map((label) => sanitizeString(label, 'Unknown'))
      : [],
    values: Array.isArray(data.interactionData?.values)
      ? data.interactionData.values.slice(0, 6).map(sanitizeNumber)
      : [],
  };

  const scatterData = Array.isArray(data.scatterData)
    ? data.scatterData.slice(0, 12).map((point) => ({
      x: sanitizeNumber(point?.x),
      y: sanitizeNumber(point?.y),
    }))
    : [];

  return { stats, platformData, interactionData, scatterData };
}

/* ==================================================
    PROMPT ENGINEERING FOR THE AI INSIGHT GENERATOR
   ==================================================
*/
function buildInsightPrompt(data) {
  return `
You are an AI analytics assistant for a teen mental health dashboard.

Analyze only the dataset statistics provided below.

Instructions:
- Return exactly 2 concise sentences.
- Keep the tone analytical but easy to understand.
- Use simple language.
- Include relevant emojis naturally.
- Focus on noticeable trends, correlations, comparisons, or unusually high/low values.
- Do not claim direct causation.
- Do not invent information outside the provided data.
- Do not mention JSON, prompts, datasets, AI limitations, or technical terms.
- Avoid repeating the same metric multiple times.
- Make the response sound like a real dashboard insight for students or researchers.

Dashboard data:
${JSON.stringify(data, null, 2)}
`.trim();
}

/* ==================================================
    PROMPT ENGINEERING FOR THE AI Q&A CHATBOT
   ==================================================
*/
function buildQuestionPrompt(question, datasetSummary) {
  return `
You are MindScope's dataset chatbot.

Answer using only the MindScope Teen Mental Health cleaned dataset context below.
Behave like a careful analytical dashboard assistant, not a strict retrieval system.

Rules:
- If the question is not about this dataset, answer exactly: "I can only answer questions about the MindScope teen mental health dataset."
- Use only the provided dataset context as evidence.
- Start with the strongest supported interpretation or trend you can infer from the available context.
- Prefer partial analytical reasoning over refusal when exact metrics are unavailable.
- You may give cautious interpretation, comparison, trend analysis, and likely implications when they are supported by the data summary.
- Do not use outside facts, medical advice, diagnosis, or unsupported explanations.
- Do not invent columns, rows, sources, or exact values not present in the context.
- Never invent correlations, statistics, subgroup results, predictions, or unsupported conclusions.
- When exact detail is unavailable, give the strongest supported interpretation first, then add a short limitation near the end.
- Keep limitation language brief. Use concise phrasing such as "though stronger comparisons are unavailable" or "within the available dashboard context".
- Prefer phrases like "the data suggests", "may indicate", "appears associated", "visible trends imply", or "within the available dashboard context".
- Explain correlations as associations, not causation.
- Keep the answer to 2-4 concise sentences.
- Sound natural, analytical, and conversational, like a real analytics assistant.
- Do not sound like documentation, policy text, or API validation.
- Do not lead with a limitation unless the question is clearly outside the dataset scope.
- At the very end of your response, you MUST provide exactly 3 short follow-up questions the user could ask next based on this topic.
- Format the follow-up questions exactly like this on a new line: "SUGGESTIONS: Question 1? | Question 2? | Question 3?"

Response pattern:
- Sentence 1: lead with the most defensible interpretation from the data.
- Sentence 2: add supporting comparison, association, or trend if available.
- Final phrase or sentence: briefly mention the main limitation only if needed.
- New line and then exactly: SUGGESTIONS: ...

Dataset context:
${datasetSummary}

User question:
${question}
`.trim();
}

// cleans up the text response coming back from the AI
function extractInsightText(response) {
  const text = response?.response?.text?.();
  const cleaned = typeof text === 'string' ? text.trim().replace(/\s+/g, ' ') : '';

  if (!cleaned) {
    const error = new Error('The AI service returned an empty insight.');
    error.statusCode = 502;
    throw error;
  }

  return cleaned;
}

function normalizeQuestionAnswer(answer) {
  const trimmed = sanitizeString(answer);

  if (!trimmed) {
    const error = new Error('The AI service returned an empty answer.');
    error.statusCode = 502;
    throw error;
  }

  if (trimmed === 'I can only answer questions about the MindScope teen mental health dataset.') {
    return trimmed;
  }

  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return trimmed;
  }

  const limitationPattern = /^(the dataset does not|the available data does not|the dashboard context does not|there is not enough|insufficient|this dataset does not|within the available dashboard context, the dataset does not)/i;
  const analyticalPattern = /\b(suggests?|may indicate|appears associated|visible trends imply|within this dataset|the data shows|the trend|association|compared with|higher|lower)\b/i;

  const analyticalSentences = [];
  const limitationSentences = [];

  sentences.forEach((sentence) => {
    if (limitationPattern.test(sentence) && !analyticalPattern.test(sentence)) {
      limitationSentences.push(sentence);
    } else {
      analyticalSentences.push(sentence);
    }
  });

  const ordered = [...analyticalSentences, ...limitationSentences];
  return ordered.join(' ').replace(/\s+/g, ' ').trim();
}

// ============ 5. THE MAIN PUBLIC SERVICE =========
export const aiService = {
  async generateInsight(data) {
    // step 1: clean the data
    const sanitizedData = sanitizeInsightPayload(data);
    // step 2: get the ai model
    const model = getModel();
    // step 3: send the prompt and wait for the result
    let result;

    try {
      result = await model.generateContent(buildInsightPrompt(sanitizedData));
    } catch (error) {
      throw normalizeModelError(error, 'Failed to generate insight.');
    }

    // step 4: extract the text
    const insight = extractInsightText(result);

    // final output: the text plus some helpful info about the year it was made
    return {
      insight,
      metadata: {
        schema: insightSchema,
        generatedAt: new Date().toISOString(),
      },
    };
  },

  async summarizeResults() {
    const error = new Error('Query summary feature not yet implemented.');
    error.statusCode = 501;
    throw error;
  },

  async answerQuestion(question) {
    const cleanedQuestion = sanitizeString(question).slice(0, 500);

    if (!cleanedQuestion) {
      const error = new Error('Question is required.');
      error.statusCode = 400;
      throw error;
    }

    const datasetSummary = await getDatasetSummary();
    const model = getModel();
    let result;

    try {
      result = await model.generateContent(buildQuestionPrompt(cleanedQuestion, datasetSummary));
    } catch (error) {
      throw normalizeModelError(error, 'Failed to answer question.');
    }

    let rawText = extractInsightText(result);

    let suggestions = [];
    const suggestionsMatch = rawText.match(/SUGGESTIONS:\s*(.*)/i);
    if (suggestionsMatch) {
      suggestions = suggestionsMatch[1].split('|').map((s) => s.trim()).filter(Boolean);
      rawText = rawText.replace(/SUGGESTIONS:\s*(.*)/i, '').trim();
    }

    const answer = normalizeQuestionAnswer(rawText);

    return {
      answer,
      suggestions,
      metadata: {
        source: path.basename(DATASET_PATH),
        generatedAt: new Date().toISOString(),
      },
    };
  },

  async categorizeRecord() {
    const error = new Error('Auto-categorization feature not yet implemented.');
    error.statusCode = 501;
    throw error;
  },
};
