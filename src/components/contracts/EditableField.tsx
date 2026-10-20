'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FieldMetadata } from '@/lib/contracts/fieldMetadata';
import type { Client, Project } from '@/lib/types/contracts';

interface EditableFieldProps {
  field: FieldMetadata;
  value: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  clients?: Client[];
  projects?: Project[];
  isRequired?: boolean;
  isInvalid?: boolean;
  currency?: string;
}

export function EditableField({ field, value, isEditing, onStartEdit, onSave, onCancel, clients, projects, isRequired, isInvalid, currency = 'KES' }: EditableFieldProps) {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => setTempValue(value), [value]);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) inputRef.current.select();
    }
  }, [isEditing]);

  const save = () => { if (!isRequired || tempValue.trim()) onSave(tempValue); };
  const keyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && field.type !== 'textarea') save();
    if (event.key === 'Escape') onCancel();
  };

  if (!isEditing) {
    const empty = !value?.trim();
    return <button type="button" onClick={onStartEdit} className={`inline rounded-md border px-1.5 py-0.5 text-left font-medium transition-colors ${empty ? 'border-dashed border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300' : 'border-transparent hover:border-border hover:bg-muted'} ${isInvalid ? 'border-destructive ring-2 ring-destructive/20' : ''}`} title={`Edit ${field.label}`} aria-label={`Edit ${field.label}`}>
      {empty ? `[Add ${field.label.toLowerCase()}]` : value}
    </button>;
  }

  const common = 'h-10 rounded-md border-input bg-background pr-20 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40';
  const select = (options: React.ReactNode) => <select ref={inputRef as React.Ref<HTMLSelectElement>} value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} className={`${common} w-full appearance-auto px-3`}>{options}</select>;
  let control: React.ReactNode;
  switch (field.type) {
    case 'textarea': control = <textarea ref={inputRef as React.Ref<HTMLTextAreaElement>} value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} rows={3} className={`${common} h-auto min-h-20 w-full resize-y px-3 py-2`} />; break;
    case 'date': control = <Input ref={inputRef as React.Ref<HTMLInputElement>} type="date" value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} className={common} />; break;
    case 'number': control = <Input ref={inputRef as React.Ref<HTMLInputElement>} type="number" value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} placeholder="0" className={common} />; break;
    case 'currency': control = <div className="relative"><span className="pointer-events-none absolute left-3 top-2.5 text-xs font-medium text-muted-foreground">{currency}</span><Input ref={inputRef as React.Ref<HTMLInputElement>} type="number" value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} placeholder="0.00" step="0.01" className={`${common} pl-12`} /></div>; break;
    case 'percentage': control = <div className="relative"><Input ref={inputRef as React.Ref<HTMLInputElement>} type="number" value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} placeholder="0" min="0" max="100" className={common} /><span className="pointer-events-none absolute right-20 top-2.5 text-xs text-muted-foreground">%</span></div>; break;
    case 'email': control = <Input ref={inputRef as React.Ref<HTMLInputElement>} type="email" value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} placeholder="email@example.com" className={common} />; break;
    case 'phone': control = <Input ref={inputRef as React.Ref<HTMLInputElement>} type="tel" value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} placeholder="Phone number" className={common} />; break;
    case 'client': control = select(<><option value="">Select a client…</option>{clients?.map((client) => <option key={client.id} value={client.id}>{client.name}{client.company ? ` (${client.company})` : ''}</option>)}</>); break;
    case 'project': control = select(<><option value="">Select a project…</option>{projects?.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</>); break;
    case 'select': control = field.key === 'currency' ? select(['KES', 'USD', 'EUR', 'GBP', 'ZAR', 'NGN'].map((item) => <option key={item} value={item}>{item}</option>)) : <Input ref={inputRef as React.Ref<HTMLInputElement>} value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} className={common} />; break;
    default: control = <Input ref={inputRef as React.Ref<HTMLInputElement>} value={tempValue} onChange={(event) => setTempValue(event.target.value)} onKeyDown={keyDown} aria-label={field.label} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} aria-invalid={isInvalid || undefined} className={`${common} ${isInvalid ? 'border-destructive ring-2 ring-destructive/20' : ''}`} />;
  }

  return <span className="relative my-1 inline-flex w-full min-w-48 align-middle sm:w-auto sm:min-w-72" data-field={field.key}>
    {control}
    <span className="absolute right-1 top-1 flex h-8 items-center gap-0.5 rounded-md border border-border bg-background/95 px-0.5 shadow-sm">
      <Button type="button" variant="ghost" size="icon-xs" onClick={save} disabled={isRequired && !tempValue.trim()} aria-label={`Save ${field.label}`} title="Save"><Check /></Button>
      <Button type="button" variant="ghost" size="icon-xs" onClick={onCancel} aria-label={`Discard ${field.label}`} title="Discard"><X /></Button>
    </span>
  </span>;
}
