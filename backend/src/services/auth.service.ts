import 'reflect-metadata'; // ← これをファイルの一番上に追加

import { inject, injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/appError';
import config from '../config/config';
import { AuthRepository } from '../repositories/auth.repository';
// import UserService  from './user.service';
import { RegisterUserDTO } from '../dtos/userDTO';
import { AuthResponse, TokenPayload } from './interface/auth.interface';
import { UserRole, UserDocument } from '../models/user/user.types';

import { ErrorCode } from '../errors/error-code';
import { UnauthorizedError } from '../errors/httpError';
import { container } from 'tsyringe';
import UserService  from './user.service';


const authRepository = container.resolve(AuthRepository);

@injectable()
export class AuthService {
  constructor(
   // @inject(AuthRepository) private readonly authRepository: AuthRepository,
    @inject(AuthRepository) private readonly authRepository: AuthRepository,
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

    const emailUsed = await authRepository.findUserByEmail(data.email);
    if (emailUsed) throw AppError.badRequest('邮箱已被注册');

    const user = await this.authRepository.registerUser(data);
    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) throw AppError.unauthorized('邮箱或密码错误');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw AppError.unauthorized('邮箱或密码错误');
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
