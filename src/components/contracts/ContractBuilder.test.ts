import { describe, expect, it } from 'vitest';
import { ContractBuilder } from './ContractBuilder';

describe('ContractBuilder', () => {
  it('exports the document-first builder component', () => {
    expect(typeof ContractBuilder).toBe('function');
  });
});
