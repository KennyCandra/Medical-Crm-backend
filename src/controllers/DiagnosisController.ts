import DiagnosisModule from "../modules/DiagnosisModule";
import UserModules from "../modules/UserModules";

export class DiagnosisController {
  static async createDiagonsis(
    patientId: string,
    doctorId: string,
    diseaseId: string,
    severity: "acute" | "severe" | "mild" | "chronic",
    notes: string
  ) {
    const newDiagnosis = await DiagnosisModule.diagnosesCreation(
      patientId,
      doctorId,
      diseaseId,
      severity,
      notes
    );
    await DiagnosisModule.getInstance().save(newDiagnosis);
    return newDiagnosis;
  }

  static async fetchForPatient(nid: string) {

    const patient = await UserModules.findUserByNid(nid);

    if (!patient) {
      return null;
    }

    const diagnosis = await DiagnosisModule.findForPatient(patient?.id!);
    return diagnosis;
  }

  static async removeDiagnosis(id: string) {
    const data = await DiagnosisModule.removeDiagnosis(id);
    return data;
  }
}

