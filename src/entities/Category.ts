import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Classification } from "./Classification";
import { v4 as uuidv4 } from "uuid";

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string = uuidv4();

    @Column({ unique: true, nullable: false })
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Classification, classification => classification.category)
    classifications: Classification[];
}

