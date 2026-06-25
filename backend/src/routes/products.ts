import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Category } from '@prisma/client';

const router = Router();

// GET / — list active products with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    const where: any = { active: true };

    if (category && Object.values(Category).includes(category as Category)) {
      where.category = category as Category;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    res.json({ products });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id — single product detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, active: true },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
