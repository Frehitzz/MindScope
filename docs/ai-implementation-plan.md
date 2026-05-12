# AI Implementation Plan: MindScope Features

This document tracks the progress of the 4 key AI features for MindScope.

## 1. Feature Roadmap

### 🟢 Feature 1: Generate Insight
- **Description**: A button on the dashboard that sends data to Gemini and returns a business insight.
- **Files**:
    - `frontend/src/components/ai/GenerateInsight.tsx` (Component)
    - `backend/routes/ai.js` -> `/insight` (Route)
    - `backend/services/aiService.js` -> `generateInsight()` (Logic)

### 🟢 Feature 2: Query Summary
- **Description**: Automatic natural-language summary of data table results.
- **Files**:
    - `frontend/src/components/ai/QuerySummary.tsx` (Component)
    - `backend/routes/ai.js` -> `/summarize-results` (Route)
    - `backend/services/aiService.js` -> `summarizeResults()` (Logic)

### 🟢 Feature 3: Data Q&A Interface
- **Description**: Interactive chat interface where users ask questions about the mental health dataset.
- **Files**:
    - `frontend/src/components/ai/AIQuestionAnswering.tsx` (Component)
    - `backend/routes/ai.js` -> `/qa` (Route)
    - `backend/services/aiService.js` -> `answerQuestion()` (Logic)

### 🟢 Feature 4: Auto-Categorization
- **Description**: Automatically tagging and labeling records in the dataset using AI.
- **Files**:
    - `backend/routes/ai.js` -> `/categorize` (Route)
    - `backend/services/aiService.js` -> `categorizeRecord()` (Logic)

---

## 2. Structural Status
- [x] Backend Routes placeholder created.
- [x] Backend Service placeholder created.
- [x] Frontend Components (Insight, Summary, Q&A) placeholders created.
- [x] Frontend API helper stubs created.

## 3. Next Steps
1. **Implementation**: Start with Feature 1 (Generate Insight).
2. **Context**: Decide how much dataset context to send to the LLM for the Q&A feature.
