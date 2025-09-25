import { Allergy } from "../entities/Allergy"
import { Pallergy } from "../entities/Pallergy"
import { User } from "../entities/user"
import BasicModule from "./BasicModule";

export default class PallergyModule extends BasicModule<Pallergy> {
    private static instance: PallergyModule;
    protected entityClass = Pallergy;
    protected entityName = "Pallergy";

    public static getInstance() {
        if (!this.instance) {
            this.instance = new PallergyModule();
        }
        return this.instance;
    }

    static async create(patientId: string,
        allergyId: string) {
        return this.getInstance().getRepository().create({
            patient: { id: patientId } as User,
            allergy: { id: allergyId } as Allergy
        })
    }

    static async findForPatient(patientId: string): Promise<Pallergy[]> {
        const relations = ["allergy"];
        const where = { patient: { id: patientId } };
        const order = {};
        const selection = {
            id: true,
            allergy: {
                id: true,
                name: true
            }
        };
        return this.getInstance().customFind(relations, where, order, selection);
    }

    static async removePallergy(pallergyId: string): Promise<void> {
        return await this.getInstance().deleteById(pallergyId);
    }
}