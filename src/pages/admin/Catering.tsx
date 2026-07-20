import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Catering() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({ name: '', category: '', type: 'Veg', image_url: '' });

  const fetchItems = async () => {
    const res = await fetch('/api/catering');
    const data = await res.json();
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (editingId) {
      await fetch('/api/catering', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...form }) });
    } else {
      await fetch('/api/catering', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setIsModalOpen(false);
    fetchItems();
  };

  const editItem = (v: any) => {
    setForm({ name: v.name, category: v.category, type: v.type, image_url: v.image_url });
    setEditingId(v.id);
    setIsModalOpen(true);
  };

  const deleteItem = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    await fetch('/api/catering', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchItems();
  };

  const openNew = () => {
    setForm({ name: '', category: '', type: 'Veg', image_url: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Menu Management</h1>
        <button onClick={openNew} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#F4D03F]">
          <Plus size={18} /> Add Dish
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? <p className="text-gray-500">Loading...</p> : items.map(v => (
          <div key={v.id} className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden group">
            <div className="relative h-40">
              <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${v.type === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-white truncate">{v.name}</h3>
              <p className="text-xs text-gray-400 mb-3">{v.category}</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => editItem(v)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 rounded"><Edit2 size={14} /></button>
                <button onClick={() => deleteItem(v.id)} className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-white/10 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Dish' : 'Add Dish'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Dish Name</label>
                <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category (e.g. Indian)</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg hover:bg-[#F4D03F]">
                {editingId ? 'Update Dish' : 'Add Dish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
