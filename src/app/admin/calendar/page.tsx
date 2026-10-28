'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subDays, subMonths } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Badge } from '@/components/ui/badge';
const calendarCategories = ['project', 'quote', 'invoice', 'gallery', 'contract', 'studio_event'] as const;

type CalendarView = 'month' | 'week' | 'agenda';
type CalendarEvent = {
  id: string; title: string; description?: string | null; startDate: string; endDate?: string | null;
  allDay?: boolean; category: string; status: string; sourceType: string; sourceId: string;
  isTentative?: boolean; relatedClientId?: string | null; relatedProjectId?: string | null;
};
const validViews: CalendarView[] = ['month', 'week', 'agenda'];
const categoryNames = calendarCategories as readonly string[];

function eventHref(event: CalendarEvent) {
  const paths: Record<string, string> = { project: 'projects', quote: 'quotes', invoice: 'invoices', gallery: 'galleries', contract: 'contracts' };
  return paths[event.sourceType] ? `/admin/${paths[event.sourceType]}/${event.sourceId}` : '/admin/calendar';
}

function CalendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const dateParam = searchParams.get('date');
  const view: CalendarView = validViews.includes(viewParam as CalendarView) ? viewParam as CalendarView : 'month';
  const currentDate = useMemo(() => dateParam && !Number.isNaN(Date.parse(dateParam)) ? parseISO(dateParam) : new Date(), [dateParam]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', startsAt: '', endsAt: '', allDay: false, eventType: 'client_event', location: '' });

  const setUrlState = useCallback((nextView: CalendarView, nextDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', nextView);
    params.set('date', format(nextDate, 'yyyy-MM-dd'));
    router.replace(`/admin/calendar?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const { startDate, endDate } = useMemo(() => {
    if (view === 'week') return { startDate: startOfWeek(currentDate, { weekStartsOn: 1 }), endDate: endOfWeek(currentDate, { weekStartsOn: 1 }) };
    if (view === 'agenda') { const startDate = new Date(currentDate); startDate.setHours(0, 0, 0, 0); return { startDate, endDate: addDays(startDate, 30) }; }
    return { startDate: startOfMonth(currentDate), endDate: endOfMonth(currentDate) };
  }, [view, currentDate]);

  const loadEvents = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ start: startDate.toISOString(), end: endDate.toISOString() });
      const response = await fetch(`/api/calendar?${params}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load calendar events.');
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load calendar events.'); }
    finally { setLoading(false); }
  }, [startDate, endDate]);
  useEffect(() => { void loadEvents(); }, [loadEvents]);

  const visibleEvents = useMemo(() => events.filter(event => filter.length === 0 || filter.some(category => {
    const labels: Record<string, string> = { project: 'Project', quote: 'Quotation', invoice: 'Invoice', gallery: 'Gallery', contract: 'Contract', studio_event: 'Studio event' };
    return labels[category] === event.category;
  })), [events, filter]);
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    visibleEvents.forEach(event => {
      const key = format(parseISO(event.startDate), 'yyyy-MM-dd');
      map.set(key, [...(map.get(key) ?? []), event]);
    });
    return map;
  }, [visibleEvents]);
  const days = useMemo(() => view === 'week'
    ? eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) })
    : eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }), [view, currentDate]);

  function shiftDate(direction: number) {
    const next = view === 'month' ? (direction > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1)) : (direction > 0 ? addDays(currentDate, view === 'week' ? 7 : 1) : subDays(currentDate, view === 'week' ? 7 : 1));
    setUrlState(view, next);
  }

  async function createEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setFormError('');
    try {
      const response = await fetch('/api/calendar/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not create event.');
      setCreateOpen(false); setForm({ title: '', description: '', startsAt: '', endsAt: '', allDay: false, eventType: 'client_event', location: '' });
      await loadEvents();
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Could not create event.'); }
    finally { setSaving(false); }
  }

  const title = view === 'month' ? format(currentDate, 'MMMM yyyy') : view === 'week' ? `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}` : `Agenda from ${format(currentDate, 'MMM d, yyyy')}`;
  const eventButton = <Button type="button" onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />New Studio Event</Button>;

  return <main className="admin-calendar-page bg-background"><div className="ui-shell admin-calendar-content py-5 sm:py-6">
    <AdminPageHeader title="Studio Calendar" description="Plan shoots, client milestones, and studio work." breadcrumb={{ label: 'Dashboard', href: '/admin' }} primaryAction={eventButton} />
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Previous" onClick={() => shiftDate(-1)}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" onClick={() => setUrlState(view, new Date())}>Today</Button><Button variant="outline" size="icon" aria-label="Next" onClick={() => shiftDate(1)}><ChevronRight className="h-4 w-4" /></Button><h2 className="ml-2 font-semibold">{title}</h2></div>
      <div className="flex gap-1 rounded-lg border p-1" aria-label="Calendar view">{validViews.map(item => <Button key={item} size="sm" variant={view === item ? 'primary' : 'ghost'} onClick={() => setUrlState(item, currentDate)}>{item[0].toUpperCase() + item.slice(1)}</Button>)}</div>
    </div>
    <div className="mb-5 flex flex-wrap gap-2" aria-label="Filter categories">{categoryNames.map(category => { const active = filter.includes(category); const label = category.replace('_', ' '); return <button type="button" key={category} onClick={() => setFilter(active ? filter.filter(item => item !== category) : [...filter, category])} className={`rounded-full border px-3 py-1.5 text-xs capitalize ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}>{label}</button>; })}</div>
    {error && <div role="alert" className="mb-4 rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}<Button className="ml-3" variant="outline" onClick={() => void loadEvents()}>Retry</Button></div>}
    {loading ? <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">Loading calendar…</div> : view === 'agenda' ? <div className="divide-y rounded-xl border">{visibleEvents.length ? visibleEvents.map(event => <EventRow key={event.id} event={event} onClick={() => setSelected(event)} />) : <Empty onCreate={() => setCreateOpen(true)} />}</div> : <div className="overflow-x-auto rounded-xl border"><div className="min-w-[720px]">
      {view === 'month' ? <div className="grid grid-cols-7 border-b text-center text-xs text-muted-foreground">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <div key={day} className="p-3">{day}</div>)}</div> : null}
      <div className="grid grid-cols-7">{view === 'month' && Array.from({ length: (days[0].getDay() + 6) % 7 }, (_, i) => <div key={`pad-${i}`} className="min-h-28 border-b border-r bg-muted/20" />)}{days.map(day => { const dayEvents = byDay.get(format(day, 'yyyy-MM-dd')) ?? []; return <div key={day.toISOString()} className={`min-h-28 border-b border-r p-2 ${view === 'week' ? 'min-h-72' : ''} ${!isSameMonth(day, currentDate) ? 'bg-muted/20' : ''}`}><button className={`mb-2 text-xs ${isSameDay(day, new Date()) ? 'font-bold text-primary' : 'text-muted-foreground'}`} onClick={() => setUrlState('agenda', day)}>{format(day, view === 'week' ? 'EEE d' : 'd')}</button><div className="space-y-1">{dayEvents.slice(0, view === 'week' ? 10 : 3).map(event => <button key={event.id} onClick={() => setSelected(event)} className="block w-full truncate rounded border border-border/60 px-1.5 py-1 text-left text-xs hover:bg-muted" title={event.title}>{event.isTentative && <span className="mr-1 text-primary">Tentative</span>}{event.title}</button>)}{dayEvents.length > (view === 'week' ? 10 : 3) && <p className="text-xs text-muted-foreground">+{dayEvents.length - (view === 'week' ? 10 : 3)} more</p>}</div></div>; })}</div>
      {!visibleEvents.length && <div className="p-2"><Empty onCreate={() => setCreateOpen(true)} /></div>}
    </div></div>}
  </div>
  {(createOpen || selected) && <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onMouseDown={event => { if (event.target === event.currentTarget) { setCreateOpen(false); setSelected(null); } }}><section role="dialog" aria-modal="true" aria-label={createOpen ? 'New Studio Event' : 'Event details'} className="h-full w-full max-w-md overflow-y-auto border-l bg-background p-6"><div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-semibold">{createOpen ? 'New Studio Event' : selected?.title}</h2><Button variant="ghost" size="icon" onClick={() => { setCreateOpen(false); setSelected(null); }} aria-label="Close"><X className="h-4 w-4" /></Button></div>
    {createOpen ? <form onSubmit={createEvent} className="space-y-4"><label className="block text-sm">Title<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label><label className="block text-sm">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label><label className="block text-sm">Starts<input required type="datetime-local" value={form.startsAt ? format(parseISO(form.startsAt), "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => setForm({ ...form, startsAt: e.target.value ? new Date(e.target.value).toISOString() : '' })} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label><label className="block text-sm">Ends<input type="datetime-local" value={form.endsAt ? format(parseISO(form.endsAt), "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => setForm({ ...form, endsAt: e.target.value ? new Date(e.target.value).toISOString() : '' })} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label><label className="block text-sm">Location<input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} />All day</label>{formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}<Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create event'}</Button></form> : selected && <div className="space-y-4 text-sm"><Badge>{selected.isTentative ? 'Tentative' : selected.category}</Badge><p className="flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4" />{format(parseISO(selected.startDate), 'PPP p')}{selected.endDate ? ` – ${format(parseISO(selected.endDate), 'p')}` : ''}</p>{selected.description && <p>{selected.description}</p>}<p className="text-muted-foreground">{selected.category} · {selected.status}</p>{(selected.relatedClientId || selected.relatedProjectId) && <Button onClick={() => router.push(eventHref(selected))}>Open related record</Button>}</div>}
  </section></div>}
  </main>;
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<main className="admin-calendar-page bg-background"><div className="ui-shell py-6"><div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">Loading calendar…</div></div></main>}>
      <CalendarContent />
    </Suspense>
  );
}

function EventRow({ event, onClick }: { event: CalendarEvent; onClick: () => void }) { return <button onClick={onClick} className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/40"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block font-medium">{event.title}</span><span className="block text-sm text-muted-foreground">{format(parseISO(event.startDate), 'EEE, MMM d · p')} · {event.category}{event.isTentative ? ' · Tentative' : ''}</span>{event.description && <span className="mt-1 block truncate text-sm text-muted-foreground">{event.description}</span>}</span></button>; }
function Empty({ onCreate }: { onCreate: () => void }) { return <div className="py-12 text-center"><CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Nothing scheduled here</p><p className="mt-1 text-sm text-muted-foreground">Add an event to keep your studio plans in view.</p><Button className="mt-4" variant="outline" onClick={onCreate}>Schedule something</Button></div>; }
