import { User } from "../../entities/user";
import { QueryRunner } from "typeorm";
import { PatientProfile } from '../../entities/patientProfile';
import { AppDataSource } from "../../../ormconfig";
import createHttpError from 'http-errors'

export default class PatientProfileModules {

    static async createPatient({ user, blood_type, queryRunner }:
        { user: User, blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown', queryRunner: QueryRunner }) {
        try {
            const newPatient = new PatientProfile()
            newPatient.blood_type = blood_type
            newPatient.user = user;
            await queryRunner.manager.save(newPatient)
            return newPatient
        } catch (err) {
            throw err
        }
    }


    static async findPatient(id: string) {
        try {
            const patientRepo = await AppDataSource.getRepository(PatientProfile)
            const patient = await patientRepo.findOneBy({ id: id })
            return patient
        } catch (err) {
            throw createHttpError.InternalServerError['internal server erro']
        }
    }
}