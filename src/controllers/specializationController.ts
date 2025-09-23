import { Request, Response, NextFunction } from "express";
import { SpecializationModules } from "../modules/SpecializationModules";
import { ResponseHelper } from "../utils/ResponseHelper";
class specialization {
  static async fetchAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const specializations = await SpecializationModules.allSpecialization();
      ResponseHelper.success(res, specializations);
    } catch (err) {
      next(err);
    }
  }
}

export default specialization;
