'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, List } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, differenceInCalendarDays, isSameDay, isSameMonth, isSameWeek, parseISO, addDays, subDays } from 'date-fns';

type CalendarView = 'month' | 'week' | 'agenda';

type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string
  allDay: boolean;
  category: string;
  status: string;
  relatedClientId?: string;
  relatedProjectId?: string;
  relatedQuoteId?: string;
  relatedInvoiceId?: string;
  relatedGalleryId?: string;
  sourceType: string;
  sourceId: string;
  isTentative: boolean;
};

type CalendarState = {
  currentDate: Date;
  view: CalendarView;
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
};

export default function CalendarPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(),
    view: 'month',
    events: [],
    loading: true,
    error: null,
  });

  // Fetch events for the current view's date range
  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      if (cancelled) return;
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        let startDate: Date, endDate: Date;

        switch (state.view) {
          case 'month':
            startDate = startOfMonth(state.currentDate);
            endDate = endOfMonth(state.currentDate);
            break;
          case 'week':
            startDate = startOfWeek(state.currentDate, { weekStartsOn: 1 }); // Monday start
            endDate = endOfWeek(state.currentDate, { weekStartsOn: 1 });
            break;
          case 'agenda':
            // For agenda, we'll show a fixed range (e.g., next 30 days)
            startDate = startOfDay(state.currentDate);
            endDate = addDays(startDate, 30);
            break;
        }

        const response = await fetch(
          `/api/calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}&view=${state.view}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch calendar data: ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setState(prev => ({
            ...prev,
            events: data,
            loading: false,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          }));
        }
      }
    }

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [state.currentDate, state.view]);

  const handlePrev = () => {
    setState(prev => ({
      ...prev,
      currentDate:
        state.view === 'month' ? subMonths(prev.currentDate, 1) :
        state.view === 'week' ? subDays(prev.currentDate, 7) :
        subDays(prev.currentDate, 1),
    }));
  };

  const handleNext = () => {
    setState(prev => ({
      ...prev,
      currentDate:
        state.view === 'month' ? addMonths(prev.currentDate, 1) :
        state.view === 'week' ? addDays(prev.currentDate, 7) :
        addDays(prev.currentDate, 1),
    }));
  };

  const handleToday = () => {
    setState(prev => ({ ...prev, currentDate: new Date() }));
  };

  const handleViewChange = (view: CalendarView) => {
    setState(prev => ({ ...prev, view }));
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isCurrentMonth = (date: Date) => isSameMonth(date, state.currentDate);
  const isCurrentWeek = (date: Date) => isSameWeek(date, state.currentDate, { weekStartsOn: 1 });

  // Group events by day for month and week views
  const eventsByDay = useMemo(() => {
    const map: Map<string, CalendarEvent[]> = new Map();
    state.events.forEach(event => {
      const start = parseISO(event.startDate);
      const dateKey = format(start, 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [state.events]);

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDay.get(dateKey) || [];
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b]">
        <p className="text-xs font-sans uppercase tracking-widest text-slate-500">Loading calendar...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#09090b] dark:text-zinc-100">
      <header className="border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Creator Command Centre Calendar
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="rounded-lg border border-slate-200 px-3 py-2 text-slate-500 hover:bg-slate-50 transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex-1 flex justify-center">
              <span className="text-center text-slate-900 dark:text-white font-medium">
                {format(state.currentDate, state.view === 'month' ? 'MMMM yyyy' : state.view === 'week' ? "PPP '–' PPP" : 'MMMM d, yyyy')}
              </span>
            </div>

            <button
              onClick={handleNext}
              className="rounded-lg border border-slate-200 px-3 py-2 text-slate-500 hover:bg-slate-50 transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleToday}
              className="rounded-lg border border-slate-200 px-3 py-2 text-slate-500 hover:bg-slate-50 transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleViewChange('month')}
                className={
                  'rounded-lg px-3 py-2 text-sm font-medium ' +
                  (state.view === 'month'
                    ? 'bg-purple-600 text-white'
                    : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                  ) +
                  ' transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
                }
              >
                Month
              </button>
              <button
                onClick={() => handleViewChange('week')}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  state.view === 'week'
                    ? 'bg-purple-600 text-white'
                    : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                } transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:bg-zinc-900/50`
              >
                Week
              </button>
              <button
                onClick={() => handleViewChange('agenda')}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  state.view === 'agenda'
                    ? 'bg-purple-600 text-white'
                    : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                } transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:bg-zinc-900/50`}
              >
                Agenda
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {state.view === 'month' && (
          <MonthView
            currentDate={state.currentDate}
            events={state.events}
            eventsByDay={eventsByDay}
            isToday={isToday}
            isCurrentMonth={isCurrentMonth}
          />
        )}
        {state.view === 'week' && (
          <WeekView
            currentDate={state.currentDate}
            events={state.events}
            eventsByDay={eventsByDay}
            isToday={isToday}
            isCurrentWeek={isCurrentWeek}
          />
        )}
        {state.view === 'agenda' && (
          <AgendaView
            events={state.events}
            currentDate={state.currentDate}
          />
        )}
      </main>
    </div>
  );
}

// Month view component
function MonthView({
  currentDate,
  events,
  eventsByDay,
  isToday,
  isCurrentMonth,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  eventsByDay: Map<string, CalendarEvent[]>;
  isToday: (date: Date) => boolean;
  isCurrentMonth: (date: Date) => boolean;
}) {
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const startDayOfWeek = daysInMonth[0].getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToPad = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Adjust for Monday start

  return (
    <div className="gap-1">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-500">
        {[...Array(7)].map((_, i) => {
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
            (i + 1) % 7
          ]; // Start with Monday
          return <div key={i}>{dayName}</div>;
        })}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding for days before the 1st */}
        {[...Array(daysToPad)].map((_, i) => (
          <div key={`pad-${i}`} className="h-24 bg-slate-50/50 dark:bg-zinc-950/50" />
        ))}

        {/* Days of the month */}
        {daysInMonth.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isTodayDay = isToday(day);
          const isCurrentMonthDay = isCurrentMonth(day);

          return (
            <div
              key={index}
              className={`group relative h-24 min-w-0 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900 ${
                isTodayDay
                  ? 'border-2 border-purple-600'
                  : isCurrentMonthDay
                    ? 'bg-white dark:bg-zinc-950'
                    : 'bg-slate-50 dark:bg-zinc-900/50'
              }`}
            >
              <div className="flex justify-between items-start p-2">
                <span className={`text-[10px] font-sans ${isTodayDay ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>
                  {format(day, 'd')}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  {dayEvents.length}
                </span>
              </div>

              <div className="mt-1 space-y-1 h-[calc(100%-2rem)] overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`truncate rounded-sm px-1 py-0.5 text-[9px] font-medium ${
                      event.isTentative
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-slate-400 dark:text-zinc-500">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
        )
      </div>
    </div>
  );
}

// Week view component
function WeekView({
  currentDate,
  events,
  eventsByDay,
  isToday,
  isCurrentWeek,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  eventsByDay: Map<string, CalendarEvent[]>;
  isToday: (date: Date) => boolean;
  isCurrentWeek: (date: Date) => boolean;
}) {
  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const daysOfWeek = eachDayOfInterval({
    start: startOfWeekDate,
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Week of {format(startOfWeekDate, 'MMM d')} – {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Weekday headers */}
        {[...Array(7)].map((_, i) => {
          const day = addDays(startOfWeekDate, i);
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()];
          return (
            <div
              key={i}
              className={`text-center text-[10px] font-sans uppercase tracking-widest ${
                isToday(day) ? 'text-purple-600 font-bold' : 'text-slate-400'
              }`}
            >
              <div>{dayName}</div>
              <div className="text-xs">{format(day, 'MMM d')}</div>
            </div>
          );
        })}

        {/* Days */}
        {daysOfWeek.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isTodayDay = isToday(day);
          const isCurrentWeekDay = isCurrentWeek(day);

          return (
            <div
              key={index}
              className={`relative h-96 min-w-0 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900 ${
                isTodayDay
                  ? 'border-2 border-purple-600'
                  : isCurrentWeekDay
                    ? 'bg-white dark:bg-zinc-950'
                    : 'bg-slate-50 dark:bg-zinc-950/50'
              }`}
            >
              <div className="flex justify-between items-start p-2">
                <span className={`text-[10px] font-sans ${isTodayDay ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>
                  {format(day, 'd')}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  {dayEvents.length}
                </span>
              </div>

              <div className="mt-1 space-y-1 h-[calc(100%-2rem)] overflow-hidden">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className=`mb-1.5 truncate rounded-sm px-2 py-1 text-[9px] font-medium ${
                      event.isTentative
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`
                  >
                    {event.title}
                    {event.description && (
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}

                {dayEvents.length === 0 && (
                  <div className="text-xs text-slate-400 dark:text-zinc-500 text-center mt-2>
                    No events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Agenda view component
function AgendaView({
  events,
  currentDate,
}: {
  events: CalendarEvent[];
  currentDate: Date;
}) {
  const startDate = startOfDay(currentDate);
  const endDate = addDays(startDate, 30);

  const upcomingEvents = events
    .filter(event => {
      const eventStart = parseISO(event.startDate);
      return eventStart >= startDate && eventStart <= endDate;
    })
    .sort((a, b) => parseISO(a.startDate) - parseISO(b.startDate));

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-zinc-400">No upcoming events in the next 30 days.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        Upcoming events ({format(startDate, 'MMM d, yyyy')} – {format(endDate, 'MMM d, yyyy')})
      </h3>

      <div className="space-y-3">
        {upcomingEvents.map((event) => {
          const eventStart = parseISO(event.startDate);
          const eventEnd = event.endDate ? parseISO(event.endDate) : null;

          return (
            <div
              key={event.id}
              className=`flex items-start gap-4 px-4 py-3 rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors`
            >
              <div className="flex-shrink-0 h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                <CalendarIcon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-lg font-medium text-slate-900 dark:text-white truncate">
                    {event.title}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    event.isTentative
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  } dark:${
                    event.isTentative
                      ? 'bg-purple-900/30 dark:text-purple-300'
                      : 'bg-blue-900/30 dark:text-blue-300'
                  }`}
                  >
                    {event.isTentative ? 'Tentative' : 'Confirmed'}
                  </span>
                </div>

                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">
                  {format(eventStart, 'PPP')}{event.endDate ? ` – ${format(eventEnd, 'PPP')}` : ''}
                </p>

                {event.description && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-1>
                    {event.description}
                  </p>
                )}

                <div className="text-xs text-slate-400 dark:text-zinc-500 flex-wrap gap-1">
                  <span>Category: {event.category}</span>
                  {event.relatedClientId && <span>Client</span>}
                  {event.relatedProjectId && <span>Project</span>}
                  {event.relatedQuoteId && <span>Quote</span>}
                  {event.relatedInvoiceId && <span>Invoice</span>}
                  {event.relatedGalleryId && <span>Gallery</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}