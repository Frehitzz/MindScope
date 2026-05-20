MINDSCOPE FINAL PROJECT DOCUMENTATION

Case Study Project: Big Data Cloud Analytics Application with AI Integration
Course: Application Development Laboratory
Output Type: Case Study Project Final Output
Topic Coverage: Lesson 1 - Big Data and Cloud Analytics; Lesson 2 - AI / SDK Integration
Project Name: MindScope


PROJECT TITLE

MindScope: Teen Mental Health Big Data Cloud Analytics Dashboard with AI Integration


COURSE DETAILS

Course: Application Development Laboratory
Project Type: Final Case Study Project
Topic Coverage: Big Data and Cloud Analytics; AI / SDK Integration
Tools Used: Free tools only


GROUP MEMBERS

Group Members:

1. ______________________________
2. ______________________________
3. ______________________________
4. ______________________________


1. PROJECT OVERVIEW

MindScope is a cloud-based analytics dashboard that processes, stores, visualizes, and analyzes a teen mental health dataset. The system extends the midterm prototype into a more complete final application by adding a cleaned data pipeline, cloud database integration, interactive charts, a searchable data table, AI-generated insights, a dataset Q&A chatbot, and a live weather widget.

The application focuses on applying Lesson 1 concepts by using cloud-hosted storage, a cloud database, data cleaning, analytical queries, and web-based visualization. It also applies Lesson 2 concepts by integrating a free AI model through an SDK/API to generate insights and answer questions using real dataset context.

The project is for educational and analytical demonstration only. It should not be used as a clinical, medical, or diagnostic tool.


2. DATASET DESCRIPTION

Dataset Name: Teen Mental Health Dataset

Dataset File:

data/Teen_Mental_Health_Dataset.csv

Cleaned Dataset File:

data/Teen_Mental_Health_Dataset.cleaned.csv

Dataset Size:

The dataset contains 1,000 rows, which satisfies the required range of 500 to 1,000 rows.

Dataset Type:

Structured / tabular CSV dataset

Cloud Database Used:

Supabase free tier

Reason for Choosing the Dataset:

This dataset was chosen because it contains meaningful columns related to teen behavior, social media usage, lifestyle habits, and mental health indicators. It is suitable for analytics because it allows the system to compare social media hours, platform usage, sleep, stress, anxiety, addiction level, and depression label. These fields are also useful for AI-generated insights because the AI can summarize visible patterns from the dashboard and answer questions using the dataset context.


3. KEY DATASET COLUMNS

age
Represents the age of the teen respondent.

gender
Represents the gender category of the respondent.

daily_social_media_hours
Represents the number of hours the respondent spends on social media per day.

platform_usage
Represents the main social media platform used by the respondent, such as TikTok, Instagram, or both.

sleep_hours
Represents the number of hours the respondent sleeps.

screen_time_before_sleep
Represents how much screen time the respondent has before sleeping.

academic_performance
Represents the academic performance score or level of the respondent.

physical_activity
Represents the level of physical activity of the respondent.

social_interaction_level
Represents whether the respondent has low, medium, or high social interaction.

stress_level
Represents the stress level of the respondent.

anxiety_level
Represents the anxiety level of the respondent.

addiction_level
Represents the social media addiction level of the respondent.

depression_label
Represents whether the respondent is labeled as depressed or not depressed in the dataset.

daily_social_media_hours_min_max
Represents the normalized version of daily_social_media_hours created during data cleaning.


4. DATASET INGESTION AND CLOUD STORAGE

Requirement Covered:

Part 1: Dataset Ingestion and Cloud Storage

Raw Dataset Cloud Storage:

The raw dataset is stored in the project repository and can also be uploaded to a free cloud storage service such as GitHub, Google Drive, or Supabase Storage.

Recommended Proof Screenshot:

Include a screenshot showing the raw CSV file visible in the selected cloud storage dashboard or GitHub repository.

Raw dataset file path in the project:

data/Teen_Mental_Health_Dataset.csv

The dataset meets the final output requirements because:

1. It has 1,000 rows.
2. It is structured tabular data.
3. It has more than 5 meaningful columns.
4. It is suitable for analysis and AI-generated insight.
5. It can be uploaded and stored using free cloud tools.


5. DATABASE DESIGN AND DATA LOADING

Requirement Covered:

Task 1B - Database Design and Data Loading

Database Used:

Supabase free tier

Database Type:

Relational cloud-hosted database

Reason for Database Choice:

Supabase was selected because the dataset is structured tabular data. Supabase provides a free PostgreSQL database, a REST API, SQL Editor, table previews, and Row Level Security support. This makes it suitable for storing CSV-based analytics data and serving filtered or aggregated results to the frontend.

Main Database Tables and Views:

teen_mental_health
Stores the uploaded raw dataset.

teen_mental_health_cleaned
Stores the cleaned and transformed dataset.

public_teen_mental_health_table
A reduced public view used by the frontend data table.

Dashboard RPC Functions:

get_dashboard_kpis
Returns summary KPI values for the dashboard cards.

get_platform_addiction_summary
Returns addiction-level summaries grouped by platform.

get_interaction_depression_summary
Returns depression-rate summaries grouped by social interaction level.

get_usage_depression_summary
Returns depression-rate summaries grouped by daily social media usage hours.

Data Loading Script:

data/upload_to_supabase.py

Purpose:

This Python script reads the CSV dataset using pandas and uploads it to Supabase through the Supabase REST API.

Important behavior:

1. Reads the CSV file.
2. Converts rows to JSON records.
3. Clears existing table rows when enabled to prevent duplicates.
4. Uploads records in chunks.
5. Uses environment variables for Supabase URL and key.

Code Evidence:

```
python data/upload_to_supabase.py
```

Recommended Proof Screenshot:

Include a Supabase table preview or SELECT query result showing that the dataset rows were loaded successfully.


6. DATA CLEANING AND TRANSFORMATION

Requirement Covered:

Task 2A - Data Cleaning and Transformation

Main Cleaning Script:

data/cleaning.py

Pipeline Runner:

data/run_cleaning_pipeline.py

The cleaning pipeline performs the required operations:

Missing or Null Values:

The script checks every column for missing values. It creates a missing-value flag column for each original column. Numeric missing values are filled using the median, while categorical missing values are filled using the mode. This preserves the records while still documenting which values were originally missing.

Normalization:

The script normalizes the daily_social_media_hours column using min-max scaling. The normalized result is stored in daily_social_media_hours_min_max.

Outlier Filtering:

The script filters outliers using the IQR method. It checks continuous numeric columns such as age, daily_social_media_hours, sleep_hours, screen_time_before_sleep, academic_performance, physical_activity, stress_level, anxiety_level, and addiction_level.

Cleaned Dataset Export:

The cleaned dataset is exported to:

data/Teen_Mental_Health_Dataset.cleaned.csv

Cleaning Summary Export:

The cleaning process writes a summary report to:

data/cleaning_summary.json

Command Used:

```
python data/run_cleaning_pipeline.py
```

Recommended Proof Screenshot:

Include a screenshot of the cleaned CSV file, the cleaning_summary.json file, or the Supabase cleaned table preview.


7. ANALYTICAL QUERIES AND COMPUTATIONS

Requirement Covered:

Task 2B - Analytical Queries

The application uses Supabase RPC functions and frontend analytics helpers to compute meaningful results from the cleaned dataset.

Query 1: Dashboard KPI Summary

Source:

get_dashboard_kpis

Business Question:

What are the overall average stress level, anxiety level, sleep hours, and daily social media usage of the teen respondents?

Output Used In:

Dashboard KPI cards

Business Insight:

This query gives a quick overview of the general wellbeing profile of the dataset. The KPI cards help users immediately understand the average stress, anxiety, sleep, and social media usage levels without manually scanning all records.


Query 2: Addiction Level by Platform

Source:

get_platform_addiction_summary

Business Question:

Which social media platform has the highest average addiction level?

Output Used In:

Average Addiction Level by Platform bar chart

Business Insight:

This query compares addiction levels across platform groups. It helps identify which platform category is associated with higher reported addiction levels in the dataset, making it useful for platform-based analysis.


Query 3: Depression Rate by Social Interaction Group

Source:

get_interaction_depression_summary

Business Question:

Which social interaction level has the highest depression rate?

Output Used In:

Depression Rate by Interaction Group chart

Business Insight:

This query helps compare depression-label rates among low, medium, and high interaction groups. It reveals whether social interaction level appears connected with differences in depression rate in the dataset.


Query 4: Daily Usage Hours vs. Depression Rate

Source:

get_usage_depression_summary

Business Question:

How does depression rate change as daily social media hours increase?

Output Used In:

Usage Hours vs. Depression Rate chart

Business Insight:

This query groups records by rounded daily usage hours and calculates depression rate for each group. It helps users see whether heavier social media usage aligns with higher depression rates in the dataset.


8. ANALYTICS DASHBOARD

Requirement Covered:

Part 3 - Web-Based Dashboard

Main Dashboard File:

frontend/src/pages/DashboardPage.tsx

Dashboard Features:

1. KPI summary cards
2. Multiple chart types
3. Interactive and responsive layout
4. AI Generate Insight button
5. Quick insight cards

KPI Cards:

The dashboard includes at least 3 KPI cards. The current dashboard includes:

- Avg Stress Level
- Avg Anxiety Level
- Avg Sleep Hours
- Daily Social Media

Chart Types:

The dashboard includes at least 3 visual chart sections:

1. Bar chart for average addiction level by platform.
2. Scatter/lollipop chart for depression rate by social interaction group.
3. Line chart for usage hours versus depression rate.

Interactive Controls:

The Data Table page provides search, filters, sorting, pagination, and export. These controls satisfy the interactivity requirement of the analytics application.

Responsive Layout:

The frontend uses responsive Tailwind CSS classes. The sidebar changes to mobile bottom navigation, dashboard grids adapt to smaller screens, and the topbar weather widget is adjusted for mobile display.

Frontend Tools Used:

- React
- TypeScript
- Vite
- Tailwind CSS
- Chart.js
- React Chart.js 2
- Lucide React icons

Deployment Option:

The frontend can be deployed on Vercel free tier.


9. DATA TABLE FEATURE

Main File:

frontend/src/pages/DataTablePage.tsx

Purpose:

The Data Table page allows users to browse cleaned student records from a reduced public Supabase view.

Features:

- Search records
- Filter by platform
- Filter by social interaction
- Filter by depression status
- Filter by social media usage range
- Sort table columns
- Paginate records
- Export filtered data to Excel
- Mobile filter drawer

Data Source:

public_teen_mental_health_table

Reason for Reduced Public View:

The frontend should not expose the full raw cleaned table. The public view only includes the columns needed by the table page.


10. AI / SDK INTEGRATION

Requirement Covered:

Part 4 - AI / SDK Integration

AI Tool Used:

Groq API free tier

AI Model:

llama-3.1-8b-instant by default

Backend AI Service File:

backend/services/aiService.js

Backend AI Routes File:

backend/routes/ai.js

Frontend AI API Client:

frontend/src/api/ai.ts

AI Feature 1: Generate Insight

Frontend Component:

frontend/src/components/ai/GenerateInsight.tsx

Endpoint:

POST /api/ai/insight

What It Does:

The user clicks the Generate Insight button on the dashboard. The frontend sends the current dashboard data to the backend. The backend sanitizes the data, builds a prompt, sends it to the Groq model, and returns a short natural-language insight.

Prompt Strategy:

The prompt instructs the AI to analyze only the provided dashboard statistics, avoid unsupported claims, keep the response short, use simple language, and avoid claiming direct causation.

AI Feature 2: Dataset Q&A Chatbot

Frontend Component:

frontend/src/components/ai/ChatbotDrawer.tsx

Endpoint:

POST /api/ai/qa

What It Does:

The user can ask questions about the dataset. The backend reads the cleaned CSV, builds a summarized dataset context, sends the question and context to Groq, and returns an answer with suggested follow-up questions.

Prompt Strategy:

The chatbot prompt tells the AI to answer only using the MindScope dataset context. It also tells the AI not to provide medical diagnosis, not to invent unsupported facts, and to explain relationships as associations rather than causation.

Rate Limiting:

The Q&A route is limited to 10 requests per 30 minutes per IP address using express-rate-limit.


11. AI INTEGRATION SHORT EXPLANATION

MindScope uses the Groq API free tier to add AI-powered insight generation and dataset question answering. The Generate Insight feature sends dashboard summary data to the backend, where the data is sanitized and inserted into a prompt that asks the model to produce a concise, data-driven interpretation. The chatbot feature uses a summarized version of the cleaned dataset as context so users can ask questions about social media usage, sleep, stress, anxiety, addiction, and depression labels. The prompt strategy limits the AI to dataset-based answers, avoids unsupported medical claims, and requires simple analytical language. This satisfies the AI/SDK integration requirement because the AI output is based on real project data, not placeholder content.


12. SYSTEM ARCHITECTURE DIAGRAM DESCRIPTION

Use this as the basis for the system architecture diagram in Google Docs:

```
Raw CSV Dataset
        |
        v
Python Upload and Cleaning Scripts
        |
        v
Cleaned CSV Dataset
        |
        v
Supabase Cloud Database
        |
        |-- Dashboard RPC Functions
        |-- Public Data Table View
        |
        v
React Frontend Dashboard
        |
        |-- KPI Cards
        |-- Charts
        |-- Data Table
        |-- AI Insight Button
        |-- Chatbot Drawer
        |-- Weather Widget
        |
        v
Express Backend API
        |
        |-- Groq AI API
        |-- OpenStreetMap/Nominatim Location API
        |
        v
AI Insights, Dataset Q&A, and Location Labels
```

Architecture Explanation:

The project begins with a CSV dataset that is uploaded and cleaned using Python scripts. The cleaned data is stored in Supabase, where aggregate RPC functions and a public view provide controlled access to the frontend. The React frontend visualizes the data using KPI cards, charts, and a data table. The Express backend supports AI features through Groq and supports the weather widget by resolving location labels through a backend route.


13. CLOUD TECHNOLOGIES AND FREE TOOLS USED

Supabase Free Tier:

Used as the cloud-hosted database for storing raw and cleaned structured data. It also provides SQL functions, public views, and REST access.

GitHub:

Used for storing the project source code and dataset files under version control.

Vercel Free Tier:

Can be used to deploy the React frontend publicly.

Render Free Tier:

Can be used to deploy the Express backend publicly.

Groq Free Tier:

Used for AI insight generation and dataset Q&A.

Open-Meteo:

Used as a free weather API for the topbar weather widget.

Nominatim/OpenStreetMap:

Used as a free reverse-geocoding service to convert coordinates into a readable location label.

React:

Used for the web frontend.

Vite:

Used as the frontend build tool.

Tailwind CSS:

Used for responsive styling.

Chart.js:

Used for dashboard visualizations.

Python and pandas:

Used for dataset cleaning, transformation, and preparation.


14. DEPLOYMENT AND RUNNING INSTRUCTIONS

Frontend Local Setup:

```
cd frontend
npm install
npm run dev
```

Backend Local Setup:

```
cd backend
npm install
npm run dev
```

Frontend Build:

```
cd frontend
npm run build
```

Data Upload:

```
python data/upload_to_supabase.py
```

Cleaning Pipeline:

```
python data/run_cleaning_pipeline.py
```

Required Frontend Environment Variables:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_BACKEND_URL

Required Backend Environment Variables:

PORT
FRONTEND_ORIGIN
GROQ_API_KEY
GROQ_MODEL

Required Data Script Environment Variables:

SUPABASE_URL
SUPABASE_KEY
SUPABASE_TABLE_NAME
SUPABASE_CLEANED_TABLE_NAME
UPLOAD_CHUNK_SIZE


15. DELIVERABLE CHECKLIST

Part 1A - Dataset Selection and Cloud Upload:

- Dataset has 1,000 rows.
- Dataset has more than 5 meaningful columns.
- Raw CSV is available in the project data folder.
- Raw CSV can be uploaded to GitHub, Google Drive, Supabase Storage, or another free cloud storage service.
- Screenshot needed: dataset visible in selected cloud storage.

Part 1B - Database Design and Loading:

- Supabase database is used.
- Raw table and cleaned table are prepared.
- Data loading script exists.
- Screenshot needed: Supabase table preview or SELECT query result.

Part 2A - Data Cleaning and Transformation:

- Missing values are handled.
- Missing-value flag columns are created.
- A numerical column is normalized using min-max scaling.
- Outliers are filtered using IQR.
- Cleaned dataset is exported.

Part 2B - Analytical Queries:

- Dashboard KPI query exists.
- Platform addiction query exists.
- Interaction depression query exists.
- Usage depression query exists.
- Business insight explanations are included in this document.

Part 3 - Analytics Dashboard:

- Dashboard source code exists.
- At least 3 KPI cards are shown.
- At least 3 chart sections are shown.
- Interactive controls exist in the data table.
- Responsive layout is implemented.
- README instructions exist.

Part 4 - AI Integration:

- Groq API is integrated.
- Generate Insight feature exists.
- Dataset Q&A chatbot exists.
- AI source code has comments.
- Screenshot or screen recording needed: AI feature working with real data.

Part 5 - Technical Documentation:

- Project title is included.
- Course details are included.
- Group members section is included.
- Dataset description is included.
- Architecture diagram description is included.
- AI integration explanation is included.
- Challenges and resolutions are included.
- Key learnings section is included.
- Cloud technologies and free tools are listed.


16. CHALLENGES ENCOUNTERED AND SOLUTIONS

Challenge 1: Preventing raw dataset exposure in the frontend

The project needed to show useful data in the browser without exposing the full cleaned table directly. This was solved by using Supabase aggregate RPC functions for dashboard charts and a reduced public view for the data table. This approach allows the frontend to read only the data it needs.

Challenge 2: Making AI answers based on real dataset context

The chatbot needed to answer questions using actual project data instead of giving generic AI responses. This was solved by reading the cleaned CSV, building a dataset summary, and including that summary in the AI prompt. The prompt also tells the AI not to invent unsupported facts.

Challenge 3: Avoiding repeated reverse-geocoding requests in the weather widget

The weather widget needed to refresh weather data every 30 seconds, but repeatedly requesting the location label would create unnecessary traffic. This was solved by fetching the location label only once and storing it while polling only the weather API.

Challenge 4: Handling API limits and user feedback

The AI service may become busy or rate-limited. This was solved by adding backend rate limiting for the chatbot and frontend-friendly error messages with countdown behavior when limits are reached.


17. KEY LEARNINGS

Group Member 1:

I learned how a cloud database can be used to store and serve cleaned dataset records for a web application. I also learned that separating raw data, cleaned data, and public views makes the application more secure and organized.

Group Member 2:

I learned how frontend dashboards can use aggregate queries to display meaningful charts and KPI cards. I also learned that responsive design is important because the application must work on both desktop and mobile screens.

Group Member 3:

I learned how AI APIs can be connected to a backend service and used to generate insights from real data. I also learned the importance of prompt engineering so the AI response stays accurate and based only on the dataset.

Group Member 4:

I learned how data cleaning improves the quality of analytics by handling missing values, normalization, and outlier filtering. I also learned how Python scripts can automate the process of preparing data for cloud storage.


18. CONCLUSION

MindScope satisfies the final project requirements by combining big data cloud analytics and AI integration in one complete application. The project uses a structured dataset with 1,000 rows, uploads and stores data in Supabase, cleans and transforms the dataset using Python, runs analytical queries through Supabase RPC functions, and visualizes the results through a responsive React dashboard.

The application also integrates a free AI tool through the Groq API. The AI features include a Generate Insight button and a dataset Q&A chatbot that both use real project data. The project uses only free tools and can be deployed using free hosting platforms such as Vercel and Render.

Overall, MindScope demonstrates the complete flow required for the final output: dataset ingestion, cloud storage, data processing, analytical querying, dashboard visualization, AI integration, documentation, and deployment readiness.
