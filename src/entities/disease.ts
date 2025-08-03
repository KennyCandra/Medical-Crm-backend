import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";
import { Diagnosis } from "./diagnosis";
import { DefaultDocument } from "./NormalDocument";


@Entity()
export class Disease extends DefaultDocument {

    @Column()
    name: string

    @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.disease)
    diagnoses: Diagnosis[]
}


