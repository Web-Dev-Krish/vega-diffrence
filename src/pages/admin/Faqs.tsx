import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Faqs() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({ question: '', answer: '' });

  const fetchFaqs = async () => {
    const res = await fetch('/api/faqs');
    const data = await res.json();
    setFaqs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFaqs(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (editingId) {
      await fetch('/api/faqs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...form }) });
    } else {
      await fetch('/api/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setIsModalOpen(false);
    fetchFaqs();
  };

  const editFaq = (v: any) => {
    setForm({ question: v.question, answer: v.answer });
    setEditingId(v.id);
    setIsModalOpen(true);
  };

  const deleteFaq = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return;
    await fetch('/api/faqs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchFaqs();
  };

  const openNew = () => {
    setForm({ question: '', answer: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Manage FAQs</h1>
        <button onClick={openNew} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#F4D03F]">
          <Plus size={18} /> Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {loading ? <p className="text-gray-500">Loading...</p> : faqs.map(faq => (
          <div key={faq.id} className="bg-[#151515] border border-white/10 rounded-xl p-6 flex justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => editFaq(faq)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded"><Edit2 size={16} /></button>
              <button onClick={() => deleteFaq(faq.id)} className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 rounded"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-white/10 rounded-xl w-full max-w-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Question</label>
                <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.question} onChange={e => setForm({...form, question: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Answer</label>
                <textarea required rows={5} className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg hover:bg-[#F4D03F]">
                {editingId ? 'Update FAQ' : 'Save FAQ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
