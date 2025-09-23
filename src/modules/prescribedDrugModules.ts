import { PrescribedDrug } from "../entities/prescribedDrug"
import { Drug } from "../entities/drug"
import { AppDataSource } from "../../ormconfig"

class prescribedDrugModule {
    static async createPrescribedDrug(drugName: string, dose: string, frequency: string, time: "before" | "after") {

        const prescribedDrugRep = await AppDataSource.getRepository(PrescribedDrug)
        const newPrescribedDrug = prescribedDrugRep.create({
            dosage: dose,
            drug: { id: drugName } as Drug,
            frequency: frequency,
            time: time
        })
        return newPrescribedDrug
    }
}


export default prescribedDrugModule