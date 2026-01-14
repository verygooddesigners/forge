'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Brief } from '@/types';

interface SmartBriefListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBrief: (brief: Brief) => void;
}

export function SmartBriefListModal({
  open,
  onOpenChange,
  onSelectBrief,
}: SmartBriefListModalProps) {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [filteredBriefs, setFilteredBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      loadBriefs();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBriefs(briefs);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = briefs.filter(
        (brief) =>
          brief.name.toLowerCase().includes(query) ||
          brief.category?.name.toLowerCase().includes(query)
      );
      setFilteredBriefs(filtered);
    }
  }, [searchQuery, briefs]);

  const loadBriefs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('briefs')
        .select('*, category:categories(*)')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setBriefs(data);
        setFilteredBriefs(data);
      }
    } catch (error) {
      console.error('Error loading briefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBriefClick = (brief: Brief) => {
    onSelectBrief(brief);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold">Open SmartBrief</DialogTitle>
          <DialogDescription>
            Select a SmartBrief to edit
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SmartBriefs by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* SmartBriefs Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBriefs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">
                {searchQuery ? 'No SmartBriefs found' : 'No SmartBriefs yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery ? 'Try a different search term' : 'Create your first SmartBrief to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBriefs.map((brief) => (
                <Card
                  key={brief.id}
                  className="cursor-pointer hover:bg-accent/50 hover:border-primary transition-all"
                  onClick={() => handleBriefClick(brief)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-2">
                      {brief.name}
                    </CardTitle>
                    {brief.category && (
                      <CardDescription className="text-xs mt-2">
                        <Badge variant="outline" className="text-xs">
                          {brief.category.name}
                        </Badge>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {brief.is_shared && (
                      <Badge variant="secondary" className="text-xs">
                        Shared with Team
                      </Badge>
                    )}
                    
                    {/* Show if has AI config */}
                    {(brief.seo_config as any)?.ai_instructions && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Sparkles className="h-3 w-3" />
                        AI Configured
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
