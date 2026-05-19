// ============ THIS FILE DEFINES HTTP ROUTES FOR AI FEATURES ===============
/*
  INSIGHT FEATURES
  - accepts the frontend request
  - vlaidates that the dashboard payload exists
  - passes the payload into the AI service
  - sends the service result back to the frontend
*/

import express from 'express';
import rateLimit from 'express-rate-limit';
import { aiService } from '../services/aiService.js';

const router = express.Router();

/**
 * FEATURE 1: Generate Insight
 * Description: Generates a natural-language business insight or recommendation based on dashboard data.
 */
router.post('/insight', async (req, res) => {
  try {
    const { data } = req.body ?? {};

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'A dashboard data payload is required.' });
    }

    const result = await aiService.generateInsight(data);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    return res.status(statusCode).json({
      message: error instanceof Error ? error.message : 'Failed to generate insight.',
    });
  }
});

/**
 * FEATURE 2: Query Summary
 * Description: Summarizes specific query results from the database.
 */
router.post('/summarize-results', async (req, res) => {
  // Placeholder for logic
  res.status(501).json({ message: 'Query summary feature not yet implemented' });
});

/**
 * Rate Limiter for Q&A Chatbot
 * Limits to 10 requests per 30 minutes to prevent abuse on free tier
 */
const qaRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    message: 'You have reached the limit of 10 questions per 30 minutes. Please wait a while before asking more to prevent API abuse.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipFailedRequests: true, // Do not count requests that result in an error (e.g. AI fails to answer)
});

/**
 * FEATURE 3: Q&A Contextual Answer
 * Description: answers user questions using the dataset as context (RAG-lite)
 */
router.post('/qa', qaRateLimiter, async (req, res) => {
  try {
    const { question } = req.body ?? {};

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return res.status(400).json({ message: 'A question with at least 3 characters is required.' });
    }

    const result = await aiService.answerQuestion(question);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    return res.status(statusCode).json({
      message: error instanceof Error ? error.message : 'Failed to answer question.',
    });
  }
});

/**
 * FEATURE 4: Auto Categorization
 * Description: Tags or labels dataset records.
 */
router.post('/categorize', async (req, res) => {
  // Placeholder for logic
  res.status(501).json({ message: 'Auto-categorization feature not yet implemented' });
});

export default router;
