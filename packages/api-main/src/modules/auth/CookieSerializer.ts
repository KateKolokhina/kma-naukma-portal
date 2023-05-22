import { PassportSerializer } from "@nestjs/passport";
import { TUser, TUserSerialized } from "./types";
import { User } from "../../model/entity/User";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class CookieSerializer extends PassportSerializer {
  constructor() {
    super();
  }

  public serializeUser(user: TUser, done: (err, serialized: TUserSerialized) => void): void {
    done(null, {
      id: user.id,
    });
  }

  public async deserializeUser(serialized: TUserSerialized, done: (err, user: TUser) => void): Promise<void> {
    if (serialized?.id) {
      await User.findOne({
        where: {
          id: serialized?.id,
        },
      })
        .then((user: User): void => void done(null, user))
        .catch((err) => {
          done(new UnauthorizedException(err?.message ?? err ?? undefined), null);
        });
    } else {
      done(null, null);
    }
  }
}
