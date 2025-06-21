import moment from "moment";
import { Request, Response, NextFunction } from "express";
import refresh from "passport-oauth2-refresh";
import { UserDocument, OAuthToken } from "../models/interface";

export function isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
     // Type: UserDocument
    const user = req.user as UserDocument & { tokens?: OAuthToken[] } | undefined;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    const provider = req.path.split('/')[2];
    const token = user.tokens?.find((token) => token.kind === provider);
    // Assume User type is defined somewhere, update its definition to include 'tokens'
    // If User type is defined in a separate file, you should update that file instead.
    // For demonstration, let's assume we can modify the type here

    if (!token) {
      return res.status(401).json({ message: 'No token found' });//Property 'tokens' does not exist on type 'User'
    }
  
    const expires = moment(token.expires);
    if (expires.isBefore(moment())) {
     return refresh.requestNewAccessToken(
        provider,
        token.refreshToken!,
        (err, accessToken, refreshToken) => {
          if (err) {
            return res.status(401).json({ message: 'Token refresh failed' });
          }

          token.accessToken = accessToken ?? '';
          token.refreshToken = refreshToken ?? '';
          token.expires = moment().add(1, 'hour').toDate();
          return next();
        }
      );
    } else {
      next();
    }
  }
  