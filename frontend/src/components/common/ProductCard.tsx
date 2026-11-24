import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { Product } from '@/types';
import { formatPrice } from '@/utils/cn';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productIds: wishlistIds } = useSelector((state: RootState) => state.wishlist);
  const isWishlisted = wishlistIds.includes(product.id);

  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const primaryImage =
    product.images?.find((i) => i.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500';

  const secondaryImage =
    product.images?.[1]?.imageUrl || primaryImage;

  // Find shades if available
  const shades = product.variants?.filter((v) => v.shadeColorHex);

  const handleCardClick = (e: React.MouseEvent) => {
    // If click originates inside interactive buttons, do not trigger card navigation
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    navigate(`/product/${product.slug}`);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedVariant = product.variants?.[0];

    dispatch(
      addToCart({
        productId: product.id,
        productVariantId: selectedVariant?.id,
        name: product.name,
        variantName: selectedVariant?.variantName,
        imageUrl: primaryImage,
        price: selectedVariant?.price || product.price,
        costPrice: selectedVariant?.costPrice || product.costPrice,
        quantity: 1,
        maxStock: selectedVariant?.stockQuantity || product.stockQuantity,
      })
    );

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product.id));
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white dark:bg-charcoal-800/80 rounded-2xl border border-lumina-200/70 dark:border-charcoal-700 overflow-hidden shadow-sm hover:shadow-luxury-hover transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isBestSeller && (
          <span className="px-2.5 py-0.5 bg-roseGold text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
            Bestseller
          </span>
        )}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="px-2.5 py-0.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-sm">
            Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
          </span>
        )}
        {product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
          <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-semibold tracking-wider rounded-full shadow-sm">
            Low Stock
          </span>
        )}
      </div>

      {/* Wishlist Heart Button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
          isWishlisted
            ? 'bg-roseGold text-white shadow-md'
            : 'bg-white/80 dark:bg-charcoal-900/80 text-charcoal-600 dark:text-lumina-300 hover:text-roseGold hover:bg-white'
        }`}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Link */}
      <div className="relative block aspect-[4/5] overflow-hidden bg-lumina-100 dark:bg-charcoal-900">
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Quick Add Overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            disabled={product.stockQuantity === 0}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg backdrop-blur-md transition-all ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-charcoal-900/90 dark:bg-lumina-100/90 text-white dark:text-charcoal-900 hover:bg-roseGold hover:text-white dark:hover:bg-roseGold dark:hover:text-white'
            } disabled:opacity-40`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : product.stockQuantity === 0 ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Meta */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-charcoal-500 dark:text-lumina-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-roseGold">
              {product.brandName}
            </span>
            <span>{product.categoryName}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-sm font-semibold text-charcoal-900 dark:text-white group-hover:text-roseGold dark:group-hover:text-roseGold line-clamp-1 transition-colors">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-[11px] text-charcoal-500 dark:text-lumina-400 line-clamp-1 mt-0.5">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-lumina-100 dark:border-charcoal-700/60 flex items-center justify-between">
          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-bold text-charcoal-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-charcoal-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Shade previews or rating */}
          {shades && shades.length > 0 ? (
            <div className="flex items-center -space-x-1">
              {shades.slice(0, 4).map((shade, idx) => (
                <span
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full border border-white dark:border-charcoal-800 shadow-xs"
                  style={{ backgroundColor: shade.shadeColorHex || '#EED4BA' }}
                  title={shade.shade}
                />
              ))}
              {shades.length > 4 && (
                <span className="text-[9px] font-bold text-charcoal-400 pl-1.5">
                  +{shades.length - 4}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center text-xs text-amber-500 font-semibold gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
