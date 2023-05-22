import { Module } from '@nestjs/common';
import { DocumentController } from './controller';
import { DocumentService } from './DocumentService';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
