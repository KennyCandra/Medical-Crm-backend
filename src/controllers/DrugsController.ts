import { Request, Response, NextFunction } from "express"
import DrugsModule from "../modules/DrugsModule/DrugsModule"
import displayTextAfterNumbers from "../helpers/displayTextAfterNumbers";
import { ai } from "../../app";

class DrugController {
    static async fetchAllDrugs(req: Request, res: Response, next: NextFunction) {
        try {
            const { value } = req.body
            const drugs = await DrugsModule.allDrugs(value)
            res.status(200).json({ message: 'here is the drugs', drugs })
        } catch (err) {
            next(err)
        }
    }

    static async getInteractions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { drug } = req.query
            const response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL,
                contents: `I want you to check drug-drug interactions between the following drugs only with each other. Do not include interactions with other drugs. The drugs are : ${drug}.
                Answer in the following format:
                1-Yes or No
                2-If Yes, provide the possible drug interaction between these two drugs; if no, write N/A.
                3-How serious is the interaction (e.g., Serious - Use Alternative, Moderate - Monitor Closely, Mild - No Special Action Required, Critical - Immediate Attention Required, etc.).
                Only respond with the three points above, nothing else.`,
            });
            const text = displayTextAfterNumbers(response.text);
            res.status(200).json({ text })
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

}

export default DrugController