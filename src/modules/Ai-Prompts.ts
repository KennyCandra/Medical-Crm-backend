import { ai } from "../../app";
import prescriptionModule from "../modules/PrescriptionModule";
import PallergyModule from "../modules/PallergyModule";
import extractJsonFromString from "../helpers/JsonCut";
import UserModules from "../modules/UserModules";
import fs from "fs";

class AiPrompts {
  static async fetchOldDrugInteractionsAndAllergies(nid: string,parsedDrug: string) : Promise<string> {
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
  }

  static async fetchDrugInteraction(parsedDrug: string) : Promise<string> {
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
  }
}

export default AiPrompts;