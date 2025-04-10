import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PrescribedDrug } from "./prescribedDrug";

@Entity()
export class Drug {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
    classification: string;

    @Column({ nullable: false })
    system: string;

    @Column({ nullable: false })
    drug: string;

    @Column({ nullable: false, type: 'enum', enum: ['oral', 'injection', 'topical', 'drops'], default: 'oral' })
    route: 'oral' | 'injection' | 'topical' | 'drops';

    @OneToMany(() => PrescribedDrug, (prescribedDrug) => prescribedDrug.drug)
    prescribedDrugs: PrescribedDrug[];
}
