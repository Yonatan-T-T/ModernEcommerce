import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchCategories, fetchFeaturedProducts, fetchBestSellers } from '@/api/queries';
import { ProductCard } from '@/components/common/ProductCard';
import { useTranslation } from '@/i18n/translations';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });

  const { data: featuredProducts = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts,
  });

  const { data: bestSellers = [], isLoading: loadingBestSellers } = useQuery({
    queryKey: ['bestseller-products'],
    queryFn: fetchBestSellers,
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 sm:pb-20 overflow-hidden">
      {/* 1. Hero Editorial Section */}
      <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-lumina-100/80 via-lumina-50 to-lumina-50 dark:from-charcoal-950 dark:via-charcoal-900 dark:to-charcoal-900 px-4 sm:px-6 lg:px-8">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-roseGold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-200/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center py-8 sm:py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-5 sm:space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-roseGold/15 border border-roseGold/30 text-roseGold text-xs font-semibold tracking-widest uppercase animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('home.heroBadge')}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal-900 dark:text-white leading-[1.1]">
              {t('home.heroTitle1')} <br />
              <span className="italic font-light bg-gradient-to-r from-roseGold via-lumina-600 to-roseGold-dark bg-clip-text text-transparent">
                {t('home.heroTitle2')}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-charcoal-600 dark:text-lumina-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {t('home.heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-all shadow-luxury flex items-center justify-center space-x-2 group"
              >
                <span>{t('home.exploreCollection')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop?isBestSeller=true"
                className="w-full sm:w-auto px-8 py-3.5 border border-charcoal-300 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-lumina-200/50 dark:hover:bg-charcoal-800 transition-colors flex items-center justify-center"
              >
                {t('home.viewBestsellers')}
              </Link>
            </div>

            {/* Micro stats */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-lumina-200 dark:border-charcoal-800 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="font-serif text-2xl font-bold text-charcoal-900 dark:text-white">98%</p>
                <p className="text-[11px] text-charcoal-500 dark:text-lumina-400">{t('home.statActives')}</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-charcoal-900 dark:text-white">16hr</p>
                <p className="text-[11px] text-charcoal-500 dark:text-lumina-400">{t('home.statWear')}</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-charcoal-900 dark:text-white">100%</p>
                <p className="text-[11px] text-charcoal-500 dark:text-lumina-400">{t('home.statCruelty')}</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="relative flex justify-center items-center"
          >
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60 dark:border-charcoal-800/80">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000"
                alt="Lumina Beauty Luxury Collection"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Floating Featured Product Badge */}
              <div className="absolute bottom-6 inset-x-6 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-roseGold">
                    Award Winner 2026
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-charcoal-900 dark:text-white">
                    Celestial Radiance Peptide Serum
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-amber-500 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold">4.9</span>
                    <span className="text-charcoal-400 text-[10px]">(38 reviews)</span>
                  </div>
                </div>
                <Link
                  to="/product/celestial-radiance-peptide-serum"
                  className="px-3.5 py-2 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 text-xs font-semibold rounded-xl hover:bg-roseGold transition-colors"
                >
                  Discover
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Collections by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 sm:space-y-3 mb-8 sm:mb-12">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-roseGold">
            {t('home.curated')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-900 dark:text-white">
            {t('home.exploreDiscipline')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-lumina-400 max-w-lg mx-auto">
            {t('home.disciplineSubtitle')}
          </p>
        </div>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?categoryId=${category.id}`}
              className="group relative h-80 sm:h-96 min-w-[75vw] sm:min-w-0 snap-center rounded-2xl overflow-hidden shadow-sm hover:shadow-luxury-hover border border-lumina-200/60 dark:border-charcoal-800 transition-all duration-300 shrink-0"
            >
              <img
                src={category.imageUrl || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800'}
                alt={category.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent group-hover:from-charcoal-900/90 transition-all" />

              <div className="absolute bottom-6 inset-x-6 text-white space-y-1.5">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-roseGold-light">
                  {category.productCount} Formulations
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-wide">
                  {category.name}
                </h3>
                <p className="text-xs text-lumina-200 line-clamp-2 opacity-90 font-light">
                  {category.description}
                </p>
                <div className="pt-2 flex items-center text-xs font-semibold text-white group-hover:text-roseGold-light transition-colors">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Formulations Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-roseGold">
              {t('home.editorsSelection')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-900 dark:text-white mt-1">
              {t('home.featuredTitle')}
            </h2>
          </div>
          <Link
            to="/shop?isFeatured=true"
            className="text-xs font-semibold tracking-wider uppercase text-charcoal-800 dark:text-lumina-200 hover:text-roseGold flex items-center gap-1 group"
          >
            <span>{t('home.viewAllFeatured')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 sm:h-96 rounded-2xl bg-lumina-200 dark:bg-charcoal-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. The Lumina Ritual Editorial */}
      <section className="bg-lumina-100 dark:bg-charcoal-950 py-20 border-y border-lumina-200/80 dark:border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-roseGold">
                {t('home.scienceEyebrow')}
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal-900 dark:text-white leading-tight">
                {t('home.ritualTitle')}
              </h2>
              <p className="text-sm text-charcoal-600 dark:text-lumina-300 leading-relaxed font-light">
                {t('home.ritualSubtitle')}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-roseGold text-white font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white">{t('home.step1Title')}</h4>
                    <p className="text-xs text-charcoal-500 dark:text-lumina-400">{t('home.step1Desc')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-roseGold text-white font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white">{t('home.step2Title')}</h4>
                    <p className="text-xs text-charcoal-500 dark:text-lumina-400">{t('home.step2Desc')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-roseGold text-white font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white">{t('home.step3Title')}</h4>
                    <p className="text-xs text-charcoal-500 dark:text-lumina-400">{t('home.step3Desc')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-roseGold text-white font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white">{t('home.step4Title')}</h4>
                    <p className="text-xs text-charcoal-500 dark:text-lumina-400">{t('home.step4Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60 dark:border-charcoal-800">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1000"
                  alt="The Lumina Ritual"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-roseGold">
              {t('home.mostAdored')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-900 dark:text-white mt-1">
              {t('home.iconicBestsellers')}
            </h2>
          </div>
          <Link
            to="/shop?isBestSeller=true"
            className="text-xs font-semibold tracking-wider uppercase text-charcoal-800 dark:text-lumina-200 hover:text-roseGold flex items-center gap-1 group"
          >
            <span>{t('home.viewAllBestsellers')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loadingBestSellers ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 sm:h-96 rounded-2xl bg-lumina-200 dark:bg-charcoal-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
