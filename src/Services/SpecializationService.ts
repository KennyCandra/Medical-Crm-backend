import SpecializationModules from "../modules/SpecializationModules";
import asyncWrapper from "../utils/AsyncWrapper";
import { Request, Response } from "express";
import { ResponseHelper } from "../utils/ResponseHelper";

class SpecializationService {
    static getAllSpecializations = asyncWrapper(async (_req: Request, res: Response) => {
        const specializations = await SpecializationModules.fetchAllSpecializations();
        ResponseHelper.success(res, specializations);
    })
}

export default SpecializationService;