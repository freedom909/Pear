import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET||'secure-random-string-here';
const payload = {
  id: '6842b5f90e3a3578e1d95024',
  email: 'mpeg56@gmail.com',
  role: 'GUEST',
};

const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

console.log(token);
