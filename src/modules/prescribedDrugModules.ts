import { PrescribedDrug } from "../entities/prescribedDrug"
import { Drug } from "../entities/drug"
import BasicModule from "./BasicModule";

class prescribedDrugModule extends BasicModule<PrescribedDrug> {
    private static instance: prescribedDrugModule;
    protected entityClass = PrescribedDrug;
    protected entityName = "PrescribedDrug";

    public static getInstance() {
        if (!this.instance) {
            this.instance = new prescribedDrugModule();
        }
        return this.instance;
    }

    static async createPrescribedDrug(drugName: string, dose: string, frequency: string, time: "before" | "after") {
        const prescribedDrugRep = await this.getInstance().getRepository().create({
            dosage: dose,
            drug: { id: drugName } as Drug,
            frequency: frequency,
            time: time
        })
        return prescribedDrugRep
    }
}


export default prescribedDrugModule