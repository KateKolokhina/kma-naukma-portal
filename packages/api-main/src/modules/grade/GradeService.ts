import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Grade } from '../../model/entity/Grade';
import { NaukmaDataSource } from '../database/config';
import { SelectQueryBuilder } from "typeorm";

@Injectable()
export class GradeService {
  public async getGradesOfStudent(studentEmail: string) {
    const qb = new SelectQueryBuilder<Grade>(NaukmaDataSource.manager.connection)
      .from(Grade, 'Grade')
      .where('Grade.ukma_email = :email', { email: studentEmail })
      .select(['Grade.course_cdoc', 'MAX(Grade.term_number) AS term'])
      .groupBy('Grade.course_cdoc')
      .having('COUNT(Grade.course_cdoc)> 1', {});

    const data = await qb.getRawMany().catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('SQL exception with entity Grade');
    });
    const mapExceptionCourses = Object.keys(data).map((key) => ({
      ['course_cdoc']: data[key].course_cdoc,
      ['term']: data[key].term,
    }));

    const exeptionCourses = [];
    Object.entries(data).forEach(([, v]) => {
      exeptionCourses.push(v.course_cdoc);
    });

    const info = await new SelectQueryBuilder<Grade>(NaukmaDataSource.manager.connection)
      .from(Grade, 'Grade')
      .where('Grade.ukma_email = :email ', {
        email: studentEmail,
      })
      .select('Grade')
      .getMany()
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('SQL exception with entity Grade');
      });

    return info.filter((item) => {
      if (exeptionCourses.includes(item.courseId)) {
        return !!mapExceptionCourses.find((o) => o.course_cdoc === item.courseId && o.term === item.term);
      } else {
        return true;
      }
    });
  }

  public transformGradeName(name: string): string {
    switch (name.toLowerCase()) {
      case 'зараховано':
        return 'Passed';
      case 'незараховано':
        return 'Fail';
      case 'відмінно':
        return 'Excellent';
      case 'добре':
        return 'Good';
      case 'задовільно':
        return 'Satisfactory';
      case 'незадовільно':
        return 'Unsatisfactory';
      case 'не зʼявився':
        return 'Did not appear';
      default:
        return '';
        console.log(`Sorry, we are out of ${name}.`);
    }
  }
}
