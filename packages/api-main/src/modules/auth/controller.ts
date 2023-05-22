import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserRequest } from './types';
import { AuthGuard } from './AuthGuard';
import { Request, Response } from 'express';
import passport0 from 'passport';
import { AuthService } from './AuthService';
import { User } from '../../model/entity/User';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('user')
  @UseGuards(AuthGuard)
  public async user(@Req() req: UserRequest): Promise<User> {
    return req?.user;
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  public async logout(@Req() req: Request | any, @Res() res: Response): Promise<void> {
    await new Promise<User>((resolve, reject): void => {
      req.logout(req.user, (err) => {
        if (err) return reject(err);
        else {
          res.redirect('/');
        }
      });
    });
  }

  @Get('naukma')
  public async requestLogin(@Req() req: UserRequest, @Res() res: Response): Promise<void> {
    if (req?.isAuthenticated()) {
      res.redirect('/profile');
    } else {
      passport0.authenticate('UkmaStrategy', {}, (err, user, info) => {
        console.debug(err);
        console.debug(user);
        console.debug(info);
      })(req, res, (...args) => {
        console.debug(...args);
      });
    }
  }

  @Post('naukma')
  public async callback(@Req() req: UserRequest, @Res() res: Response): Promise<void> {
    const result = await new Promise<User>((resolve, reject): void =>
      passport0.authenticate('UkmaStrategy', {}, async (err, data, info, ...args) => {
        if (err) {
          reject(err);
        } else if (info) {
          reject(new InternalServerErrorException(info));
        } else {
          console.debug('resolve ', data);
          const user = await this.service.processAzureProfile(data).catch((error) => {
            reject(error);
          });
          if (user) {
            return resolve(user);
          } else {
            reject(new BadRequestException('error with user authentication '));
          }
        }
      })(req, res),
    );

    if (result) {
      await req.login(result, (...args) => {
        req.user = result;
        console.log('Login complete for: ', result);
        res.redirect('/');
      });
    }
  }
}
