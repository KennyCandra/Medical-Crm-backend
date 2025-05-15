import { AppDataSource } from "../../ormconfig"
import { Category } from "../entities/Category"

export default class CategoryModule {
    static async findCat(id: string) {
        try {
            const category = await AppDataSource.getRepository(Category).findOneBy({ id: id })
            return category
        } catch (err) {
            console.log(err)
            throw err
        }
    }
}