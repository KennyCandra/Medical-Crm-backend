import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { Prescription } from "./prescription";
import { Drug } from "./drug";

@Entity()
export class PrescribedDrug {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Prescription, (prescription) => prescription.prescribedDrugs)
    @JoinColumn()
    prescription: Prescription;

    @ManyToOne(() => Drug, (drug) => drug.prescribedDrugs)
    @JoinColumn()
    drug: Drug;

    @Column({ nullable: false })
    dosage: string;

    @Column({ nullable: false })
    frequency: number;

    @Column({ nullable: true })
    start_date: Date;

    @Column({ nullable: true, type: 'enum', enum: ['oral', 'injection', 'topical', 'drops'], default: 'oral' })
    route: 'oral' | 'injection' | 'topical' | 'drops';
}
