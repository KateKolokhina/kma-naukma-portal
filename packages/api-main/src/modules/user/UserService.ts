import common_1, { Injectable } from '@nestjs/common';
import { Student } from '../../model/entity/Student';
import { AppDataSource, NaukmaDataSource } from '../database/config';
import { User } from '../../model/entity/User';
import { UserRole } from '../../model/entity/types';
import { Specialist } from '../../model/entity/Specialist';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class UserService {
  public async findUserByEmail(email: string): Promise<Student | Specialist> {
    const userRoles = await User.findOne({ where: { email: email } });
    const isStudent = userRoles.roles.includes(UserRole.USER);
    if (isStudent) {
      return await new SelectQueryBuilder<Student>(NaukmaDataSource.manager.connection)
        .from(Student, 'Student')
        .where('Student.ukma_email = :email', { email: email })
        .select('Student')
        .getOne();
    } else {
      return await AppDataSource.getRepository(Specialist)
        .createQueryBuilder('specialist')
        .where({ email: email })
        .leftJoinAndSelect('specialist.department', 'department')
        .getOne()
        .catch((error) => {
          console.log(error);
          throw new common_1.InternalServerErrorException('SQL exception with entity Specialist');
        });
    }
  }

  public async findStudentById(id: number): Promise<Student> {
    const info = await new SelectQueryBuilder<Student>(NaukmaDataSource.manager.connection)
      .from(Student, 'Student')
      .where('Student.student_cdoc = :cdoc', { cdoc: id })
      .select('Student')
      .getOne();
    return info;
  }
}
