import User from '../models/user/user.model';
import { OAuthError, ValidationError } from '../errors/httpError';
import { OAuthTokenInfo } from '../models/interface/index';

/**
 * OAuth 提供商类型
 */
export type OAuthProvider = 'google' | 'facebook' | 'twitter' | 'apple';

/**
 * OAuth 令牌信息
 */


/**
 * 处理 OAuth 用户认证
 * 如果用户不存在，则创建新用户
 * 如果用户已存在，则更新用户信息
 * 
 * @param profile OAuth 提供商返回的用户资料
 * @param tokenInfo OAuth 令牌信息
 * @returns 用户对象
 */
export const handleOAuthUser = async (profile: any, tokenInfo: OAuthTokenInfo) => {
  try {
    if (!profile || !profile.id || !profile.provider) {
      throw new ValidationError('无效的 OAuth 配置文件数据');
    }

    const provider = profile.provider as OAuthProvider;
    const providerId = profile.id;
    
    // 尝试通过 providerId 查找用户
    let user = await User.findOne({ [`${provider}Id`]: providerId });
    
    // 如果用户有邮箱，也尝试通过邮箱查找
    const email = profile.emails && profile.emails.length > 0 
      ? profile.emails[0].value 
      : undefined;
    
    if (!user && email) {
      user = await User.findOne({ email });
    }
    
    if (user) {
      // 更新现有用户
      (user as any)[`${provider}Id`] = providerId;
      (user as any).email = email;
      
      // 如果用户没有头像但 OAuth 提供了头像，则更新
        if (!(user as any).profilePhoto && profile.photos && profile.photos.length > 0) {
        (user as any).profilePhoto = profile.photos[0].value;
      }
      
      // 保存令牌信息（可选，取决于你的应用需求）
      if (tokenInfo.accessToken) {
        (user as any)[`${provider}AccessToken`] = tokenInfo.accessToken;
      }
      
      if (tokenInfo.refreshToken) {
        (user as any)[`${provider}RefreshToken`] = tokenInfo.refreshToken;
      }
      
      await user.save();
      return user;
    } else {
      // 创建新用户
      const userData: any = {
        [`${provider}Id`]: providerId,
        name: profile.displayName || `${provider}用户`,
        email,
        emailVerified: email ? true : false, // OAuth 提供的邮箱通常已验证
        role: 'user',
      };
      
      // 添加头像
      if (profile.photos && profile.photos.length > 0) {
        userData.profilePhoto = profile.photos[0].value;
      }
      
      // 保存令牌信息（可选）
      if (tokenInfo.accessToken) {
        userData[`${provider}AccessToken`] = tokenInfo.accessToken;
      }
      
      if (tokenInfo.refreshToken) {
        userData[`${provider}RefreshToken`] = tokenInfo.refreshToken;
      }
      
      const newUser = await User.create(userData);
      return newUser;
    }
  } catch (error) {
    console.error('OAuth 用户处理错误:', error);
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new OAuthError(
      `${profile?.provider || '未知提供商'} 认证失败`,
      'OAUTH_PROCESSING_ERROR',
      
    );
  }
};

/**
 * 将 OAuth 令牌与现有用户关联
 * 用于将多个 OAuth 提供商关联到同一个账户
 * 
 * @param userId 用户ID
 * @param profile OAuth 提供商返回的用户资料
 * @param tokenInfo OAuth 令牌信息
 * @returns 更新后的用户对象
 */
export const linkOAuthToUser = async (userId: string, profile: any, tokenInfo: OAuthTokenInfo) => {
  try {
    if (!profile || !profile.id || !profile.provider) {
      throw new ValidationError('无效的 OAuth 配置文件数据');
    }

    const provider = profile.provider as OAuthProvider;
    const providerId = profile.id;
    
    // 检查此 OAuth 账号是否已被其他用户关联
    const existingUser = await User.findOne({ [`${provider}Id`]: providerId });
    if (existingUser && existingUser.id !== userId) {
      throw new OAuthError(
        '此 OAuth 账号已被其他用户关联',
        'OAUTH_ALREADY_LINKED',
      
      );
    }
    
    // 查找要关联的用户
    const user = await User.findById(userId);
    if (!user) {
      throw new ValidationError('用户不存在');
    }
    
    // 关联 OAuth 账号
    (user as any)[`${provider}Id`] = providerId;
    
    // 保存令牌信息
    if (tokenInfo.accessToken) {
      (user as any)[`${provider}AccessToken`] = tokenInfo.accessToken;
    }
    
    if (tokenInfo.refreshToken) {
      (user as any)[`${provider}RefreshToken`] = tokenInfo.refreshToken;
    }
    
    await user.save();
    return user;
  } catch (error) {
    console.error('OAuth 关联错误:', error);
    
    if (error instanceof ValidationError || error instanceof OAuthError) {
      throw error;
    }
    
    throw new OAuthError(
      `关联 ${profile?.provider || '未知提供商'} 账号失败`,
      'OAUTH_LINKING_ERROR',
    
    );
  }
};

/**
 * 解除 OAuth 提供商与用户的关联
 * 
 * @param userId 用户ID
 * @param provider OAuth 提供商
 * @returns 更新后的用户对象
 */
export const unlinkOAuthFromUser = async (userId: string, provider: OAuthProvider) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ValidationError('用户不存在');
    }
    
    // 检查用户是否至少有一种登录方式（密码或其他 OAuth）
    const hasPassword = !!(user as any).password;
    const linkedProviders = ['google', 'facebook', 'twitter', 'apple'].filter(
      p => !!(user as any)[`${p}Id`]
    );
    
    // 如果用户只有一种登录方式且正是要解除的提供商，则不允许解除
    if (!hasPassword && linkedProviders.length === 1 && linkedProviders[0] === provider) {
      throw new ValidationError(
        '无法解除关联，用户必须至少保留一种登录方式',
        'CANNOT_UNLINK_LAST_PROVIDER'
      );
    }
    
    // 解除关联
    (user as any)[`${provider}Id`] = undefined;
    (user as any)[`${provider}AccessToken`] = undefined;
    (user as any)[`${provider}RefreshToken`] = undefined;
    
    await user.save();
    return user;
  } catch (error) {
    console.error('OAuth 解除关联错误:', error);
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new OAuthError(
      `解除 ${provider} 账号关联失败`,
      'OAUTH_UNLINKING_ERROR',
 
    );
  }
};