import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Hero({ onShopClick, slides: apiSlides }) {
  const defaultSlides = [
    {
      image: '/images/hero/home.webp',
      title: 'Regal Couture'
    },
    {
      image: '/images/hero/1774874343974the-wedding.jpg',
      title: 'Ancestral Weaving'
    },
    {
      image: '/images/hero/1774946941021the-wedding.avif',
      title: 'Bespoke Collections'
    }
  ];

  const slides = apiSlides && apiSlides.length > 0 ? apiSlides : defaultSlides;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto scroll timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full h-[50vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] overflow-hidden bg-on-surface select-none">
      
      {/* Slides Carousel with top-view image alignment */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            alt={slides[currentIndex].title}
            className="w-full h-full object-cover object-top" // Forces top-view (faces & collars visible)
            src={slides[currentIndex].image}
          />
        </AnimatePresence>
        
        {/* Soft elegant gradient overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-l from-on-surface/40 via-on-surface/10 to-transparent"></div>
        <div className="absolute inset-0 bg-on-surface/20"></div>
      </div>



      {/* Slide dots at the bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all ${
              currentIndex === idx ? 'w-6 bg-[#C5A880]' : 'bg-white/40'
            }`}
          ></button>
        ))}
      </div>

    </section>
  );
}
