import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { Allergy } from "./Allergy";
import { User } from "./user";
import { DefaultDocument } from "./NormalDocument";

@Entity()
export class Pallergy extends DefaultDocument {

    @ManyToOne(() => User, patient => patient.patientAllergies, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    patient: User;

    @ManyToOne(() => Allergy, allergy => allergy.patientAllergies, {
        nullable: true,
        onDelete: 'SET NULL'
    })
    @JoinColumn()
    allergy: Allergy;
}


