import { Drug } from "../entities/drug";
import BasicModule from "./BasicModule";
class DrugsModule extends BasicModule<Drug> {
  protected entityClass = Drug;
  protected entityName = "Drug";
}

export default DrugsModule;
