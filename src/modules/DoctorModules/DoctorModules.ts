import { DoctorProfile } from "../../entities/doctorProfile";
import createHttpError from 'http-errors'
import { User } from "../../entities/user";
import { Specialization } from "../../entities/specialization";
import { AppDataSource } from "../../../ormconfig";

export default class DoctorProfileModules {

    static async createDoctor({ user, specialization, license }:
        { user: User, specialization: Specialization, license: string }) {
        try {
            const newDoctor = new DoctorProfile()
            newDoctor.user = user;
            newDoctor.specialization = specialization
            newDoctor.medical_license_number = license;
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