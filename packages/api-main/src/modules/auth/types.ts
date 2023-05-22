import { Request } from 'express';
import { User } from '../../model/entity/User';
export type TUser = {
  id?: string;
  email?: string;
};

export type TUserSerialized = Pick<TUser, 'email' | 'id'>;
export type UserRequest = Request & {
  user?: Readonly<User>;
};
