'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToolCard } from '@/components/tools/ToolCard';
import { Search, Plus, BookOpen, Package } from 'lucide-react';
import type { ToolWithInstallStatus } from '@/types/tools';
import Link from 'next/link';

export function ToolsMarketplaceClient() {
  const [tools, setTools] = useState<ToolWithInstallStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch tools
  useEffect(() => {
    fetchTools();
  }, [debouncedSearch]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await fetch(`/api/tools?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-text-primary">
                Tools Marketplace
              </h1>
              <p className="text-text-secondary mt-2">
                Extend RotoWrite with powerful plugins and integrations
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/tools/docs">
                <Button variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Developer Docs
                </Button>
              </Link>
              <Link href="/tools/submit">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Tool
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Developer CTA */}
        <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Create your own RotoWrite Tools
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Build custom plugins to extend RotoWrite's functionality for your team
              </p>
            </div>
            <Link href="/tools/docs">
              <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-500/10">
                View Documentation →
              </Button>
            </Link>
          </div>
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-bg-elevated rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {debouncedSearch ? 'No tools found' : 'No tools available yet'}
            </h3>
            <p className="text-text-secondary">
              {debouncedSearch
                ? 'Try a different search term'
                : 'Be the first to submit a tool!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onInstallChange={fetchTools}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
