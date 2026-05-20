MINDSCOPE SOURCE CODE DOCUMENTATION

Project Name: MindScope
Project Type: Teen Mental Health Analytics Dashboard
Documentation Purpose: Source code explanation for the full application
Prepared For: School project documentation


1. PROJECT OVERVIEW

MindScope is a web-based dashboard that presents analytics from a teen mental health dataset. The project is designed for educational and demonstration purposes. It should not be treated as a clinical, diagnostic, or medical decision-making system.

The application helps users view summarized patterns from the dataset, browse records through a data table, generate AI-assisted dashboard insights, ask dataset-related questions through a chatbot, and view a live weather widget in the top bar.

The project is divided into three main parts:

Frontend: React, TypeScript, Vite, Tailwind CSS, Chart.js, Supabase client
Backend: Node.js, Express, Groq AI API, weather location proxy
Data Pipeline: Python scripts for uploading and cleaning the CSV dataset


2. MAIN PURPOSE OF THE SYSTEM

The main purpose of MindScope is to make a teen mental health dataset easier to understand through visual summaries, filtered table views, and AI-assisted explanations.

The system focuses on:

- Social media usage
- Platform usage
- Sleep hours
- Stress level
- Anxiety level
- Addiction level
- Social interaction level
- Depression label

The dashboard shows aggregated information instead of exposing the full raw dataset directly to the browser.


3. HIGH-LEVEL SYSTEM ARCHITECTURE

The system follows this architecture:

Frontend React App
The user interacts with the dashboard, pages, charts, data table, weather widget, and AI chatbot.

Supabase Database
The frontend reads public aggregate data and a reduced public table view from Supabase.

Backend Express Server
The backend handles AI requests and weather reverse-geocoding requests.

External APIs
The project uses Open-Meteo for weather data, Nominatim/OpenStreetMap for location labels, and Groq for AI-generated responses.

Python Data Scripts
The data folder contains scripts for uploading the original CSV and generating the cleaned dataset.


4. PROJECT FOLDER STRUCTURE

Root folder:

- README.md
- package.json
- frontend
- backend
- data
- docs
- scratch

frontend folder:

- Contains the React application.
- Contains routes, pages, components, API clients, types, styles, and public assets.

backend folder:

- Contains the Express server.
- Contains AI routes, weather routes, and AI service logic.

data folder:

- Contains the original dataset CSV.
- Contains the cleaned dataset CSV.
- Contains Python scripts for cleaning and uploading data.

docs folder:

- Contains documentation, SQL setup files, implementation notes, and feature explanations.


5. FRONTEND OVERVIEW

The frontend is located in:

frontend/

The frontend is built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Chart.js
- Supabase JavaScript client
- Lucide React icons
- SheetJS for Excel export

The frontend is responsible for:

- Rendering the application layout
- Showing the dashboard charts
- Fetching public aggregate data from Supabase
- Showing the insight summary page
- Showing the data table
- Handling search, filtering, sorting, pagination, and export
- Sending AI requests to the backend
- Showing the floating chatbot
- Showing the live weather widget


6. FRONTEND ENTRY POINT

File:

frontend/src/main.tsx

Purpose:

This file starts the React application and mounts it into the browser DOM.

It imports the main App component and renders it into the root HTML element.


7. MAIN APPLICATION LAYOUT

File:

frontend/src/App.tsx

Purpose:

This file defines the main application layout and routes.

It uses BrowserRouter from React Router and renders the shared layout:

- Sidebar
- Topbar
- Main page content
- Chatbot drawer

Routes:

- / shows DashboardPage
- /insight shows InsightPage
- /data-table shows DataTablePage

The ChatbotDrawer is mounted globally, so the chatbot is available across the whole application.


8. SIDEBAR COMPONENT

File:

frontend/src/components/Sidebar.tsx

Purpose:

The Sidebar provides navigation between the main pages.

Desktop behavior:

- Shows a vertical sidebar.
- Can collapse and expand.
- Displays navigation links with icons.

Mobile behavior:

- Shows a bottom navigation bar.
- Provides quick access to Dashboard, Insight, and Data Table.

Main navigation items:

- Dashboard
- Insight
- Data Table


9. TOPBAR COMPONENT AND WEATHER WIDGET

File:

frontend/src/components/Topbar.tsx

Purpose:

The Topbar displays the mobile logo area and the live weather widget.

The weather widget does the following:

- Checks if browser geolocation is available.
- Requests the user's location permission.
- Uses latitude and longitude to fetch live weather from Open-Meteo.
- Calls the backend weather route to resolve a readable location label.
- Displays weather icon, temperature, weather description, humidity, location, and polling status.
- Refreshes only the weather data every 30 seconds.
- Keeps the first successful location label instead of repeatedly requesting it.

Weather widget states:

- Loading live weather...
- Ready state with weather values
- Refreshing state during polling
- Error state when location is blocked or unavailable

Example ready display:

```
[weather icon] 33 C Drizzle | [humidity icon] 57% | [location icon] Taguig | 30s live
```

The weather widget is designed to work on desktop and mobile topbar layouts.


10. DASHBOARD PAGE

File:

frontend/src/pages/DashboardPage.tsx

Purpose:

The Dashboard page is the main analytics page of the application.

It shows:

- Statistic cards
- Platform addiction chart
- Depression rate by social interaction chart
- Usage hours versus depression rate chart
- Quick insight cards
- Generate Insight button

Data source:

The page calls fetchDashboardAggregateData from:

frontend/src/lib/dashboardAggregates.ts

That function reads aggregate results from Supabase RPC functions.

Charts:

- Bar chart for average addiction level by platform
- Scatter/lollipop style chart for depression rate by interaction group
- Line chart for daily social media usage versus depression rate

Loading behavior:

The dashboard shows skeleton loading cards and chart placeholders while the data is loading.


11. DASHBOARD AGGREGATE DATA LOGIC

File:

frontend/src/lib/dashboardAggregates.ts

Purpose:

This file connects the dashboard to Supabase aggregate RPC functions.

It calls these Supabase RPCs:

- get_dashboard_kpis
- get_platform_addiction_summary
- get_interaction_depression_summary
- get_usage_depression_summary

After fetching the data, it transforms the results into the shapes expected by the dashboard charts and cards.

This keeps the dashboard from directly reading the full cleaned table in the browser.


12. ANALYTICS HELPER LOGIC

File:

frontend/src/lib/analytics.ts

Purpose:

This file contains helper functions for transforming Supabase rows into frontend display data.

Main responsibilities:

- Build dashboard statistic cards
- Group addiction data by platform
- Group depression rate by interaction level
- Group depression rate by rounded usage hour
- Build written insight summaries for the Insight page

Examples of generated summaries:

- Which platform has the highest average addiction level
- Which social interaction group has the highest depression rate
- How daily social media hours relate to depression rate in the dataset


13. INSIGHT PAGE

File:

frontend/src/pages/InsightPage.tsx

Purpose:

The Insight page shows written explanations generated from the dashboard aggregate data.

It fetches the same aggregate data used by the dashboard, then builds readable summary cards.

Main insight cards:

- Addiction Level by Platform
- Depression Rate by Interaction Group
- Usage Hours vs. Depression Rate

The summaries are generated by local helper functions in analytics.ts, not by the AI backend.


14. DATA TABLE PAGE

File:

frontend/src/pages/DataTablePage.tsx

Purpose:

The Data Table page lets users browse individual student wellbeing records from a reduced public Supabase view.

Main features:

- Server-side pagination
- Search
- Sorting
- Platform filter
- Social interaction filter
- Depression filter
- Daily usage filter
- Mobile filter drawer
- Excel export

Data source:

public_teen_mental_health_table

This is a reduced public view instead of the full raw cleaned table.

Displayed columns:

- ID
- Gender
- Social Interaction
- Daily Social Media
- Primary Platform
- Depression Status

Export behavior:

The Export Data button uses SheetJS to export filtered records to:

MindScope_Data.xlsx


15. SUPABASE FRONTEND CLIENT

File:

frontend/src/api/supabase.ts

Purpose:

This file creates the Supabase client used by the frontend.

It reads the following environment variables:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

If either variable is missing, the frontend throws an error because it cannot connect to Supabase.

The frontend should only use public browser-safe values. Service-role keys should never be placed in frontend environment files.


16. AI FRONTEND API CLIENT

File:

frontend/src/api/ai.ts

Purpose:

This file contains the frontend functions used to call the backend AI endpoints.

Main functions:

- generateInsight
- summarizeResults
- askQuestion
- categorizeRecord

Currently active features:

- generateInsight
- askQuestion

Placeholder or incomplete features:

- summarizeResults
- categorizeRecord

The file also handles API errors and rate-limit metadata so the UI can show friendly messages.


17. AI GENERATE INSIGHT COMPONENT

File:

frontend/src/components/ai/GenerateInsight.tsx

Purpose:

This component renders the Generate Insight button on the dashboard.

When clicked, it sends the current dashboard data to the backend AI insight endpoint.

Main behavior:

- Prevents requests while dashboard data is still loading.
- Prevents duplicate clicks while an AI request is already running.
- Opens a modal.
- Shows loading state.
- Shows the generated insight.
- Shows a friendly error if the AI service is busy or unavailable.

Backend endpoint used:

POST /api/ai/insight


18. AI CHATBOT COMPONENT

File:

frontend/src/components/ai/ChatbotDrawer.tsx

Purpose:

This component renders the floating chatbot button and chatbot drawer.

The chatbot is named Cryztynn in the UI.

Main behavior:

- Opens and closes the drawer.
- Stores chat history in React state.
- Stores the current user question.
- Sends questions to the backend through aiService.askQuestion.
- Displays AI answers.
- Displays suggested follow-up questions.
- Shows a loading state while the backend is answering.
- Handles rate-limit errors with a countdown and retry option.

Backend endpoint used:

POST /api/ai/qa


19. SHARED UI COMPONENTS

Files:

frontend/src/components/ChartCard.tsx
frontend/src/components/SectionHeader.tsx
frontend/src/components/StatCard.tsx

Purpose:

These components keep the dashboard UI consistent.

ChartCard:

- Provides a consistent card container for chart sections.

SectionHeader:

- Provides consistent section titles and optional badges.

StatCard:

- Displays dashboard KPI values with icons and supporting text.


20. FRONTEND TYPES

Files:

frontend/src/types/teenMentalHealth.ts
frontend/src/types/database.ts

Purpose:

These files define TypeScript types for dataset rows, Supabase database objects, and dashboard response shapes.

They help make the frontend safer by checking that the app is using the correct field names and expected data types.


21. FRONTEND STYLING

Files:

frontend/src/index.css
frontend/src/App.css

Purpose:

These files define the global styling and application-level styles.

The project uses Tailwind CSS classes throughout the React components.

The visual design uses a calm dashboard style with colors such as sage, forest, cream, dusk, mist, and card backgrounds.


22. BACKEND OVERVIEW

The backend is located in:

backend/

The backend is built with:

- Node.js
- Express
- CORS
- dotenv
- express-rate-limit
- Groq SDK

The backend is responsible for:

- Serving AI endpoints
- Protecting the AI Q&A endpoint with rate limits
- Calling Groq for AI responses
- Reading the cleaned CSV dataset for chatbot context
- Providing a weather reverse-geocoding proxy
- Providing a health check endpoint


23. BACKEND ENTRY POINT

File:

backend/index.js

Purpose:

This file starts the Express server.

Main responsibilities:

- Load environment variables
- Create the Express app
- Configure CORS
- Configure JSON body parsing
- Mount AI routes under /api/ai
- Mount weather routes under /api/weather
- Add /health endpoint
- Start the server

Default backend port:

3001

Health check endpoint:

GET /health


24. BACKEND AI ROUTES

File:

backend/routes/ai.js

Purpose:

This file defines the HTTP routes for AI features.

Active routes:

POST /api/ai/insight
Generates a short AI insight from dashboard data.

POST /api/ai/qa
Answers user questions about the MindScope teen mental health dataset.

Placeholder routes:

POST /api/ai/summarize-results
Currently returns 501 because the feature is not implemented.

POST /api/ai/categorize
Currently returns 501 because the feature is not implemented.

Q&A rate limiting:

The Q&A route is limited to 10 requests per 30 minutes per IP address.

This prevents overuse of the AI service and helps protect the project from API abuse.


25. BACKEND AI SERVICE

File:

backend/services/aiService.js

Purpose:

This file contains the core AI logic.

Main responsibilities:

- Load the Groq API key
- Select the Groq model
- Read the cleaned dataset CSV
- Build a summarized dataset context
- Build prompts for AI insight generation
- Build prompts for dataset Q&A
- Call Groq chat completions
- Normalize AI errors
- Parse AI responses
- Extract follow-up suggestions from chatbot answers

Default AI model:

llama-3.1-8b-instant

Environment variable for overriding the model:

GROQ_MODEL

Required backend AI key:

GROQ_API_KEY


26. AI INSIGHT FLOW

The AI insight feature works like this:

1. DashboardPage loads aggregate data from Supabase.
2. The user clicks Generate Insight.
3. GenerateInsight sends the current dashboard data to the frontend API client.
4. frontend/src/api/ai.ts sends a POST request to /api/ai/insight.
5. backend/routes/ai.js validates the request body.
6. backend/services/aiService.js sanitizes the dashboard payload.
7. The backend builds a prompt for Groq.
8. Groq returns a short insight.
9. The backend sends the insight back to the frontend.
10. The modal displays the generated insight.


27. AI CHATBOT FLOW

The chatbot feature works like this:

1. The user opens the floating chatbot drawer.
2. The user types a question about the dataset.
3. ChatbotDrawer sends the question through aiService.askQuestion.
4. The frontend sends a POST request to /api/ai/qa.
5. The backend validates the question.
6. The backend reads or reuses a cached summary of the cleaned CSV.
7. The backend builds a dataset-only prompt for Groq.
8. Groq generates an answer and three follow-up suggestions.
9. The backend separates the answer from the suggestions.
10. The frontend shows the answer and updates the suggestion buttons.

The chatbot is instructed to answer only from the MindScope dataset context and avoid unsupported medical claims.


28. WEATHER BACKEND ROUTE

File:

backend/routes/weather.js

Purpose:

This file provides a backend route for reverse geocoding.

Endpoint:

GET /api/weather/location

Required query parameters:

- latitude
- longitude

External service used:

Nominatim/OpenStreetMap reverse geocoding

Why this backend route exists:

The frontend gets coordinates from the browser, but the backend normalizes the readable location label before returning it to the widget.

Returned values:

- locationLabel
- place


29. WEATHER WIDGET FLOW

The weather widget works like this:

1. Topbar checks if geolocation is available.
2. Browser asks the user for location permission.
3. If permission is granted, the browser returns latitude and longitude.
4. Topbar fetches weather from Open-Meteo.
5. Topbar calls the backend weather route to get a readable location label.
6. Topbar displays weather data in the top bar.
7. Topbar starts a 30-second polling interval.
8. Every 30 seconds, only the weather request runs again.
9. The location label is kept from the first successful lookup.
10. The widget shows a Refreshing state while polling is active.


30. DATA PIPELINE OVERVIEW

The data pipeline is located in:

data/

Main files:

- Teen_Mental_Health_Dataset.csv
- Teen_Mental_Health_Dataset.cleaned.csv
- cleaning.py
- run_cleaning_pipeline.py
- upload_to_supabase.py
- config.py
- cleaning_summary.json

Purpose:

The data pipeline prepares the dataset for the dashboard and uploads it to Supabase.


31. ORIGINAL DATASET

File:

data/Teen_Mental_Health_Dataset.csv

Purpose:

This is the original CSV dataset used by the project.

Main columns:

- age
- gender
- daily_social_media_hours
- platform_usage
- sleep_hours
- screen_time_before_sleep
- academic_performance
- physical_activity
- social_interaction_level
- stress_level
- anxiety_level
- addiction_level
- depression_label


32. DATA CLEANING LOGIC

File:

data/cleaning.py

Purpose:

This file contains reusable cleaning functions.

Main cleaning steps:

- Load the CSV dataset.
- Handle missing values.
- Add missing-value flag columns.
- Fill numeric missing values with the median.
- Fill categorical missing values with the mode.
- Normalize daily_social_media_hours using min-max scaling.
- Detect and remove outliers using the IQR method.

Output:

The cleaning functions return a cleaned DataFrame and summaries of the cleaning work.


33. CLEANING PIPELINE RUNNER

File:

data/run_cleaning_pipeline.py

Purpose:

This file runs the full cleaning process.

Main responsibilities:

- Load environment settings.
- Load the original CSV.
- Run the cleaning functions.
- Write the cleaned CSV.
- Write cleaning_summary.json.
- Upload the cleaned dataset to Supabase.

Output files:

- data/Teen_Mental_Health_Dataset.cleaned.csv
- data/cleaning_summary.json


34. SUPABASE UPLOAD SCRIPT

File:

data/upload_to_supabase.py

Purpose:

This file uploads CSV data to Supabase through the Supabase REST API.

Main behavior:

- Reads the dataset into a pandas DataFrame.
- Optionally clears existing rows to avoid duplicates.
- Converts the DataFrame into JSON records.
- Uploads records in chunks.

Default chunk size:

200 records

Tables used:

- teen_mental_health
- teen_mental_health_cleaned


35. DATA CONFIGURATION

File:

data/config.py

Purpose:

This file centralizes data pipeline settings.

It reads:

- data/.env
- environment variables from the current shell

Important environment variables:

- SUPABASE_URL
- SUPABASE_KEY
- SUPABASE_TABLE_NAME
- SUPABASE_CLEANED_TABLE_NAME
- UPLOAD_CHUNK_SIZE


36. DATABASE DESIGN

The project uses Supabase as the database and API layer.

Important database objects:

Raw table:

teen_mental_health

Cleaned table:

teen_mental_health_cleaned

Public reduced view:

public_teen_mental_health_table

Dashboard RPC functions:

- get_dashboard_kpis
- get_platform_addiction_summary
- get_interaction_depression_summary
- get_usage_depression_summary

The dashboard and insight pages use aggregate RPC functions.

The data table uses a reduced public view.

This structure avoids exposing the entire raw cleaned table directly to the frontend.


37. APPLICATION DATA FLOW

Dashboard data flow:

1. DashboardPage mounts.
2. fetchDashboardAggregateData runs.
3. Supabase RPC functions return aggregate rows.
4. analytics.ts transforms the rows.
5. DashboardPage renders stat cards and charts.

Insight page data flow:

1. InsightPage mounts.
2. It fetches the same aggregate data.
3. analytics.ts builds written summary cards.
4. The page renders readable insight summaries.

Data table flow:

1. DataTablePage builds a Supabase query.
2. Search, filters, sorting, and pagination are applied server-side.
3. Supabase returns the requested page of rows.
4. The table renders the records.
5. Export runs a matching query and writes an Excel file.

AI insight flow:

1. Dashboard data is sent to the backend.
2. Backend sanitizes the payload.
3. Groq generates a short insight.
4. Frontend displays the result in a modal.

Chatbot flow:

1. User asks a question.
2. Backend builds dataset context from the cleaned CSV.
3. Groq answers using only that dataset context.
4. Frontend displays the answer and suggestions.

Weather flow:

1. Browser geolocation returns coordinates.
2. Open-Meteo returns weather.
3. Backend returns location label.
4. Topbar renders weather.
5. Weather refreshes every 30 seconds.


38. ENVIRONMENT VARIABLES

Frontend environment variables:

VITE_SUPABASE_URL
The public Supabase project URL.

VITE_SUPABASE_ANON_KEY
The public Supabase anon key.

VITE_BACKEND_URL
The backend API URL used by AI features and weather location lookup.

Backend environment variables:

PORT
The backend server port. Defaults to 3001.

FRONTEND_ORIGIN
Allowed frontend origin for CORS. Can be one URL or multiple comma-separated URLs.

GROQ_API_KEY
The API key used to call Groq.

GROQ_MODEL
Optional model override. Defaults to llama-3.1-8b-instant.

Data pipeline environment variables:

SUPABASE_URL
Supabase URL for Python scripts.

SUPABASE_KEY
Supabase key used by Python scripts.

SUPABASE_TABLE_NAME
Optional raw table name. Defaults to teen_mental_health.

SUPABASE_CLEANED_TABLE_NAME
Optional cleaned table name. Defaults to teen_mental_health_cleaned.

UPLOAD_CHUNK_SIZE
Optional upload chunk size. Defaults to 200.


39. HOW TO RUN THE PROJECT LOCALLY

Install frontend dependencies:

```
cd frontend
npm install
```

Run frontend:

```
cd frontend
npm run dev
```

Install backend dependencies:

```
cd backend
npm install
```

Run backend:

```
cd backend
npm run dev
```

Run frontend production build:

```
cd frontend
npm run build
```

Run backend production start:

```
cd backend
npm start
```

Run raw dataset upload:

```
python data/upload_to_supabase.py
```

Run cleaning pipeline:

```
python data/run_cleaning_pipeline.py
```


40. TESTING AND VERIFICATION

Recommended checks:

1. Run the frontend build.
2. Run the backend server.
3. Open the frontend in the browser.
4. Confirm Dashboard cards and charts load.
5. Confirm Insight page summaries load.
6. Confirm Data Table search, filters, sort, pagination, and export work.
7. Confirm Generate Insight opens the modal and returns an AI response.
8. Confirm Chatbot answers dataset-related questions.
9. Confirm chatbot rate-limit behavior appears after too many requests.
10. Confirm weather widget requests location permission.
11. Confirm weather widget shows loading, ready, refreshing, and fallback states.
12. Confirm mobile navigation and mobile weather layout do not overflow.


41. CURRENT LIMITATIONS

The dataset is for educational demonstration only.

The AI features depend on Groq API availability and the configured API key.

The weather widget depends on browser location permission.

The weather widget also depends on Open-Meteo and the backend reverse-geocoding route.

The summarize-results and categorize backend routes are placeholders and are not fully implemented.

The dashboard depends on Supabase RPC functions existing in the database.

The data table depends on the public reduced view existing in Supabase.


42. SECURITY AND PRIVACY NOTES

The frontend should only contain public browser-safe keys.

Service-role Supabase keys should only be used in backend or local data scripts.

The frontend reads aggregate dashboard data through RPC functions.

The data table reads from a reduced public view instead of exposing the full cleaned table.

The AI chatbot is instructed not to give medical diagnosis or unsupported conclusions.

The Q&A endpoint has rate limiting to reduce API abuse.


43. DEPLOYMENT NOTES

Frontend deployment root:

frontend/

Backend deployment root:

backend/

Frontend deployment target:

Vercel

Backend deployment target:

Render or another Node.js hosting platform

Important deployment settings:

- Frontend must know VITE_SUPABASE_URL.
- Frontend must know VITE_SUPABASE_ANON_KEY.
- Frontend must know VITE_BACKEND_URL.
- Backend must know GROQ_API_KEY.
- Backend must configure FRONTEND_ORIGIN to allow the deployed frontend domain.


44. CONCLUSION

MindScope is a full-stack educational analytics dashboard for exploring a teen mental health dataset.

The frontend presents charts, insights, a data table, an AI chatbot, AI-generated dashboard insight, and a live weather widget.

The backend provides AI endpoints, rate limiting, dataset-based chatbot context, and weather location lookup.

The data pipeline prepares and uploads the dataset to Supabase.

Together, these parts create a complete source-code project with data processing, database integration, frontend visualization, backend services, and AI-assisted analysis.
