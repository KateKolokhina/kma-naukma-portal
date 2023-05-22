import { Module } from '@nestjs/common';
import { UserController } from './controller';
import { UserService } from './UserService';

@Module({
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
