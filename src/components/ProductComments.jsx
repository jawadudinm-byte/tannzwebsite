import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ADMIN_PASSCODE = "tannz123"; // 👈 Admin Passcode for deleting reviews

export default function ProductComments({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    client_name: '',
    client_location: '',
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.comment) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('product_reviews')
      .insert([
        {
          product_id: productId,
          client_name: formData.client_name,
          client_location: formData.client_location || 'India',
          rating: Number(formData.rating),
          comment: formData.comment
        }
      ]);

    if (!error) {
      setSubmittedMessage('✓ Thank you! Your review has been posted.');
      setFormData({ client_name: '', client_location: '', rating: 5, comment: '' });
      fetchComments();
    }
    setSubmitting(false);
  };

  // Admin Delete Review Handler
  const handleDeleteReview = async (reviewId) => {
    const inputCode = prompt("Enter Admin Passcode to delete this review:");
    if (inputCode === ADMIN_PASSCODE) {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (!error) {
        alert("Review deleted successfully!");
        fetchComments(); // Refresh list
      } else {
        alert("Failed to delete review: " + error.message);
      }
    } else if (inputCode !== null) {
      alert("Incorrect Admin Passcode!");
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-stone-300">
      <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight mb-4 text-stone-900">
        Customer Reviews & Questions ({reviews.length})
      </h3>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="bg-stone-200/50 p-4 rounded-xl border border-stone-300/70 mb-6 space-y-3">
        <p className="text-xs font-bold uppercase text-stone-700 tracking-wider">Leave a Review or Ask a Question</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your Full Name *"
            required
            value={formData.client_name}
            onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-stone-800"
          />
          <input
            type="text"
            placeholder="Your City / Location (e.g. Hyderabad)"
            value={formData.client_location}
            onChange={(e) => setFormData({ ...formData, client_location: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-stone-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-700">Rating:</label>
          <select
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            className="px-2 py-1 text-xs rounded border border-stone-300 bg-white font-bold text-amber-600"
          >
            <option value="5">★★★★★ (5/5)</option>
            <option value="4">★★★★☆ (4/5)</option>
            <option value="3">★★★☆☆ (3/5)</option>
          </select>
        </div>

        <textarea
          placeholder="Share your fitting experience or ask about fabric quality..."
          required
          rows="3"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-stone-800 resize-none"
        />

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-[var(--color-tannz-dark)] text-[var(--color-tannz-cream)] rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          {submitting ? 'Posting...' : 'Post Review'}
        </button>

        {submittedMessage && (
          <p className="text-xs font-semibold text-emerald-700 mt-1">{submittedMessage}</p>
        )}
      </form>

      {/* Reviews List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-xs text-stone-500 italic">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-stone-500 italic">No reviews yet. Be the first to leave a feedback!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-3 bg-white/70 rounded-lg border border-stone-200 text-xs space-y-1.5 relative group">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">
                  {rev.client_name} <span className="font-normal text-stone-500">({rev.client_location})</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">{"★".repeat(rev.rating)}</span>
                  
                  {/* Admin Delete Action */}
                  <button 
                    onClick={() => handleDeleteReview(rev.id)}
                    title="Delete Review (Admin)"
                    className="text-[10px] text-red-500 hover:text-red-700 underline font-semibold ml-2 opacity-80 hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-stone-700 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}