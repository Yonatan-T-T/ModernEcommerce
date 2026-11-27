import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api/queries';
import { ProductCard } from '@/components/common/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { productIds: wishlistIds } = useSelector((state: RootState) => state.wishlist);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => fetchProducts({ pageSize: 50 }),
  });

  const wishlistedProducts = (productsData?.items || []).filter((p) =>
    wishlistIds.includes(p.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-roseGold">
          Curated Favourites
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-900 dark:text-white mt-1">
          Your Beauty Wishlist ({wishlistIds.length})
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-lumina-400 mt-1">
          Formulations reserved for your personal skincare and beauty rituals.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 sm:h-96 rounded-2xl bg-lumina-200 dark:bg-charcoal-800 animate-pulse" />
          ))}
        </div>
      ) : wishlistedProducts.length === 0 ? (
        <div className="text-center py-24 space-y-4 bg-white dark:bg-charcoal-800/40 rounded-3xl border border-dashed border-lumina-300 dark:border-charcoal-700 p-8">
          <Heart className="w-12 h-12 text-charcoal-300 dark:text-charcoal-600 mx-auto" />
          <h3 className="font-serif text-xl font-medium text-charcoal-900 dark:text-white">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            Click the heart icon on any product to save it to your personal beauty collection.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-4 px-8 py-3 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-roseGold transition-colors"
          >
            Explore the Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {wishlistedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
