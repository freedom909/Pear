export const sendTokenResponse = (
  res: any,
  statusCode: number,
  token: string,
  user: any
) => {
  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};
