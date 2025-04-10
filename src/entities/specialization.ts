import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DoctorProfile } from "./doctorProfile";

@Entity()
export class Specialization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description?: string;

    @OneToMany(() => DoctorProfile, (doctorProfile) => doctorProfile.specialization, { nullable: true })
    doctors: DoctorProfile[]
}