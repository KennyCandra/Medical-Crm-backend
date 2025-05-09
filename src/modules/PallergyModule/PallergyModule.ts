import { AppDataSource } from "../../../ormconfig";
import { Allergy } from "../../entities/Allergy";
import { Pallergy } from "../../entities/Pallergy";
import { PatientProfile } from "../../entities/patientProfile";
import createhttperror from 'http-errors'

interface PallergyCreation {
    allergyName: string;
}

export default class PallergyModule {
    static async PallergyCreation(patient: PatientProfile,
        allergy: Allergy) {
        try {
            const newPallergy = new Pallergy()
            newPallergy.patient = patient;
            newPallergy.allergy = allergy
            return newPallergy
        } catch (err) {
            throw createhttperror(500, 'internal server error')
        }

    }

    static async findForPatient(patientId: string) {
        try {
            const allergies = await AppDataSource.getRepository(Pallergy)
                .createQueryBuilder('p')
                .select('allergy.name', 'allergy')
                .addSelect('p.id', 'id')
                .leftJoin('p.patient', 'patient')
                .leftJoin('p.allergy', 'allergy')
                .where('patient.id = :patientId', { patientId: patientId })
                .getRawMany();

            return allergies;
        } catch (err) {
            console.log(err);
            throw createhttperror(500, 'internal server error');
        }
    }

    static async removePallergy(pallergyId: string): Promise<void> {
        try {
            const pallergy = await AppDataSource.getRepository(Pallergy).findOneBy({ id: pallergyId });
            if (!pallergy) {
                throw createhttperror(404, 'Pallergy not found');
            }
            await AppDataSource.getRepository(Pallergy).remove(pallergy);
        } catch (err) {
            console.log(err)
            throw createhttperror(500, 'internal server error')
        }
    }
}