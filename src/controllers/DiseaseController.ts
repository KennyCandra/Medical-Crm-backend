import { Request, Response, NextFunction } from "express";
import DiseaseModule from "../modules/DiseaseModule";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export default class DiseaseController {
    static async fetchDisease(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const diseases = await DiseaseModule.fetchAllDiseases()
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, diseases })
        } catch (err) {
            next(err)
        }
    }

    static async fetchSpecificDisease(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { value } = req.params
            let searchValue = ""
            value ? searchValue = value : searchValue
            const diseases = await DiseaseModule.fetchSpecificDiseases(searchValue)
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, diseases })
        } catch (err) {
            next(err)
        }
    }
}