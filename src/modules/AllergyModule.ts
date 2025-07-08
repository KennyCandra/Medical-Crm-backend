import { AppDataSource } from "../../ormconfig"
import { Allergy } from "../entities/Allergy"
import createHttpError from "http-errors"

export default class AllergyModule {
    static async findAllergyById(id: string) {
        try {
            const allergy = await AppDataSource.getRepository(Allergy).findOneBy({ id: id })
            return allergy
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    static async fetchSpecificAllergy(searchTerm: string) {
        try {
            const value = `%${searchTerm}%`;
            const allergies = await AppDataSource.getRepository(Allergy)
                .createQueryBuilder('a')
                .where('a.name LIKE :value', { value })
                .getMany();

            return allergies

        } catch (err) {
            throw createHttpError.InternalServerError['internal server error']
        }

    }
}