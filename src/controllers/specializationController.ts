import { Request, Response, NextFunction } from "express"
import { SpecializationModules } from '../modules/SpecializationModules'
import { ReasonPhrases, StatusCodes } from "http-status-codes"

class specialization {

    static async fetchAll(req: Request, res: Response, next: NextFunction) {
        try {
            const specializations = await SpecializationModules.allSpecialization()
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, specializations })
        } catch (err) {
            next(err)
        }
    }
}


export default specialization