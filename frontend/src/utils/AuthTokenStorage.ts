export const AuthTokenStorage = {
  get: () => localStorage.getItem('authToken'),
  set: (token: string) => localStorage.setItem('authToken', token),
  remove: () => localStorage.removeItem('authToken'),
};
