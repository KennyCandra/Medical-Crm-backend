import { Column, Entity, Index, ManyToOne } from "typeorm";
import { DefaultDocument } from "./NormalDocument";
import { User } from "./user";
import { DoctorProfile } from "./doctorProfile";

@Entity()
@Index("permission_index", ["doctor", "patient"], { unique: true })
export default class Permission extends DefaultDocument {
  @ManyToOne(() => User, (user) => user.permissions, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  patient: User;

  @ManyToOne(
    () => DoctorProfile,
    (doctorProfile) => doctorProfile.permissions,
    {
      nullable: false,
      onDelete: 'CASCADE'
    }
  )
  doctor: DoctorProfile;

  @Column({ nullable: false, type: "int" })
  permissionLevel: number;

  @Column({
    type: "enum",
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  })
  status: "pending" | "approved" | "rejected";

  @Column({ nullable: true })
  reason?: string;
}
