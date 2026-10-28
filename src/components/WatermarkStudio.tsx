'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { WarningCircle as AlertCircle, Check, Image as ImageIcon, CircleNotch as Loader2, ArrowCounterClockwise as RotateCcw, TextT as Type } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
type Preset = {
  id: string;
  name: string;
  enabled: boolean;
  text: string;
  position: Position;
  opacity: number;
  fontSize: number;
  imageUrl?: string | null;
  imageFilename?: string | null;
};

type Settings = Omit<Preset, 'id' | 'name'>;
const defaults: Settings = { enabled: true, text: 'KIPSMTHN', position: 'bottom-right', opacity: 55, fontSize: 42 };
const positions: { value: Position; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'center', label: 'Center' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
];

const positionClass: Record<Position, string> = {
  'top-left': 'left-5 top-5',
  'top-right': 'right-5 top-5',
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  'bottom-left': 'bottom-5 left-5',
  'bottom-right': 'bottom-5 right-5',
};

export default function WatermarkStudio() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saved, setSaved] = useState<Settings>(defaults);
  const [preset, setPreset] = useState<Preset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [sample, setSample] = useState<'landscape' | 'portrait'>('landscape');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(saved), [settings, saved]);

  useEffect(() => {
    let active = true;
    fetch('/api/watermark-presets', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load watermark settings.');
        const body = await response.json() as { presets?: Preset[] };
        const first = body.presets?.[0];
        if (active && first) {
          const next = { enabled: first.enabled, text: first.text, position: first.position, opacity: first.opacity, fontSize: first.fontSize };
          setPreset(first); setSettings(next); setSaved(next);
        }
      })
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : 'Unable to load watermark settings.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setStatus(null); setError(null); setSettings((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (saving || !dirty) return;
    setSaving(true); setStatus(null); setError(null);
    try {
      const payload = { ...(preset ? { id: preset.id, imageUrl: preset.imageUrl, imagePath: (preset as Preset & { imagePath?: string | null }).imagePath, imageFilename: preset.imageFilename, imageMimeType: preset.imageUrl ? 'image/png' : null } : {}), name: preset?.name || 'Default', ...settings };
      const response = await fetch('/api/watermark-presets', {
        method: preset ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null) as { preset?: Preset; error?: string } | null;
      if (!response.ok || !body?.preset) throw new Error(body?.error || 'Unable to save watermark settings.');
      const next = { enabled: body.preset.enabled, text: body.preset.text, position: body.preset.position, opacity: body.preset.opacity, fontSize: body.preset.fontSize };
      setPreset(body.preset); setSettings(next); setSaved(next); setStatus('Watermark settings saved.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save watermark settings.');
    } finally { setSaving(false); }
  };

  const uploadImage = async (file: File) => {
    if (!preset) { setError('Save the text watermark before uploading an image.'); return; }
    if (file.type !== 'image/png' || file.size > 5 * 1024 * 1024) { setError('Choose a PNG watermark smaller than 5 MB.'); return; }
    setUploadingImage(true); setError(null); setStatus(null);
    try {
      const form = new FormData(); form.append('presetId', preset.id); form.append('file', file);
      const response = await fetch('/api/watermark-presets/image', { method: 'POST', body: form });
      const body = await response.json().catch(() => null) as { preset?: Preset; error?: string } | null;
      if (!response.ok || !body?.preset) throw new Error(body?.error || 'Unable to upload watermark image.');
      setPreset(body.preset); setStatus('Watermark image uploaded.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to upload watermark image.'); }
    finally { setUploadingImage(false); }
  };
  const removeImage = async () => {
    if (!preset) return;
    setUploadingImage(true); setError(null);
    try {
      const response = await fetch('/api/watermark-presets/image', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ presetId: preset.id }) });
      const body = await response.json().catch(() => null) as { preset?: Preset; error?: string } | null;
      if (!response.ok || !body?.preset) throw new Error(body?.error || 'Unable to remove watermark image.');
      setPreset(body.preset); setStatus('Watermark image removed.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to remove watermark image.'); }
    finally { setUploadingImage(false); }
  };
  const reset = () => { setSettings(saved); setStatus('Unsaved changes reverted.'); setError(null); };
  const selectedPosition = positionClass[settings.position];

  if (loading) return <div className="ui-loading-state" aria-live="polite"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span>Loading watermark studio…</span></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-primary bg-primary/15 p-4 text-sm dark:border-primary/50 dark:bg-primary/10 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-medium text-slate-900 dark:text-white">Global gallery default</p><p className="text-xs text-slate-600 dark:text-zinc-400">New galleries can inherit this preset. Gallery-specific settings remain editable in each gallery.</p></div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary dark:text-primary"><span className="h-2 w-2 rounded-full bg-primary" />{preset ? 'Saved preset' : 'First-time setup'}</span>
      </div>

      {(error || status) && <div role={error ? 'alert' : 'status'} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'}`}><span aria-hidden>{error ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}</span>{error || status}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
        <section className="ui-card overflow-hidden" aria-labelledby="watermark-preview-title">
          <div className="ui-card-header flex items-start justify-between gap-4"><div><p className="ui-eyebrow">Preview workspace</p><h2 id="watermark-preview-title" className="ui-section-title mt-1">Client gallery preview</h2><p className="ui-caption mt-1">Updates instantly as you refine the watermark.</p></div><div className="flex gap-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] p-1"><button type="button" aria-pressed={sample === 'landscape'} onClick={() => { setSample('landscape'); setImageFailed(false); }} className={`rounded-md px-2 py-1 text-xs ${sample === 'landscape' ? 'bg-[var(--color-bg-card)] font-medium shadow-sm' : 'text-[var(--color-text-muted)]'}`}>Landscape</button><button type="button" aria-pressed={sample === 'portrait'} onClick={() => { setSample('portrait'); setImageFailed(false); }} className={`rounded-md px-2 py-1 text-xs ${sample === 'portrait' ? 'bg-[var(--color-bg-card)] font-medium shadow-sm' : 'text-[var(--color-text-muted)]'}`}>Portrait</button></div></div>
          <div className="p-4 sm:p-6"><div className={`relative mx-auto overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-700 to-amber-700 shadow-2xl ${sample === 'portrait' ? 'aspect-[3/4] max-w-[28rem]' : 'aspect-[16/10]'}`}>
            {!imageFailed && <img src={sample === 'landscape' ? '/team-photo.jpg' : '/team-photo.jpg'} alt="Sample photograph used for watermark preview" className="absolute inset-0 h-full w-full object-cover opacity-80" onError={() => setImageFailed(true)} />}
            {imageFailed && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-950 via-slate-700 to-amber-700 p-6 text-center text-white"><ImageIcon className="h-8 w-8 opacity-70" /><p className="text-sm font-medium">Sample preview</p><p className="text-xs text-white/70">Your watermark will appear over gallery photographs here.</p></div>}
            {settings.enabled && preset?.imageUrl && <img src={preset.imageUrl} alt="Uploaded watermark preview" className={`absolute max-h-1/3 max-w-[32%] object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,.7)] ${selectedPosition}`} style={{ opacity: settings.opacity / 100 }} />}
            {settings.enabled && <div className={`absolute max-w-[85%] break-words text-white drop-shadow-[0_2px_3px_rgba(0,0,0,.7)] ${selectedPosition}`} style={{ opacity: settings.opacity / 100, fontSize: `clamp(0.8rem, ${settings.fontSize / 5}vw, ${settings.fontSize}px)`, letterSpacing: '0.14em', fontWeight: 700 }}>{settings.text || 'KIPSMTHN'}</div>}
            <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/90">Sample preview</span>
          </div><p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">Preview reflects gallery display images. It does not alter original files or imply protection for print and full-resolution delivery.</p></div>
        </section>

        <section className="ui-card" aria-labelledby="watermark-controls-title"><div className="ui-card-header"><p className="ui-eyebrow">Configuration</p><h2 id="watermark-controls-title" className="ui-section-title mt-1">Watermark style</h2></div><div className="ui-card-content space-y-5">
          <div className="grid grid-cols-2 gap-2"><button type="button" className="flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-3 py-2 text-left text-sm font-medium text-primary dark:bg-primary/10 dark:text-primary"><Type className="h-4 w-4" />Text watermark</button><button type="button" onClick={() => fileInputRef.current?.click()} disabled={!preset || uploadingImage} className="flex items-center gap-2 rounded-lg border border-[var(--color-border-subtle)] px-3 py-2 text-left text-sm text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-50"><ImageIcon className="h-4 w-4" />{uploadingImage ? 'Uploading…' : 'Upload PNG image'}</button></div>
          <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">Image watermark</p><p className="text-xs text-[var(--color-text-muted)]">Transparent PNG, up to 5 MB.</p></div>{preset?.imageFilename && <Button type="button" variant="ghost" size="sm" onClick={removeImage} disabled={uploadingImage}>Remove</Button>}</div>{preset?.imageUrl && <div className="mt-3 flex items-center gap-3"><img src={preset.imageUrl} alt="Uploaded watermark" className="h-12 max-w-40 object-contain rounded border bg-white p-1" /><span className="truncate text-xs text-[var(--color-text-muted)]">{preset.imageFilename}</span></div>}<input ref={fileInputRef} type="file" accept="image/png" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.target.value = ''; }} /></div>
          <div className="ui-field"><label htmlFor="watermark-text" className="ui-label">Watermark text</label><Input id="watermark-text" value={settings.text} maxLength={120} onChange={(event) => update('text', event.target.value)} placeholder="KIPSMTHN" /><p className="ui-field-hint">Use a short brand mark that remains legible over varied images.</p></div>
          <div className="ui-field"><label htmlFor="watermark-opacity" className="ui-label">Opacity <output htmlFor="watermark-opacity" className="float-right font-medium text-primary">{settings.opacity}%</output></label><input id="watermark-opacity" type="range" min="0" max="100" value={settings.opacity} onChange={(event) => update('opacity', Number(event.target.value))} className="w-full accent-primary" /></div>
          <div className="ui-field"><label htmlFor="watermark-size" className="ui-label">Size <output htmlFor="watermark-size" className="float-right font-medium text-primary">{settings.fontSize}px</output></label><input id="watermark-size" type="range" min="12" max="160" value={settings.fontSize} onChange={(event) => update('fontSize', Number(event.target.value))} className="w-full accent-primary" /></div>
          <fieldset><legend className="ui-label">Position</legend><div className="grid grid-cols-3 gap-2">{positions.map((item) => <button key={item.value} type="button" aria-label={`Place watermark ${item.label.toLowerCase()}`} aria-pressed={settings.position === item.value} onClick={() => update('position', item.value)} className={`min-h-10 rounded-lg border px-2 text-xs transition-colors ${settings.position === item.value ? 'border-primary bg-primary/10 font-medium text-primary dark:bg-primary/10 dark:text-primary' : 'border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-primary'}`}>{item.label}</button>)}</div></fieldset>
          <label className="flex cursor-pointer items-center gap-3 border-t border-[var(--color-border-subtle)] pt-4 text-sm"><input type="checkbox" checked={settings.enabled} onChange={(event) => update('enabled', event.target.checked)} className="h-4 w-4 accent-primary" />Show watermark in gallery previews</label>
          <div className="flex flex-wrap gap-2 border-t border-[var(--color-border-subtle)] pt-4"><Button type="button" onClick={save} disabled={saving || !dirty} className="min-w-32">{saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving</> : 'Save changes'}</Button><Button type="button" variant="ghost" onClick={reset} disabled={!dirty}><RotateCcw className="h-4 w-4" />Revert</Button></div>
        </div></section>
      </div>
      <div className="ui-card p-4 text-sm text-[var(--color-text-secondary)]"><p className="font-medium text-[var(--color-text-primary)]">Delivery scope</p><p className="mt-1">Watermarks are applied to gallery display and web-sized processed images. Original files, print output, video, and full-resolution delivery are not modified by this setting.</p></div>
    </div>
  );
}
