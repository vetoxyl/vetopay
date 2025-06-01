const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const getUserByResetToken = async (token) => {
  // Note: You'll need to add passwordResetToken and passwordResetExpires fields to the User model
  return await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });
};

const updateUser = async (id, updateData) => {
  return await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      emailVerified: true,
      twoFactorEnabled: true,
      updatedAt: true,
    },
  });
};

const getAllUsers = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;

  const where = {};
  
  if (filters.role) {
    where.role = filters.role;
  }
  
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const deleteUser = async (id) => {
  // Soft delete by deactivating the user
  return await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });
};

const activateUser = async (id) => {
  return await prisma.user.update({
    where: { id },
    data: { isActive: true },
  });
};

const verifyEmail = async (id) => {
  return await prisma.user.update({
    where: { id },
    data: { emailVerified: true },
  });
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getUserByResetToken,
  updateUser,
  getAllUsers,
  deleteUser,
  activateUser,
  verifyEmail,
}; 