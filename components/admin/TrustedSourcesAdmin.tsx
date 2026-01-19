'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { TrustedSource } from '@/types';
import { Plus, Trash2, Shield, ShieldCheck, ShieldAlert, ShieldX, Search } from 'lucide-react';

export function TrustedSourcesAdmin() {
  const [sources, setSources] = useState<TrustedSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [editingSource, setEditingSource] = useState<TrustedSource | null>(null);
  const [newSource, setNewSource] = useState({
    domain: '',
    name: '',
    trust_level: 'medium' as const,
    category: [] as string[],
    notes: '',
  });
  const supabase = createClient();

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trusted_sources')
      .select('*')
      .order('name');

    if (!error && data) {
      setSources(data);
    }
    setLoading(false);
  };

  const addSource = async () => {
    if (!newSource.domain || !newSource.name) return;

    const { error } = await supabase
      .from('trusted_sources')
      .insert({
        domain: newSource.domain.toLowerCase().replace('www.', ''),
        name: newSource.name,
        trust_level: newSource.trust_level,
        category: newSource.category,
        notes: newSource.notes,
      });

    if (!error) {
      await loadSources();
      setNewSource({
        domain: '',
        name: '',
        trust_level: 'medium',
        category: [],
        notes: '',
      });
    }
  };

  const deleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;

    const { error } = await supabase
      .from('trusted_sources')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadSources();
    }
  };

  const updateSource = async (source: TrustedSource) => {
    const { error } = await supabase
      .from('trusted_sources')
      .update({
        name: source.name,
        trust_level: source.trust_level,
        category: source.category,
        notes: source.notes,
      })
      .eq('id', source.id);

    if (!error) {
      await loadSources();
      setEditingSource(null);
    }
  };

  const getTrustIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <ShieldCheck className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'low':
        return <ShieldAlert className="h-4 w-4 text-orange-600" />;
      case 'untrusted':
        return <ShieldX className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getTrustBadgeVariant = (level: string) => {
    switch (level) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      case 'untrusted':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredSources = sources.filter(source => {
    const matchesSearch = 
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.domain.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterLevel === 'all' || source.trust_level === filterLevel;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trusted Sources Management</CardTitle>
          <CardDescription>
            Manage trusted and untrusted sources for fact verification. Sources marked as "high" or "medium" trust 
            are prioritized during research.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Source */}
          <div className="border border-border-default rounded-lg p-4 bg-bg-elevated">
            <h3 className="font-semibold mb-4">Add New Source</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="espn.com"
                  value={newSource.domain}
                  onChange={(e) => setNewSource({ ...newSource, domain: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="ESPN"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="trust-level">Trust Level</Label>
                <Select 
                  value={newSource.trust_level} 
                  onValueChange={(value: any) => setNewSource({ ...newSource, trust_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Authoritative source</SelectItem>
                    <SelectItem value="medium">Medium - Generally reliable</SelectItem>
                    <SelectItem value="low">Low - Use with caution</SelectItem>
                    <SelectItem value="untrusted">Untrusted - Avoid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Categories (comma-separated)</Label>
                <Input
                  id="category"
                  placeholder="sports, nfl, nba"
                  value={newSource.category.join(', ')}
                  onChange={(e) => setNewSource({ 
                    ...newSource, 
                    category: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this source..."
                  value={newSource.notes}
                  onChange={(e) => setNewSource({ ...newSource, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <Button 
              onClick={addSource} 
              disabled={!newSource.domain || !newSource.name}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>

          {/* Filter and Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trust Levels</SelectItem>
                <SelectItem value="high">High Only</SelectItem>
                <SelectItem value="medium">Medium Only</SelectItem>
                <SelectItem value="low">Low Only</SelectItem>
                <SelectItem value="untrusted">Untrusted Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sources List */}
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading sources...</p>
            ) : filteredSources.length > 0 ? (
              filteredSources.map((source) => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTrustIcon(source.trust_level)}
                          <h4 className="font-semibold">{source.name}</h4>
                          <Badge variant={getTrustBadgeVariant(source.trust_level)}>
                            {source.trust_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{source.domain}</p>
                        {source.category && source.category.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-2">
                            {source.category.map((cat) => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {source.notes && (
                          <p className="text-xs text-muted-foreground italic">{source.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No sources found matching your filters
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
