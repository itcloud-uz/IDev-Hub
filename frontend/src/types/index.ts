export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  blocked: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'SERVER_TOOLS' | 'AI_BOTS' | 'WEB_DEV' | 'DEVOPS' | 'MOBILE_DEV';
  price: number;
  imageUrl: string | null;
  fileUrl: string | null;
  active: boolean;
  createdAt: string;
}

export interface LicenseKey {
  id: string;
  productId: string;
  keyValue: string;
  used: boolean;
  orderId: string | null;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  amount: number;
  paymentType: 'CLICK' | 'PAYNET';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  receiptImageUrl: string | null;
  licenseKey: LicenseKey | null;
  manualKey: string | null;
  createdAt: string;
  confirmedAt: string | null;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  qrImageUrl: string | null;
  instructions: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orderCount: number;
}

export const CATEGORY_LABELS: Record<string, string> = {
  SERVER_TOOLS: 'Server vositalari',
  AI_BOTS: 'AI/Botlar',
  WEB_DEV: 'Web dasturlash',
  DEVOPS: 'DevOps',
  MOBILE_DEV: 'Mobil dasturlash',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Kutilmoqda',
  CONFIRMED: 'Tasdiqlangan',
  CANCELLED: 'Bekor qilingan',
};
