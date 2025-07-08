export const sendTokenResponse = (res: any, statusCode: number, token: string) => {
    res.status(statusCode).json({
    success: true,
    token,
  });
  };