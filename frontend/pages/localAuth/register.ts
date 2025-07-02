import { User } from '../../../models/User';
import dbConnect from '../../../utils/dbConnect';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { Error } from 'mongoose';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  token: string;
}

interface RegisterResponse {
  success?: boolean;
  user?: UserData;
  message?: string;
  errors?: string[];
}

interface ValidationError extends Error {
  errors: {
    [key: string]: {
      message: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password } = req.body as RegisterRequest;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Please provide all required fields',
    });
  }

  try {
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      // Generate a default avatar using initials
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // Return user data (excluding password) and token
    const userData: UserData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token,
    };

    res.status(201).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
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
