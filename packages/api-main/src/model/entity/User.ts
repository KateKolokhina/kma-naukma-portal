import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { UserRole } from "./types";

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @Column({
    type: "set",
    enum: UserRole,
    default: []
  })
  roles: UserRole[];

  @Column()
  lastEnter: number;
}
