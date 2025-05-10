import { AppDataSource } from "../../ormconfig"
import { Classification } from "../../entities/Classification"

export default class ClassificationModule {
    static async findClass(id: string) {
        try {
            const classify = await AppDataSource.getRepository(Classification).findOneBy({ id: id })
            return classify
        } catch (err) {
            console.log(err)
            throw err
        }
    }
}