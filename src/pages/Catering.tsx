import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Utensils, Coffee, Award } from 'lucide-react';

export default function Catering() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Veg', 'Non-Veg', 'Chinese', 'Italian', 'Desserts'];

  useEffect(() => {
    fetch('/api/catering')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const filteredItems = activeTab === 'All' ? items : items.filter(i => i.category === activeTab || i.type === activeTab);

  return (
    <div className="bg-[#0B0B0B] min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-30" />
        <div className="relative z-10 px-4">
          <ChefHat size={48} className="text-[#D4AF37] mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Malhotra <span className="text-[#D4AF37]">Catering's</span></h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Exquisite culinary experiences tailored for your grand celebrations.</p>
        </div>
      </div>

      {/* Stats/About */}
      <div className="py-16 border-b border-white/10">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <Award className="text-[#D4AF37] mx-auto mb-4" size={32} />
            <h3 className="text-3xl font-bold text-white mb-2">20+</h3>
            <p className="text-gray-400">Years Experience</p>
          </div>
          <div>
            <Utensils className="text-[#D4AF37] mx-auto mb-4" size={32} />
            <h3 className="text-3xl font-bold text-white mb-2">500+</h3>
            <p className="text-gray-400">Dishes Mastered</p>
          </div>
          <div>
            <ChefHat className="text-[#D4AF37] mx-auto mb-4" size={32} />
            <h3 className="text-3xl font-bold text-white mb-2">50+</h3>
            <p className="text-gray-400">Expert Chefs</p>
          </div>
          <div>
            <Coffee className="text-[#D4AF37] mx-auto mb-4" size={32} />
            <h3 className="text-3xl font-bold text-white mb-2">10k+</h3>
            <p className="text-gray-400">Events Catered</p>
          </div>
        </div>
      </div>

      {/* Menu Gallery */}
      <div className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">Culinary <span className="text-[#D4AF37]">Masterpieces</span></h2>
          <div className="flex flex-wrap justify-center gap-4">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 border rounded-full transition-all ${activeTab === tab ? 'border-[#D4AF37] bg-[#D4AF37] text-black font-semibold' : 'border-white/20 text-gray-400 hover:border-[#D4AF37]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-[#D4AF37]">Loading Menu...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="glass-card overflow-hidden group">
                <div className="h-48 overflow-hidden relative">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${item.type === 'Veg' ? 'bg-green-500' : item.type === 'Non-Veg' ? 'bg-red-500' : 'bg-transparent'}`} />
                </div>
                <div className="p-4 text-center">
                  <h4 className="text-lg font-serif font-bold text-white mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-400">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Counters & Pricing Info */}
      <div className="py-20 bg-[#151515]">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-serif font-bold text-white mb-6">Live <span className="text-[#D4AF37]">Counters</span> & Custom Menus</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Elevate your event with our interactive live counters. From authentic Italian pasta stations to smoky tandoor grills and liquid nitrogen desserts, our chefs provide a visual and culinary spectacle.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3"><span className="w-2 h-2 bg-[#D4AF37] rounded-full" /> Live Chaat & Street Food</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 bg-[#D4AF37] rounded-full" /> Authentic Dim Sum & Sushi Bar</li>
              <li className="flex items-center gap-3"><span className="w-2 h-2 bg-[#D4AF37] rounded-full" /> Gourmet Dessert Station</li>
            </ul>
          </div>
          <div className="glass p-8 border-l-4 border-[#D4AF37]">
            <h3 className="text-2xl font-serif font-bold text-white mb-4">Pricing Packages</h3>
            <p className="text-gray-400 mb-6">Our catering packages are customized based on guest count, menu selection, and service style.</p>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-gray-300">Silver Package (Veg)</span>
                <span className="text-[#D4AF37] font-semibold">From $25/plate</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-gray-300">Gold Package (Mixed)</span>
                <span className="text-[#D4AF37] font-semibold">From $45/plate</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-gray-300">Platinum Royal Feast</span>
                <span className="text-[#D4AF37] font-semibold">Custom Quote</span>
              </div>
            </div>
            <button className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
              Request Catering Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
