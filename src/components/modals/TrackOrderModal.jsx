import React, { useState } from 'react';
import { X, Search, ShieldCheck, Truck, Package, Check, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TrackOrderModal({ isOpen, onClose, initialOrderId = '', token = '' }) {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      setOrderId(initialOrderId);
      if (initialOrderId) {
        const fetchOrder = async () => {
          setLoading(true);
          setError(null);
          setOrderData(null);
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          try {
            const response = await fetch(`${API_BASE}/orders/track/${initialOrderId.trim()}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (response.ok) {
              const data = await response.json();
              setOrderData(data);
            } else {
              const errData = await response.json();
              setError(errData.message || 'Order not found. Please verify the ID.');
            }
          } catch (err) {
            console.error(err);
            setError('Network error. Please try again.');
          } finally {
            setLoading(false);
          }
        };
        fetchOrder();
      } else {
        setOrderData(null);
        setError(null);
      }
    }
  }, [isOpen, initialOrderId]);

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setOrderData(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    try {
      const response = await fetch(`${API_BASE}/orders/track/${orderId.trim()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Order not found. Please verify the ID.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stages = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
  const currentStageIdx = orderData ? stages.indexOf(orderData.status) : -1;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center px-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs animate-fade-in"
        ></motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-lg bg-brand-bg rounded-2xl shadow-2xl border border-[#E0DAD0] z-10 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-primary text-[#FCFAF7] p-5 flex justify-between items-center relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#5C061E] opacity-90"></div>
            <div className="relative z-10 flex items-center gap-2">
              <Truck className="w-5 h-5 text-secondary" />
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight">Track Your Couture</h3>
                <p className="text-[10px] text-[#FCFAF7]/70 font-medium">Real-time designer fulfillment progress</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="relative z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border-none"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">
            {/* Tracking Search Input */}
            <form onSubmit={handleTrack} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40" />
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter 24-Digit Order ID (e.g. 660f...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FCFAF7] border border-[#E0DAD0] rounded-xl text-xs sm:text-sm text-on-surface outline-none focus:border-primary placeholder-on-surface/35 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-[#5C061E] text-white px-5 py-2.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider border-none cursor-pointer shadow-md transition disabled:bg-primary/50 shrink-0"
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </form>

            {error && (
              <p className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold text-center font-sans">
                {error}
              </p>
            )}

            {orderData && (
              <div className="space-y-6 animate-fade-in">
                {/* Order Summary Metadata */}
                <div className="p-4 bg-[#FCFAF7] border border-[#E0DAD0] rounded-xl flex justify-between items-baseline text-xs">
                  <div>
                    <span className="text-on-surface/40 font-bold uppercase block tracking-wider text-[9px]">CUSTOMER</span>
                    <span className="font-bold text-on-surface">{orderData.guestDetails?.name || 'Valued Client'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-on-surface/40 font-bold uppercase block tracking-wider text-[9px]">TOTAL ORDER</span>
                    <span className="font-extrabold text-primary">{formatPrice(orderData.totalPrice)}</span>
                  </div>
                </div>

                {/* Tracking Progress Indicator Bar */}
                {['Returned', 'Cancelled', 'Defected'].includes(orderData.status) ? (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-red-600" />
                    <h5 className="font-display font-bold text-sm uppercase">Order Exception State</h5>
                    <p className="text-[11px] mt-1 leading-relaxed">
                      Your order has encountered status: <strong>{orderData.status}</strong>. Please reach out to customer care for bespoke inquiries.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 py-4 px-2">
                    <div className="relative flex justify-between items-center w-full">
                      {/* Connection Progress line */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-100 -z-1">
                        <div 
                          style={{ width: `${(Math.max(currentStageIdx, 0) / (stages.length - 1)) * 100}%` }}
                          className="h-full bg-secondary transition-all duration-700"
                        ></div>
                      </div>

                      {/* Stage Circles */}
                      {stages.map((stage, idx) => {
                        const isCompleted = idx <= currentStageIdx;
                        const isActive = idx === currentStageIdx;

                        return (
                          <div key={idx} className="flex flex-col items-center relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isCompleted 
                                ? isActive 
                                  ? 'bg-primary text-white ring-4 ring-primary/20 scale-110 shadow-lg' 
                                  : 'bg-secondary text-white' 
                                : 'bg-white text-on-surface/30 border-2 border-neutral-100'
                            }`}>
                              {isCompleted && !isActive ? (
                                <Check className="w-4.5 h-4.5" />
                              ) : (
                                <Package className="w-4 h-4" />
                              )}
                            </div>
                            <span className={`text-[9px] font-sans font-bold uppercase tracking-wider mt-2.5 absolute top-8 whitespace-nowrap ${
                              isActive ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-on-surface/40'
                            }`}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items Detail List */}
                <div className="pt-4 border-t border-[#E0DAD0]/60 space-y-3">
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C5A880]">Garment Package Items</h4>
                  <div className="divide-y divide-[#E0DAD0]/30">
                    {orderData.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-on-surface block">{item.name}</span>
                          <span className="text-[10px] text-on-surface/50 font-sans">Size: {item.selectedSize} | Qty: {item.quantity}</span>
                        </div>
                        <span className="font-bold text-on-surface">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
