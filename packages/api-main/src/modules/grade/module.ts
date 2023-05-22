import { Module } from '@nestjs/common';
import { GradeController } from './controller';
import { GradeService } from './GradeService';

@Module({
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
