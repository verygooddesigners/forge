'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { Brief, Category, User } from '@/types';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { BookOpen, Plus, Save, Trash2 } from 'lucide-react';

interface BriefBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function BriefBuilderModal({ open, onOpenChange, user }: BriefBuilderModalProps) {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [briefName, setBriefName] = useState('');
  const [briefContent, setBriefContent] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [isShared, setIsShared] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      loadBriefs();
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (selectedBrief) {
      setBriefName(selectedBrief.name);
      setBriefContent(selectedBrief.content);
      setCategoryId(selectedBrief.category_id || '');
      setIsShared(selectedBrief.is_shared);
    }
  }, [selectedBrief]);

  const loadBriefs = async () => {
    const { data, error } = await supabase
      .from('briefs')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBriefs(data);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'brief')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const createCategory = async () => {
    if (!newCategory.trim()) return;

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCategory, type: 'brief' })
      .select()
      .single();

    if (!error && data) {
      setCategories([...categories, data]);
      setCategoryId(data.id);
      setNewCategory('');
    }
  };

  const saveBrief = async () => {
    if (!briefName.trim()) return;

    setLoading(true);
    
    if (selectedBrief) {
      // Update existing brief
      const { error } = await supabase
        .from('briefs')
        .update({
          name: briefName,
          content: briefContent,
          category_id: categoryId || null,
          is_shared: isShared,
        })
        .eq('id', selectedBrief.id);

      if (!error) {
        await loadBriefs();
      }
    } else {
      // Create new brief
      const { data, error } = await supabase
        .from('briefs')
        .insert({
          name: briefName,
          content: briefContent || {},
          category_id: categoryId || null,
          is_shared: isShared,
          created_by: user.id,
        })
        .select()
        .single();

      if (!error && data) {
        setBriefs([data, ...briefs]);
        setSelectedBrief(data);
      }
    }
    
    setLoading(false);
  };

  const deleteBrief = async (briefId: string) => {
    if (!confirm('Are you sure you want to delete this brief?')) return;

    const { error } = await supabase
      .from('briefs')
      .delete()
      .eq('id', briefId);

    if (!error) {
      setBriefs(briefs.filter(b => b.id !== briefId));
      if (selectedBrief?.id === briefId) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setSelectedBrief(null);
    setBriefName('');
    setBriefContent(null);
    setCategoryId('');
    setIsShared(false);
  };

  const canEditBrief = (brief: Brief) => {
    return brief.created_by === user.id || user.role === 'admin';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Brief Builder
          </DialogTitle>
          <DialogDescription>
            Create and manage SEO scaffolds for your content
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Briefs List */}
          <div className="w-64 flex flex-col gap-2 overflow-auto">
            <Button onClick={resetForm} size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Brief
            </Button>
            
            <div className="space-y-2">
              {briefs.map((brief) => (
                <Card
                  key={brief.id}
                  className={`cursor-pointer transition-colors ${
                    selectedBrief?.id === brief.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => canEditBrief(brief) && setSelectedBrief(brief)}
                >
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm truncate">{brief.name}</CardTitle>
                        {brief.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {brief.category.name}
                          </Badge>
                        )}
                      </div>
                      {brief.is_shared && (
                        <Badge variant="secondary" className="text-xs">Shared</Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {briefs.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No briefs yet
                </div>
              )}
            </div>
          </div>

          {/* Brief Editor */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="briefName">Brief Name</Label>
                  <Input
                    id="briefName"
                    value={briefName}
                    onChange={(e) => setBriefName(e.target.value)}
                    placeholder="e.g., NFL Team Analysis Template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <div className="flex gap-2">
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const name = prompt('New category name:');
                        if (name) {
                          setNewCategory(name);
                          setTimeout(() => createCategory(), 0);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="shared"
                    checked={isShared}
                    onCheckedChange={setIsShared}
                  />
                  <Label htmlFor="shared" className="cursor-pointer">
                    Share with other strategists
                  </Label>
                </div>

                <div className="flex gap-2">
                  {selectedBrief && canEditBrief(selectedBrief) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBrief(selectedBrief.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  <Button onClick={saveBrief} disabled={loading || !briefName.trim()} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {selectedBrief ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden bg-white">
              <TipTapEditor
                content={briefContent}
                onChange={setBriefContent}
                placeholder="Create your brief structure here... Use headings, lists, and formatting to define your content scaffold."
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


