// In a global.d.ts or similar
declare global {
    namespace Express {
      interface User extends UserDocument {}
    }
  }
  