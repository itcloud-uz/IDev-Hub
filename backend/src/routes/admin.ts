import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAdmin } from '../middleware/auth';
import { uploadProductImage, uploadProductFile, uploadQrImage } from '../middleware/upload';
import { Category, OrderStatus, PaymentType } from '@prisma/client';

const router = Router();

// All admin routes require admin privileges
router.use(requireAdmin);

// ==================== STATS ====================

// GET /stats — dashboard statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();

    const revenueResult = await prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'CONFIRMED' },
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // Today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRevenueResult = await prisma.order.aggregate({
      _sum: { amount: true },
      where: {
        status: 'CONFIRMED',
        confirmedAt: { gte: todayStart },
      },
    });
    const todayRevenue = todayRevenueResult._sum.amount || 0;

    // Monthly revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyRevenueResult = await prisma.order.aggregate({
      _sum: { amount: true },
      where: {
        status: 'CONFIRMED',
        confirmedAt: { gte: monthStart },
      },
    });
    const monthlyRevenue = monthlyRevenueResult._sum.amount || 0;

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      todayRevenue,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /revenue — revenue by month (for charts)
router.get('/revenue', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { status: 'CONFIRMED', confirmedAt: { not: null } };

    if (startDate) {
      where.confirmedAt = { ...where.confirmedAt, gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.confirmedAt = { ...where.confirmedAt, lte: new Date(endDate as string) };
    }

    const confirmedOrders = await prisma.order.findMany({
      where,
      select: {
        amount: true,
        confirmedAt: true,
      },
      orderBy: { confirmedAt: 'asc' },
    });

    // Group by month
    const revenueByMonth: Record<string, { revenue: number; orderCount: number }> = {};

    for (const order of confirmedOrders) {
      if (!order.confirmedAt) continue;
      const monthKey = `${order.confirmedAt.getFullYear()}-${String(order.confirmedAt.getMonth() + 1).padStart(2, '0')}`;
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { revenue: 0, orderCount: 0 };
      }
      revenueByMonth[monthKey].revenue += order.amount;
      revenueByMonth[monthKey].orderCount += 1;
    }

    const result = Object.entries(revenueByMonth).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orderCount: data.orderCount,
    }));

    res.json({ revenue: result });
  } catch (error) {
    console.error('Revenue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PRODUCTS ====================

// GET /products — list ALL products (including inactive)
router.get('/products', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orders: true,
            licenseKeys: true,
          },
        },
      },
    });

    res.json({ products });
  } catch (error) {
    console.error('Admin list products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /products — create product
router.post('/products', uploadProductImage.single('image'), async (req: Request, res: Response) => {
  try {
    const { name, description, category, price } = req.body;

    if (!name || !description || !category || !price) {
      res.status(400).json({ error: 'Name, description, category, and price are required' });
      return;
    }

    if (!Object.values(Category).includes(category as Category)) {
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      res.status(400).json({ error: 'Price must be a positive number' });
      return;
    }

    const imageUrl = req.file ? `/uploads/products/images/${req.file.filename}` : null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category: category as Category,
        price: parsedPrice,
        imageUrl,
      },
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /products/:id — update product
router.put('/products/:id', uploadProductImage.single('image'), async (req: Request, res: Response) => {
  try {
    const { name, description, category, price } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const data: any = {};

    if (name) data.name = name;
    if (description) data.description = description;
    if (category) {
      if (!Object.values(Category).includes(category as Category)) {
        res.status(400).json({ error: 'Invalid category' });
        return;
      }
      data.category = category;
    }
    if (price) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        res.status(400).json({ error: 'Price must be a positive number' });
        return;
      }
      data.price = parsedPrice;
    }
    if (req.file) {
      data.imageUrl = `/uploads/products/images/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /products/:id — soft or hard delete
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { hard } = req.query;

    const existingProduct = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existingProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (hard === 'true') {
      await prisma.product.delete({ where: { id: req.params.id } });
      res.json({ message: 'Product permanently deleted' });
    } else {
      await prisma.product.update({
        where: { id: req.params.id },
        data: { active: false },
      });
      res.json({ message: 'Product deactivated' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /products/:id/toggle — toggle active status
router.patch('/products/:id/toggle', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { active: !product.active },
    });

    res.json({ product: updated, message: `Product ${updated.active ? 'activated' : 'deactivated'}` });
  } catch (error) {
    console.error('Toggle product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /products/:id/file — upload product file
router.post('/products/:id/file', uploadProductFile.single('file'), async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'File is required' });
      return;
    }

    const fileUrl = `/uploads/products/files/${req.file.filename}`;

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { fileUrl },
    });

    res.json({ product: updated, message: 'Product file uploaded successfully' });
  } catch (error) {
    console.error('Upload product file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /products/:id/keys — add license keys
router.post('/products/:id/keys', async (req: Request, res: Response) => {
  try {
    const { keys } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      res.status(400).json({ error: 'An array of license keys is required' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const created = await prisma.licenseKey.createMany({
      data: keys.map((key: string) => ({
        productId: req.params.id,
        keyValue: key,
      })),
    });

    res.status(201).json({ message: `${created.count} license keys added`, count: created.count });
  } catch (error) {
    console.error('Add license keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /products/:id/keys — list license keys for product
router.get('/products/:id/keys', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const licenseKeys = await prisma.licenseKey.findMany({
      where: { productId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
      },
    });

    res.json({ licenseKeys });
  } catch (error) {
    console.error('List license keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ORDERS ====================

// GET /orders — list all orders with filters
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const { status, paymentType } = req.query;

    const where: any = {};

    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status;
    }

    if (paymentType && Object.values(PaymentType).includes(paymentType as PaymentType)) {
      where.paymentType = paymentType;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
          },
        },
        licenseKey: {
          select: {
            keyValue: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Admin list orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /orders/:id/confirm — confirm order
router.patch('/orders/:id/confirm', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { product: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status !== 'PENDING') {
      res.status(400).json({ error: 'Only pending orders can be confirmed' });
      return;
    }

    // Try to find an available license key for this product
    const availableKey = await prisma.licenseKey.findFirst({
      where: {
        productId: order.productId,
        used: false,
      },
    });

    const updateData: any = {
      status: 'CONFIRMED' as OrderStatus,
      confirmedAt: new Date(),
    };

    if (availableKey) {
      // Assign license key to order
      await prisma.licenseKey.update({
        where: { id: availableKey.id },
        data: {
          used: true,
          orderId: order.id,
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        product: {
          select: { id: true, name: true, price: true },
        },
        licenseKey: {
          select: { keyValue: true },
        },
      },
    });

    res.json({
      order: updatedOrder,
      licenseKeyAssigned: !!availableKey,
      message: availableKey
        ? 'Order confirmed and license key assigned'
        : 'Order confirmed. No license keys available — you can set a manual key.',
    });
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /orders/:id/cancel — cancel order
router.patch('/orders/:id/cancel', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status === 'CANCELLED') {
      res.status(400).json({ error: 'Order is already cancelled' });
      return;
    }

    // If order had a license key, free it
    if (order.status === 'CONFIRMED') {
      await prisma.licenseKey.updateMany({
        where: { orderId: order.id },
        data: { used: false, orderId: null },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        product: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({ order: updatedOrder, message: 'Order cancelled' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /orders/:id/manual-key — set manual license key
router.patch('/orders/:id/manual-key', async (req: Request, res: Response) => {
  try {
    const { key } = req.body;

    if (!key) {
      res.status(400).json({ error: 'License key is required' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { manualKey: key },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        product: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({ order: updatedOrder, message: 'Manual license key set' });
  } catch (error) {
    console.error('Set manual key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PAYMENT METHODS ====================

// PUT /payment-methods/:id — update payment method
router.put('/payment-methods/:id', uploadQrImage.single('qrImage'), async (req: Request, res: Response) => {
  try {
    const { instructions } = req.body;

    const existing = await prisma.paymentMethod.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Payment method not found' });
      return;
    }

    const data: any = {};

    if (instructions !== undefined) {
      data.instructions = instructions;
    }

    if (req.file) {
      data.qrImageUrl = `/uploads/qr/${req.file.filename}`;
    }

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ paymentMethod, message: 'Payment method updated' });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BLOG ====================

// POST /blog — create blog post
router.post('/blog', uploadProductImage.single('image'), async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, published } = req.body;

    if (!title || !excerpt || !content) {
      res.status(400).json({ error: 'Title, excerpt, and content are required' });
      return;
    }

    const imageUrl = req.file ? `/uploads/products/images/${req.file.filename}` : null;

    const post = await prisma.blogPost.create({
      data: {
        title,
        excerpt,
        content,
        imageUrl,
        published: published !== undefined ? published === 'true' : true,
      },
    });

    res.status(201).json({ post });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /blog/:id — update blog post
router.put('/blog/:id', uploadProductImage.single('image'), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }

    const { title, excerpt, content, published } = req.body;
    const data: any = {};

    if (title) data.title = title;
    if (excerpt) data.excerpt = excerpt;
    if (content) data.content = content;
    if (published !== undefined) data.published = published === 'true';
    if (req.file) data.imageUrl = `/uploads/products/images/${req.file.filename}`;

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ post });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /blog/:id — delete blog post
router.delete('/blog/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }

    await prisma.blogPost.delete({ where: { id: req.params.id } });

    res.json({ message: 'Blog post deleted' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== USERS ====================

// GET /users — list all users with order counts
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /users/:id/block — toggle block status
router.patch('/users/:id/block', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { blocked: !user.blocked },
      select: {
        id: true,
        name: true,
        email: true,
        blocked: true,
      },
    });

    res.json({ user: updated, message: `User ${updated.blocked ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/:id — user detail with order history
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        createdAt: true,
        orders: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
            licenseKey: {
              select: { keyValue: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
