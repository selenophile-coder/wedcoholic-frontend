import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function CoutureCarousel({ products, wishlist, title, subtitle, onWishlistToggle, onQuickView, onAddToCart }) {
  const scrollContainerRef = useRef(null);

  const scrollThreeCards = (direction) => {
    const element = scrollContainerRef.current;
    if (element) {
      const cards = element.children;
      if (cards.length > 0) {
        const cardWidth = cards[0].getBoundingClientRect().width;
        const computedStyle = window.getComputedStyle(element);
        const gap = parseFloat(computedStyle.gap) || 24;
        const scrollOffset = (cardWidth + gap) * 3;
        element.scrollBy({ left: direction * scrollOffset, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-16 bg-brand-bg/40 border-b border-[#E0DAD0]/30 select-none relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 relative">
        <div className="text-center mb-10">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-sans font-bold text-secondary">{subtitle}</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mt-1">{title}</h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-4"></div>
        </div>

        {/* Carousel Container with side arrows */}
        <div className="relative group/carousel px-2 sm:px-4">
          {/* Left Side Floating Arrow - Visible on all screens */}
          <button
            onClick={() => scrollThreeCards(-1)}
            className="absolute -left-1 sm:-left-2 md:-left-4 top-[45%] -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 text-on-surface shadow-md border border-[#E0DAD0] flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Horizontal scroll container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto hide-scrollbar pb-6 scroll-smooth pt-1 px-1"
          >
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

          {/* Right Side Floating Arrow - Visible on all screens */}
          <button
            onClick={() => scrollThreeCards(1)}
            className="absolute -right-1 sm:-right-2 md:-right-4 top-[45%] -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white/95 text-on-surface shadow-md border border-[#E0DAD0] flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
