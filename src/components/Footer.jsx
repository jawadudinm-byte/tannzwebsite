import React from 'react';

const INSTAGRAM_HANDLE = "tannz.official";

export default function Footer({ onOpenAdmin }) {
  return (
    <footer className="mt-16 border-t border-stone-300 bg-[var(--color-tannz-cream)] text-[var(--color-tannz-dark)] pt-10 pb-8 text-xs">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-300/70">
        
        {/* Brand Info */}
        <div>
          <h4 className="font-serif text-lg font-bold tracking-widest mb-2">T A N N Z</h4>
          <p className="text-stone-600 leading-relaxed">
            Delivering high-density luxury streetwear across India. Minimalist aesthetics engineered for daily comfort.
          </p>
        </div>

        {/* Policy Details */}
        <div>
          <h5 className="font-bold uppercase tracking-wider mb-2 text-stone-800">Delivery & Policy</h5>
          <ul className="space-y-1.5 text-stone-600">
            <li>• Express All India Delivery</li>
            <li>• Pre-Payment Direct Orders Only</li>
            <li>• Direct WhatsApp / IG DM Confirmation</li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h5 className="font-bold uppercase tracking-wider mb-2 text-stone-800">Social</h5>
          <a 
            href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] rounded-md font-bold text-[11px] uppercase tracking-wider hover:opacity-90"
          >
            Instagram Profile ↗
          </a>
        </div>

      </div>

      {/* Management Portal Link Button */}
      <div className="max-w-6xl mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px] gap-2">
        <p>© 2026 TANNZ APPAREL. All rights reserved.</p>
        
        {/* 👈 Explicit click handler trigger */}
        <button 
          onClick={onOpenAdmin}
          className="text-stone-600 hover:text-stone-900 font-bold underline transition-colors cursor-pointer py-1 px-2"
        >
          Management Portal ⚙️
        </button>
      </div>
    </footer>
  );
}