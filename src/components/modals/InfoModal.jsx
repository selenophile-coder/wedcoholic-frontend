import React, { useState, useEffect } from 'react';
import { X, HelpCircle, FileText, Shield, ArrowLeftRight, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InfoModal({ isOpen, onClose, initialTab = 'faq' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setOpenFaqIndex(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'faq', label: 'FAQs', icon: HelpCircle },
    { id: 'locator', label: 'Store Locator', icon: MapPin },
    { id: 'terms', label: 'Terms of Use', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'refunds', label: 'Returns & Refunds', icon: ArrowLeftRight },
    { id: 'contact', label: 'Contact Us', icon: Mail },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        ></motion.div>

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-[92vw] sm:w-[85vw] md:w-[680px] max-w-2xl bg-brand-bg rounded-2xl shadow-2xl border border-[#E0DAD0] z-10 overflow-hidden flex flex-col md:flex-row h-[65vh] sm:h-[70vh] md:h-[400px]"
        >
          {/* Close button - Styled for high visibility */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-white/95 hover:bg-primary hover:text-white text-on-surface border border-[#E0DAD0] shadow-md transition-all cursor-pointer"
            title="Close Dialogue"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Sidebar Nav */}
          <div className="w-full md:w-44 bg-[#FCFAF7] border-b md:border-b-0 md:border-r border-[#E0DAD0] flex flex-row md:flex-col overflow-x-auto md:overflow-visible shrink-0 select-none p-2 md:p-3.5 md:pt-6 gap-1 md:gap-1.5 scrollbar-none">
            <h3 className="font-display text-xs font-extrabold text-primary tracking-wide hidden md:block mb-4 uppercase">
              WedCoholic Care
            </h3>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-1.5 px-2 md:py-2 md:px-3 rounded-lg flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-on-surface/50 hover:bg-neutral-100 hover:text-on-surface bg-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Pane */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white font-sans text-xs sm:text-sm text-on-surface/80 leading-relaxed scroll-smooth">
            
            {/* FAQ TAB */}
            {activeTab === 'faq' && (
              <div className="space-y-6 animate-fade-in">
                <h4 className="font-display text-lg sm:text-xl font-extrabold text-primary mb-6">Frequently Asked Questions</h4>
                <div className="space-y-3">
                  {[
                    {
                      q: "How do I order custom size garments?",
                      a: "Our hand-loomed luxury couture is made-to-measure. Simply select your closest standard size and complete checkout. Our bespoke tailoring team will contact you within 24 hours to collect exact parameters, or you can request a visual sizing consultation via video call."
                    },
                    {
                      q: "What is the production and shipping timeline?",
                      a: "Standard ready-to-wear orders ship in 5 to 7 business days. Custom tailored bridal wear, wedding lehengas, and hand-done embroidery pieces take between 4 to 6 weeks to weave and stitch before dispatch."
                    },
                    {
                      q: "Where can I retrieve my tracking ID?",
                      a: "Your unique 24-character hexadecimal Order ID is displayed immediately on the checkout success screen and in your order confirmation email. Use it in the 'Track Order' link in our header menu to view fulfillment updates."
                    },
                    {
                      q: "How do I reschedule a video styling appointment?",
                      a: "To reschedule or modify a video consultation, log into your user dashboard drawer and locate 'My Video Consultations.' Click on your appointment or call customer helpline to submit styling adjustments."
                    },
                    {
                      q: "Are custom tailored garments returnable?",
                      a: "Since custom-sized gowns and groom outfits are crafted specifically to your dimensions, they are non-returnable once cutting and weaving commence. Ready-to-wear sizes can be returned in unworn condition within 7 days."
                    }
                  ].map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="border-b border-[#E0DAD0]/60 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                          className="w-full flex justify-between items-center text-left py-2.5 font-sans font-bold text-on-surface text-sm cursor-pointer bg-transparent border-none focus:outline-none"
                        >
                          <span>{faq.q}</span>
                          <span className={`text-primary font-bold text-xs transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <p className="text-on-surface/70 text-xs sm:text-sm mt-1.5 leading-relaxed pr-4 font-sans font-medium">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STORE LOCATOR TAB */}
            {activeTab === 'locator' && (
              <div className="space-y-6">
                <h4 className="font-display text-lg sm:text-xl font-extrabold text-primary mb-6">Our Flagship Salons</h4>
                <p className="text-on-surface/75 mb-6">Experience our couture collections in person. Visit one of our luxurious physical boutique salons for custom measurement draping sessions, premium fabric consultations, and private designer fittings:</p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 bg-[#FCFAF7] border border-[#E0DAD0] rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-secondary tracking-widest">Mumbai Salon (Flagship)</span>
                      <p className="text-xs text-on-surface/85 mt-2 font-sans font-bold">Bespoke Mansion, Colaba Causeway, Mumbai 400001</p>
                      <p className="text-xs text-on-surface/60 mt-1 font-sans">Operational Hours: 11:00 AM - 8:30 PM (Daily)</p>
                    </div>
                  </div>
                  <div className="p-5 bg-[#FCFAF7] border border-[#E0DAD0] rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-secondary tracking-widest">New Delhi Salon</span>
                      <p className="text-xs text-on-surface/85 mt-2 font-sans font-bold">MGB-6 Emporio Court, Vasant Kunj, New Delhi 110070</p>
                      <p className="text-xs text-on-surface/60 mt-1 font-sans">Operational Hours: 10:30 AM - 9:00 PM (Daily)</p>
                    </div>
                  </div>
                  <div className="p-5 bg-[#FCFAF7] border border-[#E0DAD0] rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase text-secondary tracking-widest">London Salon</span>
                      <p className="text-xs text-on-surface/85 mt-2 font-sans font-bold">Mayfair Galleria, 42 New Bond Street, London W1S</p>
                      <p className="text-xs text-on-surface/60 mt-1 font-sans">Operational Hours: 10:00 AM - 7:00 PM (Closed Sundays)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TERMS TAB */}
            {activeTab === 'terms' && (
              <div className="space-y-6">
                <h4 className="font-display text-lg sm:text-xl font-extrabold text-primary mb-6">Terms of Service</h4>
                <p>Welcome to WedCoholic Couture. By accessing our virtual salon and placing orders, you agree to comply with our premium service terms:</p>
                <div className="space-y-3">
                  <p><strong>1. Loom Reservations:</strong> Handcrafted custom orders are put into weavers schedules upon complete authorization of the secure credit card billing.</p>
                  <p><strong>2. Color Variations:</strong> Real silks and hand-done embroidery may bear minor, unique weaver markings or natural dye shifts which establish absolute authenticity.</p>
                  <p><strong>3. Intellectual Property:</strong> All designs, silhouettes, and campaign imagery are copyrighted property of WedCoholic Ltd.</p>
                </div>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h4 className="font-display text-lg sm:text-xl font-extrabold text-primary mb-6">Privacy Policy</h4>
                <p>We honor the privacy of our clientele with absolute discretion. All personal data gathered is managed strictly to service bespoke tailors and secure logistic channels:</p>
                <div className="space-y-3">
                  <p><strong>Data Cryptography:</strong> All address particulars and checkout credentials are encrypted using industry-standard SSL channels.</p>
                  <p><strong>No Selling of Information:</strong> WedCoholic Couture will never sell, lease, or distribute email contacts, phone numbers, or size profiles to third-party marketing firms.</p>
                  <p><strong>Right to Erasure:</strong> Clients can request to delete checkout records and account logs by contacting support care.</p>
                </div>
              </div>
            )}

            {/* REFUNDS TAB */}
            {activeTab === 'refunds' && (
              <div className="space-y-6">
                <h4 className="font-display text-lg sm:text-xl font-extrabold text-primary mb-6">Returns & Refunds</h4>
                <p>Our luxury garments are custom-crafted upon reservation. Please note our refund terms:</p>
                <div className="space-y-3">
                  <p><strong>Bespoke Couture:</strong> Garments crafted to custom client size specifications are non-refundable and non-exchangeable once weaving starts.</p>
                  <p><strong>Ready-To-Wear:</strong> Standard size ready-to-wear items (S, M, L, XL) can be returned within 7 days of delivery in pristine, unworn condition with cryptographic tags intact.</p>
                  <p><strong>Damaged / Defectives:</strong> If a garment carries verified loom shipping defects, notify us within 48 hours for immediate replacement tailoring.</p>
                </div>
              </div>
            )}

            {/* CONTACT TAB */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h4 className="font-display text-lg sm:text-xl font-extrabold text-primary mb-6">Contact Us</h4>
                <p>Our client service counselors are here to guide your wedding wardrobe planning:</p>
                <div className="space-y-4 pt-2">
                  <div>
                    <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">SALES & GENERAL SUPPORT</span>
                    <p className="font-bold text-on-surface">care@wedcoholic.com</p>
                    <p className="text-on-surface/60">Response within 24 hours.</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">BESPOKE TELEPHONE HELPLINE</span>
                    <p className="font-bold text-on-surface">1800-120-000-500 (Toll Free)</p>
                    <p className="text-on-surface/60">Operational 10:00 AM - 7:00 PM IST.</p>
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
