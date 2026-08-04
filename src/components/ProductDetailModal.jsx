import React, { useState, useEffect } from 'react';
import ProductComments from './ProductComments';

const INSTAGRAM_HANDLE = "tannz.official";

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedImage, setSelectedImage] = useState(product.colors?.[0]?.images?.[0] || '');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
      setSelectedImage(product.colors[0].images?.[0] || '');
    }
  }, [product]);

  const handleColorChange = (colorObj) => {
    setSelectedColor(colorObj);
    if (colorObj.images && colorObj.images.length > 0) {
      setSelectedImage(colorObj.images[0]);
    }
  };

  const currentStock = product.stock?.[selectedColor?.name]?.[selectedSize] ?? 0;
  const isOutOfStock = currentStock === 0;

  const handleIncreaseQty = () => {
    if (quantity < currentStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const totalPrice = product.price * quantity;

  // ⚡ DIRECT INSTAGRAM DM CHAT REDIRECT FIX
  const handleBuyNow = () => {
    if (isOutOfStock) return;

    const orderMessage = `Hi TANNZ! I want to order from your website:\n\n📌 Product: ${product.name}\n🎨 Color: ${selectedColor?.name || 'Default'}\n📏 Size: ${selectedSize}\n🔢 Quantity: ${quantity}\n💰 Total Price: ₹${totalPrice.toLocaleString('en-IN')}\n\nPlease share payment details for delivery!`;

    // 1. Copy message text to clipboard
    navigator.clipboard.writeText(orderMessage);
    setCopied(true);

    // 2. Direct DM link (Opens Instagram Chat Box Directly)
    const igDirectUrl = `https://ig.me/m/${INSTAGRAM_HANDLE}`;

    setTimeout(() => {
      window.open(igDirectUrl, '_blank');
      setCopied(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--color-tannz-cream)] text-[var(--color-tannz-dark)] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col my-auto border border-stone-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold text-lg flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto p-4 sm:p-6 gap-6">
          
          {/* LEFT: Multi Image View Gallery */}
          <div className="flex flex-col gap-3">
            <div className="w-full h-80 sm:h-96 bg-stone-200 rounded-xl overflow-hidden shadow-inner relative border border-stone-300">
              <img 
                src={selectedImage || 'https://via.placeholder.com/600'} 
                alt={product.name} 
                className="w-full h-full object-cover object-center"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-red-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-md shadow-lg">
                    Out of Stock ({selectedColor?.name})
                  </span>
                </div>
              )}
            </div>
            
            {/* Gallery Thumbnails */}
            {selectedColor?.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {selectedColor.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-[var(--color-tannz-dark)] scale-105' : 'border-stone-300 opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Controls */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
                {quantity > 1 && (
                  <span className="text-xs text-stone-500 font-medium">
                    (₹{product.price.toLocaleString('en-IN')} × {quantity})
                  </span>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="mt-4">
                {isOutOfStock ? (
                  <span className="inline-block text-xs font-bold text-red-600 uppercase tracking-wider bg-red-100 px-3 py-1 rounded">
                    ✖ Size {selectedSize} ({selectedColor?.name}) is Sold Out
                  </span>
                ) : currentStock <= 3 ? (
                  <span className="inline-block text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded animate-pulse">
                    ⚡ Hurry! Only {currentStock} left in {selectedColor?.name} ({selectedSize})
                  </span>
                ) : (
                  <span className="inline-block text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded">
                    ✓ In Stock ({currentStock} available)
                  </span>
                )}
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-5">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-700">
                    Select Color: <span className="font-bold text-stone-900 ml-1">{selectedColor?.name}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {product.colors.map((col, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleColorChange(col)}
                        className={`group flex items-center gap-2 p-1.5 rounded-xl border-2 transition-all ${
                          selectedColor?.name === col.name 
                            ? 'border-stone-900 bg-stone-200/80 shadow-sm scale-105' 
                            : 'border-stone-300 hover:border-stone-400 bg-white/60'
                        }`}
                      >
                        <span 
                          className="w-6 h-6 rounded-full border border-stone-400 shadow-inner inline-block"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="text-xs font-bold pr-1 text-stone-800">
                          {col.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-700">
                  Select Size:
                </label>
                <div className="flex gap-2">
                  {product.sizes.map((sz) => {
                    const szStock = product.stock?.[selectedColor?.name]?.[sz] ?? 0;
                    return (
                      <button
                        key={sz}
                        onClick={() => {
                          setSelectedSize(sz);
                          setQuantity(1);
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                          selectedSize === sz
                            ? 'bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] shadow-md scale-105'
                            : szStock === 0
                            ? 'bg-stone-200 text-stone-400 line-through cursor-not-allowed'
                            : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="mt-5">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-stone-700">
                    Select Quantity:
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-stone-300 bg-white rounded-xl overflow-hidden shadow-sm">
                      <button 
                        onClick={handleDecreaseQty}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center font-bold text-stone-800 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-extrabold text-sm text-stone-900">
                        {quantity}
                      </span>
                      <button 
                        onClick={handleIncreaseQty}
                        disabled={quantity >= currentStock}
                        className="w-10 h-10 flex items-center justify-center font-bold text-stone-800 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      (Max available: {currentStock})
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Buy Action Button */}
            <div className="mt-6 pt-4 border-t border-stone-300 space-y-2">
              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base tracking-wider uppercase transition-all active:scale-[0.98] ${
                  isOutOfStock
                    ? 'bg-stone-400 text-stone-200 cursor-not-allowed'
                    : copied
                    ? 'bg-emerald-700 text-white scale-105'
                    : 'bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] hover:opacity-95'
                }`}
              >
                <span>
                  {isOutOfStock
                    ? 'Out of Stock'
                    : copied
                    ? '✓ Order Copied! Opening DM...'
                    : `Order on Instagram DM (₹${totalPrice.toLocaleString('en-IN')}) ↗`}
                </span>
              </button>

              {!isOutOfStock && (
                <p className="text-[11px] text-center text-stone-500 font-semibold italic">
                  💡 Order summary copy ho gaya hai, DM khulte hi chat box me bas <b className="text-stone-800">Paste</b> kar do!
                </p>
              )}
            </div>

            <ProductComments productId={product.id} />

          </div>

        </div>
      </div>
    </div>
  );
}