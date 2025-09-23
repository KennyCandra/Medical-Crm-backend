import { AppDataSource } from "../../ormconfig";
import { Allergy } from "../entities/Allergy";

export default class AllergyModule {
  static async initializeAllergy() {
    return await AppDataSource.getRepository(Allergy);
  }
  static async findAllergyById(id: string) {
    try {
      const allergyRepo = await this.initializeAllergy();
      const allergy = await allergyRepo.findOneBy({ id: id });
      return allergy;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async fetchSpecificAllergy(searchTerm: string) {
    const value = `${searchTerm}%`;
    const allergyRepo = await this.initializeAllergy();
    const allergies = await allergyRepo
      .createQueryBuilder("a")
      .where("a.name LIKE :value", { value })
      .getMany();

    return allergies;
  }
}
