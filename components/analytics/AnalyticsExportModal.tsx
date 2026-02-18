'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileSpreadsheet, FileText, FileImage, Globe, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { ExportFormat, FilterConfig, AnalyticsSummary, TeamMemberStats } from '@/types/analytics';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface AnalyticsExportModalProps {
  open: boolean;
  onClose: () => void;
  filterConfig: FilterConfig;
  stats: AnalyticsSummary | null;
  memberStats?: TeamMemberStats[];
}

const FORMATS: { key: ExportFormat; label: string; description: string; icon: React.ReactNode }[] = [
  { key: 'csv', label: 'CSV', description: 'Comma-separated values', icon: <FileText className="w-5 h-5" /> },
  { key: 'xlsx', label: 'Excel', description: 'XLSX spreadsheet', icon: <FileSpreadsheet className="w-5 h-5" /> },
  { key: 'pdf', label: 'PDF', description: 'Charts and tables', icon: <FileImage className="w-5 h-5" /> },
  { key: 'html', label: 'HTML', description: 'Interactive report', icon: <Globe className="w-5 h-5" /> },
];

export function AnalyticsExportModal({ open, onClose, filterConfig, stats, memberStats }: AnalyticsExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);

  const buildRows = () => {
    if (memberStats && memberStats.length > 0) {
      return memberStats.map((m) => ({
        Name: m.user.full_name || m.user.email,
        Role: m.user.role,
        'Projects Created': m.stats.projects_created,
        'Projects Exported': m.stats.projects_exported,
        'Total Words': m.stats.total_words,
        'Avg Word Count': m.stats.avg_word_count,
        'Avg SEO Score': m.stats.avg_seo_score,
        'SmartBriefs Created': m.stats.briefs_created,
        'SmartBriefs Shared': m.stats.briefs_shared,
      }));
    }
    if (!stats) return [];
    return [{
      Metric: 'Projects Created', Value: stats.projects_created,
    }, {
      Metric: 'Projects Exported', Value: stats.projects_exported,
    }, {
      Metric: 'Total Words', Value: stats.total_words,
    }, {
      Metric: 'Avg Word Count', Value: stats.avg_word_count,
    }, {
      Metric: 'Avg SEO Score', Value: stats.avg_seo_score,
    }, {
      Metric: 'SmartBriefs Created', Value: stats.briefs_created,
    }, {
      Metric: 'SmartBriefs Edited', Value: stats.briefs_edited,
    }, {
      Metric: 'SmartBriefs Shared', Value: stats.briefs_shared,
    }];
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = buildRows();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `forge-analytics-${dateStr}`;

      if (selectedFormat === 'csv' || selectedFormat === 'xlsx') {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Analytics');

        if (selectedFormat === 'csv') {
          const csv = XLSX.utils.sheet_to_csv(ws);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, `${filename}.csv`);
        } else {
          const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, `${filename}.xlsx`);
        }
        toast.success(`Exported as ${selectedFormat.toUpperCase()}`);
      } else if (selectedFormat === 'pdf') {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Forge Content Analytics', 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(115, 115, 115);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        if (filterConfig.dateFrom && filterConfig.dateTo) {
          doc.text(`Period: ${filterConfig.dateFrom} to ${filterConfig.dateTo}`, 14, 36);
        }

        const headers = Object.keys(rows[0] || {});
        const body = rows.map((r) => headers.map((h) => String((r as any)[h] ?? '')));
        autoTable(doc, {
          head: [headers],
          body,
          startY: 44,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [160, 33, 254] },
        });
        doc.save(`${filename}.pdf`);
        toast.success('Exported as PDF');
      } else if (selectedFormat === 'html') {
        const headers = Object.keys(rows[0] || {});
        const tableRows = rows.map((r) =>
          `<tr>${headers.map((h) => `<td>${(r as any)[h] ?? ''}</td>`).join('')}</tr>`
        ).join('');
        const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Forge Analytics</title>
<style>
  body{font-family:system-ui,sans-serif;background:#fafafa;color:#1a1a1a;padding:2rem;max-width:960px;margin:0 auto}
  h1{color:#A021FE}
  table{width:100%;border-collapse:collapse;margin-top:1.5rem}
  th{background:#A021FE;color:#fff;padding:10px 14px;text-align:left;font-size:13px}
  td{padding:10px 14px;border-bottom:1px solid #eee;font-size:13px}
  tr:hover td{background:#f5f5f5}
  .meta{color:#737373;font-size:13px;margin-top:0.5rem}
  input[type=text]{padding:6px 12px;border:1px solid #ddd;border-radius:6px;width:200px;margin-right:8px}
</style></head><body>
<h1>Forge Content Analytics</h1>
<p class="meta">Generated: ${new Date().toLocaleDateString()}</p>
<input type="text" id="search" placeholder="Filter rows..." oninput="filterTable()">
<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
<tbody id="tbody">${tableRows}</tbody></table>
<script>
function filterTable(){const q=document.getElementById('search').value.toLowerCase();
document.querySelectorAll('#tbody tr').forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q)?'':'none'})}
</script></body></html>`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        saveAs(blob, `${filename}.html`);
        toast.success('Exported as HTML');
      }
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Analytics</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {FORMATS.map((f) => (
            <Card
              key={f.key}
              className={`p-4 cursor-pointer transition-all ${
                selectedFormat === f.key
                  ? 'border-accent-primary bg-accent-muted ring-1 ring-accent-primary'
                  : 'hover:border-border-hover'
              }`}
              onClick={() => setSelectedFormat(f.key)}
            >
              <div className="flex items-center gap-3">
                <div className={selectedFormat === f.key ? 'text-accent-primary' : 'text-text-tertiary'}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {f.label}
                    {selectedFormat === f.key && <Check className="w-3.5 h-3.5 text-accent-primary" />}
                  </div>
                  <div className="text-xs text-text-tertiary">{f.description}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport} disabled={exporting || !stats}>
            {exporting ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
