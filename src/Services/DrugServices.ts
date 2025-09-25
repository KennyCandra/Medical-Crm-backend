import DrugController from "../controllers/DrugsController";
import asyncWrapper from "../utils/AsyncWrapper";
import { Request, Response } from "express";
import { ResponseHelper } from "../utils/ResponseHelper";

export default class DrugServices {
    static searchDrug = asyncWrapper(async (req: Request, res: Response) => {
        const { value } = req.params

        if (!value) {
            ResponseHelper.badRequest(res, "Value is required")
        }

        const drugs = await DrugController.searchDrug(value as string)

        ResponseHelper.success(res, { drugs: drugs });

    })

    static getInteractions = asyncWrapper(async (req: Request, res: Response) => {
        const { drug, patientNid } = req.body;
        const interactions = await DrugController.getInteractions(drug, patientNid)
        ResponseHelper.success(res, { interactions: interactions })
    })
}