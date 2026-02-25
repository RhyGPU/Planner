
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Edit3, Clock } from 'lucide-react';
import { WeekData } from '../types';
import { MONTHS, formatDateKey, formatHour } from '../constants';
import { getWeeksInRange } from '../utils/weekManager';

interface MonthlyViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  allWeeks: Record<string, WeekData>;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate, setCurrentDate, allWeeks
}) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const startOffset = (firstDay + 6) % 7;

  const [selectedDay, setSelectedDay] = useState<any>(null);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Get all weeks in this month for efficient data lookup
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const weeksInMonth = useMemo(() => getWeeksInRange(monthStart, monthEnd, allWeeks), [monthStart, monthEnd, allWeeks]);

  // Get day plan for selected day from the corresponding week
  const getSelectedDayData = (dateKey: string) => {
    for (const week of weeksInMonth) {
      if (week.dailyPlans[dateKey]) {
        return week.dailyPlans[dateKey];
      }
    }
    return null;
  };

  const selectedDayPlan = selectedDay ? getSelectedDayData(selectedDay.key) : null;
  const selectedDayEvents = selectedDayPlan?.events || [];

  return (
    <div className="flex flex-col min-h-full bg-white p-8 relative overflow-visible animate-in fade-in duration-500">
      {/* Universal Detail Overlay */}
      {selectedDay && selectedDayPlan && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
                    <div>
                        <h3 className="font-black text-2xl tracking-tighter">{selectedDay.dateString}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Real-Time Sync</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-white transition-all p-2 rounded-full hover:bg-white/10"><X size={24}/></button>
                </div>
                <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Daily Focus</label>
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold shadow-inner leading-relaxed min-h-[100px]">
                            {selectedDayPlan.focus || <span className="text-slate-300 italic">No focus set</span>}
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Daily Notes</label>
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold shadow-inner leading-relaxed min-h-[80px]">
                            {selectedDayPlan.notes || <span className="text-slate-300 italic">No notes</span>}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Time Blocks ({selectedDayEvents.length})</label>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">Synchronized</span>
                        </div>
                        <div className="space-y-3">
                            {selectedDayEvents.length === 0 ? (
                                <div className="text-slate-400 text-sm italic py-8 border-2 border-dashed border-slate-100 rounded-3xl text-center bg-slate-50/30">
                                    No strategic engagements scheduled
                                </div>
                            ) : selectedDayEvents.map(evt => (
                                <div key={`${evt.id}-modal`} className="group flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-1.5 h-10 rounded-full bg-blue-600"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{evt.title}</div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-1">
                                            <Clock size={10}/> {formatHour(evt.startHour)} - {formatHour(evt.startHour + evt.duration)}
                                        </div>
                                    </div>
                                    <button onClick={() => alert("To edit precise time blocks, use the Deep Planner view.")} className="text-slate-300 hover:text-blue-600 p-2 transition-colors">
                                        <Edit3 size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={() => setSelectedDay(null)} className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all">Close Perspective</button>
                </div>
            </div>
        </div>
      )}

      {/* Monthly Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
            <div className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-2">{currentDate.getFullYear()}</div>
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{MONTHS[currentDate.getMonth()]}</h2>
        </div>
        <div className="flex gap-3">
            <button onClick={prevMonth} className="p-4 bg-slate-50 hover:bg-slate-100 border-2 border-slate-100 rounded-[1.5rem] transition-all shadow-sm active:scale-95"><ChevronLeft size={28}/></button>
            <button onClick={nextMonth} className="p-4 bg-slate-50 hover:bg-slate-100 border-2 border-slate-100 rounded-[1.5rem] transition-all shadow-sm active:scale-95"><ChevronRight size={28}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-6">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
            <div key={d} className="text-center text-[11px] font-black text-slate-400 tracking-[0.3em]">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 flex-1">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} className="min-h-[100px] bg-slate-50/20 rounded-2xl"></div>)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
           const dayNum = i + 1;
           const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
           const dateKey = formatDateKey(dayDate);
           const dayPlan = getSelectedDayData(dateKey);
           const dayEvents = dayPlan?.events || [];
           const isToday = new Date().toDateString() === dayDate.toDateString();

           return (
            <div 
                key={i} 
                onClick={() => setSelectedDay({ key: dateKey, dateString: dayDate.toDateString() })} 
                className={`group border-2 rounded-[1.5rem] p-3 min-h-[100px] cursor-pointer flex flex-col overflow-hidden transition-all duration-300 ${
                    isToday ? 'border-blue-600 bg-blue-50/30 shadow-xl shadow-blue-100/50' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-lg font-black tracking-tighter ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>{dayNum}</span>
                {dayEvents.length > 0 && <div className="px-1.5 py-0.5 rounded-lg bg-blue-600 text-[9px] font-black text-white shadow-lg shadow-blue-200">{dayEvents.length}</div>}
              </div>
              <div className="flex-1 overflow-hidden space-y-1">
                  {dayEvents.slice(0, 2).map((e, idx) => (
                      <div key={`${e.id}-${idx}`} className="text-[8px] font-bold text-slate-700 bg-white/80 px-1.5 py-0.5 rounded-lg border border-slate-100 truncate shadow-sm group-hover:bg-white transition-colors">
                          {e.title}
                      </div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[8px] font-black text-slate-400 pl-1.5">+{dayEvents.length - 2} more</div>}
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
};
