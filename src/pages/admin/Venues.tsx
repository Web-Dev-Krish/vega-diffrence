import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Venues() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    name: '', location: '', capacity: '', price_per_day: '', rating: '', description: '', image_url: ''
  });

  const fetchVenues = async () => {
    const res = await fetch('/api/venues');
    const data = await res.json();
    setVenues(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVenues(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const payload = { ...form, capacity: parseInt(form.capacity), price_per_day: parseFloat(form.price_per_day), rating: parseFloat(form.rating) };
    
    if (editingId) {
      await fetch('/api/venues', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...payload }) });
    } else {
      await fetch('/api/venues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    
    setIsModalOpen(false);
    fetchVenues();
  };

  const editVenue = (v: any) => {
    setForm({ name: v.name, location: v.location, capacity: v.capacity, price_per_day: v.price_per_day, rating: v.rating, description: v.description, image_url: v.image_url });
    setEditingId(v.id);
    setIsModalOpen(true);
  };

  const deleteVenue = async (id: number) => {
    if (!confirm('Delete this venue?')) return;
    await fetch('/api/venues', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchVenues();
  };

  const openNew = () => {
    setForm({ name: '', location: '', capacity: '', price_per_day: '', rating: '', description: '', image_url: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Manage Venues</h1>
        <button onClick={openNew} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#F4D03F]">
          <Plus size={18} /> Add Venue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-gray-500">Loading...</p> : venues.map(v => (
          <div key={v.id} className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden">
            <img src={v.image_url} alt={v.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold text-white truncate">{v.name}</h3>
              <p className="text-sm text-gray-400 mb-4 truncate">{v.location}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#D4AF37] font-semibold">${v.price_per_day}/day</span>
                <div className="flex gap-2">
                  <button onClick={() => editVenue(v)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => deleteVenue(v.id)} className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Venue' : 'Add Venue'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Capacity</label>
                  <input required type="number" className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Price per day ($)</label>
                  <input required type="number" className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.price_per_day} onChange={e => setForm({...form, price_per_day: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Rating</label>
                  <input required type="number" step="0.1" className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea required rows={4} className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg hover:bg-[#F4D03F]">
                {editingId ? 'Update Venue' : 'Create Venue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
