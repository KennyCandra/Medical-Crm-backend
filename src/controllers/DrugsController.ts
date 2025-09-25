import AiPrompts from "../modules/Ai-Prompts";
import DrugsModule from "../modules/DrugsModule";
import { Drug } from "../entities/drug";

class DrugController {

  private static instance: DrugsModule

  private static getInstance() {
    if (!DrugController.instance) {
      DrugController.instance = new DrugsModule();
    }
    return DrugController.instance;
  }

  static async getInteractions(drug: string, patientNid: string) {
    const parsedDrug = JSON.parse(drug as string);
    const parsedDrugString = parsedDrug.map((d: Drug) => d.name);

    let parsedTextOldDrugInterActionAndAllergies = null;
    let parsedTextForDrugInteraction = null;
    if (patientNid) {
      parsedTextOldDrugInterActionAndAllergies =
        await AiPrompts.fetchOldDrugInteractionsAndAllergies(
          patientNid,
          parsedDrugString
        );
    }
    if (parsedDrug.length > 1) {
      parsedTextForDrugInteraction =
        await AiPrompts.fetchDrugInteraction(parsedDrugString);
    }
    return {
      parsedTextForDrugInteraction,
      parsedTextOldDrugInterActionAndAllergies,
    }
  }

  static async searchDrug(value: string) {
    let searchValue = value ? value : ''
    const drugs = await this.getInstance().search(searchValue, "name");
    const editedDrugs = drugs?.map((drug: Drug) => {
      return {
        id: drug.id,
        name: drug.name,
        route: drug.route?.name,
      };
    });

    return editedDrugs
  }
}


export default DrugController;
