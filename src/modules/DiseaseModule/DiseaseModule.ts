import createhttperror from 'http-errors'
import { AppDataSource } from '../../ormconfig'
import { Disease } from '../../entities/disease'
import createHttpError from 'http-errors'


export default class DiseaseModule {
    static async findDiseaseById(id: string) {
        try {
            const disease = await AppDataSource.getRepository(Disease).findOneBy({ id: id })
            return disease

        } catch {
            throw createhttperror[500]('internal server error')
        }
    }

    static async fetchAllDiseases() {
        try {
            const diseases = await AppDataSource.getRepository(Disease).find()
            return diseases
        } catch (err) {
            throw createHttpError.InternalServerError['internal server error']
        }
    }

    static async fetchSpecificDiseases(searchTerm: string) {
        try {
            const value = `%${searchTerm}%`;
            const diseases = await AppDataSource.getRepository(Disease)
                .createQueryBuilder('d')
                .where('d.name LIKE :value', { value })
                .getMany();

            return diseases

        } catch (err) {
            throw createHttpError.InternalServerError['internal server error']
        }

    }
}






