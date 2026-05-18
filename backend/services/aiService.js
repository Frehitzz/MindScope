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

// =========== SANITIZATION TOOLS =============
// - helper functions, prevent the code from crashing if data is missing or "weird"
function sanitizeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function sanitizeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
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

// ============ 5. THE MAIN PUBLIC SERVICE =========
export const aiService = {
  async generateInsight(data) {
    // step 1: clean the data
    const sanitizedData = sanitizeInsightPayload(data);
    // step 2: get the ai model
    const model = getModel();
    // step 3: send the prompt and wait for the result
    const result = await model.generateContent(buildInsightPrompt(sanitizedData));
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

  async answerQuestion() {
    const error = new Error('Q&A feature not yet implemented.');
    error.statusCode = 501;
    throw error;
  },

  async categorizeRecord() {
    const error = new Error('Auto-categorization feature not yet implemented.');
    error.statusCode = 501;
    throw error;
  },
};
