import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
@Injectable()
export class AuthGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (req?.isAuthenticated()) {
      return !!req.user;
    }
    throw new UnauthorizedException();
  }
}
