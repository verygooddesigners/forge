'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onSearch: (term: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onSearch, onClear }: SearchBarProps) {
  return (
    <div className="relative w-80">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
      />
      <Input
        type="text"
        placeholder="Search components, features..."
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-10 pr-10 bg-bg-surface border-border-subtle text-text-primary placeholder:text-text-tertiary"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-text-secondary hover:text-text-primary"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}
