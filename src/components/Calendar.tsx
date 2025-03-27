import  { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day) => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-900"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: new Date(monthStart).getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="bg-white px-3 py-4" />
          ))}
          {calendarDays.map((day) => (
            <div
              key={format(day, 'yyyy-MM-dd')}
              className={`bg-white px-3 py-4 text-center hover:bg-gray-50 cursor-pointer ${
                isToday(day) ? 'bg-indigo-50' : ''
              }`}
            >
              <time
                dateTime={format(day, 'yyyy-MM-dd')}
                className={`text-sm ${
                  isToday(day)
                    ? 'font-semibold text-indigo-600'
                    : !isSameMonth(day, currentDate)
                    ? 'text-gray-400'
                    : 'text-gray-900'
                }`}
              >
                {format(day, 'd')}
              </time>
              {format(day, 'MM-dd') === '03-15' && (
                <div className="mt-2">
                  <div className="bg-indigo-100 text-indigo-700 text-xs rounded px-1 py-0.5">
                    Team Meeting
                  </div>
                </div>
              )}
            </div>
          ))}
          {Array.from({ length: (6 * 7) - (new Date(monthStart).getDay() + calendarDays.length) }).map((_, index) => (
            <div key={`empty-end-${index}`} className="bg-white px-3 py-4" />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Calendar };