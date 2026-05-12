/*
THIS FILE IS THE ENTRY POINT AND LIKE A COMMAND CENTER FOR THE NODE BACKEND
  - it sets up the server, define security rules,
    and connects the ai features on web
*/
import express from 'express'; // a framework used to create the web server

// cross-origin resource sharing(CORS), 
// tells the backend which websites are allowed to talk to it
import cors from 'cors';

// loads the secret api keys from the .env file
import dotenv from 'dotenv';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
/*
  Restricts access so that only the frontend(localhost:5173) can make request
*/
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
}));

/*
  this allows the server ti read the data(json) you send from the frontend
  ex: the text for a sumarry or a chatbot quetion
*/
app.use(express.json());

//  ========== ROUTES =========
/*
  this mounts all the ai features, ex: you want to generate an insight
  the frontend will call http://localhost:3001/api/ai/insight
*/
app.use('/api/ai', aiRoutes);

// ========== HEALTH CHECK ==========
/*
  simple endpoint to check if the server is running, you can visit:
  http://localhost:3001/health
  but first you need to run the backend
*/
app.get('/health', (req, res) => {
  res.json({ status: 'ok', api: 'MindScope AI Backend' });
});

app.listen(port, () => {
  console.log(`🚀 MindScope AI Backend running at http://localhost:${port}`);
});
