import { UserService } from '../services/user';
import {handleOAuthUser} from '../services/handleOAuthUser'; // 原导入路径文件不存在，暂时注释
import { IUserProfile, UserDocument, OAuthProfile, OAuthConfig} from '../models/interface/index'; // 原导入路径文件不存在，暂时注释
import { Log } from '../logger/logger';

export abstract class BaseOAuthStrategy {
  constructor(
    protected readonly config: OAuthConfig,
    protected readonly userService: UserService
  ) {}

  protected abstract configureStrategy(): void;

  protected async validateOAuthProfile(
    accessToken: string,
    refreshToken: string,
    profile: OAuthProfile
  ): Promise<IUserProfile | UserDocument | ""> {
    const providerId = profile.id;
    const provider = profile.provider;
    const email = profile.emails?.[0]?.value ?? '';

    try {
      Log.info(`OAuth: Validating ${provider} user`, { providerId });
      const profileDate={// Expected 2 arguments, but got 1.
        providerId,
        provider,
        email, 
        accessToken,
        refreshToken,
        profile,
        config: this.config,
        userService: this.userService,
        id: ''
      }
      const tokenInfo = {
        accessToken,
        refreshToken,
        provider,
      }
      const user = await handleOAuthUser(profileDate,tokenInfo);        

       if (user) {
        Log.info(`OAuth: User processed`, { userId: user.id });
        return user as unknown as IUserProfile; 
      }

      return '';
    } catch (error) {
      Log.error(`OAuth: Failed to validate ${provider} user`, { error });
      throw error;
    }
  }
}