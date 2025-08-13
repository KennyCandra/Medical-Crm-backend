import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { AppDataSource } from "./ormconfig";
import { Response, Request, NextFunction, ErrorRequestHandler } from "express";
import createHttpError from "http-errors";
import cors from "cors";
import AuthRoutes from "./src/routes/Auth";
import DiagnosisRoutes from "./src/routes/Diagnosis";
import SpecializationRoutes from "./src/routes/Specializations";
import PrescriptoinRoutes from "./src/routes/Prescription";
import DrugRoutes from "./src/routes/Drug";
import cookiesParser from "cookie-parser";
import { GoogleGenAI } from "@google/genai";
import DiseaseRoutes from "./src/routes/Disease";
import AllergyRoutes from "./src/routes/Allergies";
import ReportRouter from "./src/routes/ReportsController";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import AdminRoutes from "./src/routes/Admin";
import Auth from "./src/middleware/middleware";
import { AnalyticsController } from "./src/controllers/AnalyticsController";
import { createServer } from "http";
import SocketManager from "./socket";
import NotificationRoutes from "./src/routes/NotificationRoutes";

const app = express();
app.use(express.json());
app.use(cookiesParser());
const server = createServer(app);

const allowedOrigins = ["http://localhost:5173", process.env.FRONTED_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.use("/auth", AuthRoutes);
app.use("/spec", SpecializationRoutes);
app.use("/diagnosis", DiagnosisRoutes);
app.use("/disease", DiseaseRoutes);
app.use("/presc", PrescriptoinRoutes);
app.use("/drug", DrugRoutes);
app.use("/allergy", AllergyRoutes);
app.use("/reports", ReportRouter);
app.use("/admin", Auth.checkToken, Auth.checkRoles(["owner"]), AdminRoutes);
app.use("/notification", Auth.checkToken, NotificationRoutes);
app.get("/analytics/:diseaseId", AnalyticsController.specificDiseaseAnalytics);

app.get("/", (req, res) => {
  res.send("Hello World");
});
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(
  (
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let status: number = StatusCodes.INTERNAL_SERVER_ERROR;
    let message: string = ReasonPhrases.INTERNAL_SERVER_ERROR;

    if (createHttpError.isHttpError(err)) {
      status = err.statusCode;
      message = err.message;
    }
    res.status(status).json({ message: message });
    return;
  }
);



AppDataSource.initialize().then(() => {
  const port = Number(process.env.DB_PORT_SERVER);
  server.listen(port, "0.0.0.0", () => {
    console.log("started our first server on port", port);
    SocketManager.connect(server, allowedOrigins);
  });
});