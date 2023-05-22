import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './modules/user/module';
import { AppDbModule } from './modules/database/AppDbModule';
import { NaukmaDbModule } from './modules/database/NaukmaModule';

import { GradeModule } from './modules/grade/module';
import { DocumentModule } from './modules/document/module';
import { RequestModule } from './modules/request/module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'client-main/dist'),
    }),
    AuthModule,
    AppDbModule,
    NaukmaDbModule,
    UserModule,
    GradeModule,
    DocumentModule,
    RequestModule,
  ],
})
export class AppModule {}
