import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/AuthGuard';
import { RequestTypesDto, RequestEdit } from '../../model/dto/RequestTypesDto';
import { UserRequest } from '../auth/types';
import { RequestService } from './RequestService';
import { DocumentRequest } from '../../model/entity/DocumentRequest';
import { UserService } from '../user/UserService';
import { Response } from 'express';
import dayjs from 'dayjs';
import { DocumentStatus } from '../../model/entity/types';

@Controller('doc-request')
@UseGuards(AuthGuard)
export class RequestController {
  private itemsPerPage = 3;

  constructor(protected readonly service: RequestService, protected readonly userService: UserService) {}

  @Post('/all')
  public async getPaginatedRequest(
    @Req() req: UserRequest,
    @Body() dto: { page: number; forDepartment: boolean; sortBy: string; orderBy: string },
  ): Promise<{ items: DocumentRequest[]; totalItems: number; pageSize: number }> {
    const res = await this.service.getAll(req, dto);
    console.log(await this.service.getTotalCount(req, false));
    return {
      items: res,
      pageSize: this.itemsPerPage,
      totalItems: await this.service.getTotalCount(req, false),
    };
  }

  @Post('/all/department')
  public async getPaginatedRequestDepartment(
    @Req() req: UserRequest,
    @Body() dto: { page: number; forDepartment: boolean; sortBy: string; orderBy: string },
  ): Promise<{ items: DocumentRequest[]; totalItems: number; pageSize: number; sortBy: string; orderBy: string }> {
    const res = await this.service.getAllDepartment(req, dto);
    console.log('total', await this.service.getTotalCount(req, dto.forDepartment));
    return {
      items: res,
      pageSize: this.itemsPerPage,
      totalItems: await this.service.getTotalCount(req, dto.forDepartment),
      sortBy: dto.sortBy,
      orderBy: dto.orderBy,
    };
  }

  @Post('/create')
  public async createDocumentRequest(@Req() req: UserRequest, @Body() dto: RequestTypesDto): Promise<DocumentRequest> {
    return await this.service.insert(dto, req.user.email);
  }

  @Post('/edit')
  public async editDocumentRequest(@Req() req: UserRequest, @Body() dto: RequestEdit): Promise<DocumentRequest> {
    return await this.service.edit(dto, req.user.email);
  }

  @Post('/setSpecialist')
  public async setSpecialist(@Req() req: UserRequest, @Body() dto: { id: number }): Promise<DocumentRequest> {
    return this.service.setSpecialist(req.user.email, dto.id);
  }

  @Post('/detachSpecialist')
  public async detachSpecialist(@Req() req: UserRequest, @Body() dto: { id: number }): Promise<DocumentRequest> {
    return this.service.detachSpecialist(req.user.email, dto.id);
  }

  @Get('/:id')
  public async getOneRequest(@Req() req: UserRequest, @Res() res: Response, @Param('id') id: number) {
    return res.status(HttpStatus.OK).json({
      info: await this.service.getOne(req, id),
    });
  }

  @Post('/cancel')
  public async cancelRequest(@Req() req: UserRequest, @Body() dto: { id: number }): Promise<DocumentRequest> {
    return this.service.changeStatus(req, dto.id, DocumentStatus.REJECT);
  }

  @Post('/delete')
  public async deleteRequest(@Req() req: UserRequest, @Body() dto: { id: number }): Promise<boolean> {
    return this.service.deleteRequest(req, dto.id);
  }

  @Post('/finish')
  public async finishRequest(@Req() req: UserRequest, @Body() dto: { id: number }): Promise<DocumentRequest> {
    return this.service.changeStatus(req, dto.id, DocumentStatus.DONE);
  }

  @Get('/:id/download')
  async downloadFile(@Req() req: UserRequest, @Res() res, @Param('id') id: number) {
    const pdfDoc = await this.service.generatePdf(req, id);
    res.setHeader('Content-type', 'application/pdf');
    const today = dayjs().unix();
    res.setHeader('Content-disposition', 'inline; filename="' + today + '.pdf"');
    pdfDoc.pipe(res);
    pdfDoc.end();

    return res;
  }
}
