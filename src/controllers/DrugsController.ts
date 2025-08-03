import { Request, Response, NextFunction } from "express";
import DrugsModule from "../modules/DrugsModule";
import extractInteractionObjects from "../helpers/extractInteractionObjects";
import { ai } from "../../app";
import prescriptionModule from "../modules/PrescriptionModule";
import PallergyModule from "../modules/PallergyModule";
import extractJsonFromString from "../helpers/JsonCut";
import UserModules from "../modules/UserModules";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import fs from "fs";

const fetchOldDrugInteractionsAndAllergies = async (
  nid: string,
  parsedDrug: string
) => {
  const patient = await UserModules.findUserByNid(nid);
  const drugs =
    await prescriptionModule.fetchDrugsFromPrescriptinsWithStatusTakingForSinglePatient(
      patient.id
    );
  const allergies = await PallergyModule.findForPatient(patient.id);
  const oldDrugs = drugs?.map((d) => d.name) || "";
  const oldAllergies = allergies?.map((d) => d.allergy) || "";
  const textForOldDrugInterActionAndAllergies = fs.readFileSync(
    "src/ai-prompts/OldDrugInteractionAndAllergies.txt",
    "utf8"
  );
  const newTextForDrugInteraction = textForOldDrugInterActionAndAllergies
    .replace("${drug}", parsedDrug as string)
    .replace("${oldDrugs}", oldDrugs as string)
    .replace("${allergies}", oldAllergies as string);
  const responseForOldDrugInterActionAndAllergies =
    await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: newTextForDrugInteraction,
    });
  const analysisText = responseForOldDrugInterActionAndAllergies.text;
  const json = extractJsonFromString(analysisText);
  const parsedTextOldDrugInterActionAndAllergies = JSON.parse(json);
  return parsedTextOldDrugInterActionAndAllergies;
};

const fetchDrugInteraction = async (parsedDrug: string) => {
  const textForDrugInteractions = fs.readFileSync(
    "src/ai-prompts/DrugInteraction.txt",
    "utf8"
  );

  const newTextForDrugInteractions = textForDrugInteractions.replace(
    "${drug}",
    parsedDrug as string
  );

  const responseForDrugInteraction = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: newTextForDrugInteractions,
  });

  const analysisTextForDrugInteraction = responseForDrugInteraction.text;

  const text = extractJsonFromString(analysisTextForDrugInteraction);

  const parsedTextForDrugInteraction = JSON.parse(text);
  return parsedTextForDrugInteraction;
};

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
      const { drug, patientNid } = req.body;

      console.log(drug);
      const parsedDrug = JSON.parse(drug as string);
      const parsedDrugString = parsedDrug.map((d) => d.name);
      let parsedTextOldDrugInterActionAndAllergies = null;
      let parsedTextForDrugInteraction = null;
      console.log(patientNid);
      if (patientNid) {
        parsedTextOldDrugInterActionAndAllergies =
          await fetchOldDrugInteractionsAndAllergies(patientNid, parsedDrugString);
      }
      if (parsedDrug.length > 1) {
        parsedTextForDrugInteraction = await fetchDrugInteraction(
          parsedDrugString
        );
      }
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        parsedTextForDrugInteraction,
        parsedTextOldDrugInterActionAndAllergies,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async searchDrug(req: Request, res: Response, next: NextFunction) {
    try {
      const { value } = req.params;
      const drugs = await DrugsModule.searchDrug(value);
      const editedDrugs = drugs.map((drug) => {
        return {
          id: drug.drug_id,
          name: drug.drug_name,
        };
      });
      res
        .status(StatusCodes.OK)
        .json({ message: ReasonPhrases.OK, drugs: editedDrugs });
    } catch (err) {
      next(err);
    }
  }
}

export default DrugController;
