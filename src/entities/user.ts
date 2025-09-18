import { Entity, Column, OneToOne, OneToMany, Index } from "typeorm";
import { DoctorProfile } from "./doctorProfile";
import { Prescription } from "./prescription";
import { Diagnosis } from "./diagnosis";
import { Pallergy } from "./Pallergy";
import { ReportsEntity } from "./ReportsEntity";
import { PasswordResetToken } from "./resetPw";
import { DefaultDocument } from "./NormalDocument";
import { RefreshToken } from "./refreshToken";
import { Notification } from "./Notification";
import Permission from "./Permissions";

@Entity()
export class User extends DefaultDocument {
  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ type: "enum", enum: ["male", "female"], nullable: false })
  gender: "male" | "female";

  @Column({ type: "varchar", length: 14, unique: true, nullable: false })
  @Index("idx_nid_name_prefix", { synchronize: false })
  NID: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, type: "date" })
  birth_date: Date;

  @Column({
    type: "enum",
    enum: ["doctor", "patient", "admin", "ed", "researcher"],
    nullable: false,
  })
  role: "doctor" | "patient" | "admin" | "ed" | "researcher";

  @OneToOne(() => DoctorProfile, (profile) => profile.user, { 
    nullable: true,
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  doctorProfile?: DoctorProfile;

  @Column({
    nullable: false,
    type: "enum",
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
    default: "unknown",
  })
  blood_type:
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-"
    | "unknown";

  @Column({ default: false })
  openAccess: boolean;

  @OneToMany(() => Prescription, (prescription) => prescription.patient, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  prescriptions: Prescription[];

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.patient, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  patientDiagnoses: Diagnosis[];

  @OneToMany(() => ReportsEntity, (reports) => reports.patient, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  reports: ReportsEntity[];

  @OneToMany(() => Pallergy, (Pallergy) => Pallergy.patient, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  patientAllergies: Pallergy[];

  @Column({ nullable: false, unique: true })
  email: string;

  @OneToMany(() => PasswordResetToken, (token) => token.user, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  passwordResetTokens: PasswordResetToken[];

  @OneToMany(() => RefreshToken, (token) => token.user, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  refreshTokens: RefreshToken[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  notifications: Notification[];

  @OneToMany(() => ReportsEntity, (reports) => reports.reporter, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  reportedBy: ReportsEntity[];

  @OneToMany(() => Permission, (permission) => permission.patient, {
    cascade: ['remove', 'update'],
    onDelete: 'CASCADE'
  })
  permissions: Permission[];

}
