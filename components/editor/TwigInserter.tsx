'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Braces, Search } from 'lucide-react';
import { TWIG_CATEGORIES, formatTwig, type Twig } from '@/lib/twigs';

interface TwigInserterProps {
  onInsert: (twigText: string) => void;
}

export function TwigInserter({ onInsert }: TwigInserterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleInsert = (twig: Twig) => {
    onInsert(formatTwig(twig.key));
    setOpen(false);
    setSearch('');
  };

  const query = search.toLowerCase().trim();
  const filteredCategories = TWIG_CATEGORIES.map(cat => ({
    ...cat,
    twigs: cat.twigs.filter(
      t =>
        t.key.toLowerCase().includes(query) ||
        t.label.toLowerCase().includes(query) ||
        t.example.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    ),
  })).filter(cat => cat.twigs.length > 0);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className={`h-8 px-2 gap-1 text-xs ${open ? 'bg-accent-muted text-accent-primary' : ''}`}
        title="Insert Twig variable"
      >
        <Braces className="h-4 w-4" />
        <span className="hidden sm:inline">Twigs</span>
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 max-h-96 bg-bg-surface border border-border-default rounded-lg shadow-xl z-50 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-muted" />
              <Input
                ref={inputRef}
                placeholder="Search twigs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm bg-bg-elevated border-border-default"
              />
            </div>
          </div>

          {/* Categories & Twigs */}
          <div className="flex-1 overflow-y-auto p-1">
            {filteredCategories.length === 0 ? (
              <p className="text-center text-sm text-text-tertiary py-4">No twigs found</p>
            ) : (
              filteredCategories.map((cat) => (
                <div key={cat.name} className="mb-1">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                    {cat.name}
                  </div>
                  {cat.twigs.map((twig) => (
                    <button
                      key={twig.key}
                      onClick={() => handleInsert(twig)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-bg-hover transition-colors text-left"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <code className="text-xs font-mono text-accent-primary shrink-0">
                          {`{${twig.key}}`}
                        </code>
                      </span>
                      <span className="text-[11px] text-text-tertiary truncate ml-2">
                        {twig.example}
                      </span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
