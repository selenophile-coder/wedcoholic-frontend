import React, { useState, useMemo, useRef, useEffect, useContext } from 'react';
import { 
  X, Trash2, Heart, ShoppingBag, Plus, Minus, 
  AlertCircle, Calendar, MapPin, User, Check, ChevronLeft, ChevronRight, Video, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { AuthProvider, AuthContext } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import QuickViewModal from './components/QuickViewModal';
import CheckoutModal from './components/CheckoutModal';
import ConsultationModal from './components/ConsultationModal';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import TrackOrderModal from './components/modals/TrackOrderModal';
import InfoModal from './components/modals/InfoModal';

import ShopByOccasion from './components/sections/ShopByOccasion';
import CoutureCarousel from './components/CoutureCarousel';
import CatalogGallery from './components/sections/CatalogGallery';
import AdminDashboard from './components/admin/AdminDashboard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function BespokeAppContent() {
  const { user, token, logout, isAdmin } = useContext(AuthContext);

  // Router View Switch ('shop' or 'admin')
  const [view, setView] = useState('shop');

  // Products from MongoDB
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Site Settings for Pop-up
  const [settings, setSettings] = useState(null);
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  // Global React Store states
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('wedcoholic_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wedcoholic_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  
  // Slide Drawer Toggles
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showStoreLocator, setShowStoreLocator] = useState(false);

  // Active Interactive Overlays
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [infoModalTab, setInfoModalTab] = useState('faq');
  const [trackingOrderId, setTrackingOrderId] = useState('');

  // Customized notification toast helper
  const [toastMessage, setToastMessage] = useState(null);

  // Synchronize cart/wishlist to local storage
  useEffect(() => {
    localStorage.setItem('wedcoholic_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wedcoholic_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const triggerNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch Products & Settings
  const loadBespokeData = async () => {
    try {
      setLoadingProducts(true);
      
      // Fetch Products
      const catQuery = selectedCategory !== 'All' ? `category=${selectedCategory}` : '';
      const occQuery = selectedOccasion !== 'All' ? `occasion=${selectedOccasion}` : '';
      const searchQueryParam = searchQuery ? `search=${searchQuery}` : '';
      const queryParams = [catQuery, occQuery, searchQueryParam].filter(Boolean).join('&');
      
      const prodRes = await fetch(`${API_BASE}/products?${queryParams}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // Fetch Pop-up Banner Settings
      const settingsRes = await fetch(`${API_BASE}/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
        if (settingsData.isOfferPopupEnabled) {
          const isDismissed = sessionStorage.getItem('wedcoholic_promo_dismissed');
          if (!isDismissed) {
            setShowPromoPopup(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading API data:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadBespokeData();
  }, [selectedCategory, selectedOccasion, searchQuery]);

  // List of active booked appointments dynamically loaded from database
  const [bookings, setBookings] = useState([]);
  const [userOrders, setUserOrders] = useState([]);

  const fetchUserBookings = async () => {
    if (!token || !user) {
      setBookings([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching user bookings:', err);
    }
  };

  const fetchUserOrders = async () => {
    if (!token || !user) {
      setUserOrders([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    }
  };

  useEffect(() => {
    fetchUserBookings();
    fetchUserOrders();
  }, [token, user]);

  // Premium boutiques list
  const BOUTIQUES = [
    { city: 'Mumbai', address: 'Bespoke Mansion, Colaba Causeway, Mumbai 400001', hours: '11:00 AM - 8:30 PM' },
    { city: 'New Delhi', address: 'MGB-6 Emporio Court, Vasant Kunj, New Delhi 110070', hours: '10:30 AM - 9:00 PM' },
    { city: 'London', address: 'Mayfair Galleria, 42 New Bond Street, London W1S', hours: '10:00 AM - 7:00 PM' }
  ];

  // Segment Filter definitions
  const whatsNewProducts = useMemo(() => {
    return products.filter(p => p.isNew);
  }, [products]);

  const celebrityProducts = useMemo(() => {
    return products.filter(p => p.celebrityCloset);
  }, [products]);

  const bigDayProducts = useMemo(() => {
    return products.filter(p => p.occasions && (p.occasions.includes('The Wedding') || p.occasions.includes('For Groom Big Day') || p.occasions.includes('For Bride Big Day')));
  }, [products]);

  const groomProducts = useMemo(() => {
    return products.filter(p => p.category === 'Men' || (p.occasions && p.occasions.includes('For Groom Big Day')));
  }, [products]);

  const bridalProducts = useMemo(() => {
    return products.filter(p => p.category === 'Wedding' || p.category === 'Lehengas' || (p.occasions && p.occasions.includes('For Bride Big Day')));
  }, [products]);

  const activeProduct = useMemo(() => {
    return products.find((p) => (p._id || p.id) === selectedProductId) || products[0];
  }, [selectedProductId, products]);

  // Wishlist dynamic handlers
  const handleWishlistToggle = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const targetObj = products.find(p => (p._id || p.id) === productId);
      if (exists) {
        triggerNotification(`Removed "${targetObj?.name}" from your Wishlist.`);
        return prev.filter((id) => id !== productId);
      } else {
        triggerNotification(`Added "${targetObj?.name}" to your Wishlist.`);
        return [...prev, productId];
      }
    });
  };

  // Cart operations
  const handleAddToCart = (product, size, qty = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => (item.product._id || item.product.id) === (product._id || product.id) && item.selectedSize === size
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        triggerNotification(`Updated "${product.name}" quantity inside your Bag.`);
        return updated;
      } else {
        triggerNotification(`Added "${product.name}" (Size ${size}) to your Bag.`);
        return [...prev, { product, selectedSize: size, quantity: qty }];
      }
    });
  };

  const handleUpdateQuantity = (productId, size, offset) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if ((item.product._id || item.product.id) === productId && item.selectedSize === size) {
            const nextQty = item.quantity + offset;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (productId, size) => {
    setCart((prev) => {
      const item = prev.find(i => (i.product._id || i.product.id) === productId && i.selectedSize === size);
      if (item) {
        triggerNotification(`Removed "${item.product.name}" from your Bag.`);
      }
      return prev.filter(
        (item) => !((item.product._id || item.product.id) === productId && item.selectedSize === size)
      );
    });
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, current) => acc + current.product.price * current.quantity, 0);
  }, [cart]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Switch to admin view handler
  if (view === 'admin' && isAdmin) {
    return (
      <AdminDashboard onExit={() => setView('shop')} />
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-on-surface flex flex-col justify-between selection:bg-primary selection:text-white" id="wedcoholic-app-root">
      
      {/* Brand Preloader */}
      <AnimatePresence>
        {loadingProducts && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            className="fixed inset-0 bg-[#FCFAF7] z-[1000] flex flex-col items-center justify-center select-none"
          >
            <div className="relative flex flex-col items-center">
              {/* Pulsing ring around emblem */}
              <motion.div 
                animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-full border-2 border-[#C5A880]/30 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-[#5C061E] flex items-center justify-center font-display font-extrabold text-white text-2xl shadow-xl">
                  W
                </div>
              </motion.div>
              
              {/* Rotating outer compass ring */}
              <div className="absolute -inset-2 rounded-full border border-[#C5A880]/20 animate-spin [animation-duration:16s] pointer-events-none"></div>
              
              {/* Brand Branding */}
              <h1 className="font-display text-xl font-bold tracking-widest text-primary mt-6 uppercase">
                WedCoholic
              </h1>
              <span className="text-[9px] font-sans font-bold text-secondary tracking-[0.4em] uppercase mt-1">
                Luxury Couture
              </span>

              {/* Progress Slider Line */}
              <div className="w-32 h-[1px] bg-[#E0DAD0] mt-6 relative overflow-hidden">
                <motion.div 
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 1. Header component */}
      <Header
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        wishlistCount={wishlist.length}
        onTrackOrderClick={() => setActiveModal('track-order')}
        onCartClick={() => {
          setIsCartOpen(true);
          setIsWishlistOpen(false);
          setIsProfileOpen(false);
        }}
        onWishlistClick={() => {
          setIsWishlistOpen(true);
          setIsCartOpen(false);
          setIsProfileOpen(false);
        }}
        onProfileClick={() => {
          if (user) {
            setIsProfileOpen(true);
            setIsCartOpen(false);
            setIsWishlistOpen(false);
          } else {
            setActiveModal('auth');
          }
        }}
        selectedCategory={selectedCategory}
        onCategorySelect={(category) => {
          setSelectedCategory(category);
          setTimeout(() => {
            const targetArea = document.getElementById('catalog-anchor');
            if (targetArea) {
              targetArea.scrollIntoView({ behavior: 'smooth' });
            }
          }, 150);
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setTimeout(() => {
            const targetArea = document.getElementById('catalog-anchor');
            if (targetArea) {
              targetArea.scrollIntoView({ behavior: 'smooth' });
            }
          }, 150);
        }}
        products={products}
        onProductQuickView={(prodId) => {
          setSelectedProductId(prodId);
          setActiveModal('quick-view');
        }}
      />

      {/* Main body setup */}
      <main className="pt-[110px] md:pt-[130px] flex-1 flex flex-col gap-0">
        
        {/* Toast alerts banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-[150] bg-primary text-white border border-[#C5A880]/30 py-3.5 px-5 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm"
            >
              <Check className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span className="text-xs font-sans font-bold tracking-wide">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conditional Layout Switching */}
        {selectedCategory === 'All' && selectedOccasion === 'All' && searchQuery === '' ? (
          <>
            {/* 2. Hero slider */}
            <Hero 
              onShopClick={() => {
                setSelectedCategory('All');
                setSelectedOccasion('All');
                const targetArea = document.getElementById('catalog-anchor');
                if (targetArea) {
                  targetArea.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              slides={settings?.heroSlides}
            />

            {/* 3. Curated Occasion grid list */}
            <ShopByOccasion 
              selectedOccasion={selectedOccasion}
              onOccasionSelect={(occ) => {
                setSelectedOccasion(occ);
                const targetArea = document.getElementById('catalog-anchor');
                if (targetArea) {
                  targetArea.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              customOccasions={settings?.occasionsList}
            />

            {/* 4. New Arrivals */}
            {whatsNewProducts.length > 0 && (!settings || settings.isNewArrivalsEnabled) && (
              <CoutureCarousel
                products={whatsNewProducts}
                wishlist={wishlist}
                title={settings?.newArrivalsTitle || "What's New"}
                subtitle={settings?.newArrivalsSubtitle || "JUST ARRIVED"}
                onWishlistToggle={handleWishlistToggle}
                onQuickView={(id) => {
                  setSelectedProductId(id);
                  setActiveModal('quick-view');
                }}
                onAddToCart={handleAddToCart}
              />
            )}

            {/* 5. Celebrity Closet */}
            {celebrityProducts.length > 0 && (!settings || settings.isCelebrityChoiceEnabled) && (
              <CoutureCarousel
                products={celebrityProducts}
                wishlist={wishlist}
                title={settings?.celebrityChoiceTitle || "Celebrity Closet"}
                subtitle={settings?.celebrityChoiceSubtitle || "AS SEEN ON CELEBRITIES"}
                onWishlistToggle={handleWishlistToggle}
                onQuickView={(id) => {
                  setSelectedProductId(id);
                  setActiveModal('quick-view');
                }}
                onAddToCart={handleAddToCart}
              />
            )}

            {/* 6. For the Big Day */}
            {bigDayProducts.length > 0 && (
              <CoutureCarousel
                products={bigDayProducts}
                wishlist={wishlist}
                title="For the Big Day"
                subtitle="ROYAL WEDDING SELECTION"
                onWishlistToggle={handleWishlistToggle}
                onQuickView={(id) => {
                  setSelectedProductId(id);
                  setActiveModal('quick-view');
                }}
                onAddToCart={handleAddToCart}
              />
            )}

            {/* 7. For Grooms */}
            {groomProducts.length > 0 && (
              <CoutureCarousel
                products={groomProducts}
                wishlist={wishlist}
                title="For Grooms"
                subtitle="IMPERIAL MENSWEAR"
                onWishlistToggle={handleWishlistToggle}
                onQuickView={(id) => {
                  setSelectedProductId(id);
                  setActiveModal('quick-view');
                }}
                onAddToCart={handleAddToCart}
              />
            )}

            {/* 8. For Bridal */}
            {bridalProducts.length > 0 && (
              <CoutureCarousel
                products={bridalProducts}
                wishlist={wishlist}
                title="For Bridal"
                subtitle="REGAL WOMENSWEAR & LEHENGAS"
                onWishlistToggle={handleWishlistToggle}
                onQuickView={(id) => {
                  setSelectedProductId(id);
                  setActiveModal('quick-view');
                }}
                onAddToCart={handleAddToCart}
              />
            )}
          </>
        ) : (
          /* 9. Product catalog search / category filter grid view */
          <CatalogGallery
            products={products}
            wishlist={wishlist}
            selectedCategory={selectedCategory}
            selectedOccasion={selectedOccasion}
            onClearFilters={() => {
              setSelectedCategory('All');
              setSelectedOccasion('All');
              setSearchQuery('');
            }}
            onWishlistToggle={handleWishlistToggle}
            onQuickView={(id) => {
              setSelectedProductId(id);
              setActiveModal('quick-view');
            }}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* 7. Store Locator */}
        <AnimatePresence>
          {showStoreLocator && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#FCFAF7] py-12 md:py-16 border-b border-[#E0DAD0]/30 overflow-hidden" 
              id="store-locator-area"
            >
              <div className="max-w-4xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8 border-b border-[#E0DAD0]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-2xl font-bold tracking-tight text-on-surface">WedCoholic Boutiques</h3>
                  </div>
                  <button 
                    onClick={() => setShowStoreLocator(false)} 
                    className="text-xs font-sans font-bold text-primary hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Dismiss Area
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {BOUTIQUES.map((boutique, index) => (
                    <div key={index} className="p-5 bg-white rounded-xl shadow-xs border border-[#E0DAD0] flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-sans font-bold uppercase text-secondary tracking-widest">
                          {boutique.city} Salon
                        </span>
                        <p className="text-xs text-on-surface/80 mt-2.5 leading-relaxed font-sans font-medium">
                          {boutique.address}
                        </p>
                      </div>
                      <div className="text-[10px] text-on-surface/50 font-sans tracking-wide mt-4 border-t pt-2 border-[#E0DAD0]/55">
                        Open Hours: {boutique.hours}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

      </main>

      {/* 8. Brand Footer */}
      <Footer
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          setTimeout(() => {
            const targetArea = document.getElementById('catalog-anchor');
            if (targetArea) {
              targetArea.scrollIntoView({ behavior: 'smooth' });
            }
          }, 150);
        }}
        onConsultationClick={() => {
          setActiveModal('consultation');
        }}
        onStoreLocatorClick={() => {
          setInfoModalTab('locator');
          setActiveModal('info');
        }}
        onTrackOrderClick={() => setActiveModal('track-order')}
        onPolicyClick={(tab) => {
          setInfoModalTab(tab);
          setActiveModal('info');
        }}
      />

      {/* ==================== SITE-WIDE POP-UP PROMO ==================== */}
      <AnimatePresence>
        {showPromoPopup && settings && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPromoPopup(false);
                sessionStorage.setItem('wedcoholic_promo_dismissed', 'true');
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              style={{ backgroundColor: settings.offerPopupBgColor }}
              className="relative w-full max-w-md text-white rounded-2xl shadow-2xl p-8 border border-white/10 z-10 text-center overflow-hidden"
            >
              {/* Abstract layout backgrounds */}
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/5 blur-md"></div>
              <div className="absolute -bottom-12 -left-12 w-28 h-28 rounded-full bg-white/5 blur-md"></div>
              
              <button
                onClick={() => {
                  setShowPromoPopup(false);
                  sessionStorage.setItem('wedcoholic_promo_dismissed', 'true');
                }}
                className="absolute top-4.5 right-4.5 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-none"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <Gift className="w-10 h-10 text-secondary mx-auto mb-4 animate-bounce" />
              
              <span className="text-[9px] uppercase font-sans font-bold tracking-[0.25em] text-secondary">Boutique Privilege</span>
              <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 tracking-wide">{settings.offerPopupTitle}</h3>
              <p className="text-xs text-white/80 font-sans mt-3 leading-relaxed max-w-sm mx-auto">{settings.offerPopupText}</p>
              
              <div className="bg-white/10 border border-white/20 py-2.5 px-4 rounded-xl max-w-[200px] mx-auto mt-6 text-center font-mono font-bold text-sm tracking-wider uppercase">
                CODE: {settings.offerPopupDiscountCode}
              </div>

              <p className="text-[8px] text-white/40 mt-6 select-none font-sans uppercase font-bold tracking-widest">
                *Applies to custom couture sizing commissions.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== DRAWERS (FLYOUT OVERLAYS) ==================== */}

      {/* A. Wishlist Drawer */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-[130] overflow-hidden" id="wishlist-overlay-drawer">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)} 
              className="absolute inset-0 bg-on-surface/50 backdrop-blur-xs"
            ></motion.div>
            
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35 }}
                className="w-screen max-w-md bg-brand-bg shadow-2xl flex flex-col justify-between border-l border-[#E0DAD0]"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#E0DAD0]/60 bg-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary fill-current" />
                    <h3 className="font-display text-xl font-bold text-on-surface">Liked Masterpieces</h3>
                  </div>
                  <button
                    onClick={() => setIsWishlistOpen(false)}
                    className="p-1 rounded-full text-on-surface/50 hover:text-on-surface hover:bg-brand-bg transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Saved list */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {wishlist.length === 0 ? (
                    <div className="text-center py-12 text-on-surface/40">
                      <Heart className="w-12 h-12 text-on-surface/10 mx-auto mb-4" />
                      <p className="text-sm font-sans font-bold">Your Wishlist is empty</p>
                      <p className="text-xs text-on-surface/50 mt-1">Tap hearts on couture photographs to populate</p>
                    </div>
                  ) : (
                    wishlist.map((id) => {
                      const item = products.find((p) => (p._id || p.id) === id);
                      if (!item) return null;
                      return (
                        <div key={item._id || item.id} className="flex gap-4 border-b border-[#E0DAD0]/30 pb-4">
                          <img
                            alt={item.name}
                            className="w-14 h-18 object-cover rounded-lg bg-white shadow-xs border border-[#E0DAD0]/50"
                            src={item.image}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-sans font-bold text-on-surface truncate">
                              {item.name}
                            </h4>
                            <p className="text-[9px] text-[#C5A880] font-bold uppercase tracking-wider">
                              {item.designer}
                            </p>
                            <p className="text-xs font-sans font-extrabold text-primary mt-1">
                              {formatPrice(item.price)}
                            </p>
                            
                            <div className="flex gap-3 mt-3">
                              <button
                                onClick={() => {
                                  handleAddToCart(item, item.sizes[0] || 'M', 1);
                                  handleWishlistToggle(item._id || item.id);
                                }}
                                className="text-[10px] font-sans font-bold bg-primary hover:bg-[#5C061E] text-white px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer border-none"
                              >
                                Add to Bag
                              </button>
                              <button
                                onClick={() => handleWishlistToggle(item._id || item.id)}
                                className="text-[10px] font-sans font-bold uppercase text-[#C5A880] hover:text-primary cursor-pointer border-none bg-transparent"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-6 bg-white border-t border-[#E0DAD0]/50 text-center text-[10px] text-on-surface/40 select-none uppercase tracking-widest font-bold">
                  WedCoholic Wishlist Manager
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* B. Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[130] overflow-hidden" id="shopping-bag-drawer">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)} 
              className="absolute inset-0 bg-on-surface/50 backdrop-blur-xs"
            ></motion.div>
            
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35 }}
                className="w-screen max-w-md bg-brand-bg shadow-2xl flex flex-col justify-between border-l border-[#E0DAD0]"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#E0DAD0]/60 bg-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-xl font-bold text-on-surface">Your Shopping Bag</h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 rounded-full text-on-surface/50 hover:text-on-surface hover:bg-brand-bg transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 text-on-surface/40">
                      <ShoppingBag className="w-12 h-12 text-on-surface/10 mx-auto mb-4" />
                      <p className="text-sm font-sans font-bold">Your Shopping Bag is empty</p>
                      <p className="text-xs text-on-surface/50 mt-1">Explore collections to add handcrafted wear</p>
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div key={index} className="flex gap-4 border-b border-[#E0DAD0]/30 pb-4">
                        <img
                          alt={item.product.name}
                          className="w-14 h-18 object-cover rounded-lg bg-white shadow-xs border border-[#E0DAD0]/50"
                          src={item.product.image}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs sm:text-sm font-sans font-bold text-on-surface truncate">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => handleRemoveFromCart(item.product._id || item.product.id, item.selectedSize)}
                              className="p-1 hover:text-primary transition-colors text-on-surface/40 cursor-pointer border-none bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-[9px] text-[#C5A880] font-bold uppercase tracking-wider mt-0.5">
                            {item.product.designer}
                          </p>
                          <p className="text-[10px] text-on-surface/60 mt-1">
                            Size: <span className="bg-white text-on-surface px-2 py-0.5 rounded border text-[9px] border-[#E0DAD0] font-bold">{item.selectedSize}</span>
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            {/* Counter */}
                            <div className="flex items-center border border-[#E0DAD0] bg-white rounded-lg divide-x divide-[#E0DAD0]">
                              <button
                                onClick={() => handleUpdateQuantity(item.product._id || item.product.id, item.selectedSize, -1)}
                                className="w-7 h-7 flex items-center justify-center text-xs hover:bg-[#FCFAF7] border-none bg-transparent cursor-pointer"
                              >
                                <Minus className="w-3 h-3 text-on-surface" />
                              </button>
                              <span className="w-8 text-center text-xs font-sans font-bold text-on-surface">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.product._id || item.product.id, item.selectedSize, 1)}
                                className="w-7 h-7 flex items-center justify-center text-xs hover:bg-[#FCFAF7] border-none bg-transparent cursor-pointer"
                              >
                                <Plus className="w-3 h-3 text-on-surface" />
                              </button>
                            </div>

                            <span className="text-xs font-sans font-extrabold text-on-surface">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal and checkout trigger */}
                {cart.length > 0 && (
                  <div className="p-6 bg-white border-t border-[#E0DAD0] space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs uppercase font-sans font-bold tracking-widest text-on-surface/50">
                        Bespoke Subtotal
                      </span>
                      <span className="font-sans font-extrabold text-primary text-lg sm:text-xl">
                        {formatPrice(cartSubtotal)}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-on-surface/50 leading-relaxed font-sans font-medium">
                      Our luxury garments are handcrafted upon reservation. Courier deliveries include complimentary protective casing.
                    </p>

                    <button
                      id="bag-checkout-btn"
                      onClick={() => {
                        setIsCartOpen(false);
                        if (!user) {
                          setActiveModal('auth');
                          triggerNotification('Authentication is mandatory to complete checkout.');
                        } else {
                          setActiveModal('checkout');
                        }
                      }}
                      className="w-full bg-primary hover:bg-[#5C061E] text-white py-3.5 rounded-lg font-sans font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-none cursor-pointer shadow-md"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* C. User Account & Virtual Bookings drawer */}
      <AnimatePresence>
        {isProfileOpen && user && (
          <div className="fixed inset-0 z-[130] overflow-hidden" id="account-bookings-drawer">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)} 
              className="absolute inset-0 bg-on-surface/50 backdrop-blur-xs"
            ></motion.div>
            
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35 }}
                className="w-screen max-w-md bg-brand-bg shadow-2xl flex flex-col justify-between border-l border-[#E0DAD0]"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#E0DAD0]/60 bg-primary text-white flex justify-between items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#5C061E] opacity-90"></div>
                  <div className="relative z-10 flex items-center gap-2">
                    <User className="w-5 h-5 text-white" />
                    <h3 className="font-display text-xl font-bold">WedCoholic Salon</h3>
                  </div>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="relative z-10 p-1.5 rounded-full bg-white/10 text-white hover:text-white transition-all cursor-pointer border-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Details list */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Profile Card */}
                  <div className="p-4 bg-white rounded-xl border border-[#E0DAD0] flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-sans font-bold text-lg uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-sans font-bold text-on-surface">{user.name}</h4>
                          <p className="text-xs text-on-surface/50 font-medium">{user.email}</p>
                          <p className="text-[9px] text-primary/60 font-mono font-bold mt-1 uppercase tracking-wider">Client ID: {user._id || user.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                          triggerNotification("Logged out successfully.");
                        }}
                        className="text-[10px] font-sans font-bold uppercase text-red-600 hover:text-red-800 transition cursor-pointer border border-red-200 hover:border-red-350 rounded px-2.5 py-1.5 bg-transparent"
                      >
                        Logout
                      </button>
                    </div>

                    {/* Admin Switch Link */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setView('admin');
                        }}
                        className="w-full bg-neutral-900 hover:bg-neutral-950 text-white py-2 rounded-lg text-xs font-sans font-bold uppercase tracking-wider text-center cursor-pointer border border-neutral-800 mt-2"
                      >
                        Go to Admin Panel
                      </button>
                    )}
                  </div>

                  {/* My Orders & Live Tracking */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3 border-b pb-1.5 border-[#E0DAD0]/60">
                      <h5 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C5A880]">
                        My Orders & Tracking
                      </h5>
                    </div>

                    {userOrders.length === 0 ? (
                      <div className="p-4 bg-white rounded-xl border border-[#E0DAD0] text-center text-on-surface/40">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-on-surface/20" />
                        <p className="text-xs font-sans font-bold">No Active Orders</p>
                        <p className="text-[10px] text-on-surface/50 mt-0.5">Your bespoke order tracking will display here once placed.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                        {userOrders.map((o) => {
                          const stagesList = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
                          const currentStageIdx = stagesList.indexOf(o.status);

                          return (
                            <div key={o._id} className="p-4 bg-white rounded-xl border border-[#E0DAD0] relative">
                              <span className="absolute top-3.5 right-3.5 text-[8px] px-2 py-0.5 rounded-sm uppercase tracking-wider font-sans font-bold bg-primary/10 text-primary">
                                {o.status}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-on-surface select-all block">ID: {o._id}</span>
                              <span className="text-[9px] text-on-surface/40 font-medium font-sans block mt-1">
                                Date: {new Date(o.createdAt).toLocaleDateString()} | Price: ₹{o.totalPrice.toLocaleString('en-IN')}
                              </span>

                              {/* Progress Tracker Bar */}
                              {['Returned', 'Cancelled', 'Defected'].includes(o.status) ? (
                                <div className="mt-3.5 p-2 bg-red-50 border border-red-150 rounded-lg text-center text-red-700 text-[10px] font-sans font-bold uppercase tracking-wider">
                                  Order Status: {o.status}
                                </div>
                              ) : (
                                <div className="mt-3.5 space-y-1.5 border-t border-[#E0DAD0]/30 pt-3">
                                  <div className="flex justify-between items-center text-[9px] font-sans font-bold uppercase tracking-wider text-on-surface/50">
                                    <span>Track: <strong className="text-primary">{o.status}</strong></span>
                                    <span>{Math.round((Math.max(currentStageIdx, 0) / (stagesList.length - 1)) * 100)}% Complete</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden relative">
                                    <div 
                                      className="h-full bg-secondary transition-all duration-500 rounded-full"
                                      style={{ width: `${(Math.max(currentStageIdx, 0) / (stagesList.length - 1)) * 100}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex justify-between text-[8px] font-sans font-bold text-on-surface/40 uppercase tracking-widest pt-0.5">
                                    <span>Placed</span>
                                    <span>Shipped</span>
                                    <span>Delivered</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Consultation bookings */}
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b pb-1.5 border-[#E0DAD0]/60">
                      <h5 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C5A880]">
                        My Video Consultations
                      </h5>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setActiveModal('consultation');
                        }}
                        className="text-[10px] font-sans font-bold uppercase text-primary hover:underline bg-transparent border-none cursor-pointer"
                      >
                        + Book New
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {bookings.length === 0 ? (
                        <div className="p-4 bg-white rounded-xl border border-[#E0DAD0]/60 text-center text-on-surface/40">
                          <Video className="w-8 h-8 mx-auto mb-2 text-on-surface/20" />
                          <p className="text-xs font-sans font-bold">No Scheduled Consultations</p>
                          <p className="text-[10px] text-on-surface/50 mt-0.5">Book a virtual styling session with our designers</p>
                        </div>
                      ) : (
                        bookings.map((b) => (
                        <div key={b._id || b.id} className="p-4 bg-white rounded-xl border border-[#E0DAD0] relative">
                          <span className={`absolute top-3.5 right-3.5 text-[8px] px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-sans font-bold ${
                            b.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-secondary/15 text-secondary'
                          }`}>
                            {b.status || 'PENDING'}
                          </span>
                          
                          <h6 className="text-xs font-sans font-bold text-on-surface">{b.designer} House</h6>
                          <p className="text-[11px] text-on-surface/75 mt-1">Focus Mode: {b.style}</p>
                          
                          <div className="flex gap-4 mt-3 pt-2.5 border-t border-[#E0DAD0]/30 text-[10px] text-on-surface/40 font-sans font-bold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-secondary" /> {b.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Video className="w-3.5 h-3.5 text-secondary-accent" /> {b.time}
                            </span>
                          </div>
                        </div>
                      )))}
                    </div>
                  </div>

                  {/* Authentic Guarantee */}
                  <div className="p-4 bg-[#FCFAF7] border border-[#E0DAD0] rounded-xl">
                    <span className="text-[10px] font-sans font-bold tracking-widest text-[#C5A880] uppercase block mb-1">
                      Authentic Guarantee
                    </span>
                    <p className="text-[11px] text-on-surface/70 leading-relaxed font-sans font-medium">
                      Every garment carries digital cryptographic authentication labels tags to confirm legitimate original design licensing from premium weavers.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-[#E0DAD0]/50 text-center text-[10px] text-on-surface/40 select-none uppercase tracking-widest font-bold">
                  WedCoholic Couture
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== INTERACTIVE GUEST OVERLAY MODALS ==================== */}

      {/* 1. Quick View Modal */}
      {products.length > 0 && (
        <QuickViewModal
          product={activeProduct}
          isOpen={activeModal === 'quick-view'}
          onClose={() => setActiveModal(null)}
          isWishlisted={wishlist.includes(activeProduct?._id || activeProduct?.id)}
          onWishlistToggle={() => handleWishlistToggle(activeProduct?._id || activeProduct?.id)}
          onAddToCart={(size, qty) => {
            handleAddToCart(activeProduct, size, qty);
          }}
        />
      )}

      <CheckoutModal
        isOpen={activeModal === 'checkout'}
        onClose={() => setActiveModal(null)}
        cartItems={cart}
        totalPrice={cartSubtotal}
        user={user}
        token={token}
        onOrderSuccess={() => {
          setCart([]);
          fetchUserOrders();
          triggerNotification("✓ Transaction success! Your couture is now being custom tailored.");
        }}
      />

      {/* 3. Elegant Styling Appointments Consultation Modal */}
      <ConsultationModal
        isOpen={activeModal === 'consultation'}
        onClose={() => setActiveModal(null)}
        userEmail={user?.email}
        userName={user?.name}
        userPhone={user?.phone}
        onBookingSuccess={fetchUserBookings}
      />

      {/* 4. Luxury Authentication Login / Sign Up Page Overlay */}
      <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={() => setActiveModal(null)}
        onPolicyClick={(tab) => {
          setInfoModalTab(tab);
          setActiveModal('info');
        }}
        onAuthSuccess={(userData, mode) => {
          triggerNotification(
            mode === 'LOGIN' 
              ? `Welcome back, ${userData.name}! Enjoy your boutique portal.` 
              : `Welcome to WedCoholic Couture! Your account has been registered.`
          );
          setActiveModal(null);
        }}
      />

      {/* 5. Track Order Modal */}
      <TrackOrderModal
        isOpen={activeModal === 'track-order'}
        onClose={() => {
          setActiveModal(null);
          setTrackingOrderId('');
        }}
        initialOrderId={trackingOrderId}
      />

      {/* 6. Support & Policy Info Modal */}
      <InfoModal
        isOpen={activeModal === 'info'}
        onClose={() => setActiveModal(null)}
        initialTab={infoModalTab}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BespokeAppContent />
    </AuthProvider>
  );
}
