import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { PrescribedDrug } from "./prescribedDrug";
import { Classification } from "./Classification";
import { Route } from "./Rotue";
import { DefaultDocument } from "./NormalDocument";

@Entity()
export class Drug extends DefaultDocument {

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


