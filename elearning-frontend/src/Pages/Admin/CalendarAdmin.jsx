import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Admin/MainLayout';

const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
);

const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7"/></svg>
);

const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
);

export default function CalendarAdmin() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Mgg"];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d264f] hover:border-slate-300 transition-all shadow-sm"
              title="Kembali"
            >
              <IconArrowLeft />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Kalender</h1>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={goToPrevMonth}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600"
            >
              <IconChevronLeft />
            </button>

            <button 
              onClick={goToday}
              className="px-3 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-lg transition-colors"
            >
              Hari Ini
            </button>

            <button 
              onClick={goToNextMonth}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600"
            >
              <IconChevronRight />
            </button>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-700">
            {monthNames[currentDate.getMonth()]} <span className="font-normal text-slate-400 ml-1">{currentDate.getFullYear()}</span>
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[...Array(adjustedFirstDay)].map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}
            
            {[...Array(daysInMonth)].map((_, index) => {
              const dateNum = index + 1;
              const isToday = 
                dateNum === today.getDate() && 
                currentDate.getMonth() === today.getMonth() && 
                currentDate.getFullYear() === today.getFullYear();
              
              const isPast = 
                new Date(currentDate.getFullYear(), currentDate.getMonth(), dateNum) < new Date(today.setHours(0,0,0,0));

              return (
                <div 
                  key={index} 
                  className={`aspect-square flex flex-col items-center justify-center rounded-md transition-all duration-200 cursor-default
                    ${isToday 
                      ? 'bg-[#3b82f6] text-white shadow-sm scale-105 z-10' // Biru lebih muda/terang agar tidak gelap
                      : isPast 
                        ? 'text-slate-300' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <span className="text-xs md:text-sm font-bold">
                    {dateNum}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </MainLayout>
  );
}