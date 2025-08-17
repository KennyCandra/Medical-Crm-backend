import { AppDataSource } from "../../ormconfig";
import { User } from "../entities/user";
import { PrescribedDrug } from "../entities/prescribedDrug";
import { ReportsEntity } from "../entities/ReportsEntity";

export default class ReportsEntityModule {
  static async createReportEntity(
    reporter: User,
    patient: User,
    description: string,
    prescribedDrug: PrescribedDrug
  ): Promise<ReportsEntity> {
    try {
      const newReport = new ReportsEntity();
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

  static async fetchAllReportsforowner(): Promise<ReportsEntity[]> {
    const fethedReports = await AppDataSource.getRepository(ReportsEntity)
      .createQueryBuilder("r")
      .leftJoinAndSelect("r.patient", "p")
      .leftJoinAndSelect("r.reporter", "d")
      .getMany();

    return fethedReports;
  }

  static async fetchReport(reportId: string): Promise<ReportsEntity> {
    try {
      const fethedReports = await AppDataSource.getRepository(ReportsEntity)
        .createQueryBuilder("r")
        .leftJoinAndSelect("r.patient", "p")
        .leftJoinAndSelect("r.prescribedDrug", "pd")
        .leftJoinAndSelect("pd.drug", "d")
        .leftJoinAndSelect("d.route", "ro")
        .leftJoinAndSelect("pd.prescription", "pr")
        .leftJoinAndSelect("r.reporter", "do")
        .where("r.id =:id", { id: reportId })
        .getOne();
      console.log(fethedReports);
      return fethedReports;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async fetchReportforPatientOrDoctor(
    doctorId: string | null,
    patientId: string | null
  ): Promise<ReportsEntity[]> {
    const fethedReports = await AppDataSource.getRepository(ReportsEntity)
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
