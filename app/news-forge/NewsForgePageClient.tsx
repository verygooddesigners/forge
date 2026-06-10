'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Loader2, Newspaper, Clock, ArrowRight } from 'lucide-react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { NewForgeProjectModal } from '@/components/news-forge/NewForgeProjectModal';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

interface NFProject {
  id: string;
  project_id: string;
  research_status: string;
  created_at: string;
  project: { id: string; headline: string; created_at: string };
  site: { id: string; name: string; state: string };
}

function statusLabel(status: string) {
  switch (status) {
    case 'pitches_ready': return { label: 'Pitches Ready', cls: 'text-green-600 bg-green-500/10' };
    case 'researching': return { label: 'Researching...', cls: 'text-amber-600 bg-amber-500/10' };
    case 'writing': return { label: 'Writing', cls: 'text-accent-primary bg-accent-muted' };
    default: return { label: 'Pending', cls: 'text-text-tertiary bg-bg-elevated' };
  }
}

export function NewsForgePageClient({ user }: { user: User }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<NFProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === 'true');

  useEffect(() => {
    fetch('/api/news-forge/projects')
      .then((r) => r.json())
      .then((j) => setProjects(j.projects || []))
      .finally(() => setLoading(false));
  }, [modalOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-deep">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
                <Newspaper className="w-6 h-6 text-accent-primary" />
                News Forge
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Sports news research and writing for local betting sites
              </p>
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-text-secondary text-sm py-12">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-accent-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📰</span>
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-1.5">No projects yet</h3>
              <p className="text-sm text-text-secondary mb-6 max-w-xs mx-auto">
                Create your first News Forge project to start researching and writing sports news.
              </p>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => {
                const { label, cls } = statusLabel(p.research_status);
                return (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/news-forge/projects/${p.project_id}`)}
                    className="w-full text-left border border-border-subtle rounded-2xl p-4 bg-bg-surface hover:border-accent-primary/30 hover:bg-accent-muted/20 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>
                            {label}
                          </span>
                          <span className="text-[11px] text-text-tertiary">{p.site?.name}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-text-primary truncate">
                          {p.project?.headline}
                        </h3>
                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-text-tertiary">
                          <Clock className="w-3 h-3" />
                          {new Date(p.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-accent-primary shrink-0 mt-1 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <NewForgeProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
