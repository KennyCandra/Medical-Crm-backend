import { Request, Response, NextFunction } from "express"
import DrugsModule from "../modules/DrugsModule/DrugsModule"

class DrugController {
    static async fetchAllDrugs(req: Request, res: Response, next: NextFunction) {
        try {
            const drugs = await DrugsModule.allDrugs()
            res.status(200).json({ message: 'here is the drugs', drugs })
        } catch (err) {
            next(err)
        }
    }

}


export default DrugController