import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/AuthGuard';
import { Response } from 'express';
import { UserRequest } from '../auth/types';
import { GradeService } from './GradeService';

@Controller('grade')
@UseGuards(AuthGuard)
export class GradeController {
  constructor(protected readonly service: GradeService) {}

  @Get('')
  async getStudentGrade(@Req() req: UserRequest, @Res() res: Response) {
    const result = await this.service.getGradesOfStudent(req.user.email);

    return res.status(HttpStatus.OK).json({
      result,
    });
  }
}
