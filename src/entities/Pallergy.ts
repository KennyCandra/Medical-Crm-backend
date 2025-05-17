import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Allergy } from "./Allergy";
import { User } from "./user";
import { DefaultDocument } from "./NormalDocument";

@Entity()
export class Pallergy extends DefaultDocument {

    @ManyToOne(() => User, patient => patient.patientAllergies)
    @JoinColumn()
    patient: User;

    @ManyToOne(() => Allergy, allergy => allergy.patientAllergies)
    @JoinColumn()
    allergy: Allergy;
}


