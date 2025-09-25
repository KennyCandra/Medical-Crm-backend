import ReportsController from "../controllers/ReportsController";
import asyncWrapper from "../utils/AsyncWrapper";
import { Request, Response } from "express";
import { ResponseHelper } from "../utils/ResponseHelper";


class ReportService {
    static createReport = asyncWrapper(async (req: Request, res: Response) => {
        const { patientId, prescribedDrugId, reporterId, description } = req.body;
        const newReport = await ReportsController.createReport(patientId, prescribedDrugId, reporterId, description);
        ResponseHelper.success(res, { newReport });
    })
}

export default ReportService;