import DiseaseModule from "../modules/DiseaseModule";
import asyncWrapper from "../utils/AsyncWrapper";
import { ResponseHelper } from "../utils/ResponseHelper";
import { Request, Response } from "express";

class DiseaseService {
    static searchDisease = asyncWrapper(async (req: Request, res: Response) => {
        const { value } = req.params;
        const diseases = await DiseaseModule.searchDiseases(value as string);
        ResponseHelper.success(res, { diseases: diseases });
    })
}

export default DiseaseService;
