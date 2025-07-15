import { Profile } from "passport";
import { UserDocument } from "../models/user/user.types";
import logger from "../middleware/logger";

/**
 * Handles OAuth user lookup, linking, and creation in a unified way.
 * 
 * @param profile The OAuth profile object from Passport
 * @param provider The provider name (e.g., 'google' or 'facebook')
 * @param userService Your userService instance
 * @param accessToken OAuth access token
 * @param refreshToken OAuth refresh token
 * @returns UserDocument
 */
export async function handleOAuthCallback(
  profile: Profile,
  provider: string,
  userService: any,
  accessToken: string,
  refreshToken: string
): Promise<UserDocument> {
  logger.info(`Processing OAuth callback for ${provider}`, {
    profileId: profile.id,
  });

  if (!profile.id) {
    throw new Error(`OAuth profile missing required field: id`);
  }

  const email =
    profile.emails?.[0]?.value ||
    `${profile.id}@${provider}.oauth.local`;

  logger.debug("Resolved email for OAuth user:", { email });

  // 1️⃣ Check by provider ID
  let user = await userService.findUserByOAuthProfile(
    { id: profile.id },
    provider
  );

  // 2️⃣ If not found, check by email
  if (!user && email) {
    user = await userService.findUserByEmail(email);
  }

  // 3️⃣ If user exists, optionally link provider and return
  if (user) {
    const isLinked = user[provider]?.id === profile.id;

    if (!isLinked) {
      logger.info(`Linking ${provider} account to existing user`, {
        userId: user._id,
        email,
        provider,
      });
      await userService.linkOAuthProviderToUser(
        user,
        provider,
        profile.id,
        profile,
        true // Assuming verified
      );
    } else {
      logger.info(`OAuth provider ${provider} already linked to user`, {
        userId: user._id,
        provider,
      });
    }

    return user;
  }

  // 4️⃣ Otherwise, create new user
  logger.info(`Creating new user from ${provider} profile`, {
    profileId: profile.id,
    email,
  });

  const firstname = profile.name?.givenName || provider;
  const lastname = profile.name?.familyName || "User";
  const username = `${firstname} ${lastname}`.trim();

  const createdUser = await userService.createUserFromOAuthProfile({
    id: profile.id,
    name: {
      firstname,
      lastname,
    },
    username,
    emails: profile.emails || [],
    avatar: profile.photos?.[0]?.value,
    isVerified: true,
    provider,
    oauth: {
      accessToken,
      refreshToken,
    },
  });

  logger.info(`Successfully created user from ${provider} profile`, {
    userId: createdUser._id,
    profileId: profile.id,
  });

  return createdUser;
}
