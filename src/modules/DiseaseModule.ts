import createhttperror from 'http-errors'
import { AppDataSource } from '../../ormconfig'
import { Disease } from '../entities/disease'


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
        const diseases = await AppDataSource.getRepository(Disease).find()
        return diseases
    }

    static async fetchSpecificDiseases(searchTerm: string) {
        const diseases = await AppDataSource.getRepository(Disease)
            .createQueryBuilder('d')
        if (searchTerm.startsWith('*')) {
            searchTerm = searchTerm.replace('*', '')
            diseases.where('d.name LIKE :value', { value: `%${searchTerm}%` })
        } else {
            diseases.where('d.name LIKE :value', { value: `${searchTerm}%` })
        }

        const diseasesResult = await diseases.getMany();

        return diseasesResult

    }
}






