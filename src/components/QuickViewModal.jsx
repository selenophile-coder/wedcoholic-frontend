import React, { useState } from 'react';
import { X, Heart, Star, Check, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  isWishlisted,
  onWishlistToggle,
  onAddToCart,
}) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  // Reset selected size when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || 'M');
      setQuantity(1);
    }
  }, [product]);

  const mockReviews = [
    { id: '1', name: 'Alisha S.', rating: 5, comment: 'Exceptional embroidery. Fabric is heavy and drapes gracefully.', date: 'May 12, 2026' },
    { id: '2', name: 'Kabir M.', rating: 4.8, comment: 'Perfect fit. Custom buttons are solid brass and look highly premium.', date: 'June 01, 2026' }
  ];

  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto" id="quick-view-modal">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-on-surface/60 backdrop-blur-sm transition-opacity"
        ></motion.div>

        {/* Main Container center align */}
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-4xl bg-brand-bg rounded-2xl shadow-2xl overflow-hidden border border-[#E0DAD0] md:flex z-10"
          >
            {/* Dismiss button */}
            <button
              onClick={onClose}
              id="close-quickview-modal"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/70 hover:bg-primary hover:text-white text-on-surface transition-colors border-none cursor-pointer shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Large image showcase */}
            <div className="w-full md:w-1/2 relative bg-neutral-100 min-h-0 md:min-h-full">
              <img
                alt={product.name}
                className="w-full h-[240px] sm:h-[320px] md:h-full object-cover max-h-[240px] sm:max-h-[320px] md:max-h-[640px]"
                src={product.image}
                referrerPolicy="no-referrer"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 border border-[#C5A880]/30 bg-[#C5A880] text-white text-[9px] uppercase font-sans font-bold tracking-[0.25em] px-3.5 py-1 rounded shadow-md">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Right Side: Editorial customization console */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between max-h-[600px] md:max-h-[640px] overflow-y-auto">
              <div>
                {/* Designer Name & Wishlist Status header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-sans font-bold tracking-widest uppercase text-secondary">
                    {product.designer}
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-3 tracking-tight">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-4 mb-6">
                  <span className="font-sans text-xl font-extrabold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  
                  {/* Star Score beside price */}
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-sans font-bold text-on-surface">
                      {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
                    </span>
                  </div>
                </div>

                {/* Detail Navigation Tabs */}
                <div className="border-b border-[#E0DAD0] flex gap-6 mb-4">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2.5 text-xs font-sans font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer border-none bg-transparent ${
                      activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-on-surface/50'
                    }`}
                  >
                    Product Details
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2.5 text-xs font-sans font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer border-none bg-transparent ${
                      activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-on-surface/50'
                    }`}
                  >
                    Bespoke Feedback
                  </button>
                </div>

                {/* Details Pane */}
                {activeTab === 'details' ? (
                  <div>
                    <div className="max-h-[100px] sm:max-h-[140px] overflow-y-auto pr-2 mb-4 scrollbar-thin">
                      <p className="text-xs sm:text-sm font-sans text-on-surface/80 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Highlights section */}
                    <div className="mb-6">
                      <h4 className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-on-surface/90 mb-2">
                        Handcrafted Highlights
                      </h4>
                      <ul className="space-y-1.5 my-0 py-0 pl-0">
                        {product.highlights?.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs font-sans text-on-surface/80">
                            <Check className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* Reviews Pane */
                  <div className="space-y-4 mb-6">
                    {mockReviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-white border border-[#E0DAD0] rounded-lg">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-on-surface">{rev.name}</span>
                          <span className="text-[10px] font-sans text-on-surface/40">{rev.date}</span>
                        </div>
                        <p className="text-xs text-on-surface/80 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sizing Interactive Block */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/80">
                      Select Standard Size
                    </h4>
                    <button className="text-[10px] font-sans font-bold text-secondary flex items-center gap-1 hover:underline bg-transparent border-none cursor-pointer">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Size Chart
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {product.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-10 px-3 flex items-center justify-center font-sans font-bold text-xs border rounded-lg transition-all duration-200 cursor-pointer ${
                          selectedSize === size
                            ? 'bg-primary border-primary text-white shadow-md'
                            : 'bg-white border-[#E0DAD0] text-on-surface hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Incrementor */}
                <div className="mb-6 flex items-center gap-4">
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface/80">
                    Quantity
                  </h4>
                  <div className="flex items-center border border-[#E0DAD0] bg-white rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 font-sans font-bold text-on-surface hover:bg-surface border-none bg-transparent cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-sans font-bold text-on-surface">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 font-sans font-bold text-on-surface hover:bg-surface border-none bg-transparent cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions footer panel */}
              <div className="flex gap-4 border-t border-[#E0DAD0]/60 pt-4 mt-4">
                <button
                  onClick={() => {
                    onAddToCart(selectedSize, quantity);
                    onClose();
                  }}
                  className="flex-1 bg-primary hover:bg-[#5C061E] text-[#FCFAF7] py-3.5 px-6 font-sans font-bold uppercase tracking-widest text-xs rounded-lg transition-all shadow-md"
                >
                  Add To Bag — {formatPrice(product.price * quantity)}
                </button>
                
                <button
                  onClick={onWishlistToggle}
                  className={`w-12 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                    isWishlisted 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-[#E0DAD0] bg-white text-on-surface hover:border-primary'
                  }`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
