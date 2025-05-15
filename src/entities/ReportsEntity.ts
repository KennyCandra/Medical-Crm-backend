import { Column, Entity, JoinColumn, ManyToOne,PrimaryGeneratedColumn } from "typeorm";
import { DoctorProfile } from "./doctorProfile";
import { PrescribedDrug } from "./prescribedDrug";
import { User } from "./user";
@Entity()
export class ReportsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    description: string;

    @ManyToOne(() => User, patient => patient.reports)
    @JoinColumn()
    patient: User;

    @ManyToOne(() => DoctorProfile, doctor => doctor.reports)
    @JoinColumn()
    doctor: DoctorProfile;

    @ManyToOne(() => PrescribedDrug, drug => drug.reports)
    @JoinColumn()
    prescribedDrug: PrescribedDrug;

    @Column({ default: false })
    reviewed: boolean
}

