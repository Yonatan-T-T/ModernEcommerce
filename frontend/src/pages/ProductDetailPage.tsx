import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { showToast } from '@/store/slices/toastSlice';
import { useTranslation } from '@/i18n/translations';
import { fetchProductBySlug, fetchReviews, submitReview, fetchFeaturedProducts } from '@/api/queries';
import { ProductCard } from '@/components/common/ProductCard';
import { formatPrice } from '@/utils/cn';
import {
  Star,
  Heart,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { productIds: wishlistIds } = useSelector((state: RootState) => state.wishlist);
  const { user } = useSelector((state: RootState) => state.auth);

  // Queries
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => fetchReviews(product!.id),
    enabled: !!product?.id,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products'],
    queryFn: fetchFeaturedProducts,
  });

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('desc');
  const [justAdded, setJustAdded] = useState(false);

  // Reset local state and scroll to top when product slug changes
  React.useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedVariantId(null);
    setQuantity(1);
    setIsReviewFormOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  // Set default variant when product data is received
  React.useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product]);

  // Review Form State
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState(user?.fullName || '');

  const reviewMutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product?.id] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      setIsReviewFormOpen(false);
      setReviewTitle('');
      setReviewComment('');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-lumina-200 dark:bg-charcoal-800 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-8 bg-lumina-200 dark:bg-charcoal-800 rounded w-3/4" />
            <div className="h-6 bg-lumina-200 dark:bg-charcoal-800 rounded w-1/4" />
            <div className="h-24 bg-lumina-200 dark:bg-charcoal-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-roseGold mx-auto" />
        <h2 className="font-serif text-2xl font-semibold">Formulation not found</h2>
        <p className="text-xs text-charcoal-500">The product you are looking for may have been archived.</p>
        <Link to="/shop" className="inline-block mt-4 px-6 py-2.5 bg-charcoal-900 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(product.id);
  const variants = product.variants || [];
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCost = selectedVariant ? selectedVariant.costPrice : product.costPrice;
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;

  const images = product.images?.length > 0
    ? product.images
    : [{ id: 0, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', isPrimary: true, displayOrder: 0 }];

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product.id,
        productVariantId: selectedVariant?.id,
        name: product.name,
        variantName: selectedVariant?.variantName,
        imageUrl: images[0]?.imageUrl,
        price: currentPrice,
        costPrice: currentCost,
        quantity,
        maxStock: currentStock,
      })
    );

    dispatch(showToast({ message: `Added ${product.name} to your bag` }));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate({
      productId: product.id,
      authorName: reviewAuthor || 'Verified Client',
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-charcoal-500 dark:text-lumina-400 flex items-center space-x-2">
        <Link to="/" className="hover:text-roseGold">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-roseGold">Shop</Link>
        <span>/</span>
        <Link to={`/shop?categoryId=${product.categoryId}`} className="hover:text-roseGold">{product.categoryName}</Link>
        <span>/</span>
        <span className="text-charcoal-900 dark:text-white font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-lumina-100 dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700 shadow-sm">
            <img
              src={images[selectedImageIndex]?.imageUrl || images[0]?.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-roseGold text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md">
                Bestseller
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-roseGold shadow-md scale-105'
                      : 'border-lumina-200 dark:border-charcoal-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-lumina-400 mb-2">
              <span className="font-bold uppercase tracking-widest text-roseGold">{product.brandName}</span>
              <span className="text-[11px] font-mono">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-3 mt-3">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-lumina-300 dark:text-charcoal-700'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-charcoal-800 dark:text-lumina-200">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-charcoal-400">·</span>
              <a href="#reviews" className="text-xs text-charcoal-600 dark:text-lumina-300 underline hover:text-roseGold">
                {product.reviewCount} Client Reviews
              </a>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3 mt-4">
              <span className="font-serif text-3xl font-bold text-charcoal-900 dark:text-white">
                {formatPrice(currentPrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                <span className="text-base text-charcoal-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="text-xs text-charcoal-600 dark:text-lumina-300 leading-relaxed mt-3">
              {product.shortDescription}
            </p>
          </div>

          {/* Variant Selection: Shades or Sizes */}
          {variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-lumina-200 dark:border-charcoal-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-charcoal-800 dark:text-lumina-200">
                  Select {variants[0]?.shadeColorHex ? 'Shade' : 'Option'}:
                </span>
                <span className="text-roseGold font-medium">
                  {selectedVariant?.variantName}
                </span>
              </div>

              {variants[0]?.shadeColorHex ? (
                // Color Swatches
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-transform shadow-xs flex items-center justify-center ${
                        selectedVariant?.id === v.id
                          ? 'border-roseGold scale-110 shadow-md ring-2 ring-roseGold/30'
                          : 'border-white dark:border-charcoal-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: v.shadeColorHex || '#EED4BA' }}
                      title={`${v.variantName} - ${formatPrice(v.price)}`}
                    >
                      {selectedVariant?.id === v.id && (
                        <Check className="w-3.5 h-3.5 text-charcoal-900 drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                // Pill Buttons for Sizes
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        selectedVariant?.id === v.id
                          ? 'border-roseGold bg-roseGold/10 text-roseGold shadow-xs'
                          : 'border-lumina-200 dark:border-charcoal-700 text-charcoal-700 dark:text-lumina-300 hover:bg-lumina-100 dark:hover:bg-charcoal-800'
                      }`}
                    >
                      {v.variantName} ({formatPrice(v.price)})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stock Status Indicator */}
          <div className="flex items-center space-x-2 text-xs">
            {currentStock > 10 ? (
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                In Stock & Ready for Dispatch
              </span>
            ) : currentStock > 0 ? (
              <span className="inline-flex items-center text-amber-600 dark:text-amber-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                Low Stock — Only {currentStock} units remaining
              </span>
            ) : (
              <span className="inline-flex items-center text-red-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                Temporarily Sold Out
              </span>
            )}
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="flex items-center space-x-4 pt-2">
            <div className="flex items-center border border-lumina-200 dark:border-charcoal-700 rounded-full bg-lumina-50 dark:bg-charcoal-800 px-3 py-1.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white px-2 py-1"
              >
                -
              </button>
              <span className="px-3 text-xs font-bold text-charcoal-900 dark:text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
                className="text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white px-2 py-1 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              className={`flex-1 py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg transition-all ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('product.addedToBag')}</span>
                </>
              ) : currentStock === 0 ? (
                <span>{t('product.outOfStock')}</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('product.addToBag')} — {formatPrice(currentPrice * quantity)}</span>
                </>
              )}
            </button>

            <button
              onClick={() => dispatch(toggleWishlist(product.id))}
              className={`p-3.5 rounded-full border border-lumina-200 dark:border-charcoal-700 transition-colors ${
                isWishlisted
                  ? 'bg-roseGold text-white border-roseGold'
                  : 'hover:text-roseGold hover:bg-lumina-100 dark:hover:bg-charcoal-800 text-charcoal-600 dark:text-lumina-300'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Luxury Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-lumina-200 dark:border-charcoal-800 text-xs text-charcoal-600 dark:text-lumina-300">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-roseGold shrink-0" />
              <span>{t('product.freeShippingOver')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-roseGold shrink-0" />
              <span>30-Day Luxury Guarantee</span>
            </div>
          </div>

          {/* Accordion Tabs */}
          <div className="border-t border-lumina-200 dark:border-charcoal-800 divide-y divide-lumina-200 dark:divide-charcoal-800 pt-2">
            {/* Description */}
            <div className="py-3">
              <button
                onClick={() => toggleAccordion('desc')}
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white text-left"
              >
                <span>The Formulation & Science</span>
                {activeAccordion === 'desc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeAccordion === 'desc' && (
                <div className="mt-2.5 text-xs text-charcoal-600 dark:text-lumina-300 leading-relaxed font-light">
                  {product.description}
                </div>
              )}
            </div>

            {/* Ingredients */}
            {product.ingredients && (
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('ingr')}
                  className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white text-left"
                >
                  <span>Active Molecular Ingredients</span>
                  {activeAccordion === 'ingr' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeAccordion === 'ingr' && (
                  <div className="mt-2.5 text-xs text-charcoal-600 dark:text-lumina-300 leading-relaxed font-mono text-[11px]">
                    {product.ingredients}
                  </div>
                )}
              </div>
            )}

            {/* How to Use */}
            {product.howToUse && (
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion('use')}
                  className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white text-left"
                >
                  <span>The Application Ritual</span>
                  {activeAccordion === 'use' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {activeAccordion === 'use' && (
                  <div className="mt-2.5 text-xs text-charcoal-600 dark:text-lumina-300 leading-relaxed font-light">
                    {product.howToUse}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section id="reviews" className="border-t border-lumina-200 dark:border-charcoal-800 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-roseGold">
              Verified Client Feedback
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 dark:text-white mt-1">
              Customer Reviews ({reviews.length})
            </h3>
          </div>
          <button
            onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
            className="px-6 py-2.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-roseGold transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Review Form Drawer/Modal */}
        {isReviewFormOpen && (
          <form onSubmit={handleReviewSubmit} className="mb-10 p-6 rounded-2xl bg-white dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700 shadow-md space-y-4 max-w-xl animate-fade-in">
            <h4 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-white">
              Share Your Experience
            </h4>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                Your Rating
              </label>
              <div className="flex items-center space-x-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-lumina-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  required
                  placeholder="e.g. Sarah J."
                  className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  required
                  placeholder="e.g. Pure magic for dull skin"
                  className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                Your Review
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                rows={3}
                placeholder="How does the texture, scent, and result feel on your skin?"
                className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewFormOpen(false)}
                className="px-4 py-2 text-xs text-charcoal-600 hover:text-charcoal-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="px-6 py-2 bg-roseGold text-white rounded-lg text-xs font-semibold hover:bg-roseGold-dark transition-colors disabled:opacity-50"
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-xs text-charcoal-500 py-6">Be the first to review this formulation.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="p-6 rounded-2xl bg-white dark:bg-charcoal-800/60 border border-lumina-200 dark:border-charcoal-700/60 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-lumina-300'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-charcoal-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h5 className="font-serif text-sm font-semibold text-charcoal-900 dark:text-white">
                  {r.title}
                </h5>

                <p className="text-xs text-charcoal-600 dark:text-lumina-300 leading-relaxed font-light">
                  "{r.comment}"
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-charcoal-500">
                  <span className="font-semibold text-charcoal-800 dark:text-lumina-200">{r.authorName}</span>
                  {r.isVerifiedPurchase && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" />
                      Verified Purchaser
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products: Complete the Ritual */}
      <section className="border-t border-lumina-200 dark:border-charcoal-800 pt-16 pb-16 md:pb-0">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-roseGold">
            Synergistic Formulations
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 dark:text-white">
            Complete Your Ritual
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {relatedProducts.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

          {/* Sticky Mobile Add-to-Bag Bar */}
      <div className="md:hidden fixed bottom-16 inset-x-0 z-30 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-xl border-t border-lumina-200/80 dark:border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-charcoal-900 dark:text-white truncate">{product.name}</p>
          <p className="text-xs font-bold text-roseGold">{formatPrice(currentPrice * quantity)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={currentStock === 0}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-md transition-all ${
            justAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900'
          } disabled:opacity-40`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{t('product.added')}</span>
            </>
          ) : currentStock === 0 ? (
            <span>{t('product.soldOut')}</span>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('product.addToBag')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
