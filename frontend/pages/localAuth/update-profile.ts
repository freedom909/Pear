import { User } from '../../../models/User';
import dbConnect from '../../../utils/dbConnect';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { Error } from 'mongoose';

interface UpdateProfileRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  avatar?: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  token: string;
}

interface UpdateProfileResponse {
  success?: boolean;
  user?: UserData;
  message?: string;
  errors?: string[];
}

interface JwtPayload {
  userId: string;
}

interface ValidationError extends Error {
  errors: {
    [key: string]: {
      message: string;
    };
  };
}

interface UserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  password: string;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateProfileResponse>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    await dbConnect();

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, currentPassword, newPassword, avatar } =
      req.body as UpdateProfileRequest;

    // Update basic info
    if (name) {
      user.name = name;
    }
    if (email && email !== user.email) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    if (avatar) {
      user.avatar = avatar;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      // Get user with password
      const userWithPassword = (await User.findById(decoded.userId).select(
        '+password'
      )) as UserDocument;

      // Check if current password is correct
      const isMatch = await userWithPassword.matchPassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'Current password is incorrect' });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 6 characters' });
      }

      // Set new password
      user.password = newPassword;
    }

    // Save updated user
    await user.save();

    // Return updated user data (excluding password)
    res.status(200).json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token, // Include token in response for client-side use
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);

    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationError = error as ValidationError;
      const validationErrors = Object.values(validationError.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
}
