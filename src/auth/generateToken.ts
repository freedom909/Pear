import jwt from 'jsonwebtoken';

const payload = {
  userId: '6842b5f90e3a3578e1d95024',
  email: 'mpeg56@gmail.com',
  role: 'GUEST',
};

const token = jwt.sign(payload, 'YOUR_SECRET', { expiresIn: '7d' });

console.log(token);
