import createhttperror from 'http-errors'
import { AppDataSource } from "../../../ormconfig";
import { Drug } from "../../entities/drug";

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
            throw new createhttperror.InternalServerError['internal server error']
        }

    }
}

export default DrugsModule