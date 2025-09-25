import { Allergy } from "../entities/Allergy";
import BasicModule from "./BasicModule";
export default class AllergyModule extends BasicModule<Allergy> {
  private static instance: AllergyModule;
  protected entityClass = Allergy;
  protected entityName = "Allergy";

  public static getInstance() {
    if (!this.instance) {
      this.instance = new AllergyModule();
    }
    return this.instance;
  }
}