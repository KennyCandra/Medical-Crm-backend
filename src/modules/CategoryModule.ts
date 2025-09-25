
import { Category } from "../entities/Category"
import BasicModule from "./BasicModule";

export default class CategoryModule extends BasicModule<Category> {
    private static instance: CategoryModule;
    protected entityClass = Category;
    protected entityName = "Category";

    public static getInstance() {
        if (!this.instance) {
            this.instance = new CategoryModule();
        }
        return this.instance;
    }

    static async findCat(id: string) {
        return await this.getInstance().findById(id);
    }
}