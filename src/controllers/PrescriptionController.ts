import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../ormconfig";
import DoctorProfileModules from "../modules/DoctorModules/DoctorModules";
import PatientProfileModules from "../modules/patientModules/PatientModules";
import prescriptionModule from "../modules/Prescription/PrescriptionModule";
import { PrescribedDrug } from "../entities/prescribedDrug";
import prescribedDrugModule from "../modules/PrescribedDrugs/prescribedDrugModules";
import DrugsModule from "../modules/DrugsModule/DrugsModule";
import { Drug } from "../entities/drug";
import createhttperror from 'http-errors'

export default class PrescriptionController {

    static async createPrescription(req: Request, res: Response, next: NextFunction) {
        const { doctorId, patientId, medications } = req.body;
        const queryRunner = await AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            let prescribedDrugs: PrescribedDrug[] = []

            const doctor = await DoctorProfileModules.findDoctor(doctorId)
            const patient = await PatientProfileModules.findPatient(patientId)

            for (const med of medications) {
                const drug: Drug = await DrugsModule.findDrug({ drugId: med.drug.id })
                const prescribedDrug = await prescribedDrugModule.createPrescribedDrug(
                    drug,
                    med.dose,
                    med.frequency,
                    queryRunner
                )
                prescribedDrugs.push(prescribedDrug)
            }
            await queryRunner.manager.save(prescribedDrugs)
            const newPrescrition = await prescriptionModule.createPrescription({
                doctor: doctor,
                patient: patient,
                queryRunner: queryRunner,
                prescribedDrug: prescribedDrugs
            })

            await queryRunner.manager.save(newPrescrition)
            res.status(201).json({ doctor, patient, newPrescrition })
            await queryRunner.commitTransaction()

        } catch (err) {
            console.log(err)
            await queryRunner.rollbackTransaction()
            next(err)
        } finally {
            await queryRunner.release()
        }


    }

    static async editPrescription(req: Request, res: Response, next: NextFunction) {
        try {

            const { prescriptionId } = req.body
            const prescription = await prescriptionModule.findPrescription(prescriptionId, [])
            if (!prescription) {
                throw createhttperror.NotFound("can't find this")
            }

            prescription.status = 'done'
            await AppDataSource.manager.save(prescription)

            res.status(200).json({ message: 'updated', prescription })
        } catch (err) {
            next(err)
        }
    }

    static async fetchSinglePrescription(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params
            const prescription = await prescriptionModule.findPrescription(id, [
                'patient', 'patient.user',
                'doctor', 'doctor.user',
                'prescribedDrugs', 'prescribedDrugs.drug'
            ]);
            if (!prescription) {
                throw createhttperror.NotFound("can't find this")
            }

            await AppDataSource.manager.save(prescription)

            res.status(200).json({ message: 'signlePresc', prescription })
        } catch (err) {
            next(err)
        }
    }

    static async fetchManyPrescriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const { doctorId, patientId } = req.params
            let prescriptions;

            { doctorId ? prescriptions = await prescriptionModule.findManyPrescriptions(doctorId, null) : prescriptions = await prescriptionModule.findManyPrescriptions(null, patientId) }
            if (!prescriptions) {
                throw createhttperror.NotFound("can't find this")
            }

            res.status(200).json({ message: 'here', prescriptions })
        } catch (err) {
            next(err)
        }
    }


}