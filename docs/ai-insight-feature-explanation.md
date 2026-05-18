# AI Insight Feature Explanation

## Overview

This document explains how the AI insight feature works in the MindScope codebase.

It covers:

1. The role of each file involved
2. What triggers each part
3. What data each part receives
4. What data each part returns
5. The full request lifecycle from frontend to AI response

## Files Involved

### `frontend/src/lib/dashboardAggregates.ts`

**Role**

This file fetches the dashboard's aggregate data from Supabase and converts it into the exact shape used by the dashboard UI and the AI insight feature.

**What triggers it**

It is triggered when the dashboard page loads and calls `fetchDashboardAggregateData()`.

**What data it receives**

It does not receive arguments directly.

Internally, it fetches data from these Supabase RPC functions:

- `get_dashboard_kpis`
- `get_platform_addiction_summary`
- `get_interaction_depression_summary`
- `get_usage_depression_summary`

**What data it returns**

It returns a `DashboardAggregateData` object:

```ts
{
  stats: DashboardStat[],
  platformData: PlatformData,
  interactionData: InteractionData,
  scatterData: ScatterPoint[],
}
```

That output becomes the dashboard state and later the AI request payload source.

---

### `frontend/src/pages/DashboardPage.tsx`

**Role**

This file is the main frontend page for the dashboard. It loads aggregate data, stores it in React state, and builds the payload that gets sent to the AI insight feature.

**What triggers it**

It is triggered when the user opens the dashboard route and the page renders.

The AI-specific part becomes active after the initial dashboard data finishes loading.

**What data it receives**

It receives aggregate dashboard data from `fetchDashboardAggregateData()`, including:

- `stats`
- `platformData`
- `interactionData`
- `scatterData`

It then reshapes that into `insightPayload`:

```ts
{
  stats: [{ label, value, delta }],
  platformData: { labels, addiction, max, min },
  interactionData: { labels, values },
  scatterData: [{ x, y }],
}
```

**What data it returns**

It returns rendered React UI.

For the AI insight feature specifically, it passes this prop into the button component:

```tsx
<GenerateInsight dashboardData={insightPayload} disabled={loading} />
```

---

### `frontend/src/components/ai/GenerateInsight.tsx`

**Role**

This is the frontend controller for the AI insight feature.

It:

- renders the `Generate Insight` button
- checks whether the request should be allowed
- opens the modal
- calls the backend through the API client
- shows loading, success, or error state

**What triggers it**

It is triggered when the user clicks the `Generate Insight` button.

It can also be triggered again through the retry button if the request fails.

The request is blocked if:

- the component is `disabled`
- a request is already running
- there is no dashboard data available

**What data it receives**

It receives these props:

```ts
{
  dashboardData: InsightRequest,
  disabled?: boolean
}
```

`dashboardData` contains:

- `stats`
- `platformData`
- `interactionData`
- `scatterData`

**What data it returns**

It returns React UI.

Internally, after the request completes:

- on success, it stores `response.insight`
- on failure, it stores a user-friendly error message

The visible output to the user is either:

- a loading message
- the AI-generated insight text
- an error message with retry option

---

### `frontend/src/api/ai.ts`

**Role**

This file is the frontend API client for AI-related backend requests.

It defines:

- the request type for the insight payload
- the response type from the backend
- the `generateInsight()` function that sends the network request

**What triggers it**

It is triggered when `GenerateInsight.tsx` calls:

```ts
aiService.generateInsight(dashboardData)
```

**What data it receives**

It receives one argument:

```ts
dashboardData: InsightRequest
```

The shape is:

```ts
{
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
}
```

It sends that to the backend in this JSON body:

```json
{
  "data": {
    "stats": [],
    "platformData": {},
    "interactionData": {},
    "scatterData": []
  }
}
```

**What data it returns**

It returns a `Promise<InsightResponse>`.

Success shape:

```ts
{
  insight: string;
  metadata?: {
    generatedAt?: string;
  };
}
```

If the backend returns an error status, it throws an `Error` with the backend message.

---

### `backend/index.js`

**Role**

This is the backend entry point.

It:

- starts the Express server
- enables CORS
- enables JSON request parsing
- mounts the AI routes under `/api/ai`

**What triggers it**

It is triggered when the backend server starts.

**What data it receives**

It receives:

- environment variables such as `PORT` and `FRONTEND_ORIGIN`
- incoming HTTP requests from the frontend

**What data it returns**

It does not return AI data directly.

Instead, it wires requests to the correct route handlers, including:

- `POST /api/ai/insight`
- `GET /health`

---

### `backend/routes/ai.js`

**Role**

This file defines the HTTP routes for AI features.

For the insight feature, it:

- accepts the frontend request
- validates that the dashboard payload exists
- passes the payload into the AI service
- sends the service result back to the frontend

**What triggers it**

It is triggered when the frontend sends:

```http
POST /api/ai/insight
```

**What data it receives**

It receives:

```ts
req.body.data
```

That `data` object is the dashboard payload sent from the frontend.

**What data it returns**

On success:

```json
{
  "insight": "AI-generated text",
  "metadata": {
    "schema": {},
    "generatedAt": "timestamp"
  }
}
```

On failure:

- `400` if `data` is missing or invalid
- `500` or another service-defined status code if the AI service fails

Error shape:

```json
{
  "message": "Failed to generate insight."
}
```

---

### `backend/services/aiService.js`

**Role**

This file contains the core AI logic.

It:

- validates and sanitizes the incoming dashboard payload
- selects the Gemini model
- builds the prompt
- sends the prompt to Gemini
- extracts the returned text
- returns the final AI result plus metadata

**What triggers it**

It is triggered when `backend/routes/ai.js` calls:

```ts
aiService.generateInsight(data)
```

**What data it receives**

It receives the raw dashboard payload from the route:

```ts
{
  stats,
  platformData,
  interactionData,
  scatterData
}
```

Inside the service, that payload is sanitized:

- strings are trimmed
- invalid numbers become `null`
- arrays are capped with `slice(...)`

Examples:

- `stats` is limited to 6 items
- `platformData` arrays are limited to 8 items
- `interactionData` arrays are limited to 6 items
- `scatterData` is limited to 12 points

**What data it returns**

It returns:

```ts
{
  insight: string,
  metadata: {
    schema: {
      stats: ['label', 'value', 'delta'],
      platformData: ['labels', 'addiction', 'max', 'min'],
      interactionData: ['labels', 'values'],
      scatterData: ['x', 'y'],
    },
    generatedAt: string,
  },
}
```

It can also throw errors such as:

- `400` if the dashboard payload is missing
- `500` if `GEMINI_API_KEY` is not configured
- `502` if Gemini returns empty text

## Request Lifecycle

### 1. Dashboard data is loaded

When the user opens the dashboard page, `DashboardPage.tsx` runs its `useEffect()` hook and calls `fetchDashboardAggregateData()`.

That function in `dashboardAggregates.ts` fetches aggregate metrics from Supabase using RPC calls.

### 2. Dashboard state is populated

The fetched aggregate data is stored in React state inside `DashboardPage.tsx`:

- `stats`
- `platformData`
- `interactionData`
- `scatterData`

This data powers both the visible charts and the AI insight feature.

### 3. AI payload is built on the frontend

`DashboardPage.tsx` creates `insightPayload` from the current state.

This payload is a clean summary of the current dashboard metrics and becomes the input to the AI feature.

### 4. Payload is passed into the insight component

The page renders:

```tsx
<GenerateInsight dashboardData={insightPayload} disabled={loading} />
```

At this point, the insight component has everything it needs, but it does not make a request yet.

### 5. User clicks "Generate Insight"

When the button is clicked, `GenerateInsight.tsx` runs `handleGenerateInsight()`.

Before sending anything, it checks:

- is the feature disabled
- is a request already in progress
- does the dashboard have data

If the checks pass, it:

- opens the modal
- resets old insight and error state
- sets loading state

### 6. Frontend sends the request

`GenerateInsight.tsx` calls:

```ts
aiService.generateInsight(dashboardData)
```

Then `frontend/src/api/ai.ts` sends a POST request to:

```http
/api/ai/insight
```

Request body:

```json
{
  "data": {
    "stats": [...],
    "platformData": {...},
    "interactionData": {...},
    "scatterData": [...]
  }
}
```

### 7. Express receives and routes the request

`backend/index.js` has already mounted the AI routes under `/api/ai`, so the request is forwarded to `backend/routes/ai.js`.

### 8. Route validates the payload

`backend/routes/ai.js` checks whether `req.body.data` exists and is an object.

If not, it immediately returns:

```json
{ "message": "A dashboard data payload is required." }
```

with status `400`.

If valid, it calls:

```ts
aiService.generateInsight(data)
```

### 9. AI service sanitizes the data

`backend/services/aiService.js` sanitizes the payload before sending it to Gemini.

This step ensures:

- missing strings get safe fallback values
- invalid numbers do not get passed through as bad data
- very large arrays are trimmed down

### 10. AI prompt is built

The service converts the sanitized dashboard data into a prompt that tells Gemini how to respond.

Important prompt rules include:

- return exactly 2 concise sentences
- keep the tone analytical and simple
- mention trends, comparisons, or unusual values
- do not claim causation
- do not invent facts outside the provided data

### 11. Gemini generates the insight

The service gets the Gemini model using `GEMINI_API_KEY` and `GEMINI_MODEL` or the default model:

- default model: `gemini-2.5-flash`

Then it sends the prompt using:

```ts
model.generateContent(...)
```

### 12. Response text is extracted

The service reads the returned Gemini text and normalizes whitespace.

If the model returns no usable text, the service throws an error.

### 13. Backend sends the final response

The service returns:

```json
{
  "insight": "Final AI-generated insight text",
  "metadata": {
    "schema": {
      "stats": ["label", "value", "delta"],
      "platformData": ["labels", "addiction", "max", "min"],
      "interactionData": ["labels", "values"],
      "scatterData": ["x", "y"]
    },
    "generatedAt": "2026-05-16T00:00:00.000Z"
  }
}
```

The route returns that to the frontend with HTTP 200.

### 14. Frontend shows the result

Back in `GenerateInsight.tsx`:

- success path: `response.insight` is shown in the modal
- error path: a friendly error message is shown instead

The user finally sees either:

- the generated two-sentence AI insight
- an error message with retry option

## Short Summary

The AI insight feature does not send raw database rows directly to Gemini.

Instead, the flow is:

1. Supabase aggregate RPCs produce summary data
2. The dashboard page stores that data in state
3. The user clicks the insight button
4. The frontend sends the summarized dashboard payload to the backend
5. The backend sanitizes it and builds a prompt
6. Gemini generates a short insight
7. The frontend displays the result in a modal
