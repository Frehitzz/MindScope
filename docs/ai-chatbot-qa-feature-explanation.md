# AI Chatbot Q&A Feature Explanation

## Overview

This document explains the currently implemented AI chatbot Q&A feature in MindScope.

It covers:

1. Which files are involved
2. The role of each file
3. What triggers each file
4. What data each file receives
5. What data each file returns
6. The full request lifecycle from frontend to AI response

## Active Files Involved

The active Q&A flow currently uses these files:

- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/components/ai/ChatbotDrawer.tsx`
- `frontend/src/api/ai.ts`
- `backend/index.js`
- `backend/routes/ai.js`
- `backend/services/aiService.js`
- `data/Teen_Mental_Health_Dataset.cleaned.csv`

There is also one related file that exists but is not part of the live flow:

- `frontend/src/components/ai/AIQuestionAnswering.tsx`

## File-By-File Explanation

### `frontend/src/main.tsx`

**Role**

This is the frontend React entry point. It bootstraps the app and renders the root `App` component.

Without this file, the chatbot UI never mounts because the whole frontend would not start.

**What triggers it**

It runs when the frontend application loads in the browser.

**What data it receives**

It does not receive feature-specific chatbot data.

It receives:

- the DOM node with id `root`
- the `App` component import

**What data it returns**

It does not return request data.

It renders the React application into the browser DOM.

---

### `frontend/src/App.tsx`

**Role**

This is the main frontend layout and route shell.

For the Q&A feature, its important job is mounting `ChatbotDrawer` so the chatbot is available globally across the app.

**What triggers it**

It is triggered when `main.tsx` renders `<App />`.

**What data it receives**

It does not receive chatbot request payloads.

It receives routing and layout dependencies such as:

- `BrowserRouter`
- page components
- `ChatbotDrawer`

**What data it returns**

It returns rendered React UI.

For the chatbot specifically, it returns a page tree that includes:

```tsx
<ChatbotDrawer />
```

That is what makes the chatbot button and drawer appear in the app.

---

### `frontend/src/components/ai/ChatbotDrawer.tsx`

**Role**

This is the live frontend controller and UI for the chatbot feature.

It:

- renders the floating chatbot button
- opens and closes the drawer
- stores chat history in React state
- stores the current question text
- sends the user question to the backend through `aiService.askQuestion()`
- appends the AI answer or error message back into the chat

**What triggers it**

It is triggered in several ways:

- when `App.tsx` mounts it
- when the user clicks the floating chatbot button
- when the user types in the textarea
- when the user submits the form

The actual backend request happens when `handleSubmit()` runs after form submission.

**What data it receives**

It does not receive props.

Internally it receives and manages:

- `open: boolean`
- `messages: ChatMessage[]`
- `question: string`
- `loading: boolean`

When the user submits a question, it sends this data to the API layer:

```ts
trimmedQuestion: string
```

Example outbound value:

```ts
"Which platform shows the highest addiction level?"
```

**What data it returns**

It returns rendered React UI for:

- the chatbot launch button
- the drawer
- the chat transcript
- the loading state
- the input form

It does not return raw JSON directly, but it updates UI state with:

- a new user message
- a new assistant answer from `result.answer`
- or a fallback error message

Success path inside the component:

```ts
{
  id: string,
  role: 'assistant',
  content: result.answer
}
```

Error path inside the component:

```ts
{
  id: string,
  role: 'assistant',
  content: error.message
}
```

---

### `frontend/src/api/ai.ts`

**Role**

This is the frontend API client for AI features.

For the chatbot feature, it defines the request/response contract and sends the HTTP request to the backend.

The key method is:

```ts
aiService.askQuestion(question)
```

**What triggers it**

It is triggered when `ChatbotDrawer.tsx` calls:

```ts
await aiService.askQuestion(trimmedQuestion)
```

**What data it receives**

It receives one function argument:

```ts
question: string
```

It wraps that into this JSON request body:

```json
{
  "question": "Which platform shows the highest addiction level?"
}
```

It also reads:

- `VITE_BACKEND_URL` from frontend environment variables, if defined

If not defined, it uses:

```ts
http://localhost:3001
```

**What data it returns**

It returns:

```ts
Promise<QuestionAnswerResponse>
```

Response shape:

```ts
{
  answer: string;
  metadata?: {
    source?: string;
    generatedAt?: string;
  };
}
```

If the backend responds with a non-2xx status, `parseResponse()` throws an `Error` using the backend's `message` field.

---

### `backend/index.js`

**Role**

This is the backend server entry point.

For the chatbot feature, it:

- starts the Express app
- enables CORS for the frontend
- enables JSON body parsing
- mounts the AI routes at `/api/ai`

**What triggers it**

It is triggered when the backend server process starts.

After startup, it is involved every time the frontend sends a request to the backend.

**What data it receives**

It receives:

- environment variables such as `PORT` and `FRONTEND_ORIGIN`
- incoming HTTP requests

For chatbot requests specifically, it receives a POST request headed toward:

```http
/api/ai/qa
```

**What data it returns**

It does not produce the chatbot answer itself.

Its job is to forward the request into the correct route handler.

It also exposes:

```http
GET /health
```

which returns:

```json
{
  "status": "ok",
  "api": "MindScope AI Backend"
}
```

---

### `backend/routes/ai.js`

**Role**

This file defines the HTTP endpoints for AI features.

For the chatbot feature, the active endpoint is:

```http
POST /api/ai/qa
```

Its job is to:

- read the incoming request body
- validate the `question`
- call `aiService.answerQuestion(question)`
- return the service result as JSON
- map thrown errors into HTTP responses

**What triggers it**

It is triggered when the frontend sends:

```http
POST /api/ai/qa
```

**What data it receives**

It receives:

```ts
req.body = {
  question: string
}
```

Validation rule:

- `question` must be a string
- after trimming it must be at least 3 characters long

**What data it returns**

On success it returns HTTP `200` with:

```json
{
  "answer": "AI-generated answer",
  "metadata": {
    "source": "Teen_Mental_Health_Dataset.cleaned.csv",
    "generatedAt": "2026-05-18T00:00:00.000Z"
  }
}
```

On validation failure it returns HTTP `400` with:

```json
{
  "message": "A question with at least 3 characters is required."
}
```

On service or model failure it returns either the thrown status code or `500`, with:

```json
{
  "message": "Failed to answer question."
}
```

or the more specific thrown error message.

---

### `backend/services/aiService.js`

**Role**

This file contains the core chatbot logic.

For Q&A, it does all of the real work:

- sanitizes the incoming question
- loads and summarizes the cleaned dataset
- caches that dataset summary in memory
- selects the Gemini model
- builds the Q&A prompt
- sends the prompt to Gemini
- extracts the returned text
- reorders the response so analytical sentences come before pure limitation sentences
- returns the final answer plus metadata

**What triggers it**

It is triggered when `backend/routes/ai.js` calls:

```ts
await aiService.answerQuestion(question)
```

**What data it receives**

Its public method receives:

```ts
question: string
```

Inside the service, that question is transformed into:

- `cleanedQuestion`: trimmed and limited to 500 characters

It also reads:

- `GEMINI_API_KEY`
- optional `GEMINI_MODEL`
- the cleaned CSV dataset from `data/Teen_Mental_Health_Dataset.cleaned.csv`

Before asking Gemini, it builds a dataset summary from the CSV. That summary includes:

- total row count
- allowed columns
- numeric averages/min/max values
- category counts
- grouped depression-rate summaries
- Pearson correlations between selected columns

That summary becomes the evidence context for the model.

**What data it returns**

It returns:

```ts
{
  answer: string,
  metadata: {
    source: string,
    generatedAt: string
  }
}
```

Actual values look like:

```ts
{
  answer: "The data suggests ...",
  metadata: {
    source: "Teen_Mental_Health_Dataset.cleaned.csv",
    generatedAt: "2026-05-18T00:00:00.000Z"
  }
}
```

It can also throw errors such as:

- `400` if the final cleaned question is empty
- `500` if `GEMINI_API_KEY` is missing
- `502` if the model returns empty text

**Important internal behavior**

This file does not send raw dataset rows to Gemini one by one.

Instead, it converts the CSV into a compact summary string through helper functions such as:

- `parseCsv()`
- `buildDatasetSummary()`
- `buildQuestionPrompt()`
- `normalizeQuestionAnswer()`

So the chatbot is best described as summary-grounded Q&A, not full retrieval over raw rows.

---

### `data/Teen_Mental_Health_Dataset.cleaned.csv`

**Role**

This is the dataset grounding source for the chatbot.

The backend service reads this file to create the context summary that is injected into the AI prompt.

**What triggers it**

It is triggered the first time the backend needs to answer a question and `getDatasetSummary()` runs.

After that, the generated summary is cached in `datasetSummaryCache`, so later questions reuse the cached summary instead of rereading the CSV each time.

**What data it receives**

It does not receive program input because it is a static data file.

It contains cleaned dataset rows and columns such as:

- `age`
- `gender`
- `daily_social_media_hours`
- `platform_usage`
- `sleep_hours`
- `stress_level`
- `anxiety_level`
- `addiction_level`
- `depression_label`

**What data it returns**

The CSV file itself does not return values like a function.

When read by `aiService.js`, it effectively provides:

- raw CSV text
- parsed rows
- summarized dataset context for the AI prompt

---

### `frontend/src/components/ai/AIQuestionAnswering.tsx`

**Role**

This file is a placeholder UI component for Q&A, but it is not currently connected to the live chatbot flow.

It has an input, a button, and a static "AI response will appear here..." area, but no backend call.

**What triggers it**

Right now, it is not triggered by the live app because it is not mounted from `App.tsx` or another active page.

**What data it receives**

It only manages local state:

```ts
query: string
```

**What data it returns**

It returns placeholder React UI only.

It does not send a request and does not return AI answers.

## Request Lifecycle: Frontend to AI Response

### 1. Frontend app starts

`frontend/src/main.tsx` renders `App.tsx` into the browser.

### 2. Chatbot UI is mounted globally

`frontend/src/App.tsx` includes:

```tsx
<ChatbotDrawer />
```

That makes the chatbot launcher available throughout the app.

### 3. User opens the chatbot

The user clicks the floating chatbot button rendered by `ChatbotDrawer.tsx`.

This sets:

```ts
open = true
```

and the drawer becomes visible.

### 4. User types a question

The textarea in `ChatbotDrawer.tsx` updates the local `question` state on every change.

Example:

```ts
"Does higher stress seem associated with depression?"
```

### 5. User submits the form

When the form is submitted:

- `handleSubmit()` runs
- the question is trimmed
- empty questions are ignored
- duplicate sends are blocked while `loading` is true

Then the component immediately appends the user's message to the local chat history.

### 6. Frontend calls the API client

`ChatbotDrawer.tsx` calls:

```ts
await aiService.askQuestion(trimmedQuestion)
```

### 7. Frontend sends HTTP request

`frontend/src/api/ai.ts` sends:

```http
POST {API_URL}/api/ai/qa
Content-Type: application/json
```

Request body:

```json
{
  "question": "Does higher stress seem associated with depression?"
}
```

### 8. Express receives the request

`backend/index.js` has already mounted:

```ts
app.use('/api/ai', aiRoutes)
```

So Express forwards the request to the `/qa` route in `backend/routes/ai.js`.

### 9. Route validates the input

`backend/routes/ai.js` checks:

- does `req.body.question` exist
- is it a string
- is it at least 3 trimmed characters long

If validation fails, the lifecycle stops here with an HTTP `400` error response.

### 10. Route calls the AI service

If validation passes, the route calls:

```ts
await aiService.answerQuestion(question)
```

### 11. Service sanitizes the question

Inside `backend/services/aiService.js`:

- the question is trimmed
- it is limited to 500 characters
- an empty result throws a `400`

### 12. Service loads or reuses dataset summary

The service calls:

```ts
await getDatasetSummary()
```

This does one of two things:

- first request: reads `Teen_Mental_Health_Dataset.cleaned.csv`, parses it, and builds a summary
- later requests: reuses the cached summary string from memory

### 13. Service builds the prompt

`buildQuestionPrompt(question, datasetSummary)` creates a prompt that tells Gemini:

- answer only from MindScope dataset context
- avoid outside facts
- prefer analytical interpretation when exact detail is unavailable
- keep the answer to 2-4 concise sentences
- return a strict refusal only for out-of-scope questions

### 14. Service calls Gemini

The service gets the configured Gemini model using `GEMINI_API_KEY` and then runs:

```ts
model.generateContent(prompt)
```

Default model:

```ts
gemini-2.5-flash
```

### 15. Service cleans the AI output

After Gemini responds, the service:

- extracts plain text with `extractInsightText()`
- trims and normalizes whitespace
- reorders sentences with `normalizeQuestionAnswer()` so the strongest analytical content comes first and pure limitation text moves later

### 16. Service returns structured JSON

`answerQuestion()` returns:

```json
{
  "answer": "The data suggests ...",
  "metadata": {
    "source": "Teen_Mental_Health_Dataset.cleaned.csv",
    "generatedAt": "2026-05-18T00:00:00.000Z"
  }
}
```

### 17. Route sends the response back to the browser

`backend/routes/ai.js` returns that result with HTTP `200`.

### 18. Frontend parses the response

Back in `frontend/src/api/ai.ts`, `parseResponse()`:

- reads the JSON body
- throws an `Error` if the status is not OK
- otherwise returns the typed payload

### 19. Chat UI updates

Back in `ChatbotDrawer.tsx`:

- on success, a new assistant message is appended using `result.answer`
- on failure, a new assistant message is appended using the error text
- `loading` is reset to `false`

### 20. User sees the final AI answer

The drawer re-renders and the final assistant message appears in the conversation.

## Short Summary

The live chatbot Q&A feature works like this:

1. `App.tsx` mounts `ChatbotDrawer.tsx`
2. The user submits a question in the drawer
3. `frontend/src/api/ai.ts` sends `POST /api/ai/qa`
4. `backend/routes/ai.js` validates the request
5. `backend/services/aiService.js` summarizes the cleaned CSV, builds a prompt, and calls Gemini
6. The backend returns `{ answer, metadata }`
7. `ChatbotDrawer.tsx` appends the answer into the chat UI

The key implementation detail is that the AI is grounded on a generated summary of the cleaned CSV dataset, not on arbitrary internet knowledge and not on direct row-by-row retrieval.
