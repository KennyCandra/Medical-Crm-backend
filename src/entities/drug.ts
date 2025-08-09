import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { PrescribedDrug } from "./prescribedDrug";
import { Classification } from "./Classification";
import { Route } from "./Rotue";
import { DefaultDocument } from "./NormalDocument";

@Entity()
@Index("idx_drug_name_prefix", ["name"])
export class Drug extends DefaultDocument {
  @Column({
    nullable: false,
    type: "citext",
    transformer: {
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value
    },
  })
  @Index("idx_drug_name_prefix", { synchronize: false })
  name: string;

  @ManyToOne(() => Classification, (classification) => classification.drugs, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn()
  classification: Classification;

  @ManyToOne(() => Route, (route) => route.drugs, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn()
  route: Route;

  @OneToMany(() => PrescribedDrug, (prescribedDrug) => prescribedDrug.drug)
  prescribedDrugs: PrescribedDrug[];
}
