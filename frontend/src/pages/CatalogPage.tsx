import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories, fetchBrands } from '@/api/queries';
import { ProductCard } from '@/components/common/ProductCard';
import { Filter, X, SlidersHorizontal, Search, RefreshCw, Check } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const brandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : undefined;
  const skinType = searchParams.get('skinType') ? Number(searchParams.get('skinType')) : undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const isFeatured = searchParams.get('isFeatured') === 'true';
  const isBestSeller = searchParams.get('isBestSeller') === 'true';
  const sortBy = searchParams.get('sortBy') || '';
  const pageIndex = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(search);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync search input
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        updateFilter('search', localSearch || undefined);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const updateFilter = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch('');
  };

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => fetchBrands(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      'products',
      { search, categoryId, brandId, skinType, minPrice, maxPrice, minRating, inStockOnly, isFeatured, isBestSeller, sortBy, pageIndex },
    ],
    queryFn: () =>
      fetchProducts({
        search,
        categoryId,
        brandId,
        skinType,
        minPrice,
        maxPrice,
        minRating,
        inStockOnly,
        isFeatured,
        isBestSeller,
        sortBy,
        pageIndex,
        pageSize: 12,
      }),
  });

  const products = productsData?.items || [];
  const totalCount = productsData?.totalCount || 0;
  const totalPages = productsData?.totalPages || 1;

  const renderFilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-3">
          Category
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateFilter('categoryId', undefined)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              !categoryId
                ? 'bg-roseGold/10 text-roseGold font-bold'
                : 'text-charcoal-600 dark:text-lumina-300 hover:bg-lumina-100 dark:hover:bg-charcoal-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateFilter('categoryId', c.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors ${
                categoryId === c.id
                  ? 'bg-roseGold/10 text-roseGold font-bold'
                  : 'text-charcoal-600 dark:text-lumina-300 hover:bg-lumina-100 dark:hover:bg-charcoal-800'
              }`}
            >
              <span>{c.name}</span>
              <span className="text-[10px] text-charcoal-400">({c.productCount})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skin Type */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-3">
          Skin Type
        </h4>
        <div className="space-y-1.5">
          {[
            { id: 0, name: 'All Skin Types' },
            { id: 1, name: 'Dry Skin' },
            { id: 2, name: 'Oily Skin' },
            { id: 3, name: 'Combination Skin' },
            { id: 4, name: 'Sensitive Skin' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => updateFilter('skinType', st.id === 0 ? undefined : st.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                (st.id === 0 && !skinType) || skinType === st.id
                  ? 'bg-roseGold/10 text-roseGold font-bold'
                  : 'text-charcoal-600 dark:text-lumina-300 hover:bg-lumina-100 dark:hover:bg-charcoal-800'
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-3">
          Brand / Atelier
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateFilter('brandId', undefined)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              !brandId
                ? 'bg-roseGold/10 text-roseGold font-bold'
                : 'text-charcoal-600 dark:text-lumina-300 hover:bg-lumina-100 dark:hover:bg-charcoal-800'
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => updateFilter('brandId', b.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors ${
                brandId === b.id
                  ? 'bg-roseGold/10 text-roseGold font-bold'
                  : 'text-charcoal-600 dark:text-lumina-300 hover:bg-lumina-100 dark:hover:bg-charcoal-800'
              }`}
            >
              <span>{b.name}</span>
              <span className="text-[10px] text-charcoal-400">({b.productCount})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="pt-3 border-t border-lumina-200 dark:border-charcoal-800 space-y-3">
        <label className="flex items-center space-x-2 text-xs text-charcoal-700 dark:text-lumina-200 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
            className="rounded text-roseGold focus:ring-roseGold"
          />
          <span>In-Stock Only</span>
        </label>
        <label className="flex items-center space-x-2 text-xs text-charcoal-700 dark:text-lumina-200 cursor-pointer">
          <input
            type="checkbox"
            checked={isBestSeller}
            onChange={(e) => updateFilter('isBestSeller', e.target.checked)}
            className="rounded text-roseGold focus:ring-roseGold"
          />
          <span>Bestsellers Only</span>
        </label>
        <label className="flex items-center space-x-2 text-xs text-charcoal-700 dark:text-lumina-200 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => updateFilter('isFeatured', e.target.checked)}
            className="rounded text-roseGold focus:ring-roseGold"
          />
          <span>Featured Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Page Title */}
      <div className="border-b border-lumina-200 dark:border-charcoal-800 pb-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-roseGold">
              Haute Beauty Catalog
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-900 dark:text-white mt-1">
              All Formulations
            </h1>
            <p className="text-xs text-charcoal-500 dark:text-lumina-400 mt-1">
              Showing {totalCount} active cellular treatments & cosmetic art
            </p>
          </div>

          {/* Search bar & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by name, active..."
                className="w-48 sm:w-64 pl-9 pr-3 py-2 text-xs bg-white dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-3 py-2 text-xs bg-white dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700 rounded-xl text-charcoal-700 dark:text-lumina-200 focus:outline-none focus:border-roseGold font-medium"
            >
              <option value="">Sort by: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-lumina-100 dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700 text-charcoal-700 dark:text-lumina-200 hover:text-roseGold flex items-center gap-1.5 text-xs font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-8 pr-4">
          <div className="flex items-center justify-between pb-4 border-b border-lumina-200 dark:border-charcoal-800">
            <h3 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-roseGold" />
              Filters
            </h3>
            {(categoryId || brandId || skinType || minPrice || maxPrice || minRating || inStockOnly || isFeatured || isBestSeller || search) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-roseGold hover:underline font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {renderFilterContent()}
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 rounded-2xl bg-lumina-200 dark:bg-charcoal-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 space-y-4 bg-white dark:bg-charcoal-800/40 rounded-3xl border border-dashed border-lumina-300 dark:border-charcoal-700 p-8">
              <Filter className="w-10 h-10 text-charcoal-400 mx-auto" />
              <h3 className="font-serif text-xl font-medium text-charcoal-900 dark:text-white">
                No formulations matched your criteria
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-lumina-400 max-w-sm mx-auto">
                Try widening your search terms, removing skin type filters, or resetting your filter selection.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-roseGold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center space-x-2">
                  <button
                    disabled={pageIndex <= 1}
                    onClick={() => updateFilter('page', pageIndex - 1)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-lumina-200 dark:border-charcoal-700 text-charcoal-700 dark:text-lumina-200 disabled:opacity-40 hover:bg-lumina-100 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => updateFilter('page', pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                        pageNum === pageIndex
                          ? 'bg-roseGold text-white shadow-xs'
                          : 'border border-lumina-200 dark:border-charcoal-700 text-charcoal-700 dark:text-lumina-200 hover:bg-lumina-100 dark:hover:bg-charcoal-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    disabled={pageIndex >= totalPages}
                    onClick={() => updateFilter('page', pageIndex + 1)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-lumina-200 dark:border-charcoal-700 text-charcoal-700 dark:text-lumina-200 disabled:opacity-40 hover:bg-lumina-100 dark:hover:bg-charcoal-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Slide-over Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-charcoal-900 border-l border-lumina-200 dark:border-charcoal-700 p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-lumina-100 dark:border-charcoal-800">
              <h3 className="font-serif text-lg font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-roseGold" />
                Filter Catalog
              </h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderFilterContent()}

            <div className="pt-4 border-t border-lumina-100 dark:border-charcoal-800 flex gap-3">
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFiltersOpen(false);
                }}
                className="w-1/2 py-2.5 border border-lumina-200 dark:border-charcoal-700 text-charcoal-700 dark:text-lumina-200 rounded-xl text-xs font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-1/2 py-2.5 bg-roseGold text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
