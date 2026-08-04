import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard({ onGoToStore, products = [], setProducts, refreshProducts }) {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [fetchingReviews, setFetchingReviews] = useState(false);

  // Edit / Add Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    price: 1899,
    description: '',
    sizes: ['M', 'L', 'XL'],
    colors: [
      {
        name: 'Cream',
        hex: '#F4EFE6',
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
        stock: { M: 10, L: 5, XL: 2 }
      }
    ]
  });

  // Check Supabase Auth Session
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setLoadingSession(false);
        }
      } catch (err) {
        console.error("Auth Session Error:", err);
        if (mounted) setLoadingSession(false);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setLoadingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch Reviews from DB
  useEffect(() => {
    if (session && activeTab === 'reviews') {
      fetchReviews();
    }
  }, [session, activeTab]);

  const fetchReviews = async () => {
    setFetchingReviews(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setReviews(data);
    } catch (err) {
      console.error(err);
    }
    setFetchingReviews(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrorMsg(error.message);
    } catch (err) {
      setErrorMsg("Connection error: " + err.message);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Permanent Delete Product from Supabase DB
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Delete this product permanently from database?")) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (!error) {
        if (refreshProducts) refreshProducts();
        else setProducts(products.filter(p => p.id !== productId));
      } else {
        alert("Delete failed: " + error.message);
      }
    }
  };

  // Permanent Delete Review from Supabase DB
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Delete this review permanently?")) {
      const { error } = await supabase.from('product_reviews').delete().eq('id', reviewId);
      if (!error) setReviews(reviews.filter(r => r.id !== reviewId));
      else alert("Delete failed: " + error.message);
    }
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    const mappedColors = product.colors?.map(c => ({
      name: c.name,
      hex: c.hex || '#000000',
      images: c.images?.length ? c.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
      stock: product.stock?.[c.name] || { M: 5, L: 5, XL: 5 }
    })) || [];

    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      sizes: product.sizes || ['M', 'L', 'XL'],
      colors: mappedColors.length > 0 ? mappedColors : [
        { name: 'Cream', hex: '#F4EFE6', images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'], stock: { M: 5, L: 5, XL: 5 } }
      ]
    });
    setIsProductModalOpen(true);
  };

  const handleOpenAddNew = () => {
    setEditingProduct(null);
    setProductForm({
      id: null,
      name: '',
      price: 1899,
      description: '240 GSM luxury French Terry cotton. Heavyweight oversized fitting.',
      sizes: ['M', 'L', 'XL'],
      colors: [
        {
          name: 'Cream',
          hex: '#F4EFE6',
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
          stock: { M: 10, L: 5, XL: 2 }
        }
      ]
    });
    setIsProductModalOpen(true);
  };

  const handleAddColorRow = () => {
    setProductForm({
      ...productForm,
      colors: [
        ...productForm.colors,
        {
          name: 'New Color',
          hex: '#333333',
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
          stock: { M: 5, L: 5, XL: 0 }
        }
      ]
    });
  };

  const handleRemoveColorRow = (index) => {
    if (productForm.colors.length <= 1) return;
    setProductForm({
      ...productForm,
      colors: productForm.colors.filter((_, i) => i !== index)
    });
  };

  const handleColorFieldChange = (index, field, value) => {
    const updated = [...productForm.colors];
    updated[index][field] = value;
    setProductForm({ ...productForm, colors: updated });
  };

  // ⚡ APPEND NEW UPLOADED IMAGES TO EXISTING LIST
  const handleImageFileUpload = (colorIndex, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const readFiles = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readFiles).then(newBase64Images => {
      const updated = [...productForm.colors];
      const existingImages = updated[colorIndex].images || [];
      // Combine old images + new images
      updated[colorIndex].images = [...existingImages, ...newBase64Images];
      setProductForm({ ...productForm, colors: updated });
    });
    // Reset input value to allow uploading same image if needed
    e.target.value = null;
  };

  // ⚡ INDIVIDUAL DUSTBIN DELETE FOR A SINGLE IMAGE SLOT
  const handleRemoveSingleImage = (colorIndex, imageIndex) => {
    const updated = [...productForm.colors];
    updated[colorIndex].images = updated[colorIndex].images.filter((_, idx) => idx !== imageIndex);
    setProductForm({ ...productForm, colors: updated });
  };

  const handleColorStockChange = (colorIndex, size, qty) => {
    const updated = [...productForm.colors];
    updated[colorIndex].stock = {
      ...updated[colorIndex].stock,
      [size]: Math.max(0, qty)
    };
    setProductForm({ ...productForm, colors: updated });
  };

  // Permanent Save (INSERT or UPDATE) to Supabase Database
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);

    const formattedColors = productForm.colors.map(c => ({
      name: c.name,
      hex: c.hex,
      images: c.images.length > 0 ? c.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800']
    }));

    const formattedStockObj = {};
    productForm.colors.forEach(c => {
      formattedStockObj[c.name] = c.stock;
    });

    const dbPayload = {
      name: productForm.name,
      price: Number(productForm.price),
      description: productForm.description,
      sizes: productForm.sizes,
      colors: formattedColors,
      stock: formattedStockObj,
      in_stock: true
    };

    if (editingProduct) {
      // UPDATE in Supabase
      const { error } = await supabase
        .from('products')
        .update(dbPayload)
        .eq('id', productForm.id);

      if (error) {
        alert("Update failed: " + error.message);
      }
    } else {
      // INSERT into Supabase
      const { error } = await supabase
        .from('products')
        .insert([dbPayload]);

      if (error) {
        alert("Save failed: " + error.message);
      }
    }

    setSavingProduct(false);
    if (refreshProducts) refreshProducts();
    setIsProductModalOpen(false);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[var(--color-tannz-cream)] flex items-center justify-center font-bold text-stone-700">
        Loading TANNZ Portal...
      </div>
    );
  }

  // LOGIN SCREEN (Supabase Auth Protected)
  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--color-tannz-cream)] text-[var(--color-tannz-dark)] flex flex-col justify-between p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto w-full">
          <h1 className="font-serif text-2xl font-bold tracking-widest">T A N N Z</h1>
          <button onClick={onGoToStore} className="text-xs font-bold uppercase tracking-wider underline hover:opacity-80">
            ← Back to Store
          </button>
        </div>

        <div className="max-w-md w-full mx-auto bg-white/70 backdrop-blur-md p-8 rounded-2xl border border-stone-300 shadow-xl my-12">
          <div className="text-center mb-6">
            <h2 className="font-serif text-3xl font-bold tracking-tight">Admin Portal</h2>
            <p className="text-xs text-stone-600 uppercase tracking-widest mt-1">
              Authorized Personnel Access Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-stone-700">Admin Email</label>
              <input 
                type="email"
                required
                placeholder="admin@tannz.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-stone-700">Password</label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-xs font-medium focus:outline-none focus:border-stone-900"
              />
            </div>

            <button 
              type="submit"
              disabled={authLoading}
              className="w-full bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-md"
            >
              {authLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs font-bold text-red-600 text-center mt-4 bg-red-100 p-2.5 rounded-lg border border-red-200">
              {errorMsg}
            </p>
          )}
        </div>

        <div className="text-center text-xs text-stone-500">
          © 2026 TANNZ APPAREL Console
        </div>
      </div>
    );
  }

  // LOGGED IN ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[var(--color-tannz-cream)] text-[var(--color-tannz-dark)] flex flex-col justify-between">
      
      {/* Header */}
      <header className="border-b border-stone-300 bg-white/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl font-bold tracking-widest">T A N N Z</h1>
            <span className="bg-stone-200 text-stone-800 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="hidden sm:inline text-stone-600">
              Logged as: <b className="text-stone-900">{session?.user?.email}</b>
            </span>
            <button 
              onClick={onGoToStore} 
              className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            >
              View Store
            </button>
            <button 
              onClick={handleLogout} 
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-stone-300 pb-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'inventory'
                  ? 'bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] shadow-md'
                  : 'bg-stone-200/70 text-stone-700 hover:bg-stone-300'
              }`}
            >
              📦 Product Inventory ({products.length})
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'reviews'
                  ? 'bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] shadow-md'
                  : 'bg-stone-200/70 text-stone-700 hover:bg-stone-300'
              }`}
            >
              💬 Customer Reviews
            </button>
          </div>

          {activeTab === 'inventory' && (
            <button 
              onClick={handleOpenAddNew}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>+ Add New Product</span>
            </button>
          )}
        </div>

        {/* TAB 1: PRODUCT INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white/70 border border-stone-300 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between p-5">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={product.colors?.[0]?.images?.[0] || 'https://via.placeholder.com/100'} 
                      alt={product.name} 
                      className="w-20 h-24 object-cover rounded-xl border border-stone-200"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-lg leading-tight text-stone-900">{product.name}</h3>
                      <p className="text-sm font-extrabold text-stone-800 mt-1">₹{product.price?.toLocaleString('en-IN')}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-stone-500 font-bold">Colors:</span>
                        {product.colors?.map((col, idx) => (
                          <span 
                            key={idx} 
                            className="w-3.5 h-3.5 rounded-full border border-stone-400 inline-block" 
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4 pt-4 border-t border-stone-200">
                    {product.colors?.map((col) => (
                      <div key={col.name} className="bg-stone-100 p-2.5 rounded-xl border border-stone-200 text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-stone-400" style={{ backgroundColor: col.hex }}></span>
                            <span className="font-bold text-stone-800">{col.name}</span>
                          </div>
                          <span className="text-[10px] text-stone-500 font-bold">{col.images?.length || 1} Photo(s)</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {product.sizes?.map((sz) => {
                            const qty = product.stock?.[col.name]?.[sz] ?? 0;
                            return (
                              <div key={sz} className="bg-white px-2 py-1 rounded border border-stone-300 flex items-center justify-between">
                                <span className="font-bold text-stone-600">{sz}:</span>
                                <span className={`font-extrabold ${qty === 0 ? 'text-red-600' : 'text-stone-900'}`}>{qty}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200 flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(product)}
                    className="flex-1 py-2 bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90"
                  >
                    Edit Details
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: CUSTOMER REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="bg-white/70 border border-stone-300 rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold mb-4">Moderate Customer Reviews</h2>
            {fetchingReviews ? (
              <p className="text-xs text-stone-500 italic py-4">Loading reviews from Supabase DB...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-4">No reviews submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-300 text-stone-600 uppercase font-bold">
                      <th className="p-3">Customer</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Comment</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {reviews.map((rev) => (
                      <tr key={rev.id}>
                        <td className="p-3 font-bold">{rev.client_name}</td>
                        <td className="p-3 text-stone-600">{rev.client_location || 'India'}</td>
                        <td className="p-3 text-amber-500 font-bold">{"★".repeat(rev.rating)}</td>
                        <td className="p-3 text-stone-800">{rev.comment}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleDeleteReview(rev.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded font-bold text-[10px]"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--color-tannz-cream)] text-[var(--color-tannz-dark)] w-full max-w-3xl rounded-2xl p-6 relative border border-stone-300 my-auto shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 font-bold text-sm"
            >
              ✕
            </button>

            <h2 className="font-serif text-2xl font-bold mb-4">
              {editingProduct ? 'Edit Product & Database Record' : 'Add New Product to Database'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">Product Title *</label>
                  <input 
                    type="text" 
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">Description</label>
                <textarea 
                  rows="2"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium resize-none"
                />
              </div>

              <div className="pt-2 border-t border-stone-300">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold uppercase text-stone-800 text-sm">Color Variants & Photos</h3>
                  <button 
                    type="button"
                    onClick={handleAddColorRow}
                    className="px-3 py-1.5 bg-stone-800 text-white rounded-lg font-bold text-[11px]"
                  >
                    + Add Color
                  </button>
                </div>

                <div className="space-y-4">
                  {productForm.colors.map((col, cIdx) => (
                    <div key={cIdx} className="bg-white/80 p-4 rounded-xl border border-stone-300 space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-bold">Variant #{cIdx + 1}</span>
                        {productForm.colors.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveColorRow(cIdx)}
                            className="text-red-600 font-bold text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1">Color Name</label>
                          <input 
                            type="text"
                            required
                            value={col.name}
                            onChange={(e) => handleColorFieldChange(cIdx, 'name', e.target.value)}
                            className="w-full p-2 rounded-lg border border-stone-300 bg-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold mb-1">Hex Code</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color"
                              value={col.hex}
                              onChange={(e) => handleColorFieldChange(cIdx, 'hex', e.target.value)}
                              className="w-9 h-9 rounded cursor-pointer border p-0.5"
                            />
                            <input 
                              type="text"
                              required
                              value={col.hex}
                              onChange={(e) => handleColorFieldChange(cIdx, 'hex', e.target.value)}
                              className="w-full p-2 rounded-lg border border-stone-300 bg-white font-bold uppercase"
                            />
                          </div>
                        </div>
                      </div>

                      {/* ⚡ MULTI-SLOT IMAGE MANAGER WITH INDIVIDUAL DUSTBIN DELETE */}
                      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block font-bold text-stone-800">
                            Photo Slots ({col.images?.length || 0} Photos)
                          </label>
                          <label className="cursor-pointer bg-stone-800 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-stone-900 transition-colors">
                            + Add Image Slot
                            <input 
                              type="file" 
                              accept="image/*"
                              multiple
                              onChange={(e) => handleImageFileUpload(cIdx, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Image Preview Slots Grid */}
                        {col.images?.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
                            {col.images.map((imgSrc, imgIdx) => (
                              <div key={imgIdx} className="relative group border border-stone-300 rounded-lg overflow-hidden bg-white shadow-sm">
                                <img 
                                  src={imgSrc} 
                                  alt={`slot-${imgIdx}`} 
                                  className="w-full h-20 object-cover" 
                                />
                                {/* 🗑️ DUSTBIN DELETE BUTTON */}
                                <button
                                  type="button"
                                  title="Delete image"
                                  onClick={() => handleRemoveSingleImage(cIdx, imgIdx)}
                                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-transform hover:scale-110"
                                >
                                  🗑️
                                </button>
                                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-bold">
                                  #{imgIdx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-stone-500 italic py-2">No photos added yet. Click above to upload.</p>
                        )}
                      </div>

                      <div className="bg-stone-100 p-2.5 rounded-lg border">
                        <span className="block font-bold text-stone-700 mb-1">Stock ({col.name}):</span>
                        <div className="grid grid-cols-3 gap-2">
                          {['M', 'L', 'XL'].map((sz) => (
                            <div key={sz} className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                              <span className="font-bold">{sz}:</span>
                              <input 
                                type="number" 
                                min="0" 
                                value={col.stock?.[sz] ?? 0}
                                onChange={(e) => handleColorStockChange(cIdx, sz, Number(e.target.value))}
                                className="w-12 text-center font-bold bg-stone-100 rounded border"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-stone-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingProduct}
                  className="px-6 py-2 bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] rounded-xl font-bold"
                >
                  {savingProduct ? 'Saving to DB...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-300 py-4 text-center text-xs text-stone-500 bg-white/30">
        TANNZ Luxury Apparel © 2026 Management Console
      </footer>
    </div>
  );
}