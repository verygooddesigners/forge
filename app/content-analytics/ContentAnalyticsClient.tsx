'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { User } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';
import type { AnalyticsSummary, TeamMemberStats, SavedFilter, FilterConfig } from '@/types/analytics';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { StatCard } from '@/components/analytics/StatCard';
import { ChartCard } from '@/components/analytics/ChartCard';
import { UserSelector } from '@/components/analytics/UserSelector';
import dynamic from 'next/dynamic';
const AnalyticsExportModal = dynamic(
  () => import('@/components/analytics/AnalyticsExportModal').then(m => ({ default: m.AnalyticsExportModal })),
  { ssr: false }
);
import { SaveFilterModal } from '@/components/analytics/SaveFilterModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CHART_COLORS, CHART_PALETTE, CHART_STYLE } from '@/lib/chart-theme';
import {
  Download, Save, BookmarkPlus, Trash2, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentAnalyticsClientProps {
  user: User;
}

type ViewTab = 'personal' | 'team';

export function ContentAnalyticsClient({ user }: ContentAnalyticsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = usePermissions(user.id);
  const isTeamLeaderPlus = hasPermission('can_view_team_analytics');

  // State
  const [activeTab, setActiveTab] = useState<ViewTab>('personal');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [preset, setPreset] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [memberStats, setMemberStats] = useState<TeamMemberStats[]>([]);
  const [teamAggregate, setTeamAggregate] = useState<AnalyticsSummary | null>(null);
  const [allUsers, setAllUsers] = useState<Pick<User, 'id' | 'full_name' | 'email'>[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);

  const currentFilterConfig: FilterConfig = {
    dateFrom: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    preset,
    userId: selectedUserId || undefined,
  };

  // Load shared filter from URL
  useEffect(() => {
    const token = searchParams.get('filter');
    if (token) {
      loadSharedFilter(token);
    }
  }, [searchParams]);

  const loadSharedFilter = async (token: string) => {
    try {
      const res = await fetch(`/api/analytics/filters?token=${token}`);
      const data = await res.json();
      if (data.filter) {
        const cfg = data.filter.filter_config as FilterConfig;
        if (cfg.dateFrom && cfg.dateTo) {
          setDateRange({ from: new Date(cfg.dateFrom), to: new Date(cfg.dateTo) });
        }
        if (cfg.preset) setPreset(cfg.preset);
        if (cfg.userId) setSelectedUserId(cfg.userId);
        toast.success(`Loaded filter: ${data.filter.name}`);
      }
    } catch {
      // ignore
    }
  };

  const loadSavedFilters = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/filters');
      const data = await res.json();
      setSavedFilters(data.filters || []);
    } catch {
      // ignore
    }
  }, []);

  const loadPersonalStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.set('from', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange?.to) params.set('to', format(dateRange.to, 'yyyy-MM-dd'));
      if (selectedUserId && activeTab === 'team') params.set('userId', selectedUserId);

      const res = await fetch(`/api/analytics/personal?${params}`);
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedUserId, activeTab]);

  const loadTeamStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) params.set('from', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange?.to) params.set('to', format(dateRange.to, 'yyyy-MM-dd'));

      const res = await fetch(`/api/analytics/team?${params}`);
      const data = await res.json();
      setMemberStats(data.members || []);
      setTeamAggregate(data.aggregate || null);
      setAllUsers(data.users || []);
    } catch {
      toast.error('Failed to load team analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (activeTab === 'personal') {
      loadPersonalStats();
    } else {
      loadTeamStats();
    }
    loadSavedFilters();
  }, [activeTab, loadPersonalStats, loadTeamStats, loadSavedFilters]);

  const handleDeleteFilter = async (id: string) => {
    try {
      await fetch(`/api/analytics/filters?id=${id}`, { method: 'DELETE' });
      toast.success('Filter deleted');
      loadSavedFilters();
    } catch {
      toast.error('Failed to delete filter');
    }
  };

  const applyFilter = (f: SavedFilter) => {
    const cfg = f.filter_config;
    if (cfg.dateFrom && cfg.dateTo) {
      setDateRange({ from: new Date(cfg.dateFrom), to: new Date(cfg.dateTo) });
    }
    if (cfg.preset) setPreset(cfg.preset);
    if (cfg.userId) setSelectedUserId(cfg.userId);
    toast.success(`Applied filter: ${f.name}`);
  };

  // Which stats to show based on tab
  const displayStats = activeTab === 'personal'
    ? stats
    : selectedUserId
      ? memberStats.find((m) => m.user.id === selectedUserId)?.stats || null
      : teamAggregate;

  // Sparkline data from daily breakdown
  const sparklineProjects = displayStats?.daily_breakdown.map((d) => ({ value: d.projects_created })) || [];
  const sparklineWords = displayStats?.daily_breakdown.map((d) => ({ value: d.words_written })) || [];

  // Pie chart data
  const pieData = displayStats ? [
    { name: 'Projects', value: displayStats.projects_created, color: CHART_COLORS.primary },
    { name: 'SmartBriefs', value: displayStats.briefs_created, color: CHART_COLORS.secondary },
    { name: 'Exports', value: displayStats.projects_exported, color: CHART_COLORS.tertiary },
  ].filter((d) => d.value > 0) : [];

  return (
    <div className="flex h-full w-full">
      <AppSidebar
        user={user}
        onOpenProjects={() => router.push('/projects')}
        onOpenSmartBriefs={() => router.push('/smartbriefs')}
        onOpenWriterFactory={() => router.push('/writer-factory')}
      />

      <div className="flex-1 overflow-y-auto min-h-0" style={{ background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)' }}>
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-white/60 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Content Analytics</h1>
              <p className="text-sm text-text-tertiary mt-0.5">Track your content production and performance</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Saved Filters Dropdown */}
              {savedFilters.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <BookmarkPlus className="w-4 h-4" />
                      Saved Filters
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {savedFilters.map((f) => (
                      <DropdownMenuItem key={f.id} className="flex items-center justify-between">
                        <span className="cursor-pointer flex-1" onClick={() => applyFilter(f)}>
                          {f.name}
                          {f.is_shared && <Badge variant="secondary" className="ml-2 text-[9px]">Shared</Badge>}
                        </span>
                        <Trash2
                          className="w-3.5 h-3.5 text-text-tertiary hover:text-error cursor-pointer ml-2"
                          onClick={(e) => { e.stopPropagation(); handleDeleteFilter(f.id); }}
                        />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowSaveFilterModal(true)}>
                <Save className="w-4 h-4" />
                Save Filter
              </Button>

              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                preset={preset}
                onPresetChange={setPreset}
              />

              {isTeamLeaderPlus && (
                <Button size="sm" className="gap-2" onClick={() => setShowExportModal(true)}>
                  <Download className="w-4 h-4" />
                  Export Stats
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-4">
            <button
              onClick={() => { setActiveTab('personal'); setSelectedUserId(null); }}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'personal'
                  ? 'border-accent-primary text-accent-primary'
                  : 'border-transparent text-text-tertiary hover:text-text-primary'
              }`}
            >
              My Stats
            </button>
            {isTeamLeaderPlus && (
              <button
                onClick={() => setActiveTab('team')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'team'
                    ? 'border-accent-primary text-accent-primary'
                    : 'border-transparent text-text-tertiary hover:text-text-primary'
                }`}
              >
                Team Stats
              </button>
            )}

            {/* User selector for team tab */}
            {activeTab === 'team' && isTeamLeaderPlus && allUsers.length > 0 && (
              <div className="ml-auto">
                <UserSelector
                  users={allUsers}
                  selectedUserId={selectedUserId}
                  onSelect={(uid) => {
                    setSelectedUserId(uid);
                    if (uid) {
                      // Reload personal stats for the selected user
                      setStats(null);
                      const params = new URLSearchParams();
                      if (dateRange?.from) params.set('from', format(dateRange.from, 'yyyy-MM-dd'));
                      if (dateRange?.to) params.set('to', format(dateRange.to, 'yyyy-MM-dd'));
                      params.set('userId', uid);
                      fetch(`/api/analytics/personal?${params}`)
                        .then((r) => r.json())
                        .then((data) => setStats(data))
                        .catch(() => toast.error('Failed to load user stats'));
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {loading ? (
            <LoadingSkeleton />
          ) : !displayStats ? (
            <div className="text-center py-20 text-text-tertiary">
              <p className="text-lg">No data available for this period</p>
              <p className="text-sm mt-1">Try adjusting your date range</p>
            </div>
          ) : (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  title="Projects Created"
                  value={displayStats.projects_created}
                  sparklineData={sparklineProjects}
                  color={CHART_COLORS.primary}
                />
                <StatCard
                  title="Total Words Written"
                  value={displayStats.total_words}
                  sparklineData={sparklineWords}
                  color={CHART_COLORS.secondary}
                />
                <StatCard
                  title="Avg Word Count"
                  value={displayStats.avg_word_count}
                  color={CHART_COLORS.tertiary}
                />
                <StatCard
                  title="Avg SEO Score"
                  value={displayStats.avg_seo_score > 0 ? `${displayStats.avg_seo_score}%` : '—'}
                  color={CHART_COLORS.quaternary}
                />
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <ChartCard title="Content Production Over Time" subtitle="Projects and briefs created per day">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayStats.daily_breakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: CHART_STYLE.fontSize, fill: CHART_STYLE.text }}
                          tickFormatter={(val) => {
                            const d = new Date(val);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                        />
                        <YAxis tick={{ fontSize: CHART_STYLE.fontSize, fill: CHART_STYLE.text }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: CHART_STYLE.tooltip.bg,
                            border: `1px solid ${CHART_STYLE.tooltip.border}`,
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="projects_created"
                          name="Projects"
                          stroke={CHART_COLORS.primary}
                          fill={CHART_COLORS.primary}
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="briefs_created"
                          name="SmartBriefs"
                          stroke={CHART_COLORS.secondary}
                          fill={CHART_COLORS.secondary}
                          fillOpacity={0.1}
                          strokeWidth={2}
                        />
                        <Legend />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Words Written Per Day" subtitle="Daily word production">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={displayStats.daily_breakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: CHART_STYLE.fontSize, fill: CHART_STYLE.text }}
                          tickFormatter={(val) => {
                            const d = new Date(val);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                        />
                        <YAxis tick={{ fontSize: CHART_STYLE.fontSize, fill: CHART_STYLE.text }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: CHART_STYLE.tooltip.bg,
                            border: `1px solid ${CHART_STYLE.tooltip.border}`,
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="words_written" name="Words" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <ChartCard title="Export Activity" subtitle="Content exports over time">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={displayStats.daily_breakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: CHART_STYLE.fontSize, fill: CHART_STYLE.text }}
                          tickFormatter={(val) => {
                            const d = new Date(val);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                          }}
                        />
                        <YAxis tick={{ fontSize: CHART_STYLE.fontSize, fill: CHART_STYLE.text }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: CHART_STYLE.tooltip.bg,
                            border: `1px solid ${CHART_STYLE.tooltip.border}`,
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="exports"
                          name="Exports"
                          stroke={CHART_COLORS.tertiary}
                          strokeWidth={2}
                          dot={{ fill: CHART_COLORS.tertiary, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Content Mix" subtitle="Breakdown of content types">
                  <div className="h-[280px] flex items-center justify-center">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: CHART_STYLE.tooltip.bg,
                              border: `1px solid ${CHART_STYLE.tooltip.border}`,
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-text-tertiary text-sm">No content yet</p>
                    )}
                  </div>
                </ChartCard>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard title="SmartBriefs Created" value={displayStats.briefs_created} color={CHART_COLORS.secondary} />
                <StatCard title="SmartBriefs Shared" value={displayStats.briefs_shared} color={CHART_COLORS.quaternary} />
                <StatCard title="Projects Exported" value={displayStats.projects_exported} color={CHART_COLORS.tertiary} />
              </div>

              {/* Team Member Table (team tab only, no specific user selected) */}
              {activeTab === 'team' && !selectedUserId && memberStats.length > 0 && (
                <Card className="overflow-hidden">
                  <div className="p-5 border-b border-border-subtle">
                    <h3 className="text-sm font-semibold text-text-primary">Team Members</h3>
                    <p className="text-xs text-text-tertiary mt-0.5">Click a member to view their detailed stats</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border-subtle bg-bg-surface">
                          <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Name</th>
                          <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Role</th>
                          <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Projects</th>
                          <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Total Words</th>
                          <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Avg Words</th>
                          <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">SEO Score</th>
                          <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Briefs</th>
                          <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Exports</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberStats
                          .sort((a, b) => b.stats.total_words - a.stats.total_words)
                          .map((m) => (
                            <tr
                              key={m.user.id}
                              className="border-b border-border-subtle hover:bg-bg-hover transition-colors cursor-pointer"
                              onClick={() => setSelectedUserId(m.user.id)}
                            >
                              <td className="px-5 py-3.5 text-sm font-medium text-text-primary">
                                {m.user.full_name || m.user.email.split('@')[0]}
                              </td>
                              <td className="px-5 py-3.5">
                                <Badge variant="secondary" className="text-[10px]">{m.user.role}</Badge>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-right font-mono">{m.stats.projects_created}</td>
                              <td className="px-5 py-3.5 text-sm text-right font-mono">{m.stats.total_words.toLocaleString()}</td>
                              <td className="px-5 py-3.5 text-sm text-right font-mono">{m.stats.avg_word_count}</td>
                              <td className="px-5 py-3.5 text-sm text-right font-mono">
                                {m.stats.avg_seo_score > 0 ? `${m.stats.avg_seo_score}%` : '—'}
                              </td>
                              <td className="px-5 py-3.5 text-sm text-right font-mono">{m.stats.briefs_created}</td>
                              <td className="px-5 py-3.5 text-sm text-right font-mono">{m.stats.projects_exported}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnalyticsExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        filterConfig={currentFilterConfig}
        stats={displayStats}
        memberStats={activeTab === 'team' ? memberStats : undefined}
      />
      <SaveFilterModal
        open={showSaveFilterModal}
        onClose={() => setShowSaveFilterModal(false)}
        filterConfig={currentFilterConfig}
        onSaved={loadSavedFilters}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5"><Skeleton className="h-[280px]" /></Card>
        <Card className="p-5"><Skeleton className="h-[280px]" /></Card>
      </div>
    </div>
  );
}
