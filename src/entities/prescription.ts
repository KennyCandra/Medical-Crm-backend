import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { PrescribedDrug } from "./prescribedDrug";
import { DoctorProfile } from "./doctorProfile";
import { User } from "./user";
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

    @ManyToOne(() => User, (user) => user.prescriptions)
    patient: User;

    @ManyToOne(() => DoctorProfile, (profile) => profile.prescriptions)
    doctor: DoctorProfile;

    @OneToMany(() => PrescribedDrug, (prescribedDrug) => prescribedDrug.prescription)
    prescribedDrugs: PrescribedDrug[];
}


