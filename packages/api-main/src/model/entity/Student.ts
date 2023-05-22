import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
  name: "service_edoc-student_curriculum"
})
export class Student {
  @PrimaryColumn({ name: "student_cdoc" })
  id: number;

  @Column({ name: "person_cdoc" })
  personCdoc: string;

  @Column({ name: "student_name" })
  fio: string;

  @Column({ name: "ukma_email" })
  email: string;

  @Column({ name: "student_level" })
  degreeType: string;

  @Column({ name: "student_faculty_name" })
  faculty: string;

  @Column({ name: "student_speciality" })
  speciality: string;

  @Column({ name: "student_speciality_code" })
  specialityCode: number;

  @Column({ name: "student_entry_year" })
  entryYear: number;

  @Column({ name: "student_gradebook_id" })
  gradebookId: string;
}
