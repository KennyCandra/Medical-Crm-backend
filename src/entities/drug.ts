import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { PrescribedDrug } from "./prescribedDrug";
import { Classification } from "./Classification";
import { Route } from "./Rotue";

@Entity()
export class Drug {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    name: string;

    @ManyToOne(() => Classification, classification => classification.drugs)
    @JoinColumn()
    classification: Classification;

    @ManyToOne(() => Route, route => route.drugs)
    @JoinColumn()
    route: Route;

    @OneToMany(() => PrescribedDrug, prescribedDrug => prescribedDrug.drug)
    prescribedDrugs: PrescribedDrug[];
}