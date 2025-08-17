import { NextFunction, Request, Response } from "express";
import ReportsEntityModule from "../modules/ReportsEntity";
import createhttperror from "http-errors";
import { AppDataSource } from "../../ormconfig";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export default class ReportsController {
  static async createReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { patientId, prescribedDrugId, doctorId, description } = req.body;
      console.log(doctorId);
      const [reporter, user] = await Promise.all([
        UserModules.findUserById(doctorId),
        UserModules.findUserById(patientId),
      ]);

      if (!reporter) {
        console.log("reporter not found");
        throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }

      if (!user) {
        console.log("user not found");
        throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }

      const newReport = await ReportsEntityModule.createReportEntity(
        reporter,
        user,
        description,
        prescribedDrugId
      );
      await AppDataSource.manager.save(newReport);
      res
        .status(StatusCodes.CREATED)
        .json({ message: ReasonPhrases.CREATED, newReport });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  static async fetchAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
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
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  static async fetchSingleReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { reportId } = req.params;
      const report = await ReportsEntityModule.fetchReport(reportId);

      const singleReport = {
        id: report.id,
        drugName: report.prescribedDrug.drug.name,
        reporterName:
          report.reporter.first_name + " " + report.reporter.last_name,
        patientId: report.patient.NID,
        patientName: report.patient.first_name + " " + report.patient.last_name,
        description: report.description,
        reviewed: report.reviewed,
        prescriptionId: report.prescribedDrug.prescription.id,
        route: report.prescribedDrug.drug.route.name,
      };

      res.status(200).json({ message: "here is the report", singleReport });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  static async editReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { reportId } = req.params;
      const report = await ReportsEntityModule.fetchReport(reportId);

      report.reviewed = true;
      await AppDataSource.manager.save(report);

      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, report });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
}
