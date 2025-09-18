import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { AppDataSource } from "./ormconfig";
import cors from "cors";
import AuthRoutes from "./src/routes/AuthRoute";
import DiagnosisRoutes from "./src/routes/DiagnosisRoute";
import SpecializationRoutes from "./src/routes/SpecializationsRoute";
import PrescriptoinRoutes from "./src/routes/PrescriptionRoute";
import DrugRoutes from "./src/routes/DrugRoute";
import cookiesParser from "cookie-parser";
import DiseaseRoutes from "./src/routes/DiseaseRoute";
import AllergyRoutes from "./src/routes/AllergiesRoute";
import ReportRouter from "./src/routes/ReportsRoute";
import AdminRoutes from "./src/routes/AdminRoute";
import Auth from "./src/middleware/middleware";
import { AnalyticsController } from "./src/controllers/AnalyticsController";
import { createServer } from "http";
import SocketManager from "./socket";
import NotificationRoutes from "./src/routes/NotificationRoutes";
import PermissionsRoute from "./src/routes/permissionRoute";
import ErrorHandler from './ErrorHandler'

const app = express();
app.use(express.json());
app.use(cookiesParser());
const server = createServer(app);

const allowedOrigins = ["http://localhost:5173", process.env['FRONTED_URL']];

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

app.use("/auth", AuthRoutes);
app.use("/spec", SpecializationRoutes);
app.use("/diagnosis", DiagnosisRoutes);
app.use("/disease", DiseaseRoutes);
app.use("/presc", PrescriptoinRoutes);
app.use("/drug", DrugRoutes);
app.use("/allergy", AllergyRoutes);
app.use("/reports", ReportRouter);
app.use("/admin", Auth.checkToken, AdminRoutes);
app.use("/notification", Auth.checkToken, NotificationRoutes);
app.get("/analytics/:diseaseId", AnalyticsController.specificDiseaseAnalytics);
app.use("/permission-request", PermissionsRoute);

app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.use(ErrorHandler);

AppDataSource.initialize().then(() => {
  const port = Number(process.env['DB_PORT_SERVER']);
  server.listen(port, "0.0.0.0", () => {
    console.log("started our first server on port", port);
    SocketManager.connect(server, allowedOrigins as string[]);
  });
});
