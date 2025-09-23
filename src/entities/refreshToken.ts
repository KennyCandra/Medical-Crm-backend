import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { DefaultDocument } from "./NormalDocument";
import { User } from "./user";

//we have index on the tokenSignature column type hash index
@Entity()
export class RefreshToken extends DefaultDocument {
  @Column({ nullable: false, unique: true })
  tokenSignature: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: false, type: "timestamp" })
  expiresAt: Date;
}
