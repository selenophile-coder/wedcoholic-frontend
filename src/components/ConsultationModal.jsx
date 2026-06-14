import React, { useState } from 'react';
import { X, Video, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ConsultationModal({ isOpen, onClose, userEmail = '', userName = '', userPhone = '', onBookingSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: userEmail,
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow's date
    time: '14:00',
    designer: 'Ridhi Mehra',
    style: 'Bridal Lehenga',
    notes: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrors({});
      setServerError(null);
      setFormData(prev => ({
        ...prev,
        name: userName || prev.name || '',
        phone: userPhone || prev.phone || '',
        email: userEmail || prev.email || ''
      }));
    }
  }, [isOpen, userEmail, userName, userPhone]);

  if (!isOpen) return null;

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Your name is required';
    } else if (formData.name.trim().length < 3) {
      tempErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      tempErrors.phone = 'Please enter a valid 10 to 15-digit phone number';
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    const today = new Date().toISOString().split('T')[0];
    if (!formData.date) {
      tempErrors.date = 'Appointment date is required';
    } else if (formData.date < today) {
      tempErrors.date = 'Date cannot be in the past';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setIsSuccess(true);
        if (onBookingSuccess) onBookingSuccess();
      } else {
        setServerError(data.message || 'Failed to book virtual consultation');
      }
    } catch (err) {
      setIsLoading(false);
      setServerError('Network error. Please try again later.');
    }
  };

  const todayDateStr = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] overflow-y-auto" id="video-consultation-modal">
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
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-lg bg-brand-bg rounded-2xl shadow-2xl overflow-hidden border border-[#E0DAD0] z-10"
          >
            
            <button
              onClick={onClose}
              id="close-consultation-btn"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary hover:text-white text-on-surface transition-colors cursor-pointer border-none bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              /* SUCCESS VIEW */
              <div className="p-8 text-center flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-secondary mb-4 animate-scale-up" />
                <h3 className="font-display text-2xl font-bold text-primary mb-2">Exclusive Appointment Booked</h3>
                <p className="text-xs sm:text-sm text-on-surface/85 leading-relaxed max-w-sm mb-6">
                  Thank you, <strong>{formData.name}</strong>. Our premium styling counselor of <strong>{formData.designer}</strong> has reserved your video consultation.
                </p>

                <div className="w-full bg-[#FCFAF7] border border-[#E0DAD0] rounded-xl p-4 space-y-2 mb-8 text-left text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface/50 font-bold">DATE:</span>
                    <span className="font-bold text-on-surface">{formData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface/50 font-bold">TIME SLOT:</span>
                    <span className="font-bold text-on-surface">{formData.time} (IST)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface/50 font-bold">DESIGNER:</span>
                    <span className="font-bold text-secondary uppercase">{formData.designer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface/50 font-bold">STYLE TARGET:</span>
                    <span className="font-bold text-on-surface">{formData.style}</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="bg-primary hover:bg-[#5C061E] text-white border-none px-8 py-3 rounded-lg font-sans font-bold text-xs tracking-widest cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              /* FORM VIEW */
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-2xl font-bold tracking-tight text-on-surface">
                    Video Consultation
                  </h3>
                </div>
                
                <p className="text-xs sm:text-sm text-on-surface/80 leading-relaxed mb-6 font-sans">
                  Select your preferred designer house and book an exclusive virtual fitting appointment with our custom couturiers.
                </p>

                {serverError && (
                  <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold text-center font-sans">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                      placeholder="E.g. Diya Patel"
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-sans mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                        placeholder="+91 "
                      />
                      {errors.phone && <p className="text-[10px] text-red-500 font-sans mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        readOnly={!!userEmail}
                        className={`w-full border px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none text-on-surface ${
                          userEmail 
                            ? 'bg-neutral-50 border-neutral-200 cursor-not-allowed text-on-surface/60' 
                            : 'bg-white border-[#E0DAD0] focus:border-primary'
                        }`}
                      />
                      {errors.email && <p className="text-[10px] text-red-500 font-sans mt-1">{errors.email}</p>}
                      {userEmail && <p className="text-[9px] text-[#C5A880] font-sans font-semibold mt-1">Linked to account profile</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        min={todayDateStr}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-white border border-[#E0DAD0] px-3.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                      />
                      {errors.date && <p className="text-[10px] text-red-500 font-sans mt-1">{errors.date}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1">
                        Time Slot
                      </label>
                      <select
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full bg-white border border-[#E0DAD0] px-2.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                      >
                        <option value="11:00">11:00 AM - Morning Slot</option>
                        <option value="14:00">02:00 PM - Mid day Slot</option>
                        <option value="16:30">04:30 PM - Afternoon Slot</option>
                        <option value="19:00">07:00 PM - Evening Slot</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1">
                        Boutique House
                      </label>
                      <select
                        value={formData.designer}
                        onChange={(e) => setFormData({ ...formData, designer: e.target.value })}
                        className="w-full bg-white border border-[#E0DAD0] px-2.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                      >
                        <option value="Ridhi Mehra">Ridhi Mehra</option>
                        <option value="Manyavar Mohey">Manyavar Mohey</option>
                        <option value="Vedant Fashions">Vedant Fashions</option>
                        <option value="Aza Editorials">Aza Editorials</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1">
                        Style Target
                      </label>
                      <select
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        className="w-full bg-white border border-[#E0DAD0] px-2.5 py-2.5 text-xs sm:text-sm rounded-lg outline-none focus:border-primary text-on-surface"
                      >
                        <option value="Bridal Lehenga">Bridal Lehenga</option>
                        <option value="Sherwani Set">Groom Sherwani</option>
                        <option value="Saree Silk">Banarasi Silk Saree</option>
                        <option value="Kids Ethnic">Princes Wear / Kids</option>
                        <option value="Bespoke Suit">Designer Suit Set</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface/80 mb-1">
                      Special Notes
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-white border border-[#E0DAD0] px-3 py-2 text-xs rounded-lg outline-none focus:border-primary resize-none font-sans text-on-surface"
                      placeholder="Describe color preferences, fabric desires, or size notes..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-[#5C061E] disabled:bg-[#7A0C2E]/60 text-white py-3 rounded-lg font-sans font-bold uppercase tracking-widest text-xs border-none cursor-pointer mt-2 flex justify-center items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Booking Appointment...
                      </>
                    ) : (
                      'Schedule Video Fitting'
                    )}
                  </button>
                </form>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
