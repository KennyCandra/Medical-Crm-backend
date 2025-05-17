import { Column, Entity, OneToMany } from "typeorm";
import { Classification } from "./Classification";
import { DefaultDocument } from "./NormalDocument";

@Entity()
export class Category extends DefaultDocument {

    @Column({ unique: true, nullable: false })
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Classification, classification => classification.category)
    classifications: Classification[];
}

