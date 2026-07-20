import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, Star, CheckCircle, Calendar, DollarSign, Image as ImageIcon, Video } from 'lucide-react';

export default function VenueDetails() {
  const { id } = useParams();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', date: '', guests: '' });

  useEffect(() => {
    fetch(`/api/venues?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setVenue(data);
        setLoading(false);
      });
  }, [id]);

  const handleBooking = async (e: any) => {
    e.preventDefault();
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bookingForm, venue_id: id })
    });
    alert('Booking request sent successfully!');
    setBookingForm({ name: '', email: '', date: '', guests: '' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#D4AF37]">Loading...</div>;
  if (!venue) return <div className="min-h-screen flex items-center justify-center text-white">Venue not found</div>;

  return (
    <div className="bg-[#0B0B0B] min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[80vh]">
        <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
          <div className="flex items-center gap-2 text-[#D4AF37] mb-4">
            <Star className="fill-current" size={20} />
            <span className="text-lg font-semibold">{venue.rating}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">{venue.name}</h1>
          <div className="flex flex-wrap gap-6 text-gray-300">
            <div className="flex items-center gap-2"><MapPin className="text-[#D4AF37]" /> {venue.location}</div>
            <div className="flex items-center gap-2"><Users className="text-[#D4AF37]" /> Up to {venue.capacity} Guests</div>
            <div className="flex items-center gap-2"><DollarSign className="text-[#D4AF37]" /> From ${venue.price_per_day}/day</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-serif font-bold text-white mb-6">Overview</h2>
              <p className="text-gray-400 leading-relaxed text-lg">{venue.description}</p>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-bold text-white mb-6">Facilities & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.facilities?.map((fac: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle size={18} className="text-[#D4AF37]" /> {fac}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-serif font-bold text-white mb-6">Available Events</h2>
              <div className="flex flex-wrap gap-3">
                {venue.event_types?.map((type: any, i: number) => (
                  <span key={i} className="px-4 py-2 bg-[#151515] border border-white/10 text-gray-300 rounded-full text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </section>

            {/* Gallery Placeholder */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-3xl font-serif font-bold text-white">Gallery</h2>
                <div className="flex gap-4 text-[#D4AF37]">
                  <button className="flex items-center gap-2 hover:text-white"><ImageIcon size={20}/> Photos</button>
                  <button className="flex items-center gap-2 hover:text-white"><Video size={20}/> Videos</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <img src={venue.image_url} className="w-full h-48 object-cover rounded-lg" alt="Gallery 1" />
                <div className="bg-[#151515] flex items-center justify-center h-48 rounded-lg border border-white/5">
                  <span className="text-gray-500">More images coming soon</span>
                </div>
              </div>
            </section>

            {/* Map Placeholder */}
            <section>
              <h2 className="text-3xl font-serif font-bold text-white mb-6">Location</h2>
              <div className="w-full h-64 bg-[#151515] border border-white/10 flex items-center justify-center text-gray-500 rounded-lg">
                Google Maps Placeholder for {venue.location}
              </div>
            </section>
          </div>

          {/* Sidebar / Booking Form */}
          <div className="lg:col-span-1">
            <div className="glass-card p-8 sticky top-28">
              <h3 className="text-2xl font-serif font-bold text-white mb-6">Request a Quote</h3>
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input required type="text" className="w-full bg-[#0B0B0B] border border-white/10 p-3 text-white focus:border-[#D4AF37] outline-none" value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                  <input required type="email" className="w-full bg-[#0B0B0B] border border-white/10 p-3 text-white focus:border-[#D4AF37] outline-none" value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Event Date</label>
                  <input required type="date" className="w-full bg-[#0B0B0B] border border-white/10 p-3 text-white focus:border-[#D4AF37] outline-none" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Estimated Guests</label>
                  <input required type="number" className="w-full bg-[#0B0B0B] border border-white/10 p-3 text-white focus:border-[#D4AF37] outline-none" value={bookingForm.guests} onChange={e => setBookingForm({...bookingForm, guests: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-[#D4AF37] text-black font-bold py-4 mt-4 hover:bg-[#F4D03F] transition-colors uppercase tracking-widest">
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
