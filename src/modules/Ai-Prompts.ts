
import Groq from "groq-sdk";
import prescriptionModule from "../modules/PrescriptionModule";
import PallergyModule from "../modules/PallergyModule";
import extractJsonFromString from "../helpers/JsonCut";
import UserModules from "../modules/UserModules";
import fs from "fs";
import path from "path";

class AiPrompts {
  private static groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  private static async callOpenRouterAPI(content: string): Promise<string> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a medical AI assistant specialized in drug interactions and allergies analysis. Provide accurate, detailed medical information in JSON format when requested.",
          },
          {
            role: "user",
            content: content,
          },
        ],
        model: "deepseek-r1-distill-llama-70b",
        temperature: 0.1,
        max_tokens: 2048,
      });

      const responseContent = chatCompletion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("No response content from Groq API");
      }
      return responseContent;
    } catch (error) {
      throw error;
    }
  }
  static async fetchOldDrugInteractionsAndAllergies(
    nid: string,
    parsedDrug: string
  ): Promise<string> {

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
      .replace("${drugs}", parsedDrug as string)
      .replace("${oldDrugs}", oldDrugs as string)
      .replace("${allergies}", oldAllergies as string);


    const analysisText = await this.callOpenRouterAPI(
      newTextForDrugInteraction
    );


    const promptTextForDrugInteraction = path.join(__dirname, "..", "ai-prompts", "prompt2.txt");
    fs.writeFileSync(promptTextForDrugInteraction, newTextForDrugInteraction as string);

    const responseTextForDrugInteraction = path.join(__dirname, "..", "ai-prompts", "response2.txt");
    fs.writeFileSync(responseTextForDrugInteraction, analysisText as string);

    const json = extractJsonFromString(analysisText);
    const parsedTextOldDrugInterActionAndAllergies = JSON.parse(json);
    return parsedTextOldDrugInterActionAndAllergies;
  }

  static async fetchDrugInteraction(parsedDrug: string): Promise<string> {
    const textForDrugInteractions = fs.readFileSync(
      "src/ai-prompts/DrugInteraction.txt",
      "utf8"
    );

    const newTextForDrugInteractions = textForDrugInteractions.replace(
      "${drug}",
      parsedDrug as string
    );

    const analysisTextForDrugInteraction = await this.callOpenRouterAPI(
      newTextForDrugInteractions
    );

    const promptTextForDrugInteraction = path.join(__dirname, "..", "ai-prompts", "prompt1.txt");
    fs.writeFileSync(promptTextForDrugInteraction, newTextForDrugInteractions as string);

    const responseTextForDrugInteraction = path.join(__dirname, "..", "ai-prompts", "response1.txt");
    fs.writeFileSync(responseTextForDrugInteraction, analysisTextForDrugInteraction as string);

    const text = extractJsonFromString(analysisTextForDrugInteraction);

    const parsedTextForDrugInteraction = JSON.parse(text);
    return parsedTextForDrugInteraction;
  }
}

export default AiPrompts;
