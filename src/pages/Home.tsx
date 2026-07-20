import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [venues, setVenues] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/venues?limit=3').then(res => res.json()).then(setVenues);
    fetch('/api/testimonials').then(res => res.json()).then(setTestimonials);
  }, []);

  return (
    <div className="w-full">
      {/* STRICTLY DEFINED HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Luxury Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.pexels.com/photos/5729026/pexels-photo-5729026.jpeg?auto=compress&cs=tinysrgb&w=1920")' }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-black/60 bg-gradient-to-b from-black/80 via-black/40 to-[#0B0B0B]" />
        
        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight max-w-5xl mx-auto">
              Where <span className="gold-gradient-text">Golden Moments</span> Become Timeless Celebrations
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light tracking-wide">
              Experience unparalleled luxury and flawless execution for your most cherished events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact" 
                className="px-8 py-4 bg-[#D4AF37] text-black font-semibold uppercase tracking-widest hover:bg-[#F4D03F] transition-all duration-300"
              >
                Plan Your Event
              </Link>
              <Link 
                to="/venues" 
                className="px-8 py-4 border border-[#D4AF37] text-[#D4AF37] font-semibold uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all duration-300 glass"
              >
                Explore Venues
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Venues */}
      <section className="py-24 bg-[#0B0B0B]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Premium <span className="text-[#D4AF37]">Venues</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Discover our exclusive selection of luxury venues designed to host your grandest celebrations.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {venues.map((venue, idx) => (
              <motion.div 
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="glass-card group cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1 flex items-center gap-1 text-[#D4AF37] text-sm font-semibold rounded">
                    <Star size={14} className="fill-current" /> {venue.rating}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-serif font-bold text-white mb-2">{venue.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <MapPin size={14} className="text-[#D4AF37]" /> {venue.location}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-300 mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#D4AF37]" /> Up to {venue.capacity}
                    </div>
                    <div>
                      Starts at <span className="text-[#D4AF37] font-semibold">${venue.price_per_day}</span>
                    </div>
                  </div>
                  <Link to={`/venues/${venue.id}`} className="mt-auto flex items-center justify-center gap-2 text-[#D4AF37] hover:text-[#F4D03F] transition-colors font-semibold uppercase tracking-wider text-sm">
                    View Details <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-[#151515] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Our <span className="text-[#D4AF37]">Services</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Comprehensive event solutions tailored to perfection.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {['Wedding', 'Reception', 'Birthday', 'Engagement', 'Anniversary', 'Corporate', 'Baby Shower', 'Private Party'].map((service, idx) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border border-white/10 bg-[#0B0B0B] p-6 text-center hover:border-[#D4AF37]/50 transition-colors group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#151515] border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                  <Star size={20} className="text-[#D4AF37] group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-white font-serif font-semibold">{service}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0B0B0B]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Client <span className="text-[#D4AF37]">Experiences</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0,3).map((t, idx) => (
              <div key={t.id} className="glass-card p-8">
                <div className="flex text-[#D4AF37] mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
                </div>
                <p className="text-gray-300 italic mb-6">"{t.content}"</p>
                <div>
                  <h4 className="text-white font-semibold">{t.name}</h4>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury CTA */}
      <section className="py-32 relative flex items-center justify-center bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url("https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1920")' }}>
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Ready to Create Magic?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Let our expert team craft an unforgettable experience for your next big event.</p>
          <Link to="/contact" className="inline-block px-10 py-5 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors duration-300">
            Book a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
