import React, { useState } from 'react';

export default function ProductCard({ product, onSelect }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Safe fallback image handling
  const mainImage = product.colors?.[0]?.images?.[0] || 'https://via.placeholder.com/600';

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group cursor-pointer border border-stone-200 rounded-xl overflow-hidden bg-white/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Product Image Container */}
        <div className="w-full h-80 sm:h-96 bg-stone-200/70 overflow-hidden relative">
          
          {/* Fast Skeleton effect when image is downloading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-stone-300/60 animate-pulse" />
          )}

          <img 
            src={mainImage} 
            alt={product.name} 
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {!product.inStock && (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded z-10">
              Out of Stock
            </span>
          )}
        </div>

        {/* Info Area */}
        <div className="p-4 sm:p-5">
          <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[var(--color-tannz-dark)]">
            {product.name}
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer Area */}
      <div className="px-4 sm:px-5 pb-5 pt-2 flex items-center justify-between border-t border-stone-200/60 mt-2">
        <span className="font-extrabold text-lg sm:text-xl text-[var(--color-tannz-dark)]">
          ₹{product.price.toLocaleString('en-IN')}
        </span>
        <button className="px-4 py-2 bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] text-xs font-bold uppercase tracking-wider rounded-lg group-hover:opacity-90 transition-opacity">
          View Details
        </button>
      </div>
    </div>
  );
}