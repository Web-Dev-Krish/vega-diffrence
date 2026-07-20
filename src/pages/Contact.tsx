import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-[#0B0B0B] min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Get in <span className="text-[#D4AF37]">Touch</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Let's discuss how we can make your next event truly unforgettable.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-3xl font-serif font-bold text-white mb-8">Contact Information</h2>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#151515] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <MapPin className="text-[#D4AF37]" size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-1">Office Address</h4>
                <p className="text-gray-400">123 Luxury Avenue, Golden Estate,<br/>New Delhi, India 110001</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#151515] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <Phone className="text-[#D4AF37]" size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-1">Phone</h4>
                <p className="text-gray-400">+91 98765 43210<br/>+91 11 2345 6789</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#151515] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <Mail className="text-[#D4AF37]" size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-1">Email</h4>
                <p className="text-gray-400">contact@malhotraevents.com<br/>bookings@malhotraevents.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#151515] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <Clock className="text-[#D4AF37]" size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-1">Business Hours</h4>
                <p className="text-gray-400">Monday - Saturday: 10:00 AM - 7:00 PM<br/>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass-card p-8 md:p-10">
            <h3 className="text-2xl font-serif font-bold text-white mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input required type="text" placeholder="Your Name" className="w-full bg-[#0B0B0B] border border-white/10 p-4 text-white focus:border-[#D4AF37] outline-none transition-colors" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <input required type="email" placeholder="Email Address" className="w-full bg-[#0B0B0B] border border-white/10 p-4 text-white focus:border-[#D4AF37] outline-none transition-colors" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input required type="tel" placeholder="Phone Number" className="w-full bg-[#0B0B0B] border border-white/10 p-4 text-white focus:border-[#D4AF37] outline-none transition-colors" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <textarea required placeholder="Tell us about your event..." rows={5} className="w-full bg-[#0B0B0B] border border-white/10 p-4 text-white focus:border-[#D4AF37] outline-none transition-colors resize-none" value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
              </div>
              <button type="submit" disabled={status === 'sending'} className="w-full py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest hover:bg-[#F4D03F] transition-colors disabled:opacity-50">
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {status === 'success' && <p className="text-green-500 text-center mt-4">Message sent successfully! We will contact you soon.</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
