import { User } from "../../entities/user";
import { PatientProfile } from '../../entities/patientProfile';
import { AppDataSource } from "../../../ormconfig";
import createHttpError from 'http-errors'

export default class PatientProfileModules {

    static async createPatient({ user, blood_type }:
        { user: User, blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown' }) {
        try {
            const newPatient = new PatientProfile()
            newPatient.blood_type = blood_type
            newPatient.user = user;
            return newPatient
        } catch (err) {
            throw err
        }
    }


    static async findPatientbyNid(id: string) {
        try {
            const patientUser = await AppDataSource.getRepository(User)
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.patientProfile', 'patientProfile')
                .where(`user.NID = :id`, { id })
                .getOne();

            return patientUser.patientProfile;
        } catch (err) {
            if (err.statusCode === 404) throw err;
            throw createHttpError(500, 'Internal server error');
        }
    }

    static async findPatientById(id: string) {
        try {
            const patientUser = await AppDataSource.getRepository(User)
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.patientProfile', 'patientProfile')
                .where(`user.id = :id`, { id })
                .getOne();

            return patientUser.patientProfile;
        } catch (err) {
            if (err.statusCode === 404) throw err;
            throw createHttpError(500, 'Internal server error');
        }
    }
}