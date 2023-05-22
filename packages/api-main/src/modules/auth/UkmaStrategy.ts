import { PassportStrategy } from '@nestjs/passport';
import { OIDCStrategy, IProfile } from 'passport-azure-ad';
import { Injectable, UnauthorizedException } from '@nestjs/common';

Injectable();
export class UkmaStrategy extends PassportStrategy(OIDCStrategy, 'UkmaStrategy') {
  constructor() {
    super({
      identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      responseType: 'id_token',
      responseMode: 'form_post',
      redirectUrl: 'http://localhost:8080/auth/naukma',
      allowHttpForRedirectUrl: true,
      validateIssuer: false,
      passReqToCallback: false,
      loggingLevel: 'warn',
      scope: ['openid', 'email', 'profile'],
    });
  }

  public async validate(profile: IProfile): Promise<IProfile> {
    if (!profile?.oid) {
      throw new UnauthorizedException('OID not found.');
    }
    return profile;
  }
}
