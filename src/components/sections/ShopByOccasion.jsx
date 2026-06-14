import React from 'react';
import { motion } from 'motion/react';

export default function ShopByOccasion({ selectedOccasion, onOccasionSelect, customOccasions }) {
  const defaultOccasionsList = [
    { 
      name: 'The Wedding', 
      label: 'The Wedding', 
      img: '/images/hero/1774946941021the-wedding.avif', 
      gridClass: 'md:row-span-2 md:col-span-1 h-full min-h-[300px]' 
    },
    { 
      name: 'Sangeet', 
      label: 'Sangeet Soirée', 
      img: '/images/occasions/1774947292365mehandi.avif', 
      gridClass: 'md:col-span-1 md:row-span-1 h-full' 
    },
    { 
      name: 'Haldi Rasam', 
      label: 'Haldi Rasam', 
      img: '/images/products/1774861981073groom-essentials.webp', 
      gridClass: 'md:col-span-1 md:row-span-1 h-full' 
    },
    { 
      name: 'Mehendi Moments', 
      label: 'Mehendi Moments', 
      img: '/images/occasions/1774947292365mehandi.avif', 
      gridClass: 'md:col-span-1 md:row-span-1 h-full' 
    },
    { 
      name: 'Reception', 
      label: 'Reception & Roka Ceremony', 
      img: '/images/occasions/1774948127503reception.avif', 
      gridClass: 'md:col-span-1 md:row-span-1 h-full' 
    }
  ];

  const occasionsList = customOccasions && customOccasions.length > 0 ? customOccasions : defaultOccasionsList;

  return (
    <section className="py-12 bg-white border-b border-[#E0DAD0]/30 select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10">
        <div className="text-center mb-8">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-sans font-bold text-secondary">CURATED SEGMENTS</span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface mt-1 font-semibold">Shop By Occasion</h2>
          <div className="h-[2px] w-12 bg-primary mx-auto mt-2"></div>
        </div>

        {/* 3-Column, 2-Row Grid layout on desktop with a fixed container height of 420px to dynamically align rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-3 max-w-5xl mx-auto md:h-[420px]">
          {occasionsList.map((occ) => (
            <motion.div
              key={occ.label}
              whileHover={{ y: -3 }}
              onClick={() => onOccasionSelect(occ.name)}
              className={`group cursor-pointer rounded-2xl overflow-hidden transition-all flex flex-col relative ${occ.gridClass} ${
                selectedOccasion === occ.name ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              {/* Dynamic Image Container stretching to parent cell height with no borders / padding */}
              <div className="w-full relative overflow-hidden rounded-2xl bg-neutral-100 flex-1 min-h-[160px] md:min-h-0">
                <img 
                  alt={occ.label}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  src={occ.img}
                />
                
                {/* Text sits directly on image with no card background, utilizing a gradient backdrop for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent transition-opacity group-hover:opacity-90"></div>
                
                {/* Text overlay styled inside the card bottom */}
                <div className="absolute bottom-4 left-0 right-0 text-center px-4 z-10">
                  <span className="font-sans text-[11px] sm:text-xs uppercase font-bold tracking-widest text-white drop-shadow-md">
                    {occ.label}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {selectedOccasion !== 'All' && (
          <div className="text-center mt-8">
            <button
              onClick={() => onOccasionSelect('All')}
              className="text-xs font-sans font-bold text-primary hover:underline bg-transparent border-none cursor-pointer uppercase tracking-widest"
            >
              Clear Occasion Selection
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
