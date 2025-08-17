import { Router } from "express";
import AnalyticsRoutes from "../subroute/Analytics";
import Auth from "../subroute/Auth";
import Report from "../subroute/Report";

const router = Router();

router.use('/analytics', AnalyticsRoutes)

router.use('/auth', Auth)

router.use('/reports', Report)

export default router;
