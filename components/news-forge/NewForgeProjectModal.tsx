'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewsSite {
  id: string;
  name: string;
  slug: string;
  state: string;
  state_code: string;
  cities: string[];
  default_sports: string[];
  default_teams: Array<{ name: string; sport: string; league: string }>;
}

interface TrendingItem {
  name: string;
  reason: string;
  is_major_event: boolean;
  sport?: string;
  league?: string;
}

interface SportsDiscovery {
  trending_sports: TrendingItem[];
  trending_teams: TrendingItem[];
  reasoning: string;
}

function CheckItem({
  label,
  checked,
  onChange,
  trophy,
  reason,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  trophy?: boolean;
  reason?: string;
}) {
  return (
    <label className={`flex items-start gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-accent-muted' : 'hover:bg-bg-elevated'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 accent-violet-500"
      />
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${checked ? 'text-accent-primary' : 'text-text-primary'}`}>
          {trophy && <span className="mr-1">🏆</span>}
          {label}
        </span>
        {reason && (
          <p className="text-[11px] text-text-tertiary mt-0.5 leading-tight">{reason}</p>
        )}
      </div>
    </label>
  );
}

interface NewForgeProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewForgeProjectModal({ open, onClose }: NewForgeProjectModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'submitting'>('setup');

  const [sites, setSites] = useState<NewsSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<NewsSite | null>(null);
  const [discovery, setDiscovery] = useState<SportsDiscovery | null>(null);
  const [discovering, setDiscovering] = useState(false);

  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<{ name: string; sport: string; league: string }[]>([]);
  const [headline, setHeadline] = useState('');
  const [error, setError] = useState('');

  // Load sites
  useEffect(() => {
    if (!open) return;
    fetch('/api/news-forge/sites')
      .then((r) => r.json())
      .then((j) => setSites(j.sites || []));
  }, [open]);

  const handleSiteChange = useCallback(async (siteId: string) => {
    const site = sites.find((s) => s.id === siteId) || null;
    setSelectedSite(site);
    setDiscovery(null);
    setSelectedCities(site?.cities || []);
    setSelectedSports(site?.default_sports || []);
    setSelectedTeams(site?.default_teams || []);
    setHeadline(site ? `${site.state} Sports News` : '');

    if (!site) return;

    setDiscovering(true);
    try {
      const res = await fetch('/api/news-forge/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: site.id }),
      });
      const json = await res.json();
      if (json.discovery) {
        setDiscovery(json.discovery);
        // Auto-select major event sports and teams
        json.discovery.trending_sports
          .filter((t: TrendingItem) => t.is_major_event)
          .forEach((t: TrendingItem) => {
            setSelectedSports((prev) =>
              prev.includes(t.name) ? prev : [...prev, t.name]
            );
          });
        json.discovery.trending_teams
          .filter((t: TrendingItem) => t.is_major_event)
          .forEach((t: TrendingItem) => {
            setSelectedTeams((prev) =>
              prev.some((x) => x.name === t.name)
                ? prev
                : [...prev, { name: t.name, sport: t.sport || '', league: t.league || '' }]
            );
          });
      }
    } catch {
      // continue without discovery
    } finally {
      setDiscovering(false);
    }
  }, [sites]);

  const toggleCity = (city: string) =>
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((x) => x !== city) : [...prev, city]
    );

  const toggleSport = (sport: string) =>
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((x) => x !== sport) : [...prev, sport]
    );

  const toggleTeam = (team: { name: string; sport: string; league: string }) =>
    setSelectedTeams((prev) =>
      prev.some((x) => x.name === team.name)
        ? prev.filter((x) => x.name !== team.name)
        : [...prev, team]
    );

  const allSports = [
    ...new Map(
      [
        ...(selectedSite?.default_sports || []).map((s) => ({
          name: s,
          is_major_event: false,
          reason: '',
        })),
        ...(discovery?.trending_sports || []).map((t) => ({
          name: t.name,
          is_major_event: t.is_major_event,
          reason: t.reason,
        })),
      ].map((item) => [item.name, item])
    ).values(),
  ];

  const allTeams = [
    ...new Map(
      [
        ...(selectedSite?.default_teams || []).map((t) => ({
          name: t.name,
          sport: t.sport,
          league: t.league,
          is_major_event: false,
          reason: '',
        })),
        ...(discovery?.trending_teams || []).map((t) => ({
          name: t.name,
          sport: t.sport || '',
          league: t.league || '',
          is_major_event: t.is_major_event,
          reason: t.reason,
        })),
      ].map((item) => [item.name, item])
    ).values(),
  ];

  const handleStart = async () => {
    if (!selectedSite || !headline.trim()) {
      setError('Please select a site and enter a project name.');
      return;
    }
    setStep('submitting');
    setError('');
    try {
      const res = await fetch('/api/news-forge/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: headline.trim(),
          site_id: selectedSite.id,
          selected_cities: selectedCities,
          selected_sports: selectedSports,
          selected_teams: selectedTeams,
          sports_discovery: discovery,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create project');

      onClose();
      router.push(`/news-forge/projects/${json.project.id}`);
    } catch (err: any) {
      setError(err.message);
      setStep('setup');
    }
  };

  const reset = () => {
    setStep('setup');
    setSelectedSite(null);
    setDiscovery(null);
    setSelectedCities([]);
    setSelectedSports([]);
    setSelectedTeams([]);
    setHeadline('');
    setError('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) { reset(); onClose(); }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>📰</span> New News Forge Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Site selector */}
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
              Local Site
            </label>
            <div className="relative">
              <select
                value={selectedSite?.id || ''}
                onChange={(e) => handleSiteChange(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border border-border-subtle bg-bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                disabled={step === 'submitting'}
              >
                <option value="">Select a site...</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.state})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
            </div>

            {discovering && (
              <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Discovering current sports events...
              </div>
            )}

            {discovery?.reasoning && !discovering && (
              <p className="text-xs text-text-secondary mt-2 bg-accent-muted/50 rounded-lg px-3 py-2 leading-relaxed">
                {discovery.reasoning}
              </p>
            )}
          </div>

          {selectedSite && (
            <>
              {/* Project name */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                  Project Name
                </label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Carolina Hurricanes Finals Coverage"
                  disabled={step === 'submitting'}
                />
              </div>

              {/* Cities */}
              {(selectedSite.cities || []).length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                    Cities
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {selectedSite.cities.map((city) => (
                      <CheckItem
                        key={city}
                        label={city}
                        checked={selectedCities.includes(city)}
                        onChange={(_v: boolean) => toggleCity(city)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sports */}
              {allSports.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                    Sports
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {allSports.map((s) => (
                      <CheckItem
                        key={s.name}
                        label={s.name}
                        checked={selectedSports.includes(s.name)}
                        onChange={(_v: boolean) => toggleSport(s.name)}
                        trophy={s.is_major_event}
                        reason={s.is_major_event ? s.reason : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Teams */}
              {allTeams.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">
                    Teams
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {allTeams.map((t) => (
                      <CheckItem
                        key={t.name}
                        label={`${t.name} (${t.league})`}
                        checked={selectedTeams.some((x) => x.name === t.name)}
                        onChange={(_v: boolean) => toggleTeam(t)}
                        trophy={t.is_major_event}
                        reason={t.is_major_event ? t.reason : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { reset(); onClose(); }}
              disabled={step === 'submitting'}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              disabled={!selectedSite || !headline.trim() || step === 'submitting'}
              className="flex-1"
            >
              {step === 'submitting' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                'Start Research →'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
