import {
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn,
    Entity
} from "typeorm";

@Entity()
export class DefaultDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

