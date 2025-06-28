import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import createHttpError from 'http-errors';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../ormconfig';
import { GoogleGenAI } from '@google/genai';

// Import your routes
import AuthRoutes from '../src/routes/Auth';
import DiagnosisRoutes from '../src/routes/Diagnosis';
import SpecializationRoutes from '../src/routes/Specializations';
import PrescriptoinRoutes from '../src/routes/Prescription';
import DrugRoutes from '../src/routes/Drug';
import AnalyticsRoutes from '../src/routes/Analytics';
import DiseaseRoutes from '../src/routes/Disease';
import AllergyRoutes from '../src/routes/Allergies';
import ReportRouter from '../src/routes/ReportsController';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['https://medical-crm-fronted.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/auth', AuthRoutes);
app.use('/spec', SpecializationRoutes);
app.use('/diagnosis', DiagnosisRoutes);
app.use('/disease', DiseaseRoutes);
app.use('/presc', PrescriptoinRoutes);
app.use('/drug', DrugRoutes);
app.use('/analytics', AnalyticsRoutes);
app.use('/allergy', AllergyRoutes);
app.use('/reports', ReportRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Medical CRM API (deployed on Vercel)');
});

// Gemini AI (exported in case needed elsewhere)
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  let status = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = ReasonPhrases.INTERNAL_SERVER_ERROR;

  if (createHttpError.isHttpError(err)) {
    status = err.statusCode;
    message = err.message as ReasonPhrases;
  }

  res.status(status).json({ message });
});

// Lazy DB init for serverless
let initialized = false;

const handler = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!initialized) {
      await AppDataSource.initialize();
      initialized = true;
    }

    // Pass request to Express
    app(req as any, res as any);
  } catch (err) {
    console.error('Initialization failed:', err);
    res.status(500).json({ message: 'Initialization error' });
  }
};

export default handler;
