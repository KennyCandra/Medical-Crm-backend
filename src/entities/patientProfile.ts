import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Prescription } from "./prescription"
import { User } from "./user"
import { Diagnosis } from "./diagnosis"

@Entity()
export class PatientProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({
        nullable: false,
        type: 'enum',
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
        default: 'Unknown'
    })
    blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown'

    @OneToMany(() => Prescription, prescription => prescription.patient)
    prescriptions: Prescription[]

    @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.patient)
    patientDiagnoses: Diagnosis[]

    @OneToOne(() => User , (user) => user.patientProfile)
    @JoinColumn()
    user: User
}