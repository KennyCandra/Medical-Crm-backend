import { AppDataSource } from "../../ormconfig";
import { Diagnosis } from "../entities/diagnosis";
import { Disease } from "../entities/disease";
import { DoctorProfile } from "../entities/doctorProfile";
import { User } from "../entities/user";
import createHttpError from "http-errors";
import { EntityManager } from "typeorm";

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
      diagnoses.doctor = { id: doctor } as DoctorProfile;
      diagnoses.patient = { id: patient } as User;
      diagnoses.disease = { id: disease } as Disease;
      diagnoses.severity = severity;
      diagnoses.notes = notes;
      return diagnoses;
    } catch (err) {
      throw createHttpError(500, "internal server error");
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
      throw createHttpError(500, "internal server error");
    }
  }

  static async removeDiagnosis(
    id: string,
    manager?: EntityManager
  ): Promise<{ patientId: string }> {
    try {
      const em = manager ?? AppDataSource.manager;
      const diagnosisRepo = em.getRepository(Diagnosis);

      const diagnosis = await diagnosisRepo.findOne({
        where: { id },
        relations: ["patient"],
      });

      if (!diagnosis) {
        throw createHttpError(404, "diagnosis not found");
      }

      const patientId = diagnosis.patient?.id;
      if (!patientId) {
        throw createHttpError(500, "diagnosis patient is missing");
      }

      await diagnosisRepo.delete(id);
      return { patientId };
    } catch (err) {
      if (createHttpError.isHttpError(err as any)) throw err;
      throw createHttpError(500, "internal server error");
    }
  }
}
