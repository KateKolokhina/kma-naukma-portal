import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { IProfile } from 'passport-azure-ad';
import { UserRole } from '../../model/entity/types';
import { User } from '../../model/entity/User';
import dayjs from 'dayjs';

@Injectable()
export class AuthService {
  public async processAzureProfile(profile: IProfile): Promise<User> {
    if (!profile?.oid) {
      throw new UnauthorizedException('OID not found.');
    } else {
      const email: string = profile?._json?.email ?? profile?._json?.preferred_username;
      console.log('email: ', email);

      /// check if exist in db, if no - add
      const isExist: User = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!isExist) {
        const authUser: User = new User();
        authUser.id = profile.oid;
        authUser.email = email;
        authUser.roles = [UserRole.USER];
        authUser.lastEnter = dayjs().unix();

        const auth: User = isExist ?? User.create(authUser);
        await User.save(auth).catch((error) => {
          console.log(error);
          throw new InternalServerErrorException('Помилка при збереженні облікового запису!');
        });

        return auth;
      } else {
        isExist.lastEnter = dayjs().unix();

        return await User.save(isExist).catch((error) => {
          console.log(error);
          throw new InternalServerErrorException('Помилка при обробці облікового запису!');
        });
      }
    }
  }
}
