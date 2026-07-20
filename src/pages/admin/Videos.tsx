import { useState, useEffect } from 'react';
import { Plus, Trash2, X, PlayCircle } from 'lucide-react';

export default function Videos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [form, setForm] = useState({ title: '', video_url: '', thumbnail_url: '' });

  const fetchVideos = async () => {
    const res = await fetch('/api/videos');
    const data = await res.json();
    setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch('/api/videos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setIsModalOpen(false);
    setForm({ title: '', video_url: '', thumbnail_url: '' });
    fetchVideos();
  };

  const deleteVideo = async (id: number) => {
    if (!confirm('Delete this video?')) return;
    await fetch('/api/videos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchVideos();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Video Assets</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#F4D03F]">
          <Plus size={18} /> Add Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-gray-500">Loading...</p> : videos.map(vid => (
          <div key={vid.id} className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden group">
            <div className="relative h-48 bg-black">
              {vid.thumbnail_url ? (
                <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0B0B0B]">
                  <PlayCircle size={48} className="text-gray-600" />
                </div>
              )}
              <a href={vid.video_url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center">
                <PlayCircle size={48} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
              </a>
            </div>
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-white font-semibold truncate flex-1 pr-4">{vid.title}</h3>
              <button onClick={() => deleteVideo(vid.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-white/10 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Add Video Link</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Video URL (YouTube, Vimeo, MP4)</label>
                <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Thumbnail URL</label>
                <input required className="w-full bg-[#0B0B0B] border border-white/10 rounded p-2 text-white" value={form.thumbnail_url} onChange={e => setForm({...form, thumbnail_url: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg hover:bg-[#F4D03F]">
                Save Video
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
