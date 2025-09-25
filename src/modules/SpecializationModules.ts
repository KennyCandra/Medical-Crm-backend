import { Specialization } from "../entities/specialization"
import BasicModule from "./BasicModule"

export default class SpecializationModules extends BasicModule<Specialization> {

    private static instance: SpecializationModules;
    protected entityClass = Specialization;
    protected entityName = "Specialization";

    public static getInstance() {
        if (!this.instance) {
            this.instance = new SpecializationModules();
        }
        return this.instance;
    }

    static async fetchAllSpecializations(): Promise<Specialization[]> {
        return await this.getInstance().findAll();
    }

    static async doctorSpecialization(doctorId: string): Promise<Specialization | null> {
        return await this.getInstance().findById(doctorId);
    }
}