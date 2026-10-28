export type ShortcutKeyEvent = Pick<KeyboardEvent, 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'code' | 'key'>;

export function isPaletteShortcut(event: ShortcutKeyEvent) {
  return (event.metaKey || event.ctrlKey) && event.shiftKey && (event.code === 'Period' || event.key === '>');
}

export function isShortcutsHelpShortcut(event: ShortcutKeyEvent) {
  return event.altKey && event.shiftKey && event.code === 'Slash';
}
