'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight, Calendar as CalendarIcon } from "@phosphor-icons/react";
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
    <section className="rounded-2xl border border-border bg-white dark:border-border dark:bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 dark:border-border/60">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary dark:text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted/50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Loading calendar...</div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-muted">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day: string) => (
              <div key={day} className="bg-white py-2 text-center text-[10px] font-sans uppercase tracking-widest text-muted-foreground/70 dark:bg-card dark:text-muted-foreground">
                {day}
              </div>
            ))}
            {/* Padding for first day of month */}
            {Array.from({ length: daysInMonth[0].getDay() }).map((_, i: number) => (
              <div key={`pad-${i}`} className="h-24 bg-muted/30" />
            ))}
            {daysInMonth.map((day: Day, i: number) => {
              const dayProjects = projects.filter(p => {
                const start = new Date(p.startDate);
                const end = new Date(p.endDate);
                return isWithinInterval(startOfDay(day), { start: startOfDay(start), end: endOfDay(end) }) ||
                       isWithinInterval(startOfDay(start), { start: startOfDay(day), end: endOfDay(day) });
              });

              return (
                <div key={i} className="group relative h-24 bg-white p-2 transition hover:bg-muted/50 dark:bg-card dark:hover:bg-muted">
                  <span className={`text-[10px] font-sans ${isSameDay(day, new Date()) ? 'text-primary font-bold' : 'text-muted-foreground/50'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayProjects.slice(0, 3).map(p => (
                      <div key={p.id} className="truncate rounded-sm bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary dark:bg-primary/15 dark:text-primary">
                        {p.name}
                      </div>
                    ))}
                    {dayProjects.length > 3 && (
                      <div className="text-[9px] text-muted-foreground/70">+{dayProjects.length - 3} more</div>
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
