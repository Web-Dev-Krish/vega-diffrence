import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        setBlogs(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#0B0B0B]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Insights & <span className="text-[#D4AF37]">Inspiration</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Discover trends, tips, and stories from the world of luxury events.</p>
        </div>

        {loading ? (
          <div className="text-center text-[#D4AF37]">Loading Articles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <div key={blog.id} className="glass-card overflow-hidden group flex flex-col">
                <div className="h-56 overflow-hidden">
                  <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-3">{blog.category}</div>
                  <h3 className="text-xl font-serif font-bold text-white mb-3 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">{blog.content}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 border-t border-white/10 pt-4 mt-auto">
                    <div className="flex items-center gap-1"><User size={14} /> {blog.author}</div>
                    <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(blog.published_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
