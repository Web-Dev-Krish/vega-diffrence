import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({
    title: '', type: '', venue_name: '', date: '', description: '', image_url: ''
  });

  const fetchEvents = async () => {
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (editingId) {
      await fetch('/api/events', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...form }) });
    } else {
      await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setIsModalOpen(false);
    fetchEvents();
  };

  const editEvent = (v: any) => {
    setForm({ title: v.title, type: v.type, venue_name: v.venue_name, date: v.date.split('T')[0], description: v.description, image_url: v.image_url });
    setEditingId(v.id);
    setIsModalOpen(true);
  };

  const deleteEvent = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    await fetch('/api/events', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchEvents();
  };

  const openNew = () => {
    setForm({ title: '', type: '', venue_name: '', date: '', description: '', image_url: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Manage Events</h1>
        <button onClick={openNew} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#F4D03F]">
          <Plus size={18} /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-gray-500">Loading...</p> : events.map(v => (
          <div key={v.id} className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden">
            <img src={v.image_url} alt={v.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="text-xs text-[#D4AF37] uppercase tracking-wider mb-1">{v.type}</div>
              <h3 className="text-lg font-bold text-white truncate">{v.title}</h3>
              <p className="text-sm text-gray-400 mb-4 truncate">{v.venue_name}</p>
              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <span className="text-sm text-gray-300">{new Date(v.date).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button onClick={() => editEvent(v)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => deleteEvent(v.id)} className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 rounded"><Trash2 size={16} /></button>
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
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Event' : 'Add Event'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category (e.g. Wedding)</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Venue Name</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.venue_name} onChange={e => setForm({...form, venue_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input required type="date" className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea required rows={4} className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg hover:bg-[#F4D03F]">
                {editingId ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
