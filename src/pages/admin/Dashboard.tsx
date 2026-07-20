import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { CalendarCheck, MapPin, FileText, Users } from 'lucide-react';

const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 8000 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 9000 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ bookings: 0, venues: 0, blogs: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then(res => res.json()),
      fetch('/api/venues').then(res => res.json()),
      fetch('/api/blogs').then(res => res.json()),
    ]).then(([b, v, bl]) => {
      setStats({ bookings: b.length || 0, venues: v.length || 0, blogs: bl.length || 0 });
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-white">Dashboard Overview</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#151515] border border-white/5 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Bookings</p>
            <h3 className="text-3xl font-bold text-white">{stats.bookings}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <CalendarCheck size={24} />
          </div>
        </div>
        
        <div className="bg-[#151515] border border-white/5 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Venues</p>
            <h3 className="text-3xl font-bold text-white">{stats.venues}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <MapPin size={24} />
          </div>
        </div>

        <div className="bg-[#151515] border border-white/5 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Published Blogs</p>
            <h3 className="text-3xl font-bold text-white">{stats.blogs}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-[#151515] border border-white/5 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Visitors</p>
            <h3 className="text-3xl font-bold text-white">12.5k</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#151515] border border-white/5 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#0B0B0B', borderColor: '#333' }} />
                <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#151515] border border-white/5 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Bookings by Month</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#0B0B0B', borderColor: '#333' }} />
                <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
