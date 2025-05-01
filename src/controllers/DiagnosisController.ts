import { Request, Response, NextFunction } from "express";
import PatientProfileModules from "../modules/patientModules/PatientModules";
import DoctorProfileModules from "../modules/DoctorModules/DoctorModules";
import DiagnosisModule from "../modules/DiagnosisModule/DiagnosisModule";
import DiseaseModule from "../modules/DiseaseModule/DiseaseModule";
import { AppDataSource } from "../../ormconfig";

export class DiagnosisController {
    static async createDiagonsis(req: Request, res: Response, next: NextFunction) {
        try {
            const { patientId, doctorId, diseaseId, severity } = req.body
            console.log(patientId, doctorId, diseaseId, severity)
            const patient = await PatientProfileModules.findPatientbyNid(patientId)
            const doctor = await DoctorProfileModules.findDoctor(doctorId)
            const disease = await DiseaseModule.findDiseaseById(diseaseId)
            const diagnoses = await DiagnosisModule.diagnosesCreation(patient, doctor, disease, severity)
            await AppDataSource.manager.save(diagnoses)

            res.status(201).json({ diagnoses, message: 'created Diagnosis' })

        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    static async fetchForPatient(req: Request, res: Response, next: NextFunction) {
        try {
            const { patientId } = req.params

            const patient = await PatientProfileModules.findPatientbyNid(patientId)
            const diagnosis = await DiagnosisModule.findForPatient(patient)

            res.status(200).json({ diagnosis, message: 'here is your diagnosis' })


        } catch (err) {
            console.error(err)
            next(err)
        }
    }
}