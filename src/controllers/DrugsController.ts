import { Request, Response, NextFunction } from "express"
import DrugsModule from "../modules/DrugsModule";
import displayTextAfterNumbers from "../helpers/displayTextAfterNumbers";
import { ai } from "../../api/app";
import prescriptionModule from "../modules/PrescriptionModule";
import PallergyModule from "../modules/PallergyModule";
import extractJsonFromString from "../helpers/JsonCut";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

class DrugController {
    static async fetchAllDrugs(req: Request, res: Response, next: NextFunction) {
        try {
            const { value } = req.body
            const drugs = await DrugsModule.allDrugs(value)
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, drugs })
        } catch (err) {
            next(err)
        }
    }

    static async getInteractions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { drug } = req.query
            const response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL,
                contents: `You are tasked to check for drug-drug interactions between the following drugs ONLY (ignore interactions with any other drugs).
                Answer STRICTLY in the following format:
                1- Yes or No (depending on whether any interactions exist).
                2- If Yes:
                - For each interaction, write in this style:
                    "There is an interaction between [Drug A] and [Drug B]: [brief explanation of the interaction]."
                - List every detected interaction as a separate sentence.
                - Keep the explanation short and specific.
                - add the word also if there is more than 1
                - If No, simply write: "N/A."
                3- Severity: Choose from (Critical - Immediate Action Required, Serious - Use Alternative, Moderate - Monitor Closely, Mild - No Special Action Required)
                **Important:**  
                - Do not add any introduction, summary, comments, or extra text.
                - Respond ONLY with points 1, 2, and 3.
                The drugs are: ${drug}.`,
            });
            const text = displayTextAfterNumbers(response.text);
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, text })
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    static async checkOldInteractions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { nid } = req.params;
            const { newDrugs } = req.query
            console.log(newDrugs)
            const patient = await UserModules.findUserByNid(nid)
            const drugs = await prescriptionModule.fetchDrugsFromPrescriptinsWithStatusTakingForSinglePatient(patient.id)
            let oldDrugs = drugs?.map(d => {
                return d.name
            }) || ''
            const allergies = await PallergyModule.findForPatient(patient.id)
            const oldAllergies = allergies?.map(d => {
                return d.allergy
            }) || ''
            console.log(allergies)
            const response = await ai.models.generateContent({
                model: process.env.GEMINI_MODEL,
                contents: `Check for drug-drug interactions between: ${Array.isArray(newDrugs) ? newDrugs.join(', ') : newDrugs} and the patient’s current medications: ${oldDrugs}.
                Also, check if the patient is allergic to any component of: ${Array.isArray(newDrugs) ? newDrugs.join(', ') : newDrugs}. Patient allergies: ${oldAllergies}.
                Respond with a **valid JSON** object in the following format — no extra text:
                {
                  "hasInteractions": true/false,
                  "interactions": [
                    {
                      "drug1": "Drug A",
                      "drug2": "Drug B",
                      "description": "Brief description of the interaction",
                      "severity": "Critical|Serious|Moderate|Mild"
                    }
                  ],
                  "hasAllergies": true/false,
                  "allergies": [
                    {
                      "drug": "Drug name",
                      "allergen": "Allergen or class name",
                      "severity": "Critical|Serious|Moderate|Mild"
                    }
                  ],
                  "recommendation": "If any interaction or allergy is found, provide a clear clinical recommendation. If none found, return: 'Safe to prescribe based on available information.'"
                }
                Severity levels:
                - Critical: Immediate Action Required – Contraindicated
                - Serious: Use Alternative – Avoid if possible
                - Moderate: Monitor Closely – Adjust dose or monitor
                - Mild: No Special Action Required – Minimal concern
                
                Instructions:
                1. Return only valid JSON
                2. Use empty arrays for “interactions” or “allergies” if none found
                3. Be specific and factual in all outputs
                4. No extra text outside the JSON
                `
            });


            const analysisText = response.text;
            const json = extractJsonFromString(analysisText)
            const parsedText = JSON.parse(json)

            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, data: parsedText })
        } catch (err) {
            next(err)
        }
    }

}

export default DrugController