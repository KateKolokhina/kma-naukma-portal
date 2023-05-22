import { Module } from "@nestjs/common";
import { AuthController } from "./controller";
import { AuthService } from "./AuthService";
import { UkmaStrategy } from "./UkmaStrategy";
import { CookieSerializer } from "./CookieSerializer";

@Module({
  controllers: [AuthController],
  providers: [AuthService, UkmaStrategy, CookieSerializer],
})
export class AuthModule {}

