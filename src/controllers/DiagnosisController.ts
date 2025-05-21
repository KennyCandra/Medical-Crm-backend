import { Request, Response, NextFunction } from "express";
import DoctorProfileModules from "../modules/DoctorModules";
import DiagnosisModule from "../modules/DiagnosisModule";
import DiseaseModule from "../modules/DiseaseModule";
import { AppDataSource } from "../../ormconfig";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
export class DiagnosisController {
    static async createDiagonsis(req: Request, res: Response, next: NextFunction) {
        try {
            const { patientId, doctorId, diseaseId, severity } = req.body
            console.log(patientId, doctorId, diseaseId, severity)
            const patient = await UserModules.findUserByNid(patientId)
            const doctor = await DoctorProfileModules.findDoctor(doctorId)
            const disease = await DiseaseModule.findDiseaseById(diseaseId)
            const diagnoses = await DiagnosisModule.diagnosesCreation(patient, doctor, disease, severity)
            await AppDataSource.manager.save(diagnoses)

            res.status(StatusCodes.CREATED).json({ diagnoses, message: ReasonPhrases.CREATED })

        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    static async fetchForPatient(req: Request, res: Response, next: NextFunction) {
        try {
            const { nid } = req.params
            if (nid.length !== 14) {
                res.status(404).json({ message: 'can"t find this' })
                return
            }

            const patient = await UserModules.findUserByNid(nid)
            const diagnosis = await DiagnosisModule.findForPatient(patient)

            res.status(StatusCodes.OK).json({ diagnosis, message: ReasonPhrases.OK })


        } catch (err) {
            console.error(err)
            next(err)
        }
    }
}