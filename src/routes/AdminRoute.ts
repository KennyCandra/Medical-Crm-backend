import { Router } from "express";
import AnalyticsRoutes from "../subroute/AnalyticsRoute";
import AuthRoute from "../subroute/AuthRoute";
import Report from "../subroute/ReportRoute";
import Auth from "../middleware/middleware";

const router = Router();

router.use(
  "/analytics",
  Auth.checkRoles(["admin", "researcher"]),
  AnalyticsRoutes
);

router.use("/auth", Auth.checkRoles(["admin"]), AuthRoute);

router.use("/reports", Auth.checkRoles(["admin"]), Report);

export default router;
