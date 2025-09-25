import { Pallergy } from "../entities/Pallergy";
import AllergyModule from "../modules/AllergyModule";
import PallergyModule from "../modules/PallergyModule";
import UserModules from "../modules/UserModules";
import { Allergy } from "../entities/Allergy";

export default class AllergiesController {
  static async getAllergiesForPatient(nid: string): Promise<Pallergy[] | null> {
    const patient = await UserModules.findUserByNid(nid);

    if (!patient) {
      return null
    }

    const allergies = await PallergyModule.findForPatient(patient?.id);
    return allergies;
  }

  static async addAllergy(allergyId: string, id: string): Promise<Pallergy | null> {
    ;


    const newPallergy = await PallergyModule.create(id, allergyId);

    await PallergyModule.getInstance().save(newPallergy as Pallergy);

    return newPallergy as Pallergy;
  }

  static async removePallergy(pallergyId: string, id: string): Promise<boolean> {

    const relation = ['patient'];
    const where = { id: pallergyId, patient: { id: id } };
    const pallergy = await PallergyModule.getInstance().customFind(relation, where);

    if (pallergy[0]?.patient.id !== id) {
      return false;
    }

    await PallergyModule.getInstance().deleteById(pallergy[0].id);

    return true;
  }

  static async fetchAllergies(value: string): Promise<Allergy[]> {
    return await AllergyModule.getInstance().search(value, "name");
  }
}

