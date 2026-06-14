import React, { useState } from 'react';
import { ArrowRight, Globe, MessageSquare, Video, Share2 } from 'lucide-react';

export default function Footer({
  onCategorySelect,
  onConsultationClick,
  onStoreLocatorClick,
  onTrackOrderClick,
  onPolicyClick,
}) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-on-surface text-white py-16 mt-16 font-sans border-t border-[#C5A880]/20 select-none">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        
        {/* Brand & Newsletter Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-10">
          <div>
            <h3 className="font-display text-3xl font-extrabold text-[#C5A880] tracking-wide mb-4">
              WedCoholic
            </h3>
            <p className="text-white/60 max-w-xs text-xs sm:text-sm leading-relaxed">
              Timeless elegance and contemporary silhouettes for your most special occasions. Handcrafted with ancestral precision and modern customization.
            </p>
          </div>

          <div className="w-full max-w-md">
            <h4 className="font-display text-lg sm:text-xl font-bold mb-3 text-[#FCFAF7]">
              Subscribe to our Newsletter
            </h4>
            <form onSubmit={handleSubscribe} className="relative border-b border-white/20 flex items-center mb-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-3 pl-1 pr-10 outline-none border-none text-white text-xs sm:text-sm placeholder-white/40 focus:placeholder-transparent transition-all"
                placeholder="Enter Email Address"
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-[#C5A880] transition-colors bg-transparent border-none cursor-pointer"
                title="Subscribe Now"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {subscribed && (
              <span className="text-[10px] font-sans font-bold text-[#C5A880] uppercase tracking-widest animate-fade-in block">
                ✓ Gracefully registered! Welcome to WedCoholic.
              </span>
            )}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16 border-t border-white/10 pt-12">
          <div className="flex flex-col gap-3">
            <h5 className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-2">CATEGORIES</h5>
            <button onClick={() => onCategorySelect('Men')} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Groom Dressing
            </button>
            <button onClick={() => onCategorySelect('Lehengas')} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Bridal Lehengas
            </button>
            <button onClick={() => onCategorySelect('Wedding')} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Wedding Collections
            </button>
            <button onClick={() => onCategorySelect('Kids')} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Royal Kidswear
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-2">SUPPORT</h5>
            <button onClick={onTrackOrderClick} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Track Order
            </button>
            <button onClick={() => onPolicyClick('contact')} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Contact Us
            </button>
            <button onClick={onStoreLocatorClick} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Store Locator
            </button>
            <button onClick={onConsultationClick} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans font-bold text-secondary">
              Book a Video Call
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-2">OUR POLICIES</h5>
            <button onClick={() => onPolicyClick('faq')} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              FAQs
            </button>
            <button onClick={() => onPolicyClick('terms')} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Terms of Use
            </button>
            <button onClick={() => onPolicyClick('privacy')} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Privacy Policy
            </button>
            <button onClick={() => onPolicyClick('refunds')} className="text-left text-white/70 hover:text-[#C5A880] transition-colors text-xs sm:text-sm bg-transparent border-none cursor-pointer p-0 font-sans">
              Returns & Refunds
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-2">CONTACT</h5>
            <p className="text-xs sm:text-sm text-white/60 font-medium">care@wedcoholic.com</p>
            <p className="text-xs sm:text-sm text-white/60 font-bold">1800-120-000-500</p>
          </div>

          <div className="flex flex-col gap-4 select-none">
            <h5 className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-2">KEEP IN TOUCH</h5>
            <div className="flex gap-4">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#C5A880] transition-colors" title="X (Twitter)">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#C5A880] transition-colors" title="Instagram">
                <svg className="w-4.5 h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://wedcoholic.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#C5A880] transition-colors" title="Website">
                <Globe className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex justify-center items-center">
          <div className="text-xs text-white/40 tracking-wider text-center select-none">
            © 2026 WedCoholic Ltd. All rights reserved. 100% Secure Payments.
            <span className="text-primary font-bold ml-2">Developed by ~Team Selenophile</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
