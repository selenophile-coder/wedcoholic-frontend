import React, { useState, useMemo } from 'react';
import { Search, User, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header({
  cartCount,
  wishlistCount,
  onCartClick,
  onWishlistClick,
  selectedCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
  onProfileClick,
  products = [],
  onProductQuickView,
  onTrackOrderClick,
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categories = ['Women', 'Men', 'Kids', 'Lehengas', 'Wedding', 'Designers'];

  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.designer.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, products]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <header className="bg-brand-bg/90 backdrop-blur-lg border-b border-[#E0DAD0] fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="flex flex-col w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-3 md:py-4">
        
        {/* Top Row: Responsive layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 relative">
          
          {/* Logo & Icons row on mobile */}
          <div className="flex items-center justify-between w-full md:w-auto md:contents">
            {/* Brand Logo */}
            <div 
              id="brand-logo-mobile-desktop"
              onClick={() => {
                onCategorySelect('All');
                onSearchChange('');
              }}
              className="text-2xl md:text-3xl lg:text-4xl font-display text-primary tracking-wide cursor-pointer hover:opacity-90 font-extrabold flex flex-col items-center md:absolute md:left-1/2 md:-translate-x-1/2 select-none"
            >
              <span>WedCoholic</span>
              <span className="h-[1px] w-12 bg-secondary mt-0.5"></span>
            </div>

            {/* Mobile Actions (Hidden on desktop) */}
            <div className="flex flex-col items-end gap-1 md:hidden select-none">
              <div className="flex items-center gap-3">
                <motion.button 
                  id="user-profile-btn-mobile"
                  onClick={onProfileClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 text-on-surface hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </motion.button>
                
                <motion.button 
                  id="wishlist-drawer-btn-mobile"
                  onClick={onWishlistClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 text-on-surface hover:text-primary transition-colors relative cursor-pointer border-none bg-transparent"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white font-sans font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </motion.button>

                <motion.button 
                  id="shopping-cart-btn-mobile"
                  onClick={onCartClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 text-on-surface hover:text-primary transition-colors relative cursor-pointer border-none bg-transparent"
                  title="Bag"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white font-sans font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </motion.button>
              </div>
              <button
                type="button"
                onClick={onTrackOrderClick}
                className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#C5A880] hover:text-primary transition-colors cursor-pointer border-none bg-transparent mr-1.5"
              >
                Track Order
              </button>
            </div>
          </div>

          {/* Search Bar - Full-width on mobile (placed bottom), constrained on tablet (w-200px) */}
          <div className="w-full md:w-[200px] lg:w-[300px] relative z-20 mt-1 md:mt-0 order-last md:order-first">
            <motion.div 
              animate={{ 
                borderColor: isSearchFocused ? '#7A0C2E' : '#E0DAD0',
                scale: isSearchFocused ? 1.02 : 1
              }}
              className="relative flex items-center rounded-full border bg-white/40 shadow-xs"
            >
              <Search className="absolute left-3.5 w-4 h-4 text-on-surface/50" />
              <input
                id="header-search-input"
                className="w-full pl-10 pr-4 py-1.5 md:py-2 bg-transparent text-xs sm:text-sm text-on-surface placeholder-on-surface/40 rounded-full outline-none border-none focus:ring-0 focus:outline-none"
                placeholder="Search premium couture..."
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
            </motion.div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-[#E0DAD0] rounded-xl shadow-2xl overflow-hidden divide-y divide-[#E0DAD0]/40 z-30 max-h-80 overflow-y-auto"
                >
                  {searchSuggestions.map((prod) => (
                    <div
                      key={prod._id || prod.id}
                      onClick={() => {
                        onSearchChange(prod.name);
                        if (onProductQuickView) {
                          onProductQuickView(prod._id || prod.id);
                        }
                      }}
                      className="p-3 flex gap-3 hover:bg-primary/5 transition-colors cursor-pointer items-center text-xs text-on-surface select-none"
                    >
                      <img
                        alt={prod.name}
                        className="w-8 h-10 object-cover rounded border border-[#E0DAD0]/60"
                        src={prod.image}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-sans font-bold text-on-surface truncate">{prod.name}</h5>
                        <p className="text-[9px] text-[#C5A880] font-bold uppercase tracking-wider">{prod.designer}</p>
                      </div>
                      <span className="font-sans font-extrabold text-primary shrink-0">{formatPrice(prod.price)}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop-only Actions row (Hidden on mobile) */}
          <div className="hidden md:flex flex-col items-end gap-1 justify-center shrink-0 z-10 select-none">
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Account Profile */}
              <motion.button 
                id="user-profile-btn"
                onClick={onProfileClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 text-on-surface hover:text-primary transition-colors duration-200 relative group cursor-pointer border-none bg-transparent"
                title="Profile & Bookings"
              >
                <User className="w-5 h-5 md:w-5.5 md:h-5.5" />
                <span className="absolute bottom-0 right-1.5 w-1.5 h-1.5 rounded-full bg-secondary-accent scale-0 group-hover:scale-100 transition-transform duration-200"></span>
              </motion.button>

              {/* Wishlist */}
              <motion.button 
                id="wishlist-drawer-btn"
                onClick={onWishlistClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 text-on-surface hover:text-primary transition-colors duration-200 relative cursor-pointer border-none bg-transparent"
                title="My Favorites"
              >
                <Heart className="w-5 h-5 md:w-5.5 md:h-5.5" />
                {wishlistCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary text-white font-sans font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Shopping Bag */}
              <motion.button 
                id="shopping-cart-btn"
                onClick={onCartClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 text-on-surface hover:text-primary transition-colors duration-200 relative cursor-pointer border-none bg-transparent"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 md:w-5.5 md:h-5.5" />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-secondary text-white font-sans font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
            <button
              type="button"
              onClick={onTrackOrderClick}
              className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C5A880] hover:text-primary transition-colors cursor-pointer border-none bg-transparent mr-1.5"
            >
              Track Order
            </button>
          </div>

        </div>

        {/* Dynamic Category Navigation Menu */}
        <nav className="flex items-center justify-start md:justify-center overflow-x-auto hide-scrollbar gap-4 sm:gap-6 md:gap-8 mt-3 md:mt-4 whitespace-nowrap pt-1">
          <button
            id="nav-category-all"
            onClick={() => {
              onCategorySelect('All');
              onSearchChange('');
            }}
            className={`text-xs uppercase tracking-widest font-sans font-bold py-1.5 border-b-2 transition-all duration-300 cursor-pointer border-none bg-transparent ${
              selectedCategory === 'All'
                ? 'text-primary border-primary'
                : 'text-on-surface/60 border-transparent hover:text-primary hover:border-primary/30'
            }`}
          >
            All Collections
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat}
              id={`nav-category-${cat.toLowerCase()}`}
              onClick={() => {
                onCategorySelect(cat);
                onSearchChange('');
              }}
              className={`text-xs uppercase tracking-widest font-sans font-bold py-1.5 border-b-2 transition-all duration-300 cursor-pointer border-none bg-transparent ${
                selectedCategory === cat
                  ? 'text-primary border-primary'
                  : 'text-on-surface/60 border-transparent hover:text-primary hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
