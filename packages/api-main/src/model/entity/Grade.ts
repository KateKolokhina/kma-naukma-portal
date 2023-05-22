import { Column, ViewEntity } from "typeorm";

@ViewEntity({
  name: "service_edoc-student_curriculum"
})
export class Grade {

  @Column({ name: "ukma_email" })
  email: string;

  @Column({ name: "course_cdoc" })
  courseId: number;

  @Column({ name: "term_number" })
  term: number;

  @Column({ name: "course_name" })
  courseName: string;

  @Column({ name: "course_name_english" })
  courseNameEnglish: string;

  @Column({ name: "course_total_credits" })
  courseCredits: number;

  @Column({ name: "grade" })
  grade: number;

  @Column({ name: "grade_text" })
  gradeText: string;

  gradeTextEnglish: string;

  @Column({ name: "grade_ects" })
  gradeEcts: number;
}
