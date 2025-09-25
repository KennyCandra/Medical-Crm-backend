
import { Diagnosis } from "../entities/diagnosis";
import { Disease } from "../entities/disease";
import { DoctorProfile } from "../entities/doctorProfile";
import { User } from "../entities/user";
import BasicModule from "./BasicModule";
import { FindOptionsSelect, ObjectLiteral } from "typeorm";

export default class DiagnosisModule extends BasicModule<Diagnosis> {
  private static instance: DiagnosisModule;
  protected entityClass = Diagnosis;
  protected entityName = "Diagnosis";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new DiagnosisModule();
    }
    return this.instance;
  }

  static async diagnosesCreation(
    patient: string,
    doctor: string,
    disease: string,
    severity: "acute" | "severe" | "mild" | "chronic",
    notes: string
  ) {
    const diagnoses = new Diagnosis();
    diagnoses.patient = { id: patient } as User;
    diagnoses.doctor = { id: doctor } as DoctorProfile;
    diagnoses.disease = { id: disease } as Disease;
    diagnoses.severity = severity;
    diagnoses.notes = notes;
    return diagnoses;
  }

  static async findForPatient(patientId: string) {
    const relations = ["disease"];
    const where = { patient: { id: patientId } };
    const order = {};
    const selection: FindOptionsSelect<ObjectLiteral> = {
      id: true,
      disease: {
        id: true,
        name: true
      }
    };
    return await this.getInstance().customFind(relations, where, order, selection);
  }

  static async removeDiagnosis(id: string) {
    return await this.getInstance().deleteById(id);
  }
}