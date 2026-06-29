import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { uploadReceiptImage } from '../middleware/upload';
import { PaymentType } from '@prisma/client';

const router = Router();

// POST / — create order
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { productId, paymentType } = req.body;

    if (!productId || !paymentType) {
      res.status(400).json({ error: 'Mahsulot ID va to\'lov turi kiritilishi shart' });
      return;
    }

    if (!Object.values(PaymentType).includes(paymentType as PaymentType)) {
      res.status(400).json({ error: 'Noto\'g\'ri to\'lov turi. CLICK yoki PAYNET bo\'lishi kerak' });
      return;
    }

    // Verify product exists and is active
    const product = await prisma.product.findFirst({
      where: { id: productId, active: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Mahsulot topilmadi' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        productId,
        amount: product.price,
        paymentType: paymentType as PaymentType,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    });

    // Remove from cart if it was there
    await prisma.cartItem.deleteMany({
      where: {
        userId: req.user!.id,
        productId,
      },
    });

    res.status(201).json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /:id/paid — upload receipt
router.post('/:id/paid', requireAuth, uploadReceiptImage.single('receipt'), async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== req.user!.id) {
      res.status(403).json({ error: 'You can only update your own orders' });
      return;
    }

    if (order.status !== 'PENDING') {
      res.status(400).json({ error: 'Only pending orders can be marked as paid' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Receipt image is required' });
      return;
    }

    const receiptImageUrl = `/uploads/receipts/${req.file.filename}`;

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { receiptImageUrl },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    res.json({ order: updatedOrder, message: 'Receipt uploaded. Waiting for admin confirmation.' });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /my — get user's orders
router.get('/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            imageUrl: true,
            fileUrl: true,
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

    // Only show license keys and file URLs for confirmed orders
    const sanitizedOrders = orders.map((order) => ({
      ...order,
      licenseKey: order.status === 'CONFIRMED' ? order.licenseKey : null,
      manualKey: order.status === 'CONFIRMED' ? order.manualKey : null,
      product: {
        ...order.product,
        fileUrl: order.status === 'CONFIRMED' ? order.product.fileUrl : null,
      },
    }));

    res.json({ orders: sanitizedOrders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id/download — download product file
router.get('/:id/download', requireAuth, async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        product: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== req.user!.id) {
      res.status(403).json({ error: 'You can only download files from your own orders' });
      return;
    }

    if (order.status !== 'CONFIRMED') {
      res.status(403).json({ error: 'Order must be confirmed before downloading' });
      return;
    }

    if (!order.product.fileUrl) {
      res.status(404).json({ error: 'No file available for this product' });
      return;
    }

    // The fileUrl is stored as a relative path like /uploads/products/files/filename.zip
    const filePath = path.join(process.cwd(), order.product.fileUrl);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found on server' });
      return;
    }

    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/public-receipt/:id (Public endpoint for QR code validation)
router.get('/public-receipt/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            name: true,
            category: true,
            price: true,
            description: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        },
        licenseKey: true
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Buyurtma topilmadi' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Public receipt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
