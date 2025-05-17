import { Column, Entity, OneToMany } from "typeorm";
import { DoctorProfile } from "./doctorProfile";
import { DefaultDocument } from "./NormalDocument";

@Entity()
export class Specialization extends DefaultDocument {

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description?: string;

    @OneToMany(() => DoctorProfile, (doctorProfile) => doctorProfile.specialization, { nullable: true })
    doctors: DoctorProfile[]
}

