/*
  ========== THE DESITINATION (BACKEND URL) ==========
  - this tells the frontend where to find the server
*/
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const aiService = {
  /*
    1. Generate Dashboard Insight
  */
  /*
   ========== SERVICE OBJECT ==========
   - groups all the ai features into one place so i can import like this:
     import { aiService } from '../api/ai
  */
  async generateInsight(dashboardData: any) {
    const response = await fetch(`${API_URL}/api/ai/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dashboardData }),
    });
    return await response.json();
  },

  /**
   * 2. Summarize Query Results
   */
  async summarizeResults(results: any) {
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
  async askQuestion(question: string, context?: any) {
    const response = await fetch(`${API_URL}/api/ai/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    });
    return await response.json();
  },

  /**
   * 4. Categorize record
   */
  async categorizeRecord(record: any) {
    const response = await fetch(`${API_URL}/api/ai/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record }),
    });
    return await response.json();
  }
};
