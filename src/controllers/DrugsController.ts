import { Request, Response, NextFunction } from "express";
import DrugsModule from "../modules/DrugsModule";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import AiPrompts from "../modules/Ai-Prompts";


type Drug = {
  name: string
}
class DrugController {
  static async getInteractions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { drug, patientNid } = req.body;

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
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        parsedTextForDrugInteraction,
        parsedTextOldDrugInterActionAndAllergies,
      });
    } catch (err) {
      next(err);
    }
  }

  static async searchDrug(req: Request, res: Response, next: NextFunction) {
    try {
      const { value } = req.params;
      let searchValue = value ? value : ''
      const drugs = await DrugsModule.searchDrug(searchValue);
      const editedDrugs = drugs.map((drug) => {
        return {
          id: drug.id,
          name: drug.name,
          route: drug.route,
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
