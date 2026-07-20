import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const res = await fetch('/api/testimonials');
    const data = await res.json();
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const deleteReview = async (id: number) => {
    if (!confirm('Delete this review?')) return;
    await fetch('/api/testimonials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchReviews();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Manage Reviews</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-gray-500">Loading...</p> : reviews.map(r => (
          <div key={r.id} className="bg-[#151515] border border-white/10 rounded-xl p-6 relative">
            <button onClick={() => deleteReview(r.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
              <Trash2 size={18} />
            </button>
            <div className="flex text-[#D4AF37] mb-3">
              {[...Array(r.rating)].map((_, i) => <span key={i}>★</span>)}
            </div>
            <p className="text-gray-300 italic mb-4 text-sm">"{r.content}"</p>
            <h4 className="text-white font-semibold">{r.name}</h4>
            <p className="text-xs text-gray-500">{r.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
