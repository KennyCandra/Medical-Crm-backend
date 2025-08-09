import { AppDataSource } from "../../ormconfig";
import { DoctorProfile } from "../entities/doctorProfile";
import { User } from "../entities/user";
import { PrescribedDrug } from "../entities/prescribedDrug";
import { ReportsEntity } from "../entities/ReportsEntity";

export default class ReportsEntityModule {
  static async createReportEntity(
    doctor: DoctorProfile,
    patient: User,
    description: string,
    prescribedDrug: PrescribedDrug
  ): Promise<ReportsEntity> {
    try {
      const newReport = new ReportsEntity();
      newReport.doctor = doctor;
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
      .leftJoinAndSelect("r.doctor", "d")
      .leftJoinAndSelect("d.user", "ud")
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
        .leftJoinAndSelect("r.doctor", "do")
        .leftJoinAndSelect("do.user", "ud")
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
      .leftJoinAndSelect("r.doctor", "d");

    if (doctorId) {
      fethedReports.where("r.doctorId = :doctorId", { doctorId });
    } else {
      fethedReports.where("r.patientId = :patientId", { patientId });
    }

    const reports = fethedReports.getMany();

    return reports;
  }
}
