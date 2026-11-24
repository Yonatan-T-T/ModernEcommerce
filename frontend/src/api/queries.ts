import api from './client';
import {
  Product,
  Category,
  Brand,
  Order,
  InventoryItem,
  InventoryTransaction,
  AnalyticsDashboard,
  Coupon,
  Review,
  Customer,
  StoreConfig,
} from '@/types';

// Store Config
export const fetchStoreConfig = async (): Promise<StoreConfig> => {
  const { data } = await api.get('/config');
  return data;
};

// Products
export interface ProductFilters {
  search?: string;
  categoryId?: number;
  brandId?: number;
  skinType?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  sortBy?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface PagedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const fetchProducts = async (filters: ProductFilters): Promise<PagedResponse<Product>> => {
  const { data } = await api.get('/products', { params: filters });
  return data;
};

export const fetchProductById = async (id: number): Promise<Product> => {
  const { data } = await api.get(`/products/${id}`);
  return data.data ?? data;
};

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  const { data } = await api.get(`/products/slug/${encodeURIComponent(slug)}`);
  return data.data ?? data;
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const { data } = await api.get('/products/featured');
  return data;
};

export const fetchBestSellers = async (): Promise<Product[]> => {
  const { data } = await api.get('/products/bestsellers');
  return data;
};

export const createProduct = async (productData: any): Promise<Product> => {
  const { data } = await api.post('/products', productData);
  return data.data;
};

export const updateProduct = async (id: number, productData: any): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data.data;
};

export const deleteProduct = async (id: number): Promise<boolean> => {
  const { data } = await api.delete(`/products/${id}`);
  return data.data;
};

export const toggleProductActive = async (id: number): Promise<boolean> => {
  const { data } = await api.patch(`/products/${id}/toggle-active`);
  return data.data;
};

// Categories & Brands
export const fetchCategories = async (includeInactive = false): Promise<Category[]> => {
  const { data } = await api.get('/categories', { params: { includeInactive } });
  return data;
};

export const createCategory = async (catData: any): Promise<Category> => {
  const { data } = await api.post('/categories', catData);
  return data.data;
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  const { data } = await api.delete(`/categories/${id}`);
  return data.data;
};

export const fetchBrands = async (includeInactive = false): Promise<Brand[]> => {
  const { data } = await api.get('/brands', { params: { includeInactive } });
  return data;
};

export const createBrand = async (brandData: any): Promise<Brand> => {
  const { data } = await api.post('/brands', brandData);
  return data.data;
};

export const deleteBrand = async (id: number): Promise<boolean> => {
  const { data } = await api.delete(`/brands/${id}`);
  return data.data;
};

// Orders
export const createOrder = async (orderData: any): Promise<Order> => {
  const { data } = await api.post('/orders', orderData);
  return data.data;
};

export const fetchMyOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders/my-orders');
  return data;
};

export const fetchOrderById = async (id: number): Promise<Order> => {
  const { data } = await api.get(`/orders/${id}`);
  return data.data;
};

export const trackOrderByNumber = async (orderNumber: string): Promise<Order> => {
  const { data } = await api.get(`/orders/tracking/${orderNumber}`);
  return data.data;
};

export const fetchAdminOrders = async (
  pageIndex = 1,
  pageSize = 10,
  status?: number
): Promise<PagedResponse<Order>> => {
  const { data } = await api.get('/orders', { params: { pageIndex, pageSize, status } });
  return data;
};

export const updateOrderStatus = async (id: number, statusData: any): Promise<Order> => {
  const { data } = await api.put(`/orders/${id}/status`, statusData);
  return data.data;
};

// Inventory
export const fetchInventoryOverview = async (): Promise<InventoryItem[]> => {
  const { data } = await api.get('/inventory/overview');
  return data;
};

export const fetchLowStockItems = async (): Promise<InventoryItem[]> => {
  const { data } = await api.get('/inventory/low-stock');
  return data;
};

export const adjustStock = async (adjustmentData: any): Promise<boolean> => {
  const { data } = await api.post('/inventory/adjust', adjustmentData);
  return data.data;
};

export const fetchInventoryTransactions = async (
  pageIndex = 1,
  pageSize = 20,
  productId?: number
): Promise<PagedResponse<InventoryTransaction>> => {
  const { data } = await api.get('/inventory/transactions', { params: { pageIndex, pageSize, productId } });
  return data;
};

// Analytics
export const fetchAnalyticsDashboard = async (): Promise<AnalyticsDashboard> => {
  const { data } = await api.get('/analytics/dashboard');
  return data;
};

// Coupons
export const fetchCoupons = async (): Promise<Coupon[]> => {
  const { data } = await api.get('/coupons');
  return data;
};

export const createCoupon = async (couponData: any): Promise<Coupon> => {
  const { data } = await api.post('/coupons', couponData);
  return data.data;
};

export const deleteCoupon = async (id: number): Promise<boolean> => {
  const { data } = await api.delete(`/coupons/${id}`);
  return data.data;
};

export const validateCoupon = async (
  code: string,
  orderSubTotal: number
): Promise<{ isValid: boolean; message: string; discountAmount: number; code?: string }> => {
  const { data } = await api.post('/coupons/validate', { code, orderSubTotal });
  return data.data;
};

// Reviews
export const fetchReviews = async (productId: number): Promise<Review[]> => {
  const { data } = await api.get(`/reviews/product/${productId}`);
  return data;
};

export const submitReview = async (reviewData: any): Promise<Review> => {
  const { data } = await api.post('/reviews', reviewData);
  return data.data;
};

// Customers
export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data } = await api.get('/users/customers');
  return data;
};

export const fetchWishlistIds = async (): Promise<number[]> => {
  const { data } = await api.get('/users/wishlist');
  return data;
};

export const toggleWishlistApi = async (productId: number): Promise<boolean> => {
  const { data } = await api.post(`/users/wishlist/toggle/${productId}`);
  return data.data;
};
