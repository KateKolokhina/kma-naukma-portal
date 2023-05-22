import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { NaukmaDataSource } from '../database/config';
import { User } from '../../model/entity/User';
import { Student } from '../../model/entity/Student';
import { AuthGuard } from '../auth/AuthGuard';
import { Response } from 'express';
import { UserRequest } from '../auth/types';
import { UserService } from './UserService';
import { SelectQueryBuilder } from "typeorm";

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(protected readonly service: UserService) {}

  @Get('profile')
  async getUserInfo(@Req() req: UserRequest, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      info: await this.service.findUserByEmail(req.user.email),
    });
  }

  @Get('all')
  async fetchAll(@Res() response) {
    const users = await User.find();
    return response.status(HttpStatus.OK).json({
      users,
    });
  }

  @Get('students')
  async getStudent(@Res() response) {
    const students = await new SelectQueryBuilder<Student>(NaukmaDataSource.manager.connection)
      .from(Student, 'Student')
      .select('Student')
      .limit(5)
      .execute();

    return response.status(HttpStatus.OK).json({
      students,
    });
  }
}
