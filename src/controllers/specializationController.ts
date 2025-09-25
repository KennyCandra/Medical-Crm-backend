import SpecializationModules from "../modules/SpecializationModules";
class specialization {
  static async fetchAll() {
    return await SpecializationModules.fetchAllSpecializations();
  }
}


export default specialization;
