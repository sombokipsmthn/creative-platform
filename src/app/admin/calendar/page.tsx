'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfDay, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, CircleAlert, Clock3, FileText, FolderKanban, Images, Receipt, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/admin/StatusBadge';

type CalendarView = 'month' | 'week' | 'agenda';
type EventCategory = 'Project' | 'Quotation' | 'Invoice' | 'Gallery' | 'Contract' | 'Studio event';

type CalendarEvent = {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  category: EventCategory;
  status: string;
  sourceType: string;
  sourceId: string;
  relatedClientId?: string | null;
  relatedProjectId?: string | null;
  relatedQuoteId?: string | null;
  relatedInvoiceId?: string | null;
  relatedGalleryId?: string | null;
  isTentative?: boolean;
};

type FilterRecord = { id: string; name: string; company?: string | null };

const categoryMeta: Record<EventCategory, { icon: typeof FolderKanban; tone: string }> = {
  Project: { icon: FolderKanban, tone: 'bg-primary/10 text-primary' },
  Quotation: { icon: FileText, tone: 'bg-secondary text-secondary-foreground' },
  Invoice: { icon: Receipt, tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  Gallery: { icon: Images, tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  Contract: { icon: FileText, tone: 'bg-muted text-muted-foreground' },
  'Studio event': { icon: CalendarDays, tone: 'bg-primary/10 text-primary' },
};

function dateRange(view: CalendarView, date: Date) {
  if (view === 'month') return { start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }) };
  if (view === 'week') return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) };
  return { start: startOfDay(date), end: addDays(startOfDay(date), 30) };
}

function eventDate(event: CalendarEvent) {
  const value = parseISO(event.startDate);
  return Number.isNaN(value.getTime()) ? null : value;
}

function EventMarker({ event, onSelect }: { event: CalendarEvent; onSelect: (event: CalendarEvent) => void }) {
  const meta = categoryMeta[event.category] ?? categoryMeta.Project;
  const Icon = meta.icon;
  return (
    <button type="button" onClick={() => onSelect(event)} className="group flex w-full min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className={`flex size-4 shrink-0 items-center justify-center rounded-sm ${meta.tone}`}><Icon className="size-3" aria-hidden="true" /></span>
      <span className="min-w-0 truncate font-medium text-foreground">{event.title}</span>
    </button>
  );
}

function LoadingState() {
  return <div className="grid gap-4" role="status" aria-label="Loading command center">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}</div>
    <Skeleton className="h-[34rem] rounded-xl" />
  </div>;
}

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [category, setCategory] = useState<'all' | EventCategory>('all');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [clients, setClients] = useState<FilterRecord[]>([]);
  const [projects, setProjects] = useState<FilterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventSaving, setEventSaving] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => dateRange(view, currentDate), [view, currentDate]);

  useEffect(() => {
    Promise.all([
      fetch('/api/clients', { cache: 'no-store' }).then(response => response.ok ? response.json() : []),
      fetch('/api/projects', { cache: 'no-store' }).then(response => response.ok ? response.json() : []),
    ]).then(([clientRows, projectRows]) => {
      setClients(Array.isArray(clientRows) ? clientRows : []);
      setProjects(Array.isArray(projectRows) ? projectRows : []);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadEvents() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ start: range.start.toISOString(), end: range.end.toISOString(), view });
        if (clientId) params.set('clientId', clientId);
        if (projectId) params.set('projectId', projectId);
        const response = await fetch(`/api/calendar?${params.toString()}`, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`Calendar request failed with status ${response.status}`);
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') return;
        setError(cause instanceof Error ? cause.message : 'Calendar data could not be loaded.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadEvents();
    return () => controller.abort();
  }, [range, view, clientId, projectId, refreshNonce]);

  const visibleEvents = useMemo(() => category === 'all' ? events : events.filter(event => event.category === category), [category, events]);
  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    visibleEvents.forEach(event => {
      const date = eventDate(event);
      if (!date) return;
      const key = format(date, 'yyyy-MM-dd');
      grouped.set(key, [...(grouped.get(key) ?? []), event]);
    });
    return grouped;
  }, [visibleEvents]);

  function move(direction: -1 | 1) {
    setCurrentDate(date => view === 'month' ? (direction === 1 ? addMonths(date, 1) : subMonths(date, 1)) : (direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1)));
  }

  function resetToday() { setCurrentDate(new Date()); }

  async function saveEvent(formData: FormData) {
    setEventSaving(true);
    try {
      const response = await fetch(editingEvent ? `/api/calendar/events/${editingEvent.sourceId}` : '/api/calendar/events', { method: editingEvent ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(formData.entries())) });
      if (!response.ok) throw new Error(editingEvent ? 'Event could not be updated' : 'Event could not be created');
      setEventFormOpen(false);
      setEditingEvent(null);
      setRefreshNonce(value => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Event could not be saved.');
    } finally {
      setEventSaving(false);
    }
  }

  async function deleteEvent() {
    if (!selectedEvent || selectedEvent.sourceType !== 'studio_event' || !window.confirm('Delete this studio event?')) return;
    setEventSaving(true);
    try {
      const response = await fetch(`/api/calendar/events/${selectedEvent.sourceId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Event could not be deleted');
      setSelectedEvent(null);
      setRefreshNonce(value => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Event could not be deleted.');
    } finally {
      setEventSaving(false);
    }
  }

  const sourceHref = selectedEvent?.sourceType === 'project' ? `/admin/projects/${selectedEvent.sourceId}` : selectedEvent?.sourceType === 'quote' ? `/admin/quotes/${selectedEvent.sourceId}` : selectedEvent?.sourceType === 'invoice' ? `/admin/invoices/${selectedEvent.sourceId}` : selectedEvent?.sourceType === 'gallery' ? `/admin/galleries/${selectedEvent.sourceId}` : selectedEvent?.sourceType === 'contract' ? `/admin/contracts/${selectedEvent.sourceId}` : null;

  return <div className="ui-page ui-page-padded">
    <div className="ui-shell">
      <AdminPageHeader title="Studio Command Center" description="Plan production activity, deadlines, and client work from one operational workspace." breadcrumb={{ label: 'Dashboard', href: '/admin' }} primaryAction={<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => { setEditingEvent(null); setEventFormOpen(true); }}><CalendarDays aria-hidden="true" />New event</Button><Button type="button" onClick={resetToday}><CalendarDays aria-hidden="true" />Today</Button></div>} />

      {eventFormOpen && <EventForm event={editingEvent} clients={clients} projects={projects} saving={eventSaving} onCancel={() => { setEventFormOpen(false); setEditingEvent(null); }} onSubmit={saveEvent} />}

      <div className="mb-6 grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-sm">Payment tracking</CardTitle></CardHeader><CardContent><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 text-muted-foreground" aria-hidden="true" /><div><p className="text-sm font-medium">Payment ledger not connected</p><p className="mt-1 text-sm text-muted-foreground">Invoice dates are shown, but balances and partial payments are unavailable until payment records are connected.</p></div></div></CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Booking schedule</CardTitle></CardHeader><CardContent><div className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-5 text-muted-foreground" aria-hidden="true" /><div><p className="text-sm font-medium">No external booking source</p><p className="mt-1 text-sm text-muted-foreground">Use New event for manually scheduled studio activity. No booking records are being inferred.</p></div></div></CardContent></Card></div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Visible events" value={visibleEvents.length} detail="In the current range" icon={CalendarDays} />
        <SummaryCard label="Projects" value={visibleEvents.filter(event => event.category === 'Project').length} detail="Production activity" icon={FolderKanban} />
        <SummaryCard label="Financial milestones" value={visibleEvents.filter(event => event.category === 'Invoice' || event.category === 'Quotation').length} detail="Quotes and invoices" icon={Receipt} />
        <SummaryCard label="Needs review" value={visibleEvents.filter(event => ['overdue', 'expired', 'declined'].includes(event.status.toLowerCase())).length} detail="Derived from source status" icon={CircleAlert} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0">
          <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><CardTitle>Calendar workspace</CardTitle><p className="mt-1 text-sm text-muted-foreground">{format(currentDate, view === 'month' ? 'MMMM yyyy' : view === 'week' ? "MMM d, yyyy" : 'MMM d, yyyy')}</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1" role="group" aria-label="Calendar navigation"><Button type="button" variant="outline" size="icon-sm" onClick={() => move(-1)} aria-label="Previous period"><ChevronLeft aria-hidden="true" /></Button><Button type="button" variant="outline" size="icon-sm" onClick={() => move(1)} aria-label="Next period"><ChevronRight aria-hidden="true" /></Button></div>
              <div className="flex rounded-lg bg-muted p-1" role="tablist" aria-label="Calendar view"><ViewButton active={view === 'month'} onClick={() => setView('month')}>Month</ViewButton><ViewButton active={view === 'week'} onClick={() => setView('week')}>Week</ViewButton><ViewButton active={view === 'agenda'} onClick={() => setView('agenda')}>Agenda</ViewButton></div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center gap-2 border-b p-4" aria-label="Event filters"><span className="mr-1 text-xs font-medium text-muted-foreground">Show</span><FilterButton active={category === 'all'} onClick={() => setCategory('all')}>All</FilterButton>{(Object.keys(categoryMeta) as EventCategory[]).map(item => <FilterButton key={item} active={category === item} onClick={() => setCategory(item)}>{item}</FilterButton>)}<select aria-label="Filter by client" value={clientId} onChange={event => setClientId(event.target.value)} className="h-7 rounded-lg border border-input bg-background px-2 text-xs"><option value="">All clients</option>{clients.map(client => <option key={client.id} value={client.id}>{client.company || client.name}</option>)}</select><select aria-label="Filter by project" value={projectId} onChange={event => setProjectId(event.target.value)} className="h-7 rounded-lg border border-input bg-background px-2 text-xs"><option value="">All projects</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></div>
            {loading ? <div className="p-4"><LoadingState /></div> : error ? <div className="admin-empty-state"><CircleAlert className="size-6 text-destructive" aria-hidden="true" /><h2>Calendar unavailable</h2><p>{error}</p><Button type="button" variant="outline" onClick={() => setCurrentDate(new Date())}><RefreshCw aria-hidden="true" />Retry</Button></div> : view === 'month' ? <MonthView currentDate={currentDate} eventsByDay={eventsByDay} onSelect={setSelectedEvent} /> : view === 'week' ? <WeekView currentDate={currentDate} eventsByDay={eventsByDay} onSelect={setSelectedEvent} /> : <AgendaView events={visibleEvents} onSelect={setSelectedEvent} />}
          </CardContent>
        </Card>

        <EventDetail event={selectedEvent} sourceHref={sourceHref} busy={eventSaving} onEdit={() => { setEditingEvent(selectedEvent); setEventFormOpen(true); }} onDelete={deleteEvent} />
      </div>
    </div>
  </div>;
}

function SummaryCard({ label, value, detail, icon: Icon }: { label: string; value: number; detail: string; icon: typeof CalendarDays }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</CardTitle><span className="flex size-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground"><Icon className="size-4" aria-hidden="true" /></span></CardHeader><CardContent><p className="text-2xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></CardContent></Card>;
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) { return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{children}</button>; }
function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) { return <Button type="button" variant={active ? 'secondary' : 'ghost'} size="sm" aria-pressed={active} onClick={onClick}>{children}</Button>; }

function MonthView({ currentDate, eventsByDay, onSelect }: { currentDate: Date; eventsByDay: Map<string, CalendarEvent[]>; onSelect: (event: CalendarEvent) => void }) {
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }) });
  return <div className="overflow-x-auto"><div className="min-w-[42rem]"><div className="grid grid-cols-7 border-b bg-muted/40">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground">{day}</div>)}</div><div className="grid grid-cols-7">{days.map(day => { const dayEvents = eventsByDay.get(format(day, 'yyyy-MM-dd')) ?? []; const today = isSameDay(day, new Date()); return <div key={day.toISOString()} className={`min-h-28 border-b border-r p-2 ${!isSameMonth(day, currentDate) ? 'bg-muted/20' : ''}`}><div className="mb-1 flex items-center justify-between"><span className={`text-xs font-medium ${today ? 'flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{format(day, 'd')}</span>{dayEvents.length > 0 && <span className="text-[10px] text-muted-foreground">{dayEvents.length}</span>}</div><div className="space-y-0.5">{dayEvents.slice(0, 3).map(event => <EventMarker key={`${event.sourceType}-${event.sourceId}`} event={event} onSelect={onSelect} />)}{dayEvents.length > 3 && <p className="px-1.5 text-[11px] text-muted-foreground">+{dayEvents.length - 3} more</p>}</div></div>; })}</div></div></div>;
}

function WeekView({ currentDate, eventsByDay, onSelect }: { currentDate: Date; eventsByDay: Map<string, CalendarEvent[]>; onSelect: (event: CalendarEvent) => void }) {
  const days = eachDayOfInterval({ start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) });
  return <div className="grid grid-cols-1 divide-y md:grid-cols-7 md:divide-x md:divide-y-0">{days.map(day => <div key={day.toISOString()} className="min-h-64 p-3"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-medium text-muted-foreground">{format(day, 'EEE')}</p><p className={`text-lg font-semibold ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>{format(day, 'd')}</p></div><span className="text-xs text-muted-foreground">{format(day, 'MMM')}</span></div><div className="space-y-1">{(eventsByDay.get(format(day, 'yyyy-MM-dd')) ?? []).map(event => <EventMarker key={`${event.sourceType}-${event.sourceId}`} event={event} onSelect={onSelect} />)}</div></div>)}</div>;
}

function AgendaView({ events, onSelect }: { events: CalendarEvent[]; onSelect: (event: CalendarEvent) => void }) {
  const sorted = [...events].sort((a, b) => (eventDate(a)?.getTime() ?? 0) - (eventDate(b)?.getTime() ?? 0));
  if (!sorted.length) return <div className="admin-empty-state"><CalendarDays className="size-6 text-muted-foreground" aria-hidden="true" /><h2>No events in this range</h2><p>Authorized production and financial milestones will appear here.</p></div>;
  return <div className="divide-y">{sorted.map(event => { const date = eventDate(event); return <button key={`${event.sourceType}-${event.sourceId}`} type="button" onClick={() => onSelect(event)} className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><span className="w-20 shrink-0 text-xs text-muted-foreground">{date ? format(date, 'EEE, MMM d') : 'Undated'}</span><span className="min-w-0 flex-1"><span className="block truncate font-medium">{event.title}</span><span className="mt-1 block truncate text-sm text-muted-foreground">{event.description || event.category}</span></span><StatusBadge status={event.status} /></button>; })}</div>;
}

function EventForm({ event, clients, projects, saving, onCancel, onSubmit }: { event: CalendarEvent | null; clients: FilterRecord[]; projects: FilterRecord[]; saving: boolean; onCancel: () => void; onSubmit: (formData: FormData) => void }) {
  const startValue = event?.startDate ? event.startDate.slice(0, 16) : '';
  const endValue = event?.endDate ? event.endDate.slice(0, 16) : '';
  return <Card className="mb-6"><CardHeader><CardTitle>{event ? 'Edit studio event' : 'New studio event'}</CardTitle></CardHeader><CardContent><form className="grid gap-4 sm:grid-cols-2" action={onSubmit}><label className="grid gap-1 text-sm"><span>Title</span><input name="title" defaultValue={event?.title ?? ''} required className="h-8 rounded-lg border border-input bg-background px-2.5" /></label><label className="grid gap-1 text-sm"><span>Starts</span><input name="startsAt" defaultValue={startValue} type="datetime-local" required className="h-8 rounded-lg border border-input bg-background px-2.5" /></label><label className="grid gap-1 text-sm"><span>Ends</span><input name="endsAt" defaultValue={endValue} type="datetime-local" className="h-8 rounded-lg border border-input bg-background px-2.5" /></label><label className="grid gap-1 text-sm"><span>Client</span><select name="clientId" defaultValue={event?.relatedClientId ?? ''} className="h-8 rounded-lg border border-input bg-background px-2.5"><option value="">No client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.company || client.name}</option>)}</select></label><label className="grid gap-1 text-sm"><span>Project</span><select name="projectId" defaultValue={event?.relatedProjectId ?? ''} className="h-8 rounded-lg border border-input bg-background px-2.5"><option value="">No project</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="grid gap-1 text-sm sm:col-span-2"><span>Description</span><textarea name="description" defaultValue={event?.description ?? ''} className="min-h-20 rounded-lg border border-input bg-background p-2.5" /></label><div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : event ? 'Save changes' : 'Create event'}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div></form></CardContent></Card>;
}

function EventDetail({ event, sourceHref, onEdit, onDelete, busy }: { event: CalendarEvent | null; sourceHref: string | null; onEdit: () => void; onDelete: () => void; busy: boolean }) {
  if (!event) return <Card className="h-fit"><CardHeader><CardTitle>Event details</CardTitle></CardHeader><CardContent><div className="admin-empty-state p-4"><Clock3 className="size-6 text-muted-foreground" aria-hidden="true" /><p>Select an event to inspect its source and status.</p></div></CardContent></Card>;
  const date = eventDate(event);
  return <Card className="h-fit"><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{event.title}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{event.category}</p></div><Badge variant={event.isTentative ? 'warning' : 'secondary'}>{event.isTentative ? 'Tentative' : 'Source record'}</Badge></div></CardHeader><CardContent className="space-y-4"><div><p className="ui-eyebrow">When</p><p className="mt-1 text-sm">{date ? format(date, 'EEEE, MMMM d, yyyy') : 'Date unavailable'}</p></div><div><p className="ui-eyebrow">Status</p><div className="mt-1"><StatusBadge status={event.status} /></div></div>{event.description && <div><p className="ui-eyebrow">Notes</p><p className="mt-1 text-sm text-muted-foreground">{event.description}</p></div>}<div><p className="ui-eyebrow">Source</p><div className="flex flex-wrap gap-2">{sourceHref ? <Link className="mt-1 inline-flex text-sm text-primary underline-offset-4 hover:underline" href={sourceHref}>Open source record <span aria-hidden="true">→</span></Link> : <p className="mt-1 text-sm text-muted-foreground">Studio event</p>}{event.sourceType === 'studio_event' && <><Button type="button" variant="outline" size="sm" onClick={onEdit}>Edit</Button><Button type="button" variant="destructive" size="sm" disabled={busy} onClick={onDelete}>Delete</Button></>}</div></div></CardContent></Card>;
}
