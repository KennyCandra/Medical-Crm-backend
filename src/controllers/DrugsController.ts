import { Request, Response, NextFunction } from "express";
import DrugsModule from "../modules/DrugsModule";
import extractInteractionObjects from "../helpers/extractInteractionObjects";
import { ai } from "../../app";
import prescriptionModule from "../modules/PrescriptionModule";
import PallergyModule from "../modules/PallergyModule";
import extractJsonFromString from "../helpers/JsonCut";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

class DrugController {
  static async fetchAllDrugs(req: Request, res: Response, next: NextFunction) {
    try {
      const { value } = req.body;
      const drugs = await DrugsModule.allDrugs(value);
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, drugs });
    } catch (err) {
      next(err);
    }
  }

  static async getInteractions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { drug } = req.query;
      console.log('drugs' ,drug);
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: `
You are tasked with checking for drug-drug interactions between the following drugs only: ${drug}
Check every unique pairwise combination between these drugs (e.g., Drug A with Drug B, Drug A with Drug C, Drug B with Drug C, etc.).
Ignore interactions with any drugs not listed.

Respond strictly with a valid JSON object in the following format:

json
Copy
Edit
{
  "hasInteractions": true/false,
  "interactions": [
    {
      "drug1": "Drug A",
      "drug2": "Drug B",
      "description": "Brief explanation of the interaction",
      "severity": "Critical|Serious|Moderate|Mild"
    }
  ],
  "severity": "Critical|Serious|Moderate|Mild"
}
Instructions:

Set hasInteractions to true if any interactions are found, otherwise false.

Include one object per interaction in the interactions array.

Each object must contain drug1, drug2, description, and severity.

Maintain unique combinations only (e.g., Drug A vs Drug B, not again as Drug B vs Drug A).

The severity field at the root should reflect the most severe interaction level among all detected interactions.

Severity levels must be one of:

Critical – Immediate Action Required

Serious – Use Alternative

Moderate – Monitor Closely

Mild – No Special Action Required

If no interactions are found:

Set hasInteractions to false

Set interactions to an empty array []

Set severity to "Mild"

Important:

Only respond with the valid JSON object — no introduction, comments, or extra text.

Compare each drug with every other drug in the list exactly once.

Do not include interactions with any unlisted drugs.
`,
      });
      const text = extractJsonFromString(response.text);
      const parsedText = JSON.parse(text);
      res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, parsedText });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async checkOldInteractions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { nid } = req.params;
      const { newDrugs } = req.query;
      const patient = await UserModules.findUserByNid(nid);
      const drugs =
        await prescriptionModule.fetchDrugsFromPrescriptinsWithStatusTakingForSinglePatient(
          patient.id
        );
      let oldDrugs =
        drugs?.map((d) => {
          return d.name;
        }) || "";
      const allergies = await PallergyModule.findForPatient(patient.id);
      const oldAllergies =
        allergies?.map((d) => {
          return d.allergy;
        }) || "";
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: `Here is the improved version of your prompt, now focusing only on:

Checking each new drug vs current medications for interactions

Checking each new drug vs patient allergies for allergic reactions

Skipping any interactions between new drugs themselves

It’s rewritten for clarity, precision, and strict formatting:

You are tasked with checking for:

Drug-drug interactions between each new drug and each of the patient’s current medications.

Allergic reactions by comparing each new drug against the patient’s known allergies.

Inputs:

New drugs: ${Array.isArray(newDrugs) ? newDrugs.join(", ") : newDrugs}

Current medications: ${oldDrugs}

Patient allergies: ${oldAllergies}

Check the following:

For each new drug, check for interactions only with current medications (not with other new drugs).

For each new drug, check if it may cause an allergic reaction based on the patient’s allergies.

Ignore any interaction between current drugs or between new drugs themselves.

Respond strictly with a valid JSON object only, no extra text:

json
Copy
Edit
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

Critical: Immediate Action Required – Contraindicated

Serious: Use Alternative – Avoid if possible

Moderate: Monitor Closely – Adjust dose or monitor

Mild: No Special Action Required – Minimal concern

Instructions:

Respond only with valid JSON (no explanation or extra text)

Use empty arrays [] if no interactions or allergies are found

Be specific, accurate, and concise in all descriptions

Do not include duplicate entries

Do not check or report interactions between new drugs themselves
                `,
      });

      const analysisText = response.text;
      const json = extractJsonFromString(analysisText);
      const parsedText = JSON.parse(json);

      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, data: parsedText });
    } catch (err) {
      next(err);
    }
  }
}

export default DrugController;
