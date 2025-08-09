import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from "typeorm";
import { Diagnosis } from "./diagnosis";
import { DefaultDocument } from "./NormalDocument";

@Entity()
@Index("idx_disease_name", ["name"])
export class Disease extends DefaultDocument {

  @Column({ type: "citext", unique: true, nullable: true })
  name: string;

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.disease)
  diagnoses: Diagnosis[];
}
