import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import ReviewSection from './components/ReviewSection';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './lib/supabase';

export default function App() {
  const [view, setView] = useState('store');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 1. Fetch Live Products from Supabase DB on Mount
  useEffect(() => {
    fetchProductsFromSupabase();
  }, []);

  const fetchProductsFromSupabase = async (forceRefresh = false) => {
    // ⚡ INSTANT LOAD: Pehle LocalStorage se cached data load karein
    if (!forceRefresh) {
      const cached = localStorage.getItem('tannz_products_data');
      if (cached) {
        setProducts(JSON.parse(cached));
        setLoading(false);
      }
    } else {
      setLoading(true);
    }

    try {
      // Full select taaki images wali 'colors' array accurate aaye
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data) {
        // Map database columns to app state
        const mapped = data.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          description: item.description,
          sizes: item.sizes || ['M', 'L', 'XL'],
          colors: item.colors || [],
          stock: item.stock || {},
          inStock: item.in_stock,
          image_url: item.image_url || item.colors?.[0]?.images?.[0] || ''
        }));

        setProducts(mapped);
        // Cache update karein taaki next reload par Zero Wait time ho
        localStorage.setItem('tannz_products_data', JSON.stringify(mapped));
      }
    } catch (err) {
      console.error("Failed to load products from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'admin') {
    return (
      <AdminDashboard 
        onGoToStore={() => {
          setView('store');
          fetchProductsFromSupabase(true); // Admin se wapas aane par fresh data load karein
        }}
        products={products}
        setProducts={setProducts}
        refreshProducts={() => fetchProductsFromSupabase(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-tannz-cream)] text-[var(--color-tannz-dark)] font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
              Curated Fine Collection
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-2 tracking-widest uppercase">
              Heavyweight Apparel Built for Everyday Luxury
            </p>
          </div>

          {loading && products.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-8">
              {/* Bouncing Dots Loading Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-stone-600 font-semibold text-base sm:text-lg tracking-wide">
                  Loading Products
                </span>
                <div className="flex space-x-1.5 items-end h-4">
                  <div className="w-2 h-2 bg-stone-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-stone-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-stone-700 rounded-full animate-bounce"></div>
                </div>
              </div>

              {/* Skeleton Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="animate-pulse bg-stone-200/70 rounded-2xl h-80 w-full"></div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 font-bold text-stone-500">
              No products listed yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {products.map((prod) => (
                <ProductCard 
                  key={prod.id} 
                  product={prod} 
                  onSelect={(p) => setSelectedProduct(p)} 
                />
              ))}
            </div>
          )}

          <ReviewSection />
        </main>
      </div>

      <Footer onOpenAdmin={() => setView('admin')} />

      {selectedProduct && (
        <ProductDetailModal 
          product={products.find((p) => p.id === selectedProduct.id)} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}