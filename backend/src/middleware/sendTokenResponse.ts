import { Response } from 'express';
import { UserDocument } from '../models/user/user.types';
import { UserResponseDTO } from '@/dtos/userDTO';

export const sendTokenResponse = (user: UserDocument, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    data: new UserResponseDTO(user),
  });
};

