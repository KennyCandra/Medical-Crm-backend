import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Drug } from "./drug";

@Entity()
export class Route {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
    name: string;

    @OneToMany(() => Drug, (drug) => drug.route)
    drugs: Drug[];
}