import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { IUser } from '../models/user/user.types';
import { UserRole, UserStatus } from '../models/user/user.types';

// userDTO.ts
export class CreateUserInput {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UpdateUserInput {
  @IsOptional() @IsString() username?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
  @IsOptional() isVerified?: boolean;
}

/**
 * 注册用户DTO
 */
export class RegisterUserDTO {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  name!: string;

  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/, {
    message: '密码必须包含至少一个大写字母、一个小写字母和一个数字',
  })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: '无效的用户角色' })
  role?: UserRole;
}

/**
 * 登录用户DTO
 */
export class LoginUserDTO {
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  password!: string;
}

/**
 * 更新用户信息DTO
 */
export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email?: string;

  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;
}

/**
 * 更新密码DTO
 */
export class UpdatePasswordDTO {
  @IsNotEmpty({ message: '当前密码不能为空' })
  @IsString({ message: '当前密码必须是字符串' })
  @IsNotEmpty({ message: '当前密码不能为空' })
  @IsString({ message: '当前密码必须是字符串' })
  currentPassword!: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度不能少于6个字符' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/, {
    message: '新密码必须包含至少一个大写字母、一个小写字母和一个数字',
  })
  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度不能少于6个字符' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/, {
    message: '新密码必须包含至少一个大写字母、一个小写字母和一个数字',
  })
  newPassword!: string;
}

/**
 * 忘记密码DTO
 */
export class ForgotPasswordDTO {
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;
}

/**
 * 重置密码DTO
 */
export class ResetPasswordDTO {
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6个字符' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/, {
    message: '密码必须包含至少一个大写字母、一个小写字母和一个数字',
  })
  password!: string;

  @IsNotEmpty({ message: '确认密码不能为空' })
  @IsString({ message: '确认密码必须是字符串' })
  confirmPassword!: string;
}

/**
 * 用户响应DTO
 */
export class UserResponseDTO implements Pick<IUser, 'email' | 'role'> {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user._id;
    // 处理不同格式的用户名
    if (user.username && typeof user.username === 'object') {
      // 如果username是一个包含firstname和lastname的对象
      const firstname = user.username.firstname || '';
      const lastname = user.username.lastname || '';
      this.name = `${firstname} ${lastname}`.trim();
    } else if (user.username && typeof user.username === 'string') {
      // 如果username是一个字符串
      this.name = user.username;
    } else if (user.name) {
      // 如果有name字段
      this.name = user.name;
    } else {
      // 默认值
      this.name = '';
    }
    this.email = user.email;
    this.role = user.role;
    this.avatar = user.avatar || '/images/avatar.jpg'; // Default avatar
    this.isVerified = user.isVerified;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

/**
 * 登录响应DTO
 */
export class LoginResponseDTO {
  token: string;
  user: UserResponseDTO;

  constructor(token: string, user: any) {
    this.token = token;
    this.user = new UserResponseDTO(user);
  }
}