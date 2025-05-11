import { Column, Entity, JoinColumn, ManyToOne,PrimaryGeneratedColumn } from "typeorm";
import { PatientProfile } from "./patientProfile";
import { DoctorProfile } from "./doctorProfile";
import { PrescribedDrug } from "./prescribedDrug";

@Entity()
export class ReportsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    description: string;

    @ManyToOne(() => PatientProfile, patient => patient.reports)
    @JoinColumn()
    patient: PatientProfile;

    @ManyToOne(() => DoctorProfile, doctor => doctor.reports)
    @JoinColumn()
    doctor: DoctorProfile;

    @ManyToOne(() => PrescribedDrug, drug => drug.reports)
    @JoinColumn()
    prescribedDrug: PrescribedDrug;

    @Column({ default: false })
    reviewed: boolean
}

