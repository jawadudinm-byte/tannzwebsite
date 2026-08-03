import React from 'react';

const REVIEWS = [
  {
    id: 1,
    name: "Amaan K.",
    rating: 5,
    text: "The fabric quality is unreal. High-end oversized fitting and perfect cream tone.",
    verified: true
  },
  {
    id: 2,
    name: "Saif R.",
    rating: 5,
    text: "Delivery was fast, fabric feeling is super premium. Will order again!",
    verified: true
  },
  {
    id: 3,
    name: "Zaid M.",
    rating: 5,
    text: "Best heavyweight tee I have bought locally. Stitched to perfection.",
    verified: true
  }
];

export default function ReviewSection() {
  return (
    <section className="mt-16 sm:mt-24 border-t border-stone-300 pt-12 pb-8">
      <div className="text-center mb-8">
        <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
          Client Feedback
        </h3>
        <p className="text-stone-600 text-xs tracking-widest uppercase mt-1">
          Verified Buyers & Fitting Reviews
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((rev) => (
          <div 
            key={rev.id} 
            className="p-5 rounded-xl border border-stone-200 bg-white/50 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex text-amber-500 mb-2">
                {"★".repeat(rev.rating)}
              </div>
              <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                "{rev.text}"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-900">{rev.name}</span>
              {rev.verified && (
                <span className="text-emerald-700 text-[10px] uppercase font-bold tracking-wider">
                  ✓ Verified Order
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}