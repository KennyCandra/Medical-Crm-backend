import AllergiesController from "../controllers/AllergiesController";
import asyncWrapper from "../utils/AsyncWrapper";
import { Request, Response } from "express";
import { ResponseHelper } from "../utils/ResponseHelper";
import { StatusCodes } from "http-status-codes";

class AllergyService {
    static getAllergiesForPatient = asyncWrapper(async (req: Request, res: Response) => {
        const { nid } = req.params;

        const allergies = await AllergiesController.getAllergiesForPatient(nid as string);

        if (!allergies) {
            ResponseHelper.notFound(res);
            return;
        }

        ResponseHelper.success(res, { allergies });
    })

    static addAllergy = asyncWrapper(async (req: Request, res: Response) => {
        const { allergyId } = req.body;
        const { id } = req.user;

        const allergy = await AllergiesController.addAllergy(allergyId, id);
        if (!allergy) {
            ResponseHelper.CustomErr(res, "Error adding allergy", StatusCodes.NOT_FOUND);
            return;
        }

        ResponseHelper.success(res, { allergy: allergy });
    })

    static fetchAllergy = asyncWrapper(async (req: Request, res: Response) => {
        const { value } = req.params;
        const allergies = await AllergiesController.fetchAllergies(value as string);

        ResponseHelper.success(res, { allergies });
    })

    static removePallergy = asyncWrapper(async (req: Request, res: Response) => {
        const { pallergyId } = req.params;
        const { id } = req.user;
        const result = await AllergiesController.removePallergy(pallergyId as string, id as string);
        ResponseHelper.success(res, { result });
    })
}

export default AllergyService;