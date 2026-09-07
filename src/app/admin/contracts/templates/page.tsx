'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FilePlus,
  Loader2,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { ContractTemplate } from '@/lib/types/contracts';

export default function ContractTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/contracts/templates?search=${encodeURIComponent(search)}&category=${selectedCategory}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    void loadTemplates();
  }, [search, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Contract Templates</h1>
            <p className="text-sm text-gray-500">
              Start with a contract designed for the work you do.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <Link
              href="/admin/contracts/new"
              className="Button Button--secondary"
            >
              New Contract from Scratch
            </Link>
          </div>
        </div>
      </header>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="Photography">Photography</option>
              <option value="Video">Video</option>
              <option value="Design">Design</option>
              <option value="Creative Services">Creative Services</option>
              <option value="Consulting">Consulting</option>
              <option value="Events">Events</option>
              <option value="General Business">General Business</option>
              <option value="Legal & Protection">Legal & Protection</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No templates found.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                      <FilePlus className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
                      <p className="text-sm text-gray-500">{template.category}</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      router.push(`/admin/contracts/new?templateId=${template.id}`);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{template.description || 'No description'}</p>
                <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-gray-700">
                  Choose this template and we&apos;ll guide you through the information needed for this agreement.
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
