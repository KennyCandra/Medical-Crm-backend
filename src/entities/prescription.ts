import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { PatientProfile } from "./patientProfile";
import { PrescribedDrug } from "./prescribedDrug";
import { DoctorProfile } from "./doctorProfile";

@Entity()
export class Prescription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    start_date: Date;

    @Column({ nullable: true, type: 'enum', enum: ['taking', 'done'], default: 'taking' })
    status: 'taking' | 'done';

    @Column({ nullable: true })
    description: string

    @ManyToOne(() => PatientProfile, (patientProfile) => patientProfile.prescriptions)
    patient: PatientProfile;

    @ManyToOne(() => DoctorProfile, (profile) => profile.prescriptions)
    doctor: DoctorProfile;

    @OneToMany(() => PrescribedDrug, (prescribedDrug) => prescribedDrug.prescription)
    prescribedDrugs: PrescribedDrug[];
}