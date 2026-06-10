'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { PitchPanel } from '@/components/news-forge/PitchPanel';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

interface Props {
  user: User;
  project: any;
  nfProject: any;
  initialPitches: any[];
}

export function NewsForgeProjectClient({ user, project, nfProject, initialPitches }: Props) {
  const router = useRouter();
  const site = nfProject.site;

  return (
    <div className="flex h-screen overflow-hidden bg-bg-deep">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Back nav */}
          <button
            onClick={() => router.push('/news-forge')}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            News Forge
          </button>

          {/* Project header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {site && (
                <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary bg-bg-elevated px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {site.name} · {site.state}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-text-primary">{project.headline}</h1>

            {nfProject.selected_sports?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {nfProject.selected_sports.map((s: string) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-accent-muted text-accent-primary font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pitch panel */}
          <div className="rounded-2xl border border-border-subtle bg-bg-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle bg-bg-elevated flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Story Pitches</h2>
              <span className="text-xs text-text-tertiary">
                {initialPitches.length > 0
                  ? `${initialPitches.length} pitch${initialPitches.length !== 1 ? 'es' : ''}`
                  : 'No pitches yet'}
              </span>
            </div>
            <PitchPanel
              projectId={project.id}
              initialPitches={initialPitches}
              researchStatus={nfProject.research_status}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
