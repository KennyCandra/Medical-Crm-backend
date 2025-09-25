
import { Disease } from '../entities/disease'
import BasicModule from './BasicModule'
import { FindOptionsSelect, Like, ObjectLiteral } from 'typeorm';

export default class DiseaseModule extends BasicModule<Disease> {
    private static instance: DiseaseModule;
    protected entityClass = Disease;
    protected entityName = "Disease";

    public static getInstance() {
        if (!this.instance) {
            this.instance = new DiseaseModule();
        }
        return this.instance;
    }

    static async findDiseaseById(id: string) {
        const disease = await this.getInstance().findById(id);
        return disease;
    }

    static async searchDiseases(searchTerm: string) {
        if (searchTerm.startsWith('*')) {
            const cleanTerm = searchTerm.replace('*', '');
            const relations: string[] = [];
            const where = { name: Like(`%${cleanTerm}%`) };
            const order = {};
            const selection: FindOptionsSelect<ObjectLiteral> = {};
            return await this.getInstance().customFind(relations, where, order, selection);
        } else {
            const relations: string[] = [];
            const where = { name: Like(`${searchTerm}%`) };
            const order = {};
            const selection: FindOptionsSelect<ObjectLiteral> = {};
            return await this.getInstance().customFind(relations, where, order, selection);
        }
    }
}