import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { Specialization } from "./specialization";
import { User } from "./user";
import { Diagnosis } from "./diagnosis";
import { Prescription } from "./prescription";
import { DefaultDocument } from "./NormalDocument";
import Permission from "./Permissions";

@Entity()
export class DoctorProfile extends DefaultDocument {
  @Column({ unique: true, nullable: false })
  medical_license_number: string;

  @Column({
    default: "pending",
    type: "enum",
    enum: ["pending", "approved", "rejected"],
  })
  status: string;

  @Column({ default: null, type: "varchar", nullable: true })
  reason: string;

  @ManyToOne(() => Specialization, (specialization) => specialization.doctors, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  specialization: Specialization;

  @OneToOne(() => User, (user) => user.doctorProfile)
  @JoinColumn()
  user: User;

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.doctor, {
    nullable: true,
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  diagnoses: Diagnosis[];

  @OneToMany(() => Prescription, (prescription) => prescription.doctor, {
    nullable: true,
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  prescriptions: Prescription[];

  @OneToMany(() => Permission, (permission) => permission.doctor, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  permissions: Permission[];
}
