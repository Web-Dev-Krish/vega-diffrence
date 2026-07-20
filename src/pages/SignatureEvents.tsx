import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function SignatureEvents() {
  return (
    <div className="bg-[#0B0B0B]">
      {/* 1. Birthdays at Mankameshwar Palace */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="Palace Birthday" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/80 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-sm font-bold tracking-[0.3em] text-[#D4AF37] mb-4 uppercase">Signature Package</h2>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Royal Birthdays at <br/>
              <span className="gold-gradient-text">Mankameshwar Palace</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light">
              Experience the grandeur of a royal birthday celebration. Majestic decor, premium catering, and an ambiance fit for kings and queens.
            </p>
            
            <div className="grid grid-cols-2 gap-8 mb-10 border-t border-white/10 pt-8">
              <div>
                <h4 className="text-[#D4AF37] font-semibold mb-2">Experience</h4>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• Palace Illumination</li>
                  <li>• Royal Entry with Chariot</li>
                  <li>• Live Sufi Music</li>
                </ul>
              </div>
              <div>
                <h4 className="text-[#D4AF37] font-semibold mb-2">Services</h4>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• 5-Star Catering</li>
                  <li>• Premium Floral Decor</li>
                  <li>• Photography & Drone</li>
                </ul>
              </div>
            </div>
            
            <Link to="/contact" className="inline-block px-8 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
              Book This Package
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Pool Parties at Vatika Resort */}
      <section className="relative min-h-screen flex items-center justify-end pt-20">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/221436/pexels-photo-221436.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="Pool Party" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0B0B0B] via-[#0B0B0B]/80 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex justify-end">
          <div className="max-w-3xl text-right">
            <h2 className="text-sm font-bold tracking-[0.3em] text-[#D4AF37] mb-4 uppercase">Signature Package</h2>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Premium Pool Parties at <br/>
              <span className="gold-gradient-text">Vatika Resort</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light ml-auto">
              Dive into luxury. Neon night lighting, live DJ sets, floating decor, and exotic mocktails for the ultimate vibrant celebration.
            </p>
            
            <div className="grid grid-cols-2 gap-8 mb-10 border-t border-white/10 pt-8 text-left">
              <div>
                <h4 className="text-[#D4AF37] font-semibold mb-2">Experience</h4>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• Neon Night Lighting</li>
                  <li>• Live DJ & Dance Floor</li>
                  <li>• Floating Pool Decor</li>
                </ul>
              </div>
              <div>
                <h4 className="text-[#D4AF37] font-semibold mb-2">Services</h4>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• Live BBQ & Counters</li>
                  <li>• Exotic Mocktail Bar</li>
                  <li>• Cabana Setup</li>
                </ul>
              </div>
            </div>
            
            <Link to="/contact" className="inline-block px-8 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
              Book This Package
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
