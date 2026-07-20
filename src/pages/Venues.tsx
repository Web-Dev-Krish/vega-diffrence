import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Star, ArrowRight } from 'lucide-react';

export default function Venues() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/venues')
      .then(res => res.json())
      .then(data => {
        setVenues(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      {/* Header */}
      <div className="bg-[#151515] py-20 border-b border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Premium <span className="text-[#D4AF37]">Venues</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Explore our curated collection of extraordinary spaces, perfect for your timeless celebrations.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.map((venue, idx) => (
              <motion.div 
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card group cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="relative h-72 overflow-hidden">
                  <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1 flex items-center gap-1 text-[#D4AF37] text-sm font-semibold rounded">
                    <Star size={14} className="fill-current" /> {venue.rating}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">{venue.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <MapPin size={16} className="text-[#D4AF37]" /> {venue.location}
                  </div>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">{venue.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-300 mb-6 border-t border-white/10 pt-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#D4AF37]" /> Up to {venue.capacity}
                    </div>
                    <div>
                      From <span className="text-[#D4AF37] font-semibold text-lg">${venue.price_per_day}</span>
                    </div>
                  </div>
                  <Link to={`/venues/${venue.id}`} className="w-full py-3 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center gap-2 hover:bg-[#D4AF37] hover:text-black transition-colors font-semibold uppercase tracking-wider text-sm">
                    Explore Venue <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
