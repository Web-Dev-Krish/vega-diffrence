import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data || []));
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 border border-white/5 opacity-50 bg-[#0B0B0B]"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toISOString().split('T')[0];
    const dayBookings = bookings.filter(b => b.date.startsWith(dateStr));
    
    days.push(
      <div key={`day-${d}`} className="min-h-[100px] p-2 border border-white/5 bg-[#151515] hover:bg-white/5 transition-colors">
        <div className="font-bold text-gray-500 mb-2">{d}</div>
        <div className="space-y-1">
          {dayBookings.map(b => (
            <div key={b.id} className={`text-xs px-2 py-1 rounded truncate ${b.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {b.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-white">Booking Calendar</h1>
        <div className="flex items-center gap-4 bg-[#151515] rounded-lg p-2 border border-white/10">
          <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronLeft size={20} /></button>
          <span className="text-white font-bold min-w-[120px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded text-gray-400"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="bg-[#151515] border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-[#0B0B0B] border-b border-white/10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    </div>
  );
}
