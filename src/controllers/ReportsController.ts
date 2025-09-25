import { Request, Response } from "express";
import ReportsEntityModule from "../modules/ReportsModule";
import { AppDataSource } from "../../ormconfig";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import asyncWrapper from "../utils/AsyncWrapper";

export default class ReportsController {
  static async createReport(patientId: string, prescribedDrugId: string, reporterId: string, description: string) {

    const newReport = await ReportsEntityModule.createReportEntity(
      reporterId,
      patientId,
      description,
      prescribedDrugId
    );
    await AppDataSource.manager.save(newReport);
    return newReport;
  }

  static fetchAll = asyncWrapper(async (
    _req: Request,
    res: Response,
  ) => {
    const reports = await ReportsEntityModule.fetchAllReportsforowner();

    const finalResults = reports.map((report) => {
      return {
        reporterName:
          report.reporter.first_name + " " + report.reporter.last_name,
        patientName:
          report.patient.first_name + " " + report.patient.last_name,
        reviewed: report.reviewed,
        id: report.id,
      };
    });

    res.status(200).json({ message: "here is the reports", finalResults });
  })

  static fetchSingleReport = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const { reportId } = req.params;

    const report = await ReportsEntityModule.fetchReport(reportId!);



    const singleReport = {
      id: report!.id,
      drugName: report!.prescribedDrug.drug.name,
      reporterName:
        report!.reporter.first_name + " " + report!.reporter.last_name,
      patientId: report!.patient.NID,
      patientName: report!.patient.first_name + " " + report!.patient.last_name,
      description: report!.description,
      reviewed: report!.reviewed,
      prescriptionId: report!.prescribedDrug.prescription.id,
      route: report!.prescribedDrug.drug.route.name,
    };

    res.status(200).json({ message: "here is the report", singleReport });
  })

  static editReport = asyncWrapper(async (
    req: Request,
    res: Response,
  ) => {
    const { reportId } = req.params;
    const report = await ReportsEntityModule.fetchReport(reportId!);

    report!.reviewed = true;
    await AppDataSource.manager.save(report);

    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, report });
  })
}
