import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Department } from "./Department";
import { DocumentRequest } from "./DocumentRequest";

@Entity()
export class Document extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name!: string;

  @Column({type:"text", nullable: true})
  description: string;

  @Column({ default: 14 })
  termOfExecution: number;

  @Column()
  counter: number;

  @ManyToOne(() => Department, (depart) => depart.documents)
  department: Department;

  @OneToMany(() => DocumentRequest, (doc) => doc.document)
  requests: DocumentRequest[];
}
