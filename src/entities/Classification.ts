import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Drug } from "./drug";
import { Category } from "./Category";

@Entity()
export class Classification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    name: string;

    @ManyToOne(() => Category, category => category.classifications)
    @JoinColumn()
    category: Category;

    @OneToMany(() => Drug, drug => drug.classification)
    drugs: Drug[];
}