import { Router, Request, Response } from 'express';
import { db, users } from '@workspace/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth';

const router = Router();

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    name: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

// Register
router.post('/register', async (req: RegisterRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
    }).returning();

    const token = generateToken(newUser[0].id);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: LoginRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
