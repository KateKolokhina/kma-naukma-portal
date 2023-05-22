import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "./Document";
import { Specialist } from "./Specialist";

@Entity()
export class Department extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Document, (doc) => doc.department)
  documents: Document[]

  @OneToMany(() => Specialist, (spec) => spec.department)
  specialists: Specialist[]
}
