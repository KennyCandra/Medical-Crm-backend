import { Request, Response, NextFunction } from "express";
import DiseaseModule from "../modules/DiseaseModule";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export default class DiseaseController {
    static async fetchDisease(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            const diseases = await DiseaseModule.fetchSpecificDiseases(value)
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, diseases })
        } catch (err) {
            next(err)
        }
    }
}