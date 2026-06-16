import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  totalPrice,
  user = null,
  token = '',
  updateUser = null,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [paymentOption, setPaymentOption] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      setCreatedOrder(null);
      setFormData((prev) => ({
        ...prev,
        name: user?.name || prev.name || '',
        email: user?.email || prev.email || '',
        phone: user?.phone || prev.phone || '',
        address: user?.address || prev.address || '',
        city: user?.city || prev.city || '',
        state: user?.state || prev.state || '',
        zip: user?.zip || prev.zip || '',
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    try {
      const payload = {
        guestDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        items: cartItems.map((item) => ({
          product: item.product._id || item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
        })),
        totalPrice: totalPrice,
        paymentMethod: paymentOption,
      };

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedOrder(data.order);
        setIsSubmitting(false);
        setIsSuccess(true);
        if (data.user && updateUser) {
          updateUser(data.user);
        }
      } else {
        const data = await response.json();
        alert(data.message || 'Payment processing failed');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to payment gateway');
      setIsSubmitting(false);
    }
  };

  const handleFinalAcknowledge = () => {
    onOrderSuccess();
    onClose();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] overflow-y-auto" id="checkout-gateway-modal">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isSuccess ? undefined : onClose}
          className="fixed inset-0 bg-on-surface/60 backdrop-blur-sm transition-opacity"
        ></motion.div>

        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-3xl bg-brand-bg rounded-2xl shadow-2xl overflow-hidden border border-[#E0DAD0] z-10"
          >
            
            {/* Header */}
            <div className="bg-primary text-[#FCFAF7] p-5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#5C061E] opacity-90"></div>
              <div className="relative z-10">
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Luxury Checkout</h3>
                <p className="text-[10px] sm:text-xs text-[#FCFAF7]/70 mt-0.5">Secure payment authorization console</p>
              </div>
              {!isSuccess && (
                <button
                  onClick={onClose}
                  className="relative z-10 p-1.5 rounded-full bg-white/10 text-white hover:text-white hover:bg-white/20 transition-all cursor-pointer border-none"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {isSuccess ? (
              /* ORDER SUCCESS VIEW */
              <div className="p-8 text-center flex flex-col items-center justify-center py-16 text-on-surface">
                <CheckCircle2 className="w-16 h-16 text-secondary-accent mb-4 animate-bounce" />
                <h4 className="font-display text-3xl font-bold text-primary mb-2">Order Confirmed!</h4>
                <p className="text-xs sm:text-sm text-on-surface/80 max-w-md leading-relaxed mb-6">
                  Your exquisite boutique couture has been successfully reserved. Our concierge will email you custom measurements instructions and a secure delivery link within 24 hours.
                </p>
                <div className="bg-[#FCFAF7] p-4 border border-[#E0DAD0] rounded-xl max-w-sm w-full mb-8 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-secondary">Your Order ID (for tracking)</span>
                    <p className="font-mono font-bold text-xs text-primary select-all mt-1">{createdOrder?._id}</p>
                  </div>
                  <div className="border-t border-[#E0DAD0]/60 pt-2">
                    <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-secondary">Estimated Arrival</span>
                    <p className="font-sans font-bold text-sm text-on-surface mt-1">June 25 - June 28, 2026</p>
                  </div>
                </div>
                <button
                  id="success-dismiss-btn"
                  onClick={handleFinalAcknowledge}
                  className="bg-primary hover:bg-[#5C061E] text-white px-10 py-3.5 text-xs font-sans font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer border-none"
                >
                  Return to Shop
                </button>
              </div>
            ) : (
              /* CHECKOUT FORM VIEW */
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]" id="checkout-form">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left hand side form elements */}
                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-on-surface border-b pb-2 mb-4 border-[#E0DAD0]">
                        1. Delivery Address
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                            Full Name
                          </label>
                          <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                            placeholder="Lord/Lady Sterling"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                              Email
                            </label>
                            <input
                              required
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                              placeholder="you@email.com"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                              Phone
                            </label>
                            <input
                              required
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                              placeholder="+91 XXXXX XXXXX"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                            Destination Address
                          </label>
                          <input
                            required
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                            placeholder="Boulevard Mansions, Flat 12A"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                              City
                            </label>
                            <input
                              required
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#E0DAD0] px-2 py-2 text-xs rounded-lg outline-none focus:border-primary text-on-surface"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                              State
                            </label>
                            <input
                              required
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#E0DAD0] px-2 py-2 text-xs rounded-lg outline-none focus:border-primary text-on-surface"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                              Zip Code
                            </label>
                            <input
                              required
                              type="text"
                              name="zip"
                              value={formData.zip}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#E0DAD0] px-2 py-2 text-xs rounded-lg outline-none focus:border-primary text-on-surface"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-on-surface border-b pb-2 mb-4 border-[#E0DAD0]">
                        2. Payment Method
                      </h4>

                      {/* Choose option Tabs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => setPaymentOption('card')}
                          className={`p-3 border rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 cursor-pointer ${
                            paymentOption === 'card' ? 'border-[#C5A880] bg-primary/5 text-primary' : 'border-[#E0DAD0] bg-white text-on-surface'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentOption('upi')}
                          className={`p-3 border rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 cursor-pointer ${
                            paymentOption === 'upi' ? 'border-[#C5A880] bg-primary/5 text-primary' : 'border-[#E0DAD0] bg-white text-on-surface'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          UPI Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentOption('cod')}
                          className={`p-3 border rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 cursor-pointer ${
                            paymentOption === 'cod' ? 'border-[#C5A880] bg-primary/5 text-primary' : 'border-[#E0DAD0] bg-white text-on-surface'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          COD
                        </button>
                      </div>

                      {paymentOption === 'card' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                              Cardholder Name
                            </label>
                            <input
                              required={paymentOption === 'card'}
                              type="text"
                              name="cardName"
                              value={formData.cardName}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                              Card Number
                            </label>
                            <input
                              required={paymentOption === 'card'}
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                              placeholder="4000 1234 5678 9010"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                                Expiry Date
                              </label>
                              <input
                                required={paymentOption === 'card'}
                                type="text"
                                name="expiry"
                                value={formData.expiry}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1.5">
                                CVV
                              </label>
                              <input
                                required={paymentOption === 'card'}
                                type="password"
                                maxLength={3}
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                                placeholder="XXX"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentOption === 'upi' && (
                        <div className="p-4 bg-white border border-[#E0DAD0] rounded-xl flex flex-col items-center justify-center text-center">
                          <p className="text-xs text-on-surface font-semibold mb-2">
                            Scan the boutique secure QR after submittal.
                          </p>
                          <div className="w-24 h-24 bg-on-surface rounded-xl flex items-center justify-center text-white/50 text-[10px] font-mono">
                            MOCK_QR
                          </div>
                        </div>
                      )}

                      {paymentOption === 'cod' && (
                        <div className="p-4 bg-white border border-[#E0DAD0] rounded-xl text-center">
                          <p className="text-xs text-on-surface font-semibold leading-relaxed">
                            Cash On Delivery includes premium packaging handling. (₹500 surcharge included).
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right hand side purchase summary card */}
                  <div className="lg:col-span-5 bg-white border border-[#E0DAD0] rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-on-surface mb-3 border-b pb-2 border-[#E0DAD0]">
                        Bag Summary ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)})
                      </h4>

                      {/* Small product row items scrolling preview */}
                      <div className="max-h-[200px] overflow-y-auto space-y-3.5 pr-2 hide-scrollbar">
                        {cartItems.map((item, idx) => (
                          <div key={idx} className="flex gap-3">
                            <img
                              alt={item.product.name}
                              className="w-11 h-14 object-cover rounded bg-white shadow-xs border border-[#E0DAD0]/50"
                              src={item.product.image}
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-sans font-bold text-on-surface truncate">
                                {item.product.name}
                              </h5>
                              <p className="text-[9px] font-sans text-secondary font-bold uppercase">
                                {item.product.designer}
                              </p>
                              <p className="text-[10px] text-on-surface/60 mt-0.5">
                                Size: {item.selectedSize} | Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="text-xs font-sans font-bold text-on-surface shrink-0">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#E0DAD0]/60 pt-4 mt-6 space-y-2">
                        <div className="flex justify-between text-xs font-sans text-on-surface/70">
                          <span>Subtotal</span>
                          <span>{formatPrice(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-sans text-on-surface/70">
                          <span>Courier Insurance</span>
                          <span className="text-secondary-accent uppercase font-bold text-[9px] tracking-wider">Complimentary</span>
                        </div>
                        {paymentOption === 'cod' && (
                          <div className="flex justify-between text-xs font-sans text-on-surface/70">
                            <span>COD Surcharge</span>
                            <span>{formatPrice(500)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm sm:text-base font-sans font-extrabold text-on-surface border-t border-[#E0DAD0]/30 pt-3 mt-2">
                          <span>Total Sum</span>
                          <span className="text-primary">
                            {formatPrice(totalPrice + (paymentOption === 'cod' ? 500 : 0))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        id="submit-payment-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-[#5C061E] text-white py-3.5 rounded-lg font-sans font-bold uppercase tracking-widest text-xs disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 border-none cursor-pointer"
                      >
                        {isSubmitting ? 'Securing Transaction...' : `Pay — ${formatPrice(totalPrice + (paymentOption === 'cod' ? 500 : 0))}`}
                      </button>
                      
                      <div className="flex items-center justify-center gap-1.5 text-[9px] text-on-surface/50 mt-3 text-center tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-secondary-accent" />
                        <span>256-bit AES SSL Secure Checkout Shield</span>
                      </div>
                    </div>
                  </div>

                </div>
              </form>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
