const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const generateTokens = async (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, tokenId: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  return await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
};

const getRefreshToken = async (token) => {
  return await prisma.refreshToken.findUnique({
    where: { token },
  });
};

const deleteRefreshToken = async (token) => {
  return await prisma.refreshToken.delete({
    where: { token },
  });
};

const deleteUserRefreshTokens = async (userId) => {
  return await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

const deleteExpiredRefreshTokens = async () => {
  return await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

module.exports = {
  generateTokens,
  saveRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshTokens,
  deleteExpiredRefreshTokens,
}; 