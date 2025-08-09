import { Router } from "express";
import ReportsController from "../controllers/ReportsController";

const router = Router();

router.get("/all", ReportsController.fetchAll);

router.put("/edit/:reportId", ReportsController.editReport);

router.get("/:reportId", ReportsController.fetchSingleReport);

export default router;
