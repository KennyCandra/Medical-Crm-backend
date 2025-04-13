import { Request, Response, NextFunction } from "express"
import { SpecializationModules } from '../modules/SpecializationModules/SpecializationModules'

class specialization {

    static async fetchAll(req: Request, res: Response, next: NextFunction) {
        try {
            const specializations = await SpecializationModules.allSpecialization()
            res.status(200).json({ message: 'fetched your data', specializations })
        } catch (err) {
            next(err)
        }
    }
}


export default specialization