import { AppDataSource } from "../../../ormconfig";
import { Specialization } from "../../entities/specialization";
import createHttpError from 'http-errors'

export class SpecializationModules {

    static async isValid(validationName: string) {
        const specialization = await AppDataSource.getRepository(Specialization).findOneBy({ name: validationName })

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

}