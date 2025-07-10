export const config = {
  security: {
    password: {
      iterations: 10000,
      keylen: 64,
      digest: 'sha512',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'secure-random-string-here',
      expiresIn: '1d',
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.163.com',
      port: process.env.EMAIL_PORT || 465,
      secure: process.env.EMAIL_SECURE || true,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      from: process.env.EMAIL_FROM || '"<NAME>" <<EMAIL>>',
      auth: {
        user: process.env.EMAIL_USER || '<EMAIL>',
        pass: process.env.EMAIL_PASS || '<PASSWORD>',
      },
    },
  },
};
