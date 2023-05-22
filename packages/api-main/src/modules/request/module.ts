import { Module } from '@nestjs/common';
import { RequestController } from './controller';
import { RequestService } from './RequestService';
import { UserService } from '../user/UserService';
import { GradeService } from '../grade/GradeService';

@Module({
  controllers: [RequestController],
  providers: [RequestService, UserService, GradeService],
})
export class RequestModule {}
