import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  fetchBrands,
  createBrand,
  deleteBrand,
} from '@/api/queries';
import { Plus, Trash2, Tags, Award, X } from 'lucide-react';

export const AdminCategoriesBrandsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Brand Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [brandLogo, setBrandLogo] = useState('');

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories-page'],
    queryFn: () => fetchCategories(true),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['admin-brands-page'],
    queryFn: () => fetchBrands(true),
  });

  // Mutations
  const createCatMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-page'] });
      setIsCatModalOpen(false);
      setCatName('');
      setCatDesc('');
      setCatImage('');
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories-page'] }),
  });

  const createBrandMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands-page'] });
      setIsBrandModalOpen(false);
      setBrandName('');
      setBrandDesc('');
      setBrandLogo('');
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-brands-page'] }),
  });

  return (
    <div className="space-y-12">
      {/* Categories Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-roseGold">Taxonomy</span>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              Disciplines & Categories ({categories.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Structure your beauty collections into intuitive customer navigation disciplines.
            </p>
          </div>
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-4 py-2 bg-roseGold text-white rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-roseGold-dark transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Discipline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => (
            <div key={c.id} className="p-5 bg-white dark:bg-[#141418] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center space-x-3">
                <img src={c.imageUrl || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=100'} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-white/10" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">{c.name}</h4>
                  <p className="text-[11px] text-roseGold font-semibold">{c.productCount} Formulations</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{c.description}</p>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/10 text-xs">
                <span className="text-slate-400 font-mono">/{c.slug}</span>
                <button
                  onClick={() => {
                    if (confirm(`Delete discipline ${c.name}?`)) deleteCatMutation.mutate(c.id);
                  }}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brands Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-roseGold">Houses</span>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              Beauty Houses & Ateliers ({brands.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Curate the partner brands and luxury houses featured in the catalog.
            </p>
          </div>
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand House</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {brands.map((b) => (
            <div key={b.id} className="p-5 bg-white dark:bg-[#141418] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center space-x-3">
                <img src={b.logoUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100'} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-white/10" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">{b.name}</h4>
                  <p className="text-[11px] text-roseGold font-semibold">{b.productCount} Formulations</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{b.description}</p>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/10 text-xs">
                <span className="text-slate-400 font-mono">/{b.slug}</span>
                <button
                  onClick={() => {
                    if (confirm(`Delete brand ${b.name}?`)) deleteBrandMutation.mutate(b.id);
                  }}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCatModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#16161C] rounded-2xl border border-slate-200 dark:border-white/10 p-6 z-10 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Add Discipline / Category</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createCatMutation.mutate({ name: catName, description: catDesc, imageUrl: catImage }); }} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  placeholder="e.g. Cleansers & Toners"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={2}
                  placeholder="Formulations designed to balance skin microbiota..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold font-mono text-[11px]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCatMutation.isPending}
                  className="px-5 py-2 bg-roseGold text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-roseGold-dark disabled:opacity-50 transition-colors shadow-xs"
                >
                  {createCatMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBrandModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#16161C] rounded-2xl border border-slate-200 dark:border-white/10 p-6 z-10 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Add Beauty Brand / Atelier</h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createBrandMutation.mutate({ name: brandName, description: brandDesc, logoUrl: brandLogo }); }} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  placeholder="e.g. Atelier Guerlain"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Atelier Bio</label>
                <textarea
                  value={brandDesc}
                  onChange={(e) => setBrandDesc(e.target.value)}
                  rows={2}
                  placeholder="Historic French haute perfumery established in 1828..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold font-mono text-[11px]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBrandMutation.isPending}
                  className="px-5 py-2 bg-roseGold text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-roseGold-dark disabled:opacity-50 transition-colors shadow-xs"
                >
                  {createBrandMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
