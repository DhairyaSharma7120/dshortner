import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateAccessToken = (
  userId: string,
  email: string
) => {
  return jwt.sign(
    {
      sub: userId,
      email,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};