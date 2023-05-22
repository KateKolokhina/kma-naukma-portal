import common_1, { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RequestEdit, RequestTypesDto } from '../../model/dto/RequestTypesDto';
import { DocumentRequest } from '../../model/entity/DocumentRequest';
import { Document } from '../../model/entity/Document';
import { DocumentStatus, ReceiveType, UserRole } from '../../model/entity/types';
import { UserService } from '../user/UserService';
import dayjs from 'dayjs';
import { UserRequest } from '../auth/types';
import { AppDataSource } from '../database/config';
import { GradeService } from '../grade/GradeService';
import { Specialist } from '../../model/entity/Specialist';
import { User } from '../../model/entity/User';
import { DocumentRequestDetails } from '../../model/dto/details-type';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import path from 'path';
import PdfPrinter from 'pdfmake';

@Injectable()
export class RequestService {
  private itemsPerPage = 5;

  constructor(protected readonly userService: UserService, protected readonly gradeService: GradeService) {}

  async getTotalCount(req: UserRequest, forDepartment: boolean): Promise<number> {
    if (req.user.roles.includes(UserRole.USER)) {
      const studentInfo = await this.userService.findUserByEmail(req.user.email);
      return await DocumentRequest.count({
        where: {
          studentId: studentInfo.id,
        },
      }).catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('SQL exception with entity Document');
      });
    } else {
      const spec = await AppDataSource.getRepository(Specialist)
        .createQueryBuilder('specialist')
        .where({ email: req.user.email })
        .leftJoinAndSelect('specialist.department', 'department')
        .getOne()
        .catch((error) => {
          console.log(error);
          throw new common_1.InternalServerErrorException('SQL exception with entity Specialist');
        });

      if (forDepartment) {
        return await AppDataSource.getRepository(DocumentRequest)
          .createQueryBuilder('doc_req')
          .where('department.id = :department', { department: spec.department.id })
          .leftJoinAndSelect('doc_req.document', 'document')
          .leftJoinAndSelect('document.department', 'department')
          .getCount()
          .catch((error) => {
            console.log(error);
            throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
          });
      } else {
        return await AppDataSource.getRepository(DocumentRequest)
          .createQueryBuilder('doc_req')
          .where('specialist.email = :email', { email: req.user.email })
          .leftJoinAndSelect('doc_req.document', 'document')
          .leftJoinAndSelect('doc_req.specialist', 'specialist')
          .leftJoinAndSelect('document.department', 'department')
          .getCount()
          .catch((error) => {
            console.log(error);
            throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
          });
      }
    }
  }

  async getAll(
    req: UserRequest,
    dto: { page: number; forDepartment: boolean; sortBy: string; orderBy: string },
  ): Promise<DocumentRequest[]> {
    const offset: number = (dto.page - 1) * this.itemsPerPage;
    console.log('offset', offset);

    let sortBy = 'doc_req';
    if (dto.sortBy === 'docType') {
      sortBy = 'document.name';
    } else if (dto.sortBy === 'specialistFio') {
      sortBy = 'specialist.fio';
    } else {
      sortBy = sortBy.concat('.', dto.sortBy);
    }
    const orderBy: 'DESC' | 'ASC' = dto.orderBy === 'DESC' ? 'DESC' : 'ASC';

    let res = [];
    if (req.user.roles.includes(UserRole.USER)) {
      const studentInfo = await this.userService.findUserByEmail(req.user.email);

      res = await AppDataSource.getRepository(DocumentRequest)
        .createQueryBuilder('doc_req')
        .where({ studentId: studentInfo.id })
        .leftJoinAndSelect('doc_req.specialist', 'specialist')
        .leftJoinAndSelect('doc_req.document', 'document')
        .orderBy(sortBy, orderBy)
        .limit(this.itemsPerPage)
        .offset(offset)
        .getMany()
        .catch((error) => {
          throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
        });
    } else {
      res = await AppDataSource.getRepository(DocumentRequest)
        .createQueryBuilder('doc_req')
        .where('specialist.email = :email', { email: req.user.email })
        .leftJoinAndSelect('doc_req.specialist', 'specialist')
        .leftJoinAndSelect('doc_req.document', 'document')
        .leftJoinAndSelect('document.department', 'department')
        .orderBy(sortBy, orderBy)
        .limit(this.itemsPerPage)
        .offset(offset)
        .getMany()
        .catch((error) => {
          console.log(error);
          throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
        });
    }
    res.forEach((item) => {
      item.receiveType = this.transformReceiveType(item.receiveType);
    });
    return res;
  }

  async getAllDepartment(
    req: UserRequest,
    dto: { page: number; forDepartment: boolean; sortBy: string; orderBy: string },
  ): Promise<DocumentRequest[]> {
    const offset: number = (dto.page - 1) * this.itemsPerPage;
    let sortBy = 'doc_req';
    if (dto.sortBy === 'docType') {
      sortBy = 'document.name';
    } else if (dto.sortBy === 'specialistFio') {
      sortBy = 'specialist.fio';
    } else {
      sortBy = sortBy.concat('.', dto.sortBy);
    }
    const orderBy: 'DESC' | 'ASC' = dto.orderBy === 'DESC' ? 'DESC' : 'ASC';

    const spec = await AppDataSource.getRepository(Specialist)
      .createQueryBuilder('specialist')
      .where({ email: req.user.email })
      .leftJoinAndSelect('specialist.department', 'department')
      .getOne()
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('SQL exception with entity Specialist');
      });
    let res = [];
    res = await AppDataSource.getRepository(DocumentRequest)
      .createQueryBuilder('doc_req')
      .where('department.id = :department', { department: spec.department.id })
      .leftJoinAndSelect('doc_req.document', 'document')
      .leftJoinAndSelect('doc_req.specialist', 'specialist')
      .leftJoinAndSelect('document.department', 'department')
      .orderBy(sortBy, orderBy)
      .limit(this.itemsPerPage)
      .offset(offset)
      .getMany()
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
      });

    res.forEach((item) => {
      item.receiveType = this.transformReceiveType(item.receiveType);
    });
    return res;
  }

  async deleteRequest(req: UserRequest, id: number): Promise<boolean> {
    const request = await this.getOneEntity(id);
    const user = await User.findOne({ where: { email: req.user.email } });
    if (!(user.roles.includes(UserRole.SPECIALIST) || user.roles.includes(UserRole.ADMIN))) {
      throw new InternalServerErrorException('User have none permission to change status of request : ' + id);
    }
    DocumentRequest.delete({ id: id })
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
      });
    return false;
  }

  async changeStatus(req: UserRequest, id: number, status: DocumentStatus): Promise<DocumentRequest> {
    const request = await this.getOneEntity(id);
    if (request.status == DocumentStatus.DONE) {
      throw new InternalServerErrorException('Request: ' + id + " is already done. We can't change it.");
    }
    if (status == DocumentStatus.DONE) {
      const user = await User.findOne({ where: { email: req.user.email } });
      if (!(user.roles.includes(UserRole.SPECIALIST) || user.roles.includes(UserRole.ADMIN))) {
        throw new InternalServerErrorException('User have none permission to change status of request : ' + id);
      }
      request.finishedDate = dayjs().unix();
    }
    request.status = status;
    return await DocumentRequest.save(request).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
    });
  }

  async setSpecialist(specEmail: string, requestId: number): Promise<DocumentRequest> {
    const spec = await Specialist.findOne({ where: { email: specEmail } });

    const request = await this.getOneEntity(requestId);

    if (request.status == DocumentStatus.DONE) {
      throw new InternalServerErrorException('Request: ' + requestId + " is already done. We can't change it.");
    }
    request.specialist = spec;
    request.status = DocumentStatus.IN_WORK;
    return await DocumentRequest.save(request).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
    });
  }

  async detachSpecialist(specEmail: string, requestId: number): Promise<DocumentRequest> {
    const spec = await Specialist.findOne({ where: { email: specEmail } });

    const request = await this.getOneEntity(requestId);
    if (request.specialist != null && request.specialist.id == spec.id) {
      request.specialist = null;
    }

    if (request.status == DocumentStatus.DONE) {
      throw new InternalServerErrorException('Request: ' + requestId + " is already done. We can't change it.");
    }
    request.status = DocumentStatus.CREATED;
    return await DocumentRequest.save(request).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
    });
  }

  async getOneEntity(id: number): Promise<DocumentRequest> {
    return await AppDataSource.getRepository(DocumentRequest)
      .createQueryBuilder('doc_req')
      .where({ id: id })
      .leftJoinAndSelect('doc_req.specialist', 'specialist')
      .leftJoinAndSelect('doc_req.document', 'document')
      .getOne()
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
      });
  }

  async getOne(req: UserRequest, id: number) {
    const requestInfo = await AppDataSource.getRepository(DocumentRequest)
      .createQueryBuilder('doc_req')
      .where({ id: id })
      .leftJoinAndSelect('doc_req.specialist', 'specialist')
      .leftJoinAndSelect('doc_req.document', 'document')
      .getOne()
      .catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('SQL exception with entity DocumentRequest');
      });

    const studentInfo = await this.userService.findStudentById(requestInfo.studentId);

    switch (requestInfo.document.name) {
      case 'Академічна довідка':
        return {
          id: requestInfo.id,
          receiveType: this.transformReceiveType(requestInfo.receiveType),
          officialCode: requestInfo.officialCode,
          creationDate: dayjs.unix(requestInfo.creationDate).format('DD/MM/YYYY HH:mm:ss'),
          comment: requestInfo.comment,
          specialistEmail: requestInfo.specialist == null ? null : requestInfo.specialist.email,
          docType: requestInfo.document.name,
          finishedDate:
            requestInfo.finishedDate == null ? '' : dayjs.unix(requestInfo.finishedDate).format('DD/MM/YYYY HH:mm:ss'),
          status: requestInfo.status,
          specialistFio: requestInfo.specialist == null ? '' : requestInfo.specialist.fio,
          studentEmail: studentInfo.email,

          studentFio: studentInfo.fio,
          yearOfStudy: this.getYearOfStudy(studentInfo.entryYear),

          //очна чи заочна
          modeOfStudy: '',

          // держ-замовлення чи контракт
          formOfStudy: '',

          faculty: studentInfo.faculty,
          speciality: studentInfo.speciality,

          //бакалавр чи магістр
          degreeLevel: studentInfo.degreeType,

          // період навчання
          startTerm: dayjs(studentInfo.entryYear + '-09-01').format('DD.MM.YYYY'),
          endTerm: this.getEndTerm(studentInfo.entryYear, studentInfo.degreeType),
        };
      case 'Академічна довідка (розширена)':
        return {
          id: requestInfo.id,
          receiveType: this.transformReceiveType(requestInfo.receiveType),
          officialCode: requestInfo.officialCode,
          creationDate: dayjs.unix(requestInfo.creationDate).format('DD/MM/YYYY HH:mm:ss'),
          docType: requestInfo.document.name,
          specialistEmail: requestInfo.specialist == null ? null : requestInfo.specialist.email,
          finishedDate:
            requestInfo.finishedDate == null ? '' : dayjs.unix(requestInfo.finishedDate).format('DD/MM/YYYY HH:mm:ss'),
          status: requestInfo.status,
          specialistFio: requestInfo.specialist == null ? '' : requestInfo.specialist.fio,
          studentEmail: studentInfo.email,
          studentFio: studentInfo.fio,
          yearOfStudy: this.getYearOfStudy(studentInfo.entryYear),

          comment: requestInfo.comment,
          //очна чи заочна
          modeOfStudy: '',

          // держ-замовлення чи контракт
          formOfStudy: '',

          faculty: studentInfo.faculty,
          speciality: studentInfo.speciality,

          //бакалавр чи магістр
          degreeLevel: studentInfo.degreeType,

          // період навчання
          startTerm: dayjs(studentInfo.entryYear + '-09-01').format('DD.MM.YYYY'),
          endTerm: this.getEndTerm(studentInfo.entryYear, studentInfo.degreeType),
        };
      default:
        return {
          id: requestInfo.id,
          receiveType: this.transformReceiveType(requestInfo.receiveType),
          officialCode: requestInfo.officialCode,
          creationDate: dayjs.unix(requestInfo.creationDate).format('DD/MM/YYYY HH:mm:ss'),
          docType: requestInfo.document.name,
          specialistEmail: requestInfo.specialist.email,
          finishedDate:
            requestInfo.finishedDate == null ? '' : dayjs.unix(requestInfo.finishedDate).format('DD/MM/YYYY HH:mm:ss'),
          status: requestInfo.status,
          specialistFio: requestInfo.specialist == null ? '' : requestInfo.specialist.fio,
          studentEmail: studentInfo.email,
          comment: requestInfo.comment,
          studentFio: studentInfo.fio,
        };
    }
    return null;
  }

  private getEndTerm(entryYear: number, degreeType: string): string {
    if (degreeType == 'Бакалавр') {
      return dayjs(entryYear + 4 + '-07-01').format('DD.MM.YYYY');
    } else if (degreeType == 'Магістр') return dayjs(entryYear + 2 + '-07-01').format('DD.MM.YYYY');
  }

  private getYearOfStudy(entryYear: number): number {
    const currentDate = dayjs();
    const currentYear = dayjs().year();
    const nowAutumn = currentDate.isAfter(dayjs(currentYear + '-09-01'));
    if (nowAutumn) {
      return currentYear - entryYear + 1;
    } else {
      return currentYear - entryYear;
    }
  }

  async insert(dto: RequestTypesDto, email: string): Promise<DocumentRequest> {
    const entity: DocumentRequest = DocumentRequest.create();
    const document = await Document.findOne({ where: { id: dto.docType } }).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('SQL exception with entity Document');
    });
    entity.document = document;
    entity.officialCode = this.generateOfficialCode(document);
    entity.status = DocumentStatus.CREATED;
    entity.creationDate = dayjs().unix();
    entity.comment = dto.comment;

    entity.receiveType = (<any>ReceiveType)[dto.receiveType.toUpperCase()];

    const student = await this.userService.findUserByEmail(email).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('SQL exception with entity Student');
    });

    entity.studentId = student.id;
    entity.studentFio = student.fio;

    const result = await DocumentRequest.save(entity).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Exception while saving DocumentRequest entity');
    });

    document.counter += 1;

    await Document.save(document).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Exception while saving Document entity');
    });
    return result;
  }

  async edit(dto: RequestEdit, email: string): Promise<DocumentRequest> {
    console.log(dto);
    const entity: DocumentRequest = await this.getOneEntity(dto.id);
    if (entity.status == DocumentStatus.DONE) {
      throw new InternalServerErrorException('Request: ' + dto.id + " is already done. We can't change it.");
    }

    let updateDocType = false;
    let document = null;
    let oldDocId = null;
    if (dto.docType != entity.document.id) {
      document = await Document.findOne({ where: { id: dto.docType } }).catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('SQL exception with entity Document');
      });
      oldDocId = entity.document.id;
      entity.document = document;
      entity.officialCode = this.generateOfficialCode(document);
      updateDocType = true;
    }

    if (dto.comment != entity.comment) {
      entity.comment = dto.comment;
    }

    const newReceiveType = (<any>ReceiveType)[dto.receiveType.toUpperCase()];

    if (newReceiveType != entity.receiveType) {
      entity.receiveType = newReceiveType;
    }
    const result = await DocumentRequest.save(entity).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException('Exception while saving DocumentRequest entity');
    });

    if (document != null && oldDocId != null) {
      const oldDocument = await Document.findOne({ where: { id: oldDocId } }).catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('SQL exception with entity Document');
      });
      oldDocument.counter -= 1;
      document.counter += 1;

      await Document.save(document).catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('Exception while saving Document entity');
      });
      await Document.save(oldDocument).catch((error) => {
        console.log(error);
        throw new InternalServerErrorException('Exception while saving Document entity');
      });
    }

    return result;
  }

  async generatePdf(req: UserRequest, id: number): Promise<PDFKit.PDFDocument> {
    const info: DocumentRequestDetails = await this.getOne(req, id);

    let bodyInfo = [];
    let grades = [];
    const table = [];
    switch (info.docType) {
      case 'Академічна довідка':
        bodyInfo = this.getAcademMainInfo(info);
        bodyInfo.push(
          {
            text: '\n\n',
          },
          {
            alignment: 'justify',
            columns: [
              { text: '' },
              {
                text: ['Декан факультету інформатики', '\n\n\n', 'Провідний спеціаліст факультету інформатики'],
                alignment: 'left',
                width: 'auto',
              },
              { text: '' },
              {
                text: ['Андрій ГЛИБОВЕЦЬ', '\n\n\n', 'Олена РИЖИХ'],
                alignment: 'left',
                decoration: 'underline',
              },
              { text: '' },
            ],
          },
        );
        break;
      case 'Академічна довідка (розширена)':
        grades = await this.gradeService.getGradesOfStudent(info.studentEmail);
        bodyInfo = this.getAcademMainInfo(info);

        table.push([
          { text: '1', style: 'tableHeader' },
          { text: '2', style: 'tableHeader' },
          { text: '3', style: 'tableHeader' },
          { text: '4', style: 'tableHeader' },
          { text: '5', style: 'tableHeader' },
        ]);
        table.push([
          {
            text: 'Код освітнього компоненту або результатів навчання (за наявності) / Component code or learning outcomes code (if available)',
            style: 'tableHeader',
          },
          {
            text: 'Назва освітнього компоненту або результатів навчання / Component title or learning outcomes title',
            style: 'tableHeader',
          },
          {
            text: 'Відмітка про успішне завершення освітнього компоненту студентом або досягнення результатів навчання / Component successfully completed by a student or learning',
            style: 'tableHeader',
          },
          {
            text: 'Кількість кредитів Європейської кредитної трансферно- накопичувальної системи / Number of ECTS credits',
            style: 'tableHeader',
          },
          { text: 'Оцінка за шкалою закладу вищої освіти / Institutional Grade', style: 'tableHeader' },
        ]);
        grades.forEach((item) => {
          table.push([
            item.courseId,
            item.courseName + ' / ' + (item.courseNameEnglish || ' '),
            item.gradeText + ' / ' + this.gradeService.transformGradeName(item.gradeText),
            item.courseCredits,
            item.grade,
          ]);
        });

        bodyInfo.push(
          {
            text: 'Навчальні досягнення студента(ки)',
            style: 'subheader',
            alignment: 'center',
          },
          {
            style: 'tableExample',
            table: {
              headerRows: 1,
              // dontBreakRows: true,
              // keepWithHeaderRows: 2,
              body: table,
            },
          },
        );
        bodyInfo.push({
          alignment: 'justify',
          columns: [
            { text: '' },
            {
              text: ['Декан факультету інформатики', '\n\n\n', 'Провідний спеціаліст факультету інформатики'],
              alignment: 'left',
              width: 'auto',
            },
            { text: '' },
            {
              text: ['Андрій ГЛИБОВЕЦЬ', '\n\n\n', 'Олена РИЖИХ'],
              alignment: 'left',
              decoration: 'underline',
            },
            { text: '' },
          ],
        });
        break;
      default:
        break;
    }
    const docDefinition: TDocumentDefinitions = {
      content: bodyInfo,
      styles: {
        info: {
          fontSize: 10,
        },
        header: {
          fontSize: 16,
          bold: true,
        },
        infoAdditional: {
          margin: [0, 5, 0, 15],
        },
        subheader: {
          fontSize: 15,
          bold: true,
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black',
        },
        defaultStyle: {
          font: 'Times',
        },
      },
      defaultStyle: {
        font: 'Times',
      },
    };
    const fonts = {
      Times: {
        normal: path.join(__dirname, '../../../..', './shared/fonts/times.ttf'),
        bold: path.join(__dirname, '../../../..', './shared/fonts/times_bold.ttf'),
      },
    };

    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition, {});

    return pdfDoc;
  }

  private getAcademMainInfo(info: DocumentRequestDetails) {
    const res = [
      {
        text: [
          'НАЦІОНАЛЬНИЙ УНІВЕРСИТЕТ\n',
          {
            text: ' "КИЄВО-МОГИЛЯНСЬКА АКАДЕМІЯ" ',
            decoration: 'underline',
          },
        ],
        style: 'header',
        alignment: 'center',
      },
      {
        text: '04655, м. Київ, вул.Г. Сковороди 2 тел.: 425-60-59, факс: 463-67-83',
        style: 'info',
        alignment: 'center',
      },
      {
        text: '\n\n\n\n',
      },
      {
        text: 'Довідка',
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: '\n\n',
      },
      {
        alignment: 'justify',
        columns: [
          {
            text: this.getDateInUkrString(dayjs()),
            alignment: 'left',
            decoration: 'underline',
            bold: true,
          },
          {
            text: info.officialCode,
            alignment: 'right',
            decoration: 'underline',
            bold: true,
          },
        ],
      },
      {
        text: '\n\n\n\n',
      },
      {
        text: [
          '     Цією довідкою засвідчуємо, що ',
          { text: info.studentFio, bold: true },
          ' дійсно є студентом(студенткою) ' +
            info.yearOfStudy +
            ' року навчання Національного університету "Києво - Могилянська академія"' +
            info.modeOfStudy +
            ' форма навчання, ' +
            info.yearOfStudy +
            ' рівень акредитації, ' +
            info.formOfStudy +
            '.',
        ],
      },
      {
        text: [
          info.faculty + ', освітній рівень: ' + info.degreeLevel + '.',
          'Спеціальність: ' + info.speciality + '.',
        ],
      },
      {
        text: '\n\n',
      },
      {
        text: '      Термін навчання з ' + info.startTerm + ' до ' + info.endTerm + '.',
      },
      {
        text: '\n\n',
      },
    ];
    return res;
  }

  private getDateInUkrString(date: dayjs.Dayjs): string {
    const day = date.day();
    const month = date.month();
    const year = date.year();

    const dayStr = '"' + day + '"';
    let monthStr = '';

    switch (month) {
      case 1:
        monthStr = 'січня';
        break;
      case 2:
        monthStr = 'лютого';
        break;
      case 3:
        monthStr = 'березня';
        break;
      case 4:
        monthStr = 'квітня';
        break;
      case 5:
        monthStr = 'травня';
        break;
      case 6:
        monthStr = 'червня';
        break;
      case 7:
        monthStr = 'липня';
        break;
      case 8:
        monthStr = 'серпня';
        break;
      case 9:
        monthStr = 'вересня';
        break;
      case 10:
        monthStr = 'жовтня';
        break;
      case 11:
        monthStr = 'листопада';
        break;
      case 12:
        monthStr = 'грудня';
        break;
    }

    const res = dayStr + ' ' + monthStr + ' ' + year + 'р.';
    return res;
  }

  private generateOfficialCode(doc: Document): string {
    return '№' + doc.id + '/' + (doc.counter + 1);
  }

  private transformReceiveType(type: ReceiveType): string {
    switch (type) {
      case ReceiveType.E_COPY:
        return 'Електрона копія';
      case ReceiveType.ORIGINAL:
        return 'Оригінал';
      default:
        return null;
    }
  }
}
