import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Classification } from "./Classification";

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Classification, classification => classification.category)
    classifications: Classification[];
}
