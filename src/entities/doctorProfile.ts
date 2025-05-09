import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Specialization } from "./specialization"
import { User } from "./user"
import { Diagnosis } from "./diagnosis"
import { Prescription } from "./prescription"
import { ReportsEntity } from "./ReportsEntity"

@Entity()
export class DoctorProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true, nullable: false })
    medical_license_number: string

    @ManyToOne(() => Specialization, (specialization) => specialization.doctors)
    specialization: Specialization

    @OneToOne(() => User, (user) => user.doctorProfile)
    @JoinColumn()
    user: User

    @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.doctor, { nullable: true })
    diagnoses: Diagnosis[]

    @OneToMany(() => Prescription, (prescription) => prescription.doctor, { nullable: true })
    prescriptions: Prescription[]

    @OneToMany(() => ReportsEntity, (reports) => reports.doctor)
    reports: ReportsEntity[]
}