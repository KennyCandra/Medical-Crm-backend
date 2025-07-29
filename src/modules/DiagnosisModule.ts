import { AppDataSource } from "../../ormconfig";
import { Diagnosis } from "../entities/diagnosis";
import { Disease } from "../entities/disease";
import { DoctorProfile } from "../entities/doctorProfile";
import { User } from "../entities/user";
import createhttperror from "http-errors";

export default class DiagnosisModule {
  static async diagnosesCreation(
    patient: User,
    doctor: DoctorProfile,
    disease: Disease,
    severity: "acute" | "severe" | "mild" | "chronic",
    notes: string
  ) {
    try {
      const diagnoses = new Diagnosis();
      diagnoses.doctor = doctor;
      diagnoses.patient = patient;
      diagnoses.disease = disease;
      diagnoses.severity = severity;
      diagnoses.notes = notes;
      return diagnoses;
    } catch (err) {
      throw createhttperror[500]("internal server error");
    }
  }

  static async findForPatient(patient: User): Promise<Diagnosis[]> {
    try {
      const diagnoses = await AppDataSource.getRepository(Diagnosis).find({
        where: { patient: { id: patient.id } },
        relations: ["disease"],
        order: {
          created_at: "ASC",
        },
      });

      return diagnoses;
    } catch (err) {
      console.log(err);
      throw createhttperror[500]("internal server error");
    }
  }

  static async removeDiagnosis(id: string) {
    try {
      const diagnosis = await AppDataSource.getRepository(Diagnosis).delete(id);
      return diagnosis;
    } catch (err) {
      throw createhttperror[500]("internal server error");
    }
  }
}
