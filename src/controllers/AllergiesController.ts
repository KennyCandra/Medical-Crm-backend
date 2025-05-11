import { NextFunction, Request, Response } from "express";
import PatientProfileModules from "../modules/patientModules/PatientModules";
import createhttperror from "http-errors";
import { AppDataSource } from "../../ormconfig";
import { Pallergy } from "../entities/Pallergy";
import AllergyModule from "../modules/AllergiesModule/AllergyModule";
import PallergyModule from "../modules/PallergyModule/PallergyModule";

export default class AllergiesController {
    static async getAllergiesForPatient(req: Request, res: Response, next: NextFunction) {
        try {
            const { nid } = req.params;
            const patient = await PatientProfileModules.findPatientbyNid(nid);
            if (!patient) {
                throw createhttperror(404, "Patient not found");
            }
            const allergies = await PallergyModule.findForPatient(patient.id);
            if (!allergies) {
                throw createhttperror(404, "No allergies found for this patient");
            }
            res.status(200).json({ allergies: allergies });
        } catch (error) {
            next(error);
        }
    }

    static async addAllergy(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, allergyId } = req.body;
            const patient = await PatientProfileModules.findPatientById(userId);
            if (!patient) {
                throw createhttperror(404, "Patient not found");
            }
            const allergy = await AllergyModule.findAllergyById(allergyId);
            if (!allergy) {
                throw createhttperror(404, "Allergy not found");
            }
            const newPallergy = await PallergyModule.PallergyCreation(patient, allergy);
            await AppDataSource.getRepository(Pallergy).save(newPallergy);
            res.status(201).json(newPallergy);
        } catch (error) {
            next(error);
        }
    }

    static async removePllergy(req: Request, res: Response, next: NextFunction) {
        try {
            const { pallergyId } = req.params;
            await PallergyModule.removePallergy(pallergyId);
            res.status(200).json({ message: "Pallergy removed successfully" });
        } catch (error) {
            next(error);
        }
    }

    static async getSpecificAllergy(req: Request, res: Response, next: NextFunction) {
        try {
            const { allergyId } = req.params;
            const allergy = await AllergyModule.fetchSpecificAllergy(allergyId);
            res.status(200).json(allergy);
        } catch (error) {
            next(error);
        }
    }

}