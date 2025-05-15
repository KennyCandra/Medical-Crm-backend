import { AppDataSource } from "../../ormconfig"
import { Diagnosis } from "../entities/diagnosis"
import { Disease } from "../entities/disease"
import { DoctorProfile } from "../entities/doctorProfile"
import { User } from "../entities/user"
import createhttperror from 'http-errors'

export default class DiagnosisModule {
    static async diagnosesCreation(patient: User,
        doctor: DoctorProfile,
        disease: Disease,
        severity: "acute" | "severe" | "mild" | "chronic") {
        try {
            const diagnoses = new Diagnosis()
            diagnoses.doctor = doctor;
            diagnoses.patient = patient
            diagnoses.disease = disease
            diagnoses.severity = severity
            return diagnoses
        } catch (err) {
            throw createhttperror[500]('internal server error')
        }

    }

    static async findForPatient(patientId: User): Promise<Diagnosis[]> {
        try {
            const diagnoses = await AppDataSource.getRepository(Diagnosis)
                .find({
                    where: { patient: { id: patientId.id } },
                    relations: ["disease"]
                });

            return diagnoses

        } catch (err) {
            console.log(err)
            throw createhttperror[500]('internal server error')
        }
    }
}