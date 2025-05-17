import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Drug } from "./drug";
import { Category } from "./Category";
import { DefaultDocument } from "./NormalDocument";

@Entity()
export class Classification extends DefaultDocument {

    @Column({ nullable: false })
    name: string;

    @ManyToOne(() => Category, category => category.classifications)
    @JoinColumn()
    category: Category;

    @OneToMany(() => Drug, drug => drug.classification)
    drugs: Drug[];
}

