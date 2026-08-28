'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay, isSameDay, isWithinInterval, eachDayOfInterval } from 'date-fns';

type Project = {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  status: string;
};

export function ProductionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/calendar?month=${month}&year=${year}`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch calendar projects:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [month, year]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">Loading calendar...</div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-zinc-900">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-white py-2 text-center text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:bg-zinc-950 dark:text-zinc-500">
                {day}
              </div>
            ))}
            {/* Padding for first day of month */}
            {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="h-24 bg-slate-50/50 dark:bg-zinc-950/50" />
            ))}
            {daysInMonth.map((day, i) => {
              const dayProjects = projects.filter(p => {
                const start = new Date(p.startDate);
                const end = new Date(p.endDate);
                return isWithinInterval(startOfDay(day), { start: startOfDay(start), end: endOfDay(end) }) ||
                       isWithinInterval(startOfDay(start), { start: startOfDay(day), end: endOfDay(day) });
              });

              return (
                <div key={i} className="group relative h-24 bg-white p-2 transition hover:bg-slate-50 dark:bg-zinc-950 dark:hover:bg-zinc-900">
                  <span className={`text-[10px] font-mono ${isSameDay(day, new Date()) ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayProjects.slice(0, 3).map(p => (
                      <div key={p.id} className="truncate rounded-sm bg-purple-100 px-1 py-0.5 text-[9px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        {p.name}
                      </div>
                    ))}
                    {dayProjects.length > 3 && (
                      <div className="text-[9px] text-slate-400">+{dayProjects.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
