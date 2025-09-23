import { AppDataSource } from "../../ormconfig"
import { DoctorProfile } from "../entities/doctorProfile"
import { Specialization } from "../entities/specialization"
import createHttpError from 'http-errors'
import { StatusCodes, ReasonPhrases } from "http-status-codes"

export class SpecializationModules {

    static async allSpecialization() {
        try {
            const specializations = await AppDataSource.getRepository(Specialization).find()
            return specializations
        } catch (err) {
            throw createHttpError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)
        }
    }

    static async doctorSpecialization(doctorId: string) {
        try {
            const doctorSpecialization = await AppDataSource.getRepository(DoctorProfile)
                .createQueryBuilder('d')
                .leftJoinAndSelect('d.specialization', 's')
                .where('d.id = :id', { id: doctorId })
                .getOne()

            if (!doctorSpecialization) {
                throw createHttpError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)

            }

            return doctorSpecialization.specialization.name
        } catch (err) {
            throw createHttpError(StatusCodes.INTERNAL_SERVER_ERROR, ReasonPhrases.INTERNAL_SERVER_ERROR)

        }
    }
}