import { Entity, Column, ManyToOne } from "typeorm";
import { DefaultDocument } from "./NormalDocument";
import { User } from "./user";

@Entity()
export class Notification extends DefaultDocument {
  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @Column({ nullable: false, enum: ["diagnosis", "prescription", "report"] })
  entity: "diagnosis" | "prescription" | "report";

  @Column({ nullable: false, enum: ["create", "update", "delete" , "view"] })
  action: "create" | "update" | "delete" | 'view';

  @Column({ nullable: true })
  foreignItemId: string;
}
