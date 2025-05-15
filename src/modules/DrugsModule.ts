import createhttperror from 'http-errors'
import { AppDataSource } from "../../ormconfig"
import { Drug } from "../entities/drug"

class DrugsModule {
    static async findDrug({ drugId }: { drugId: string }) {
        try {
            const drugRepo = await AppDataSource.getRepository(Drug)
            const drug = await drugRepo.findOneBy({ id: drugId })

            if (!drug) {
                throw new createhttperror.NotFound['drug not found']
            }

            return drug
        } catch (err) {
            if (!err) {
                throw new createhttperror.InternalServerError['internal server error']
            } else {
                throw err
            }
        }

    }

    static async allDrugs(value: string) {
        try {
            const drugs = await AppDataSource.getRepository(Drug)
                .createQueryBuilder('drug')
                .leftJoin('drug.route', 'route')
                .where("drug.name ILIKE :value", { value: `%${value}%` })
                .select([
                    'drug.name AS name',
                    'drug.id AS id',
                    'route.name AS route'
                ])
                .getRawMany();
            return drugs

        }
        catch (err) {
            throw err
        }
    }
}

export default DrugsModule