import createhttperror from "http-errors";
import { AppDataSource } from "../../ormconfig";
import { Drug } from "../entities/drug";
import { StatusCodes , ReasonPhrases } from "http-status-codes";

class DrugsModule {
  static async findDrug({ drugId }: { drugId: string }) {
    try {
      const drugRepo = await AppDataSource.getRepository(Drug);
      const drug = await drugRepo.findOneBy({ id: drugId });

      if (!drug) {
        throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
      }

      return drug;
    } catch (err) {
      if (!err) {
        throw new createhttperror.InternalServerError[
          "internal server error"
        ]();
      } else {
        throw err;
      }
    }
  }

  static async allDrugs(value: string) {
    try {
      const drugs = await AppDataSource.getRepository(Drug)
        .createQueryBuilder("drug")
        .leftJoin("drug.route", "route")
        .where("drug.name LIKE :value", { value: `${value}%` })
        .select(["drug.name AS name", "drug.id AS id", "route.name AS route"])
        .getRawMany();
      return drugs;
    } catch (err) {
      throw err;
    }
  }

  static async searchDrug(value: string) {
    try {
      const drugRepo = await AppDataSource.getRepository(Drug).createQueryBuilder("drug");
      if (value.startsWith("*")) {
        drugRepo.where("drug.name LIKE :value", {
          value: `%${value.slice(1)}%`,
        });
      } else {
        drugRepo.where("drug.name LIKE :value", { value: `${value}%` });
      }
      const drugs = await drugRepo
        .leftJoin("drug.route", "route")
        .select(["drug.name AS name", "drug.id AS id", "route.name AS route"])
        .getRawMany();
      return drugs;
    } catch (err) {
      throw err;
    }
  }
}

export default DrugsModule;
