import { useState, useEffect } from 'react';
import { Check, X, Trash2, Search } from 'lucide-react';

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    fetchBookings();
  };

  const deleteBooking = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    await fetch('/api/bookings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchBookings();
  };

  const filtered = bookings.filter(b => 
    b.name?.toLowerCase().includes(search.toLowerCase()) || 
    b.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Manage Bookings</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search bookings..." 
            className="bg-[#151515] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#D4AF37] outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#151515] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0B0B0B] text-gray-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Event Date</th>
                <th className="p-4">Guests</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No bookings found</td></tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.email}</div>
                    </td>
                    <td className="p-4 text-gray-300">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-300">{b.guests}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                        b.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => updateStatus(b.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20" title="Approve">
                        <Check size={16} />
                      </button>
                      <button onClick={() => updateStatus(b.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20" title="Reject">
                        <X size={16} />
                      </button>
                      <button onClick={() => deleteBooking(b.id)} className="p-2 bg-gray-500/10 text-gray-500 rounded hover:bg-gray-500/20 hover:text-red-500" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
