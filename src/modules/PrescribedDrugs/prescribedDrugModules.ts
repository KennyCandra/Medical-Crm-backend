import { PrescribedDrug } from "../../entities/prescribedDrug";
import { Drug } from "../../entities/drug";
import { AppDataSource } from "../../../ormconfig";
import createhttperror from 'http-errors'
import { QueryRunner } from "typeorm";

class prescribedDrugModule {
    static async createPrescribedDrug(drugName: Drug, dose: string, frequency: string, queryRunner: QueryRunner) {

        try {
            const prescribedDrugRep = await AppDataSource.getRepository(PrescribedDrug)
            const newPrescribedDrug = prescribedDrugRep.create({
                dosage: dose,
                drug: drugName,
                frequency: frequency,
            })
            await queryRunner.manager.save(newPrescribedDrug)
            return newPrescribedDrug
        } catch (err) {
            console.log(err)
            throw createhttperror.InternalServerError['internal server error']
        }
    }
}

export default prescribedDrugModule