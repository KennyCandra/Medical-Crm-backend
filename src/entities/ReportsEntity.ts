import { Column, Entity, JoinColumn, ManyToOne,PrimaryGeneratedColumn } from "typeorm";
import { PrescribedDrug } from "./prescribedDrug";
import { User } from "./user";
import { DefaultDocument } from "./NormalDocument";
@Entity()
export class ReportsEntity extends DefaultDocument {

    @Column({ nullable: false })
    description: string;

    @ManyToOne(() => User, patient => patient.reports)
    @JoinColumn()
    patient: User;

    @ManyToOne(() => User, reporter => reporter.reportedBy)
    @JoinColumn()
    reporter: User;

    @ManyToOne(() => PrescribedDrug, drug => drug.reports)
    @JoinColumn()
    prescribedDrug: PrescribedDrug;

    @Column({ default: false })
    reviewed: boolean
}

