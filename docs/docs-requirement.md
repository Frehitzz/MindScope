APPLICATION DEVELOPMENT LABORATORY
FINAL OUTPUT REQUIREMENTS
Case Study Project: Big Data Cloud Analytics Application with AI Integration



Course
Application Development Laboratory
Output Type
Case Study Project (Final)
Topic Coverage
Lesson 1: Big Data & Cloud Analytics  |  Lesson 2: AI / SDK Integration
Tools Required
FREE tools ONLY — no paid subscriptions or paid API keys allowed
Dataset Size
500 to 1,000 rows from a free public source
Total Points
100 points + 10 bonus points
Basis
Extends and finalizes the Midterm Output prototype



Project Overview
For the Final Term, student groups will expand their Midterm Big Data Cloud Analytics prototype into a complete, deployed application that integrates AI capabilities using a free AI SDK or API. This output is scoped strictly to the topics covered in Lesson 1 (Big Data & Cloud Analytics) and Lesson 2 (AI/SDK Integration).

You are still working as a junior cloud developer at DataInsights Corp. Your team must now deliver a final version of the analytics dashboard that processes and visualizes real cloud-stored data, and uses a free AI model to generate intelligent insights or summaries from that data.

Learning Objectives
Apply Big Data storage concepts: data lakes, NoSQL databases, and cloud-hosted storage (Lesson 1)
Build a cloud-hosted data ingestion, cleaning, querying, and visualization pipeline (Lesson 1)
Integrate at least one free AI/LLM API or SDK to add an intelligent feature to the application (Lesson 2)
Apply prompt engineering techniques to produce meaningful, data-driven AI output (Lesson 2)
Deploy the complete application publicly using free hosting platforms only



Part 1: Dataset Ingestion & Cloud Storage  [30 pts]
This part applies Lesson 1 concepts on Big Data storage and cloud infrastructure.

Task 1A — Dataset Selection & Cloud Upload  (10 pts)
Choose or retain your Midterm dataset. It must meet all of the following requirements:
Between 500 and 1,000 rows — datasets outside this range will not be accepted
Sourced exclusively from a FREE public platform: Kaggle (free account), Philippine Open Data Portal (data.gov.ph), UCI Machine Learning Repository (archive.ics.uci.edu), Google Dataset Search, or Our World in Data (ourworldindata.org)
Must contain at least 5 meaningful columns suitable for analysis and AI-generated insight

Deliverables:
Raw dataset uploaded to a free cloud storage service: Google Drive, Supabase Storage (free tier), Cloudflare R2 (free tier), or GitHub (files under 100 MB)
Screenshot of the dataset file visible in the cloud storage dashboard
Written description of 150 words covering: the data source, number of rows and columns, what each key column means, and why this dataset was chosen

Task 1B — Database Design & Data Loading  (20 pts)
Load your dataset into an appropriate FREE cloud-hosted database. Select the database type that best fits your data structure:

If your data is...
Use this FREE database...
Structured / tabular (CSV, Excel)
Supabase (free tier) / SQLite / PlanetScale (free)
Semi-structured (JSON, logs)
MongoDB Atlas (free tier) / Firebase Firestore (free tier)
Graph / relational network
Neo4j AuraDB (free tier) / local Neo4j Desktop (free)


Deliverables:
Database schema or collection structure — ERD diagram or JSON schema screenshot
Script or code used to load the data into the database (Python, SQL, or Node.js) — must include comments
Screenshot confirming the data is loaded (e.g., a SELECT query result, document count, or table row preview)




Part 2: Data Processing & Query Pipeline  [25 pts]
This part covers the data engineering component of Lesson 1. You will write a processing script and run meaningful analytical queries on your cleaned dataset.

Task 2A — Data Cleaning & Transformation  (10 pts)
Write a script that performs all of the following operations on your dataset:
Handle all missing or null values — document your strategy: did you drop, fill, or flag each case?
Normalize or standardize at least one numerical column using a clear method such as min-max scaling or z-score normalization
Filter out outliers using a statistical method (IQR or Z-score)
Export the cleaned dataset back to your cloud storage

Accepted tools (all free): Python with pandas, SQL, or Node.js.

Task 2B — Analytical Queries  (15 pts)
Write and execute at least 3 meaningful queries or computations on your cleaned dataset. Each query must answer a real business question relevant to your data. Examples:
"Which category has the highest average rating?"
"What is the total count of records per region?"
"Which 5 entries have the highest value in a key column?"

Deliverables:
Full, commented source code for the cleaning script and all analytical queries
Output or results of each query — printed table, exported CSV, or screenshot
A 2 to 3 sentence business insight explanation for each query describing what it reveals



Part 3: Analytics Dashboard  [25 pts]
This part covers the visualization component of Lesson 1. Build a functional web-based dashboard that displays your processed data visually and interactively.

Task 3 — Web-Based Dashboard  (25 pts)
Required Features:
At least 3 distinct chart types (e.g., bar chart, line chart, pie chart, scatter plot)
At least 1 interactive control — such as a category dropdown, date picker, or search filter
A summary section with at least 3 KPI cards (e.g., Total Records, Average Value, Maximum Value)
Fully responsive layout — must be usable on both desktop and mobile screen sizes

Accepted Tech Stacks (ALL FREE):
Frontend: React via Vue (free), Vue 3 (free), or plain HTML / CSS / JS
Charting: Chart.js (free), Recharts (free), Plotly.js (free), or Google Charts (free)
Styling: Tailwind CSS (free), Bootstrap (free), or custom CSS
Deployment: Vercel (free), Netlify (free), Render free tier, or GitHub Pages (free)

Deliverables:
Full source code of the dashboard submitted as a public GitHub repository link or zipped folder
Live deployed URL on a free platform (Vercel, Netlify, Render, or GitHub Pages), OR a recorded demo video of 3 to 5 minutes uploaded to Google Drive or YouTube as unlisted
A README.md file with clear instructions on how to run the project locally



Part 4: AI / SDK Integration  [10 pts]
This part directly applies to Lesson 2. You must integrate at least one free AI model or SDK into your application. The AI feature must use actual data from your dataset — not dummy or placeholder content.

Task 4 — AI-Powered Feature  (10 pts)
Your application must include at least one working AI-powered feature. Accepted examples:
A "Generate Insight" button that sends a summary of the current dataset to a free LLM API and displays a natural-language business insight or recommendation in the dashboard
An AI-generated summary of query results — for example, "Based on the data, the top-performing category is X because..."
A simple Q&A interface where the user types a question about the data and the AI answers using the dataset as context
Automatic categorization, labeling, or tagging of dataset records using a free AI model

Accepted FREE AI Tools & SDKs:
Google Gemini API — free tier via Google AI Studio, gemini-1.5-flash model (no credit card required)
Groq API — free tier with fast LLM inference using LLaMA 3 or Mixtral models (free account, no card)
Hugging Face Inference API — free tier for open-source text generation models
Cohere API — free trial tier for text generation and summarization
OpenRouter — free models available such as Mistral 7B on the free tier

Deliverables:
Source code for the AI SDK / API integration with clear comments explaining what each part does
Screenshot or screen recording showing the AI feature working with real data from your dataset
A short written explanation of 100 to 150 words covering: which AI tool was used, what the feature does, and what prompt or input was sent to the model



Part 5: Technical Documentation  [10 pts]
Submit a written project report of at least 3 pages in PDF or Word format. The report must contain all of the following sections:

Project Title, Course Details, and Complete List of Group Members
Dataset Description: source, row and column count, definitions of each key column, and justification for choosing this dataset
System Architecture Diagram: a clear diagram showing the full data flow from ingestion through cloud storage, processing, dashboard visualization, and AI integration
AI Integration Explanation: which free AI tool was used, what prompt strategy was applied, and what output the model produces
Challenges Encountered and How They Were Resolved — at least 2 specific examples
Key Learnings: a short reflection from each group member — at least 2 sentences per person
Cloud Technologies and Free Tools Used: list all platforms and services with a brief reason for each choice
