import React from 'react';

const INSTAGRAM_HANDLE = "tannz.official"; // Update with your IG handle

export default function Navbar() {
  return (
    <header className="border-b border-stone-300 bg-[var(--color-tannz-cream)] text-[var(--color-tannz-dark)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col items-center justify-center">
        {/* Brand Name */}
        <h1 className="text-3xl font-serif tracking-[0.25em] font-bold text-center">
          T A N N Z
        </h1>
        
        {/* Subtitle */}
        <p className="text-[10px] tracking-[0.3em] uppercase text-stone-600 mt-1 font-medium">
          EST. 2024 • FINE APPAREL
        </p>

        {/* Action Bar */}
        <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-stone-200 text-xs tracking-wider uppercase">
          <span className="font-semibold text-stone-700">Collection</span>
          <a
            href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] hover:opacity-90 transition-opacity font-medium"
          >
            {/* Native Clean Instagram SVG */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </header>
  );
}