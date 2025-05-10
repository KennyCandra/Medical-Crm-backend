import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PatientProfile } from "./patientProfile";
import { Allergy } from "./Allergy";

@Entity()
export class Pallergy {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => PatientProfile, patient => patient.patientAllergies)
    @JoinColumn()
    patient: PatientProfile;

    @ManyToOne(() => Allergy, allergy => allergy.patientAllergies)
    @JoinColumn()
    allergy: Allergy;
}


