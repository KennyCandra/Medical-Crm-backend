import { AppDataSource } from "../../ormconfig";
import { Diagnosis } from "../entities/diagnosis";
import { Disease } from "../entities/disease";
import { DoctorProfile } from "../entities/doctorProfile";
import { User } from "../entities/user";
import createhttperror from "http-errors";

export default class DiagnosisModule {
  static async diagnosesCreation(
    patient: string,
    doctor: string,
    disease: string,
    severity: "acute" | "severe" | "mild" | "chronic",
    notes: string
  ) {
    try {
      const diagnoses = new Diagnosis();
      diagnoses.doctor = {id : doctor} as DoctorProfile;
      diagnoses.patient = {id : patient} as User;
      diagnoses.disease = {id : disease} as Disease;
      diagnoses.severity = severity;
      diagnoses.notes = notes;
      return diagnoses;
    } catch (err) {
      throw createhttperror[500]("internal server error");
    }
  }

  static async findForPatient(patient: string): Promise<Diagnosis[]> {
    try {
      const diagnoses = await AppDataSource.getRepository(Diagnosis).find({
        where: { patient: { id: patient } },
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
