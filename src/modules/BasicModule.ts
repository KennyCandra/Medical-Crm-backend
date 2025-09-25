import { DeepPartial, FindOptionsSelect, Like, ObjectLiteral } from "typeorm";
import { AppDataSource } from "../../ormconfig";

export default abstract class BasicModule<T> {
    protected abstract entityClass: new () => T;
    protected abstract entityName: string;

    getRepository() {
        return AppDataSource.getRepository(this.entityClass);
    }
    async findById(id: string): Promise<T | null> {
        return await this.getRepository().findOneBy({ id: id }) as T | null;
    }

    async findAll(): Promise<T[]> {
        return await this.getRepository().find() as T[];
    }

    async deleteById(id: string): Promise<void> {
        await this.getRepository().delete(id);
    }

    async save(entity: T): Promise<T> {
        return await this.getRepository().save(entity as DeepPartial<ObjectLiteral>) as T;
    }

    async update(id: string, entity: T): Promise<T> {
        return await this.getRepository().update(id, entity as DeepPartial<ObjectLiteral>) as T;
    }

    async findWithIdAndRelations(id: string, relations: string[]): Promise<T[]> {
        return await this.getRepository().findOne({ where: { id: id }, relations: relations }) as T[];
    }

    async deleteWithWhere(where: Record<string, any>): Promise<void> {
        await this.getRepository().delete(where);
    }

    async search(searchTerm: string, field: string): Promise<T[]> {
        return await this.getRepository().find({ where: { [field]: Like(`${searchTerm}%`) } }) as T[];
    }

    async customFind(relations: string[] = [], where: Record<string, any> = {}, order: Record<string, any> = {},
        selection: FindOptionsSelect<ObjectLiteral> | undefined = {}): Promise<T[]> {
        return await this.getRepository().find({ where: { ...where }, relations: relations, order: order, select: selection }) as T[];
    }

}