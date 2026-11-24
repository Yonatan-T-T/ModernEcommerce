import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
} from '@/api/queries';
import { Product } from '@/types';
import { formatPrice } from '@/utils/cn';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  Check,
  AlertCircle,
  Eye,
  Filter,
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const initialForm = {
    name: '',
    shortDescription: '',
    description: '',
    sku: '',
    price: 0,
    costPrice: 0,
    compareAtPrice: 0,
    categoryId: 1,
    brandId: 1,
    skinType: 0,
    ingredients: '',
    howToUse: '',
    stockQuantity: 50,
    lowStockThreshold: 10,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    imageUrls: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'],
    variants: [
      {
        sku: '',
        variantName: 'Default Size (50ml)',
        size: '50ml',
        shade: '',
        shadeColorHex: '',
        price: 0,
        costPrice: 0,
        stockQuantity: 50,
        isActive: true,
      },
    ],
  };

  const [formData, setFormData] = useState(initialForm);

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => fetchCategories(true),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: () => fetchBrands(true),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', { search, categoryId: selectedCategory }],
    queryFn: () => fetchProducts({ search, categoryId: selectedCategory, pageSize: 50 }),
  });

  const products = productsData?.items || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: toggleProductActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const resetForm = () => {
    setFormData(initialForm);
    setEditingProduct(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      sku: p.sku,
      price: p.price,
      costPrice: p.costPrice,
      compareAtPrice: p.compareAtPrice || 0,
      categoryId: p.categoryId,
      brandId: p.brandId,
      skinType: p.skinType,
      ingredients: p.ingredients || '',
      howToUse: p.howToUse || '',
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      imageUrls: p.images?.map((i) => i.imageUrl) || ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'],
      variants: p.variants?.map((v) => ({
        sku: v.sku,
        variantName: v.variantName,
        size: v.size || '',
        shade: v.shade || '',
        shadeColorHex: v.shadeColorHex || '',
        price: v.price,
        costPrice: v.costPrice,
        stockQuantity: v.stockQuantity,
        isActive: v.isActive,
      })) || [],
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: { ...formData, id: editingProduct.id } });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-roseGold">
            Catalog Administration
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Formulation & Variant Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your cosmetic product catalog, pricing, cost of goods, and inventory allocation.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-roseGold text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-roseGold-dark transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Formulation</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by formulation name or SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#16161C] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:border-roseGold"
          />
        </div>

        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 text-xs bg-white dark:bg-[#16161C] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-roseGold font-medium"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#141418] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Formulation</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Margin</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading formulations...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No formulations found.</td>
                </tr>
              ) : (
                products.map((p) => {
                  const margin = p.price > 0 ? Math.round(((p.price - p.costPrice) / p.price) * 100) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 flex items-center space-x-3">
                        <img
                          src={p.primaryImageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80'}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-white/10 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">SKU: {p.sku}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{p.categoryName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{formatPrice(p.price)}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{formatPrice(p.costPrice)}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{margin}%</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            p.stockQuantity <= p.lowStockThreshold ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleActiveMutation.mutate(p.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-600 hover:text-roseGold dark:text-slate-400 dark:hover:text-roseGold transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                              deleteMutation.mutate(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#16161C] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Formulation' : 'Create New Formulation'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Formulation Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Celestial Radiance Peptide Serum"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    placeholder="LB-SKIN-001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cost Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Compare At Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice || ''}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand / House *
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Elevated anti-aging elixir with triple peptides"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed ritual description, formulation methodology, and benefits..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrls[0] || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrls: [e.target.value] })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-roseGold focus:ring-roseGold"
                  />
                  <span>Feature on Homepage</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded text-roseGold focus:ring-roseGold"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2 bg-roseGold text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-roseGold-dark disabled:opacity-50 transition-colors shadow-sm"
                >
                  {editingProduct ? 'Save Updates' : 'Create Formulation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
