import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET / — list all payment methods
router.get('/', async (_req: Request, res: Response) => {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany();
    res.json({ paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
