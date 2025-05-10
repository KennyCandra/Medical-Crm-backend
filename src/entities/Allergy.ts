import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { Pallergy } from "./Pallergy";

@Entity()
export class Allergy {
    @PrimaryGeneratedColumn('uuid')
    id: string 

    @Column({ unique: true, nullable: false })
    name: string;

    @OneToMany(() => Pallergy, (pallergy) => pallergy.allergy)
    patientAllergies: Pallergy[]
}
