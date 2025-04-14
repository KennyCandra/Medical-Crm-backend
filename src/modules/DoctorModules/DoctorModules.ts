import { DoctorProfile } from "../../entities/doctorProfile";
import createHttpError from 'http-errors'
import { User } from "../../entities/user";
import { Specialization } from "../../entities/specialization";
import { QueryRunner } from "typeorm";
import { AppDataSource } from "../../../ormconfig";

export default class DoctorProfileModules {

    static async createDoctor({ user, specialization, license, queryRunner }:
        { user: User, specialization: Specialization, license: string, queryRunner: QueryRunner }) {
        try {
            const newDoctor = new DoctorProfile()
            newDoctor.user = user;
            newDoctor.specialization = specialization
            newDoctor.medical_license_number = license;
            await queryRunner.manager.save(newDoctor)
            return newDoctor
        } catch (err) {
            if (err.code === '23505') {
                throw createHttpError.BadRequest('license already exists');
            }
        }
    }


    static async findDoctor(id: string) {
        try {
            const doctorRepo = await AppDataSource.getRepository(DoctorProfile)
            const doctor = await doctorRepo.findOneBy({ id: id })

            if (!doctor) {
                throw createHttpError.NotFound['doctor id is wrong']
            }
            return doctor
        } catch (err) {
            throw createHttpError.InternalServerError['internal server erro']
        }
    }
}