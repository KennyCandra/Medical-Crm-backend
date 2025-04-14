import { Prescription } from "../../entities/prescription";
import { QueryRunner } from "typeorm";
import { PatientProfile } from "../../entities/patientProfile";
import { DoctorProfile } from "../../entities/doctorProfile";
import createhttperror from 'http-errors'
import { PrescribedDrug } from "../../entities/prescribedDrug";

class prescriptionModule {
    static async createPrescription({ patient, doctor, queryRunner, prescribedDrug }: { patient: PatientProfile, doctor: DoctorProfile, queryRunner: QueryRunner, prescribedDrug: PrescribedDrug[] }) {
        try {
            const newPrescrition = new Prescription()
            newPrescrition.doctor = doctor;
            newPrescrition.patient = patient;
            newPrescrition.prescribedDrugs = prescribedDrug
            newPrescrition.start_date = new Date()

            await queryRunner.manager.save(newPrescrition)
            return newPrescrition
        } catch (err) {
            throw new createhttperror.InternalServerError['internal server error']
        }

    }
}

export default prescriptionModule