import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../ormconfig";
import DoctorProfileModules from "../modules/DoctorModules/DoctorModules";
import PatientProfileModules from "../modules/patientModules/PatientModules";
import prescriptionModule from "../modules/Prescription/PrescriptionModule";
import { PrescribedDrug } from "../entities/prescribedDrug";
import prescribedDrugModule from "../modules/PrescribedDrugs/prescribedDrugModules";
import DrugsModule from "../modules/DrugsModule/DrugsModule";
import { Drug } from "../entities/drug";

export class PrescriptionController {

    static async createPrescription(req: Request, res: Response, next: NextFunction) {
        const { doctorId, patientId, medications } = req.body;
        const queryRunner = await AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            let prescbriedDrugs: PrescribedDrug[] = []

            const doctor = await DoctorProfileModules.findDoctor(doctorId)
            const patient = await PatientProfileModules.findPatient(patientId)

            for (const med of medications) {
                const drug: Drug = await DrugsModule.findDrug(med.drugId)
                const prescribedDrug = await prescribedDrugModule.createPrescribedDrug(
                    drug,
                    med.dosage,
                    med.frequency,
                    queryRunner
                )
                prescbriedDrugs.push(prescribedDrug)
            }

            const newPrescrition = await prescriptionModule.createPrescription({
                doctor: doctor,
                patient: patient,
                queryRunner: queryRunner,
                prescribedDrug: prescbriedDrugs
            })

            await queryRunner.manager.save(newPrescrition)
            res.status(200).json({ doctor, patient, newPrescrition })
            await queryRunner.commitTransaction()

        } catch (err) {
            console.log(err)
            await queryRunner.rollbackTransaction()
            next(err)
        } finally {
            await queryRunner.release()
        }


    }

    static async deletePrescription(req: Request, res: Response, next: NextFunction){
        
    }
}