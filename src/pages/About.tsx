import { Award, Users, Target, Shield } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-[#0B0B0B] min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Crafting <span className="text-[#D4AF37]">Timeless</span> Legacies
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Founded on the principles of elegance, precision, and unparalleled luxury, Malhotra Events has been transforming visions into breathtaking realities for over two decades.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              We believe that every event is a unique story waiting to be told. From intimate gatherings to royal weddings, our dedicated team ensures flawless execution and extraordinary memories.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="border-l-2 border-[#D4AF37] pl-4">
                <h4 className="text-2xl font-bold text-white">20+</h4>
                <p className="text-gray-500 text-sm uppercase tracking-wider">Years Experience</p>
              </div>
              <div className="border-l-2 border-[#D4AF37] pl-4">
                <h4 className="text-2xl font-bold text-white">1000+</h4>
                <p className="text-gray-500 text-sm uppercase tracking-wider">Events Executed</p>
              </div>
            </div>
          </div>
          <div className="relative h-[600px]">
            <img src="https://images.pexels.com/photos/337980/pexels-photo-337980.jpeg?auto=compress&cs=tinysrgb&w=800" alt="About Us" className="w-full h-full object-cover rounded-sm" />
            <div className="absolute -bottom-8 -left-8 bg-[#151515] p-8 border border-white/10 hidden md:block">
              <Award size={48} className="text-[#D4AF37] mb-4" />
              <h4 className="text-xl font-serif font-bold text-white">Award Winning</h4>
              <p className="text-gray-400 text-sm">Premium Event Planners</p>
            </div>
          </div>
        </div>

        {/* Mission / Vision */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="glass p-8 text-center">
            <Target size={40} className="text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-white mb-4">Our Mission</h3>
            <p className="text-gray-400">To deliver exceptional, bespoke event experiences that exceed expectations through creativity, meticulous planning, and flawless execution.</p>
          </div>
          <div className="glass p-8 text-center bg-[#D4AF37]/5 border-[#D4AF37]/30">
            <Shield size={40} className="text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-white mb-4">Our Vision</h3>
            <p className="text-gray-400">To be the globally recognized benchmark for luxury event organizing and premium catering services.</p>
          </div>
          <div className="glass p-8 text-center">
            <Users size={40} className="text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-white mb-4">Our Values</h3>
            <p className="text-gray-400">Integrity, Innovation, Elegance, and a relentless commitment to perfection in every detail.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
