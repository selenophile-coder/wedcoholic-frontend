import React from 'react';
import { AlertCircle } from 'lucide-react';
import ProductCard from '../ProductCard';

export default function CatalogGallery({
  products,
  wishlist,
  selectedCategory,
  selectedOccasion,
  onClearFilters,
  onWishlistToggle,
  onQuickView,
  onAddToCart,
}) {
  return (
    <section className="py-16 bg-[#FCFAF7]" id="catalog-anchor">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 relative">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 pb-4 border-b border-[#E0DAD0]/30 gap-4">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-secondary">
              DESIGNER COUTURE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mt-1">
              {selectedCategory === 'All' ? "All Collections" : `${selectedCategory} Collections`}
              {selectedOccasion !== 'All' && ` — ${selectedOccasion}`}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-xs font-sans uppercase font-bold tracking-widest text-[#C5A880]">
              {(selectedCategory !== 'All' || selectedOccasion !== 'All') && (
                <button
                  onClick={onClearFilters}
                  className="hover:text-primary hover:underline cursor-pointer border-none bg-transparent"
                >
                  Clear Filters
                </button>
              )}
              <span className="text-on-surface/50">Showing {products.length} masterpieces</span>
            </div>
          </div>
        </div>

        {/* Catalog list logic */}
        {products.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-[#E0DAD0] max-w-xl mx-auto flex flex-col items-center select-none">
            <AlertCircle className="w-12 h-12 text-primary/70 mb-4" />
            <h4 className="font-display text-lg font-bold text-on-surface mb-2">No masterpieces match your request</h4>
            <p className="text-xs text-on-surface/75 mb-6 leading-relaxed">
              We currently do not hold item stocks matching your exact descriptors. Please alter search filters or view all categories.
            </p>
            <button
              onClick={onClearFilters}
              className="bg-primary hover:bg-[#5C061E] text-white border-none py-2.5 px-6 font-sans font-bold text-xs uppercase tracking-widest rounded-lg cursor-pointer"
            >
              View All Products
            </button>
          </div>
        ) : (
          /* Simple Responsive Grid Column - No scroll arrows or sliding */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 px-1">
            {products.map((prod) => (
              <ProductCard
                key={prod._id || prod.id}
                product={prod}
                isWishlisted={wishlist.includes(prod._id || prod.id)}
                onWishlistToggle={() => onWishlistToggle(prod._id || prod.id)}
                onQuickView={() => onQuickView(prod._id || prod.id)}
                onAddToCartDirectly={(size) => onAddToCart(prod, size, 1)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
