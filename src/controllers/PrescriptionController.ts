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
import { Prescription } from "../entities/prescription";

export default class PrescriptionController {

    static async createPrescription(req: Request, res: Response, next: NextFunction) {
        const { doctorId, patientId, medication, description } = req.body;
        const queryRunner = await AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            let prescribedDrugs: PrescribedDrug[] = []

            if (medication.length === 0) {
                res.status(400).json({ message: "please enter some drugs" })
                return
            }

            const doctor = await DoctorProfileModules.findDoctor(doctorId)
            const patient = await PatientProfileModules.findPatientbyNid(patientId)

            if (!doctor) {
                res.status(404).json({ message: 'doctor' })
                return
            }

            if (!patient) {
                res.status(404).json({ message: 'patient' })
                return
            }

            for (const med of medication) {
                const drug: Drug = await DrugsModule.findDrug({ drugId: med.drug.id })
                const prescribedDrug = await prescribedDrugModule.createPrescribedDrug(
                    drug,
                    med.dose,
                    med.frequency,
                    med.time
                )
                prescribedDrugs.push(prescribedDrug)
            }
            await queryRunner.manager.save(prescribedDrugs)

            const newPrescrition = await prescriptionModule.createPrescription({
                doctor: doctor,
                patient: patient,
                prescribedDrug: prescribedDrugs,
                description: description
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
            const { prescriptionId } = req.params
            const { userId } = req.body
            const patientId = await PatientProfileModules.findPatientById(userId)
            const prescription = await prescriptionModule.findPrescription(prescriptionId, ['patient'])

            if (patientId === null) {
                throw createhttperror.NotFound("you are not a patient")
            }

            if (patientId.id !== prescription.patient.id) {
                throw createhttperror.Unauthorized("you don't take this prescrption")
            }

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
            let prescriptions: Prescription[];

            { doctorId ? prescriptions = await prescriptionModule.findManyPrescriptions(doctorId, null) : prescriptions = await prescriptionModule.findManyPrescriptions(null, patientId) }
            if (!prescriptions) {
                throw createhttperror.NotFound("can't find this")
            }
            const completedPresc = prescriptions.filter(presc => presc.status === 'done').length;
            const notCompletedPresc = prescriptions.filter(presc => presc.status === 'taking').length;


            res.status(200).json({
                message: 'here',
                prescriptions,
                completed: completedPresc,
                notCompleted: notCompletedPresc
            });
        } catch (err) {
            next(err)
        }
    }


}