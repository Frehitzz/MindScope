// ============ THIS FILE DEFINES HTTP ROUTES FOR AI FEATURES ===============
/*
  INSIGHT FEATURES
  - accepts the frontend request
  - vlaidates that the dashboard payload exists
  - passes the payload into the AI service
  - sends the service result back to the frontend
*/

import express from 'express';
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
 * FEATURE 3: Q&A Contextual Answer
 * Description: Answers user questions using the dataset as context (RAG-lite).
 */
router.post('/qa', async (req, res) => {
  // Placeholder for logic
  res.status(501).json({ message: 'Q&A feature not yet implemented' });
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
