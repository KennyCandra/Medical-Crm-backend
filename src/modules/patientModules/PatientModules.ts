import { User } from "../../entities/user";
import { QueryRunner } from "typeorm";
import { PatientProfile } from '../../entities/patientProfile';

export default class PatientProfileModules {

    static async createPatient({ user, blood_type, queryRunner }:
        { user: User, blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown', queryRunner: QueryRunner }) {
        try {
            const newPatient = new PatientProfile()
            newPatient.blood_type = blood_type
            newPatient.user = user;
            console.log('i am here')
            await queryRunner.manager.save(newPatient)
            return newPatient
        } catch (err) {
            throw err
        }
    }
}