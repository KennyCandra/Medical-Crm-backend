import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user";
import { DefaultDocument } from "./NormalDocument";

@Entity()
export class PasswordResetToken extends DefaultDocument {
    @Column({ nullable: false, unique: true })
    token: string;

    @Column({ nullable: false })
    expiresAt: Date;

    @Column({ default: false })
    used: boolean;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn()
    user: User;
}