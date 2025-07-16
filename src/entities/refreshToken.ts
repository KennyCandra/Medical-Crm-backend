import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { DefaultDocument } from "./NormalDocument";
import { User } from "./user";

@Entity()
export class RefreshToken extends DefaultDocument {
  @Column({ nullable: false, unique: true })
  @Index()
  tokenSignature: string;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: false, type: "timestamp" })
  expiresAt: Date;
}
