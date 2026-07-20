import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, PlayCircle } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Wedding', 'Reception', 'Birthday', 'Corporate', 'Anniversary'];

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  const filteredEvents = category === 'All' ? events : events.filter(e => e.type === category);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="text-center mb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Our <span className="text-[#D4AF37]">Events</span></h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Explore our portfolio of meticulously planned and beautifully executed events.</p>
      </div>

      <div className="container mx-auto px-4">
        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full border transition-all ${
                category === cat 
                  ? 'border-[#D4AF37] bg-[#D4AF37] text-black font-semibold' 
                  : 'border-white/20 text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-[#D4AF37]">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {event.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle size={48} className="text-white/80 hover:text-[#D4AF37] cursor-pointer transition-colors" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 uppercase tracking-wider">
                    {event.type}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold text-white mb-3">{event.title}</h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-[#D4AF37]" /> {new Date(event.date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2"><MapPin size={14} className="text-[#D4AF37]" /> {event.venue_name || 'Premium Venue'}</div>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
