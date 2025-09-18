import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { PrescribedDrug } from "./prescribedDrug";
import { User } from "./user";
import { DefaultDocument } from "./NormalDocument";
@Entity()
export class ReportsEntity extends DefaultDocument {

    @Column({ nullable: false })
    description: string;

    @ManyToOne(() => User, patient => patient.reports, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    patient: User;

    @ManyToOne(() => User, reporter => reporter.reportedBy, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    reporter: User;

    @ManyToOne(() => PrescribedDrug, drug => drug.reports, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    prescribedDrug: PrescribedDrug;

    @Column({ default: false })
    reviewed: boolean
}

