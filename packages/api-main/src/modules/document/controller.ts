import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { AppDataSource } from '../database/config';
import { AuthGuard } from '../auth/AuthGuard';
import { Response } from 'express';
import { UserRequest } from '../auth/types';
import { Document } from '../../model/entity/Document';

@Controller('document')
@UseGuards(AuthGuard)
export class DocumentController {
  @Get('')
  async getAllDocuments(@Req() req: UserRequest, @Res() res: Response) {
    const result = await AppDataSource.getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.department', 'department')
      .getMany();
    return res.status(HttpStatus.OK).json({
      result,
    });
  }
}
