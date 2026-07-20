import { Construction } from 'lucide-react';

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-6">
        <Construction size={40} />
      </div>
      <h1 className="text-3xl font-serif font-bold text-white mb-4">{title}</h1>
      <p className="text-gray-400 max-w-md">
        This module is part of the enterprise CMS suite. The UI layout is ready and waiting for backend integration in the next phase.
      </p>
    </div>
  );
}
