import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Department } from "./Department";
import { DocumentRequest } from "./DocumentRequest";

@Entity()
export class Specialist extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  fio: string;

  @ManyToOne(() => Department, (depart) => depart.specialists)
  department: Department;

  @OneToMany(() => DocumentRequest, (doc) => doc.specialist)
  requests: DocumentRequest[];
}
