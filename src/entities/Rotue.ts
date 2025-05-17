import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Drug } from "./drug";
import { DefaultDocument } from "./NormalDocument";

@Entity()
export class Route extends DefaultDocument {

    @Column({ unique: true, nullable: false })
    name: string;

    @OneToMany(() => Drug, (drug) => drug.route)
    drugs: Drug[];
}
