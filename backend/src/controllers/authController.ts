import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = (req as any).body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return (res as any).status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and initial stats transactionally
    const result = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });

      const newStats = await tx.userStats.create({
        data: {
          userId: newUser.id,
        },
      });

      return { user: newUser, stats: newStats };
    });

    // Generate Token
    const token = jwt.sign(
      { userId: result.user.id, role: result.user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    (res as any).status(201).json({ 
      message: 'User registered successfully', 
      token,
      user: { 
        id: result.user.id, 
        username: result.user.username, 
        email: result.user.email, 
        role: result.user.role 
      },
      stats: result.stats
    });
  } catch (error) {
    console.error(error);
    (res as any).status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = (req as any).body;

    // Find User AND Stats
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { stats: true }
    });

    if (!user) {
      return (res as any).status(400).json({ message: 'Invalid credentials' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return (res as any).status(400).json({ message: 'Invalid credentials' });
    }

    // Generate Token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    (res as any).json({ 
      message: 'Login successful', 
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      stats: user.stats
    });
  } catch (error) {
    console.error(error);
    (res as any).status(500).json({ message: 'Server error during login' });
  }
};