import 'reflect-metadata'; // ← これをファイルの一番上に追加

import { inject, injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/appError';
import config from '../config/config';
//import { AuthRepository } from '../repositories/auth.repository';
import UserService  from './user.service';
import { RegisterUserDTO } from '../dtos/userDTO';
import { AuthResponse, TokenPayload } from './interface/auth.interface';
import { UserRole, UserDocument } from '../models/user/user.types';
import { OAuthProfile } from '../models/interface/index';
import { ErrorCode } from '../errors/error-code';
import { UnauthorizedError } from '../errors/httpError';
import { container } from 'tsyringe';

const userService=container.resolve(UserService);
@injectable()
export class AuthService {
  constructor(
   // @inject(AuthRepository) private readonly authRepository: AuthRepository,
    @inject(UserService) private readonly userService: UserService
  ) {}

 async generateJwtForUser(user: UserDocument) : Promise<string>{
    const payload: TokenPayload = {
      id: user.id,
      role: user.role as UserRole,
      email: user.email,
    };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '1h',
    });
 }

  async register(data: RegisterUserDTO): Promise<AuthResponse> {
    const exists = await this.userService.findUserByName(data.firstname, data.lastname);
    if (exists) throw AppError.badRequest('用户名已被使用');

    const emailUsed = await userService.findUserByEmail(data.email);
    if (emailUsed) throw AppError.badRequest('邮箱已被注册');

    const user = await this.userService.createLocalUser(data);
    return this.buildAuthResponse(user);
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    const user = await this.userService.findByIdentifier(identifier, password);
    return this.buildAuthResponse(user);
  }

  async oauthLogin(provider: string, profile: OAuthProfile): Promise<AuthResponse> {
    const user = await this.userService.handleOAuthLogin(provider, profile);
    return this.buildAuthResponse(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as TokenPayload;
    const user = await this.userService.findUserById(decoded.id);
    if (!user) throw AppError.unauthorized('无效的刷新令牌');
    return this.buildAuthResponse(user);
  }

  verifyAccessToken(token: string): Promise<TokenPayload | undefined> {
    try {
      return Promise.resolve(jwt.verify(token, config.jwt.secret) as TokenPayload);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError(ErrorCode.TOKEN_EXPIRED, 'Token expired');
      }
      return Promise.resolve(undefined);
    }
  }

  private buildAuthResponse(user: UserDocument): AuthResponse {
    return {
      user: {
        id: user.id.toString(),
        username: { firstname: user.firstname, lastname: user.lastname },
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken: user.generateAuthToken(),
        refreshToken: user.generateRefreshToken(),
      },
    };
  }
}
