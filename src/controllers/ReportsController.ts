import { NextFunction, Request, Response } from "express";
import ReportsEntityModule from "../modules/ReportsEntity";
import DoctorProfileModules from "../modules/DoctorModules";
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
      const [doctor, user] = await Promise.all([
        DoctorProfileModules.findDoctor(doctorId),
        UserModules.findUserById(patientId),
      ]);
      if (!doctor) {
        throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }

      const newReport = await ReportsEntityModule.createReportEntity(
        doctor,
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
      // const { role } = req.body
      const reports = await ReportsEntityModule.fetchAllReportsforAdmin();

      const finalResults = reports.map((report) => {
        return {
          doctorName:
            report.doctor.user.first_name + " " + report.doctor.user.last_name,
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
        doctorName:
          report.doctor.user.first_name + " " + report.doctor.user.last_name,
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
