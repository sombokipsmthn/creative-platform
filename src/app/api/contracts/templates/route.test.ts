import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { fetchContractTemplates } = vi.hoisted(() => ({
  fetchContractTemplates: vi.fn(),
}));

vi.mock('@/lib/contracts/server', () => ({ fetchContractTemplates }));
vi.mock('@/lib/api/route-boundaries', () => ({
  withCreatorApi: vi.fn(async (request: Request, handler: (request: Request, user: { id: string }) => Promise<Response>) => handler(request, { id: 'creator-1' })),
}));

import { GET } from './route';

describe('contract templates route', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a normalized object with templates and total', async () => {
    fetchContractTemplates.mockResolvedValue({
      templates: [{ id: 'template-1', name: 'Photography Agreement' }],
      total: 1,
    });

    const response = await GET(new NextRequest('https://example.com/api/contracts/templates?search=photo&category=Photography&limit=10&offset=20'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      templates: [{ id: 'template-1', name: 'Photography Agreement' }],
      total: 1,
    });
    expect(fetchContractTemplates).toHaveBeenCalledWith({ search: 'photo', category: 'Photography', limit: 10, offset: 20 });
  });

  it('returns a server error when template retrieval fails', async () => {
    fetchContractTemplates.mockRejectedValue(new Error('database unavailable'));

    const response = await GET(new NextRequest('https://example.com/api/contracts/templates'));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Failed to fetch templates' });
  });
});
