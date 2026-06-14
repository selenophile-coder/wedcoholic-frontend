import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductCard({
  product,
  isWishlisted,
  onWishlistToggle,
  onQuickView,
  onAddToCartDirectly,
}) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-w-[280px] sm:min-w-[300px] max-w-[320px] flex-shrink-0 group flex flex-col justify-between select-none cursor-pointer"
      id={`product-card-${product.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden mb-3.5 rounded-xl bg-white/40 shadow-sm border border-[#E0DAD0] transition-all duration-300 group-hover:shadow-md">
        
        {/* Hover zoom picture (Smooth CSS scale transition on group hover) */}
        <img
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          src={product.image}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Soft elegant gradient shadow on cards */}
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/30 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Exclusive Gold Badge */}
        {product.badge && (
          <span className="absolute top-3.5 left-3.5 border border-[#C5A880] bg-primary text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-xs">
            {product.badge}
          </span>
        )}

        {/* Direct Action Utility Buttons */}
        <div className="absolute top-3.5 right-3.5 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-x-1 sm:group-hover:translate-x-0 z-10">
          
          {/* Wishlist Toggle button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onWishlistToggle();
            }}
            id={`wishlist-btn-${product.id}`}
            className={`w-9 h-9 rounded-full flex items-center justify-center border border-[#E0DAD0]/30 shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer ${
              isWishlisted
                ? 'bg-primary text-white'
                : 'bg-white/80 hover:bg-primary hover:text-white text-on-surface'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Interactive Bottom Accent Overlay */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-y-2 sm:group-hover:translate-y-0 z-10">
          {/* Shop Now Button (Triggers Details Modal) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
            id={`shop-now-btn-${product.id}`}
            className="w-full bg-primary/95 hover:bg-primary text-white py-2.5 text-xs font-sans font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-sm border-none cursor-pointer"
          >
            Shop Now
          </motion.button>
        </div>
      </div>

      {/* Product Metadata Descriptions */}
      <div className="flex flex-col">
        <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-secondary mb-0.5">
          {product.designer}
        </span>
        <h3 className="font-sans text-sm md:text-base font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors flex items-center justify-between gap-2">
          <span>{product.name}</span>
          {product.discount && (
            <span className="text-[8px] sm:text-[9px] font-sans font-extrabold text-[#154230] bg-[#154230]/10 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-widest">
              {product.discount}% OFF
            </span>
          )}
        </h3>
        <p className="font-sans text-xs sm:text-sm text-on-surface/80 mt-0.5">
          Starting from <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          {product.discount && (
            <span className="text-[10px] sm:text-xs text-on-surface/40 line-through ml-2 font-medium">
              {formatPrice(Math.round(product.price / (1 - product.discount / 100)))}
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
}
