import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Allergy } from "./Allergy";
import { User } from "./user";

@Entity()
export class Pallergy {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => User, patient => patient.patientAllergies)
    @JoinColumn()
    patient: User;

    @ManyToOne(() => Allergy, allergy => allergy.patientAllergies)
    @JoinColumn()
    allergy: Allergy;
}


