import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from 'src/users/entities/user.entity';

export type JwtPayload = {
  sub: number;
  email: string;
  role: UserRole;
};

export type JwtUser = {
  id: number;
  email: string;
  role: UserRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    });
  }

  validate(payload: JwtPayload): JwtUser {
    if (!payload?.sub) throw new UnauthorizedException();

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
