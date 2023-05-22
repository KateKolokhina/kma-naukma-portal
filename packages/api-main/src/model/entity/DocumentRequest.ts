import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "./Document";
import { Specialist } from "./Specialist";
import { DocumentStatus, ReceiveType } from "./types";

@Entity('doc_request')
export class DocumentRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: DocumentStatus.CREATED })
  status: DocumentStatus;

  @Column({ unique: true })
  officialCode: string;

  @Column()
  studentId: number;

  @Column({ default: ReceiveType.E_COPY })
  receiveType: ReceiveType;

  @Column()
  studentFio: string;

  @Column()
  creationDate: number;

  @Column({ nullable: true, default: null })
  finishedDate: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => Specialist, (spec) => spec.requests, { nullable: true })
  specialist: Specialist;

  @ManyToOne(() => Document, (doc) => doc.requests)
  document: Document;
}
