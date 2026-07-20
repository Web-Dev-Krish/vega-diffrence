import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({ title: '', category: '', author: '', content: '', image_url: '' });

  const fetchBlogs = async () => {
    const res = await fetch('/api/blogs');
    const data = await res.json();
    setBlogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const payload = { ...form, published_at: new Date().toISOString() };
    if (editingId) {
      await fetch('/api/blogs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...payload }) });
    } else {
      await fetch('/api/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setIsModalOpen(false);
    fetchBlogs();
  };

  const editBlog = (v: any) => {
    setForm({ title: v.title, category: v.category, author: v.author, content: v.content, image_url: v.image_url });
    setEditingId(v.id);
    setIsModalOpen(true);
  };

  const deleteBlog = async (id: number) => {
    if (!confirm('Delete this blog post?')) return;
    await fetch('/api/blogs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchBlogs();
  };

  const openNew = () => {
    setForm({ title: '', category: '', author: '', content: '', image_url: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Manage Blogs</h1>
        <button onClick={openNew} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#F4D03F]">
          <Plus size={18} /> New Post
        </button>
      </div>

      <div className="bg-[#151515] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0B0B0B] text-gray-400 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr> : blogs.map(b => (
              <tr key={b.id} className="hover:bg-white/5">
                <td className="p-4 text-white font-semibold">{b.title}</td>
                <td className="p-4 text-gray-300">{b.category}</td>
                <td className="p-4 text-gray-400">{new Date(b.published_at).toLocaleDateString()}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => editBlog(b)} className="p-2 bg-white/5 text-gray-400 rounded hover:text-white"><Edit2 size={16} /></button>
                  <button onClick={() => deleteBlog(b.id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Post' : 'New Post'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Author</label>
                  <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cover Image URL</label>
                <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea required rows={8} className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg hover:bg-[#F4D03F]">
                {editingId ? 'Update Post' : 'Publish Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
