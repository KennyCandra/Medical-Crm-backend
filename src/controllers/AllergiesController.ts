import { NextFunction, Request, Response } from "express";
import createhttperror from "http-errors";
import { AppDataSource } from "../../ormconfig";
import { Pallergy } from "../entities/Pallergy";
import AllergyModule from "../modules/AllergyModule";
import PallergyModule from "../modules/PallergyModule";
import UserModules from "../modules/UserModules";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export default class AllergiesController {
    static async getAllergiesForPatient(req: Request, res: Response, next: NextFunction) {
        try {
            const { nid } = req.params;
            const patient = await UserModules.findUserByNid(nid);
            if (!patient) {
                throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
            }
            const allergies = await PallergyModule.findForPatient(patient.id);
            if (!allergies) {
                throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
            }
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, allergies: allergies });
        } catch (error) {
            next(error);
        }
    }

    static async addAllergy(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, allergyId } = req.body;
            const patient = await UserModules.findUserByNid(userId);
            if (!patient) {
                throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
            }
            const allergy = await AllergyModule.findAllergyById(allergyId);
            if (!allergy) {
                throw createhttperror(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND);
            }
            const newPallergy = await PallergyModule.PallergyCreation(patient, allergy);
            await AppDataSource.getRepository(Pallergy).save(newPallergy);
            res.status(StatusCodes.CREATED).json({ message: ReasonPhrases.CREATED, pallergy: newPallergy });
        } catch (error) {
            next(error);
        }
    }

    static async removePllergy(req: Request, res: Response, next: NextFunction) {
        try {
            const { pallergyId } = req.params;
            await PallergyModule.removePallergy(pallergyId);
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
        } catch (error) {
            next(error);
        }
    }

    static async getSpecificAllergy(req: Request, res: Response, next: NextFunction) {
        try {
            const { allergyId } = req.params;
            const allergy = await AllergyModule.fetchSpecificAllergy(allergyId);
            res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK, allergy });
        } catch (error) {
            next(error);
        }
    }

}