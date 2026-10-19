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

  // explicit types for date arrays to satisfy TS checks
  type Day = Date;

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
    <section className="">
      <div className="">
        <div className="">
          <CalendarIcon className="" />
          <h2 className="">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="">
          <button
            onClick={prevMonth}
            className=""
          >
            <ChevronLeft className="" />
          </button>
          <button
            onClick={nextMonth}
            className=""
          >
            <ChevronRight className="" />
          </button>
        </div>
      </div>

      <div className="">
        {loading ? (
          <div className="">Loading calendar...</div>
        ) : (
          <div className="">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day: string) => (
              <div key={day} className="">
                {day}
              </div>
            ))}
            {/* Padding for first day of month */}
            {Array.from({ length: daysInMonth[0].getDay() }).map((_, i: number) => (
              <div key={`pad-${i}`} className="" />
            ))}
            {daysInMonth.map((day: Day, i: number) => {
              const dayProjects = projects.filter(p => {
                const start = new Date(p.startDate);
                const end = new Date(p.endDate);
                return isWithinInterval(startOfDay(day), { start: startOfDay(start), end: endOfDay(end) }) ||
                       isWithinInterval(startOfDay(start), { start: startOfDay(day), end: endOfDay(day) });
              });

              return (
                <div key={i} className="">
                  <span className={`text-[10px] font-sans ${isSameDay(day, new Date()) ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="">
                    {dayProjects.slice(0, 3).map(p => (
                      <div key={p.id} className="">
                        {p.name}
                      </div>
                    ))}
                    {dayProjects.length > 3 && (
                      <div className="">+{dayProjects.length - 3} more</div>
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
