import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    OneToMany,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";
import { DoctorProfile } from "./doctorProfile";
import { Prescription } from "./prescription";
import { Diagnosis } from "./diagnosis";
import { Pallergy } from "./Pallergy";
import { ReportsEntity } from "./ReportsEntity";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    first_name: string

    @Column({ nullable: false })
    last_name: string

    @Column({ type: 'enum', enum: ['male', 'female'], nullable: false })
    gender: 'male' | 'female'

    @Column({ type: "varchar", length: 14, unique: true, nullable: false })
    NID: string

    @Column({ nullable: false })
    password: string

    @Column({ type: 'enum', enum: ['doctor', 'patient', 'owner'], nullable: false })
    role: 'doctor' | 'patient' | 'admin'

    @Column({ nullable: false, type: 'date' })
    birth_date: Date

    @OneToOne(() => DoctorProfile, (profile) => profile.user, { nullable: true })
    doctorProfile?: DoctorProfile

    @Column({
        nullable: false,
        type: 'enum',
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
        default: 'unknown'
    })
    blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'

    @OneToMany(() => Prescription, prescription => prescription.patient)
    prescriptions: Prescription[]

    @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.patient)
    patientDiagnoses: Diagnosis[]

    @OneToMany(() => ReportsEntity, (reports) => reports.patient)
    reports: ReportsEntity[]

    @OneToMany(() => Pallergy, (Pallergy) => Pallergy.patient)
    patientAllergies: Pallergy[]

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

