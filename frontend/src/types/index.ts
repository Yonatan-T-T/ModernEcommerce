export interface StoreConfig {
  storeName: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
}

export type SkinType = 'All' | 'Dry' | 'Oily' | 'Combination' | 'Sensitive' | 'Normal';

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  variantName: string;
  size?: string;
  shade?: string;
  shadeColorHex?: string;
  price: number;
  costPrice: number;
  weightGrams?: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  sku: string;
  price: number;
  costPrice: number;
  compareAtPrice?: number;
  weightGrams?: number;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  skinType: number;
  skinTypeName: string;
  ingredients?: string;
  howToUse?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  primaryImageUrl?: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  productCount: number;
}

export interface CartItem {
  productId: number;
  productVariantId?: number;
  name: string;
  variantName?: string;
  imageUrl?: string;
  price: number;
  costPrice: number;
  weightGrams?: number;
  quantity: number;
  maxStock: number;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'Customer' | 'Admin';
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface CheckoutAddress {
  fullName: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productVariantId?: number;
  productName: string;
  variantName?: string;
  productImageUrl?: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  subTotal: number;
  profit: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: CheckoutAddress;
  status: number;
  statusName: string;
  paymentStatus: number;
  paymentStatusName: string;
  paymentMethod: string;
  subTotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  totalAmount: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
}

export interface InventoryItem {
  productId: number;
  productName: string;
  productSku: string;
  imageUrl?: string;
  categoryName: string;
  sellingPrice: number;
  costPrice: number;
  currentStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  variants: {
    variantId: number;
    variantName: string;
    sku: string;
    currentStock: number;
    costPrice: number;
    price: number;
  }[];
}

export interface InventoryTransaction {
  id: number;
  productId: number;
  productName: string;
  productVariantId?: number;
  variantName?: string;
  transactionType: number;
  transactionTypeName: string;
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  performedByName: string;
  orderId?: number;
  createdAt: string;
}

export interface AnalyticsDashboard {
  totalRevenue: number;
  totalCostOfGoodsSold: number;
  totalNetProfit: number;
  profitMarginPercentage: number;
  totalInventoryCostValue: number;
  totalInventoryRetailValue: number;
  totalUnitsInStock: number;
  lowStockItemCount: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesTrend: {
    date: string;
    revenue: number;
    cost: number;
    profit: number;
    orderCount: number;
  }[];
  salesByCategory: {
    categoryId: number;
    categoryName: string;
    revenue: number;
    quantitySold: number;
    percentage: number;
  }[];
  topProducts: {
    productId: number;
    productName: string;
    imageUrl?: string;
    sku: string;
    sellingPrice: number;
    costPrice: number;
    unitsSold: number;
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    profitMargin: number;
  }[];
  recentOrders: {
    orderId: number;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    netProfit: number;
    status: string;
    createdAt: string;
  }[];
}

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: number;
  discountTypeName: string;
  discountValue: number;
  minimumSpend: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
}

export interface Review {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}
