import { Column, Entity, Index, OneToMany } from "typeorm";
import { Pallergy } from "./Pallergy";
import { DefaultDocument } from "./NormalDocument";

@Entity()
export class Allergy extends DefaultDocument {

    @Column({ unique: true, nullable: false, type: "citext" })
    @Index({ unique: true })
    name: string;

    @OneToMany(() => Pallergy, (pallergy) => pallergy.allergy)
    patientAllergies: Pallergy[]
}

