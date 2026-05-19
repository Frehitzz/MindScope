/*
  ========== THE DESITINATION (BACKEND URL) ==========
  - this tells the frontend where to find the server
  - the response type from the backend 
  - the generateInsight() function that sends the network request
*/
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

type ApiErrorResponse = {
  message?: string;
};

type ApiRequestError = Error & {
  status?: number;
  resetTime?: number;
};

export type InsightRequest = {
  stats: Array<{ label: string; value: string; delta: string }>;
  platformData: {
    labels: string[];
    addiction: number[];
    max: number[];
    min: number[];
  };
  interactionData: {
    labels: string[];
    values: number[];
  };
  scatterData: Array<{ x: number; y: number }>;
};

export type InsightResponse = {
  insight: string;
  metadata?: {
    generatedAt?: string;
  };
};

export type QuestionAnswerResponse = {
  answer: string;
  suggestions?: string[];
  metadata?: {
    source?: string;
    generatedAt?: string;
  };
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as T | ApiErrorResponse | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : 'Request failed.';
    const error = new Error(message) as ApiRequestError;
    error.status = response.status;
    
    if (response.status === 429) {
      const resetHeader = response.headers.get('RateLimit-Reset');
      if (resetHeader) {
        error.resetTime = parseInt(resetHeader, 10);
      }
    }
    
    throw error;
  }

  return payload as T;
}

export const aiService = {
  /*
    1. Generate Dashboard Insight
  */
  /*
   ========== SERVICE OBJECT ==========
   - groups all the ai features into one place so i can import like this:
     import { aiService } from '../api/ai
  */
  async generateInsight(dashboardData: InsightRequest): Promise<InsightResponse> {
    const response = await fetch(`${API_URL}/api/ai/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dashboardData }),
    });
    return parseResponse<InsightResponse>(response);
  },

  /**
   * 2. Summarize Query Results
   */
  async summarizeResults(results: unknown) {
    // fetch - for sending requests over the internet
    const response = await fetch(`${API_URL}/api/ai/summarize-results`, {
      method: 'POST', // sending data to the server
      headers: { 'Content-Type': 'application/json' }, // Tells the server "Hey, I'm sending you a JSON object."
      body: JSON.stringify({ results }), // actual data (dataset results) being sent to the ai
    });
    return await response.json();
  },

  /**
   * 3. Q&A about the dataset
   */
  async askQuestion(question: string): Promise<QuestionAnswerResponse> {
    const response = await fetch(`${API_URL}/api/ai/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    return parseResponse<QuestionAnswerResponse>(response);
  },

  /**
   * 4. Categorize record
   */
  async categorizeRecord(record: unknown) {
    const response = await fetch(`${API_URL}/api/ai/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record }),
    });
    return await response.json();
  }
};
