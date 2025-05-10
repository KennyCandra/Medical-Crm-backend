import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne
} from "typeorm";
import { PatientProfile } from "./patientProfile";
import { DoctorProfile } from "./doctorProfile";

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
    role: 'doctor' | 'patient' | 'owner'

    @Column({ nullable: false, type: 'date' })
    birth_date: Date

    @OneToOne(() => DoctorProfile, (profile) => profile.user, { nullable: true })
    doctorProfile?: DoctorProfile

    @OneToOne(() => PatientProfile, (profile) => profile.user, { nullable: true })
    patientProfile?: PatientProfile
    

}

