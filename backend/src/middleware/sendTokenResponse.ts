import { Response } from 'express';
import { UserDocument } from '../models/user/user.types';

export function sendTokenResponse(user: UserDocument, statusCode: number, res: Response) {
  const token = user.getSignedJwtToken();
  const refreshToken = user.generateRefreshToken();
  const tokenExpiry = Math.floor(Date.now() / 1000) + 60 * 60;  

  res
    .status(statusCode)
    .cookie('token', token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + 7 * 24 * 3600000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .json({ success: true, token, refreshToken, tokenExpiry });
}
