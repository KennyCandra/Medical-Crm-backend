import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Disease } from "./disease";
import { PatientProfile } from "./patientProfile";
import { DoctorProfile } from "./doctorProfile";

@Entity()

export class Diagnosis {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: ["acute", "severe", "mild", "chronic"] })
    severity: "acute" | "severe" | "mild" | "chronic"

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne(() => PatientProfile, (PatientProfile) => PatientProfile.patientDiagnoses)
    patient: PatientProfile;

    @ManyToOne(() => DoctorProfile, (profile) => profile.diagnoses)
    doctor: DoctorProfile

    @ManyToOne(() => Disease, (disease) => disease.diagnoses)
    disease: Disease

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    diagnosed_at: Date;

}


