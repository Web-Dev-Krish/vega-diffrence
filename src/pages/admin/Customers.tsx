import { useState, useEffect } from 'react';
import { Search, Mail, Calendar } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Aggregate customers from bookings
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        const uniqueCustomers = new Map();
        (data || []).forEach((b: any) => {
          if (!uniqueCustomers.has(b.email)) {
            uniqueCustomers.set(b.email, {
              name: b.name,
              email: b.email,
              totalBookings: 1,
              lastBookingDate: b.date
            });
          } else {
            const existing = uniqueCustomers.get(b.email);
            existing.totalBookings += 1;
            if (new Date(b.date) > new Date(existing.lastBookingDate)) {
              existing.lastBookingDate = b.date;
            }
          }
        });
        setCustomers(Array.from(uniqueCustomers.values()));
        setLoading(false);
      });
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Customer CRM</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="bg-[#151515] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#D4AF37] outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#151515] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0B0B0B] text-gray-400 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Total Bookings</th>
              <th className="p-4">Last Activity</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td></tr> : 
             filtered.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">No customers found</td></tr> :
             filtered.map((c, i) => (
              <tr key={i} className="hover:bg-white/5">
                <td className="p-4">
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Mail size={12}/> {c.email}</div>
                </td>
                <td className="p-4 text-white font-semibold">
                  <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full">{c.totalBookings}</span>
                </td>
                <td className="p-4 text-gray-400 text-sm flex items-center gap-2 mt-3">
                  <Calendar size={14}/> {new Date(c.lastBookingDate).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button className="text-[#D4AF37] hover:text-white text-sm font-semibold">View History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
