import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Disease } from "./disease";
import { DoctorProfile } from "./doctorProfile";
import { User } from "./user";
import { DefaultDocument } from "./NormalDocument";


@Entity()

export class Diagnosis extends DefaultDocument {

    @Column({ type: 'enum', enum: ["acute", "severe", "mild", "chronic"] })
    severity: "acute" | "severe" | "mild" | "chronic"

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne(() => User, (user) => user.patientDiagnoses)
    patient: User;

    @ManyToOne(() => DoctorProfile, (profile) => profile.diagnoses)
    doctor: DoctorProfile

    @ManyToOne(() => Disease, (disease) => disease.diagnoses)
    disease: Disease

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    diagnosed_at: Date;

}


