import createhttperror from 'http-errors'
import { AppDataSource } from '../../ormconfig'
import { Disease } from '../entities/disease'
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
            const diseases = await AppDataSource.getRepository(Disease)
            .createQueryBuilder('d')
             if(searchTerm.startsWith('*')) {
                searchTerm = searchTerm.replace('*', '')
                diseases.where('d.name LIKE :value', { value: `%${searchTerm}%` })
             } else {
                diseases.where('d.name LIKE :value', { value: `${searchTerm}%` })
             }

            const diseasesResult = await diseases.getMany();

            return diseasesResult

        } catch (err) {
            throw createHttpError.InternalServerError['internal server error']
        }

    }
}






