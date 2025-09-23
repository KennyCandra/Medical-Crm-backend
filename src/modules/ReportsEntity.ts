import { AppDataSource } from "../../ormconfig";
import { User } from "../entities/user";
import { PrescribedDrug } from "../entities/prescribedDrug";
import { Reports } from "../entities/Reports";

export default class ReportsEntityModule {
  static async createReportEntity(
    reporter: User,
    patient: User,
    description: string,
    prescribedDrug: PrescribedDrug
  ): Promise<Reports> {
    try {
      const newReport = new Reports();
      newReport.reporter = reporter;
      newReport.patient = patient;
      newReport.description = description;
      newReport.prescribedDrug = prescribedDrug;
      console.log(newReport);
      return newReport;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async fetchAllReportsforowner(): Promise<Reports[]> {
    const fethedReports = await AppDataSource.getRepository(Reports)
      .createQueryBuilder("r")
      .leftJoinAndSelect("r.patient", "p")
      .leftJoinAndSelect("r.reporter", "d")
      .getMany();

    return fethedReports;
  }

  static async fetchReport(reportId: string): Promise<Reports | null> {
    try {
      const fethedReports = await AppDataSource.getRepository(Reports)
        .createQueryBuilder("r")
        .leftJoinAndSelect("r.patient", "p")
        .leftJoinAndSelect("r.prescribedDrug", "pd")
        .leftJoinAndSelect("pd.drug", "d")
        .leftJoinAndSelect("d.route", "ro")
        .leftJoinAndSelect("pd.prescription", "pr")
        .leftJoinAndSelect("r.reporter", "do")
        .where("r.id =:id", { id: reportId })
        .getOne();

      return fethedReports;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async fetchReportforPatientOrDoctor(
    doctorId: string | null,
    patientId: string | null
  ): Promise<Reports[]> {
    const fethedReports = await AppDataSource.getRepository(Reports)
      .createQueryBuilder("r")
      .leftJoinAndSelect("r.patient", "p")
      .leftJoinAndSelect("r.prescribedDrug", "pd")
      .leftJoinAndSelect("r.reporter", "d");

    if (doctorId) {
      fethedReports.where("r.reporterId = :doctorId", { doctorId });
    } else {
      fethedReports.where("r.patientId = :patientId", { patientId });
    }

    const reports = fethedReports.getMany();

    return reports;
  }
}
