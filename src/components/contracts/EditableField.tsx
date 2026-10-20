'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FieldMetadata } from '@/lib/contracts/fieldMetadata';
import type { Client, Project } from '@/lib/types/contracts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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

<<<<<<< HEAD
  useEffect(() => setTempValue(value), [value]);
=======
  // Synchronize the local editor buffer when the parent value changes.
  useEffect(() => {
    // The editor buffer intentionally mirrors a changing parent value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTempValue(value);
  }, [value]);

>>>>>>> c898786fba874637680566941fd0b37ceea58254
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

<<<<<<< HEAD
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
=======
  // Edit mode - render appropriate input type
  const baseInputClasses =
    'px-3 py-2 bg-white dark:bg-gray-800 border-2 border-purple-400 dark:border-purple-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400';

  const inputContent = (() => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            rows={3}
            className={`${baseInputClasses} block w-full resize-none font-sans`}
          />
        );

      case 'date':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="date"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${baseInputClasses} w-40`}
          />
        );

      case 'number':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="number"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className={`${baseInputClasses} w-32`}
          />
        );

      case 'currency':
        return (
          <div className="inline-flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currency}</span>
            <input
              ref={inputRef as React.Ref<HTMLInputElement>}
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              step="0.01"
              className={`${baseInputClasses} w-40`}
            />
          </div>
        );

      case 'percentage':
        return (
          <div className="inline-flex items-center gap-2">
            <input
              ref={inputRef as React.Ref<HTMLInputElement>}
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              min="0"
              max="100"
              className={`${baseInputClasses} w-20`}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">%</span>
          </div>
        );

      case 'email':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="email"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="email@example.com"
            className={`${baseInputClasses} w-64`}
          />
        );

      case 'phone':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="tel"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="+1 (555) 000-0000"
            className={`${baseInputClasses} w-48`}
          />
        );

      case 'client':
        return (
          <Select value={tempValue || 'none'} onValueChange={(value) => setTempValue(value === 'none' ? '' : value)}><SelectTrigger className={`${baseInputClasses} w-64`}><SelectValue placeholder="Select a client..." /></SelectTrigger><SelectContent><SelectItem value="none">Select a client...</SelectItem>{clients?.map((client) => <SelectItem key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ''}</SelectItem>)}</SelectContent></Select>
        );

      case 'project':
        return (
          <Select value={tempValue || 'none'} onValueChange={(value) => setTempValue(value === 'none' ? '' : value)}><SelectTrigger className={`${baseInputClasses} w-64`}><SelectValue placeholder="Select a project..." /></SelectTrigger><SelectContent><SelectItem value="none">Select a project...</SelectItem>{projects?.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select>
        );

      case 'select':
        // For currency select
        if (field.key === 'currency') {
          return (
            <Select value={tempValue} onValueChange={setTempValue}><SelectTrigger className={`${baseInputClasses} w-32`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="KES">KES</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="ZAR">ZAR</SelectItem><SelectItem value="NGN">NGN</SelectItem></SelectContent></Select>
          );
        }
        // Default text input
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`${baseInputClasses} w-96`}
          />
        );

      case 'text':
      default:
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`${baseInputClasses} w-96`}
          />
        );
    }
  })();

  return (
    <div className="inline-flex items-center gap-2 align-top">
      {inputContent}
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm" onClick={handleSave} disabled={isRequired && !tempValue.trim()} className="text-green-600" title="Save"><Check className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon-sm" onClick={onCancel} className="text-red-600" title="Cancel"><X className="h-4 w-4" /></Button>
      </div>
    </div>
  );
>>>>>>> c898786fba874637680566941fd0b37ceea58254
}
