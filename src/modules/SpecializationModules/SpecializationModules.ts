import { AppDataSource } from "../../../ormconfig";
import { DoctorProfile } from "../../entities/doctorProfile";
import { Specialization } from "../../entities/specialization";
import createHttpError from 'http-errors'

export class SpecializationModules {

    static async isValid(specialityId: string) {
        const specialization = await AppDataSource.getRepository(Specialization).findOneBy({ id: specialityId })

        if (specialization) {
            return { specializationId: specialization, isValidSpecialization: true }
        } else {
            return { specializationId: null, isValidSpecialization: false }
        }
    }

    static async allSpecialization() {
        try {
            const specializations = await AppDataSource.getRepository(Specialization).find()
            return specializations
        } catch (err) {
            throw createHttpError.InternalServerError['internal server error']
        }
    }

    static async doctorSpecialization(doctorId: string) {
        try {
            const doctorSpecialization = await AppDataSource.getRepository(DoctorProfile)
                .createQueryBuilder('d')
                .leftJoinAndSelect('d.specialization', 's')
                .where('d.id = :id', { id: doctorId })
                .getOne()
            return doctorSpecialization.specialization.name
        } catch (err) {
            throw createHttpError.InternalServerError['internal server error']
        }
    }

}