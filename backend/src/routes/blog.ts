import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET / — list published blog posts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    res.json({ posts });
  } catch (error) {
    console.error('List blog posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id — single blog post
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { id: req.params.id, published: true },
    });

    if (!post) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }

    res.json({ post });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
