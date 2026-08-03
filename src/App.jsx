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

  const fetchProductsFromSupabase = async () => {
    setLoading(true);
    try {
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
          inStock: item.in_stock
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.error("Failed to load products from DB:", err);
    }
    setLoading(false);
  };

  if (view === 'admin') {
    return (
      <AdminDashboard 
        onGoToStore={() => {
          setView('store');
          fetchProductsFromSupabase(); // Refresh store when returning
        }}
        products={products}
        setProducts={setProducts}
        refreshProducts={fetchProductsFromSupabase}
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

          {loading ? (
            <div className="text-center py-12 font-bold text-stone-500 italic">
              Loading Products Collection...
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