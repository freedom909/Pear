require('dotenv').config();
const jwt = require('jsonwebtoken');

const payload = { id: '686279bcf6a6f126c541e93a' };
const secret = process.env.JWT_SECRET;

const token = jwt.sign(payload, secret, { expiresIn: '7d' });

console.log('Generated token:', token);

const decoded = jwt.verify(token, secret);
console.log('Decoded token:', decoded);
