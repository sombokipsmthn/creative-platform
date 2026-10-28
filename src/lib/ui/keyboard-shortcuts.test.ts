import { describe, expect, it } from 'vitest';
import { isPaletteShortcut, isShortcutsHelpShortcut } from './keyboard-shortcuts';

describe('workspace keyboard shortcuts', () => {
  it('opens and toggles the palette with Command or Control plus Shift+Period', () => {
    expect(isPaletteShortcut({ metaKey: true, ctrlKey: false, shiftKey: true, altKey: false, code: 'Period', key: '.' })).toBe(true);
    expect(isPaletteShortcut({ metaKey: false, ctrlKey: true, shiftKey: true, altKey: false, code: 'Period', key: '.' })).toBe(true);
    expect(isPaletteShortcut({ metaKey: true, ctrlKey: false, shiftKey: true, altKey: false, code: 'Period', key: '>' })).toBe(true);
  });

  it('does not trigger the palette without required modifiers', () => {
    expect(isPaletteShortcut({ metaKey: false, ctrlKey: false, shiftKey: true, altKey: false, code: 'Period', key: '.' })).toBe(false);
    expect(isPaletteShortcut({ metaKey: true, ctrlKey: false, shiftKey: false, altKey: false, code: 'Period', key: '.' })).toBe(false);
  });

  it('opens shortcut help with Alt+Shift+Slash only', () => {
    expect(isShortcutsHelpShortcut({ metaKey: false, ctrlKey: false, shiftKey: true, altKey: true, code: 'Slash', key: '?' })).toBe(true);
    expect(isShortcutsHelpShortcut({ metaKey: false, ctrlKey: false, shiftKey: true, altKey: false, code: 'Slash', key: '?' })).toBe(false);
  });
});
