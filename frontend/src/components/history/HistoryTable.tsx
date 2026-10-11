import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  FileText, 
  ArrowUpDown, 
  Video, 
  Mic, 
  Image as ImageIcon,
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Eye, 
  Download,
  Printer
} from 'lucide-react';
import { ScanHistoryItem } from '../../types/history';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { generateForensicPdfReport } from '../../utils/pdfReport';
import { getPrivacySettings } from '../../services/historyService';

interface HistoryTableProps {
  items: ScanHistoryItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onViewItem: (item: ScanHistoryItem) => void;
}

export type VerdictFilter = 'all' | 'authentic' | 'suspicious' | 'fake';
export type ModalityFilter = 'all' | 'video' | 'audio' | 'image';

export const HistoryTable: React.FC<HistoryTableProps> = ({
  items,
  onDeleteItem,
  onClearAll,
  onViewItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<VerdictFilter>('all');
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>('all');
  const [sortBy, setSortBy] = useState<'date' | 'probability'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter & Search
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = item.mediaName.toLowerCase().includes(term);
          const matchHash = item.sha256.toLowerCase().includes(term);
          if (!matchName && !matchHash) return false;
        }

        // Verdict filter
        if (verdictFilter !== 'all' && item.verdict !== verdictFilter) {
          return false;
        }

        // Modality filter
        if (modalityFilter !== 'all' && item.mediaType !== modalityFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'probability') {
          return sortOrder === 'desc'
            ? b.aiProbability - a.aiProbability
            : a.aiProbability - b.aiProbability;
        } else {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        }
      });
  }, [items, searchTerm, verdictFilter, modalityFilter, sortBy, sortOrder]);

  const toggleSort = (type: 'date' | 'probability') => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  const handleExportSelected = () => {
    const privacy = getPrivacySettings();
    if (selectedIds.length === 1) {
      const item = items.find((i) => i.id === selectedIds[0]);
      if (item && item.rawResponse) {
        generateForensicPdfReport(item.rawResponse, { faceBlur: privacy.faceBlurOnExport });
      }
    } else {
      const selectedItems = items.filter((i) => selectedIds.includes(i.id));
      const blob = new Blob([JSON.stringify(selectedItems, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `truthlens-history-batch-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const getModalityIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-blue-500" />;
      case 'audio':
        return <Mic className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <ImageIcon className="w-3.5 h-3.5 text-cyan-500" />;
    }
  };

  const getVerdictBadge = (verdict: string, probability: number) => {
    if (verdict === 'inconclusive') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
          <span>Inconclusive (No Face)</span>
        </span>
      );
    } else if (verdict === 'authentic') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Authentic ({probability}%)</span>
        </span>
      );
    } else if (verdict === 'suspicious') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Suspicious ({probability}%)</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
          <span>AI Deepfake ({probability}%)</span>
        </span>
      );
    }
  };

  return (
    <Card variant="default" className="p-6 space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name or SHA-256 hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-sans"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Verdict Filter Buttons */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-navy-900 p-1 border border-slate-200 dark:border-navy-800 text-xs">
            <button
              onClick={() => setVerdictFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                verdictFilter === 'all'
                  ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVerdictFilter('authentic')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                verdictFilter === 'authentic'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-emerald-500'
              }`}
            >
              Authentic
            </button>
            <button
              onClick={() => setVerdictFilter('suspicious')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                verdictFilter === 'suspicious'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-500 hover:text-amber-500'
              }`}
            >
              Suspicious
            </button>
            <button
              onClick={() => setVerdictFilter('fake')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                verdictFilter === 'fake'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 hover:text-rose-500'
              }`}
            >
              Fake / Tampered
            </button>
          </div>

          {/* Modality Filter Dropdown */}
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value as ModalityFilter)}
            className="px-3 py-2 text-xs font-mono rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="all">All Modalities</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="image">Images</option>
          </select>

          {/* Batch Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSelected}
                leftIcon={<Download className="w-3.5 h-3.5 text-cyan-500" />}
              >
                Export ({selectedIds.length})
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  selectedIds.forEach((id) => onDeleteItem(id));
                  setSelectedIds([]);
                }}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete ({selectedIds.length})
              </Button>
            </div>
          )}

          {items.length > 0 && selectedIds.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-slate-400 hover:text-rose-500 text-xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-navy-800">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-navy-900/90 border-b border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 dark:border-navy-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
              </th>
              <th className="p-3.5 font-bold">Subject Media</th>
              <th className="p-3.5 font-bold">Modality</th>
              <th 
                className="p-3.5 font-bold cursor-pointer hover:text-cyan-500 transition-colors select-none"
                onClick={() => toggleSort('probability')}
              >
                <div className="flex items-center gap-1">
                  <span>Verdict & Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 font-bold hidden md:table-cell">Modality Breakdown</th>
              <th 
                className="p-3.5 font-bold cursor-pointer hover:text-cyan-500 transition-colors select-none"
                onClick={() => toggleSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-navy-850">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                  <div className="max-w-xs mx-auto space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-navy-700" />
                    <p className="font-medium text-slate-600 dark:text-slate-300">No matching scans found</p>
                    <p className="text-xs text-slate-400">
                      {searchTerm || verdictFilter !== 'all' || modalityFilter !== 'all'
                        ? 'Try clearing your search query or filters.'
                        : 'Completed media scans will be saved to your local history automatically.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const dateObj = new Date(item.timestamp);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-navy-850/60 ${
                      isSelected ? 'bg-cyan-500/5 dark:bg-cyan-500/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, item.id]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== item.id));
                          }
                        }}
                        className="rounded border-slate-300 dark:border-navy-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                      />
                    </td>

                    {/* Media Title & SHA256 */}
                    <td className="p-3.5">
                      <div className="space-y-0.5 max-w-xs">
                        <button
                          onClick={() => onViewItem(item)}
                          className="font-bold text-slate-900 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 text-left truncate block max-w-xs cursor-pointer"
                          title={item.mediaName}
                        >
                          {item.mediaName}
                        </button>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="truncate max-w-[140px]" title={item.sha256}>
                            SHA: {item.sha256.substring(0, 10)}...
                          </span>
                          {item.formattedSize && (
                            <>
                              <span>•</span>
                              <span>{item.formattedSize}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Modality */}
                    <td className="p-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-750 text-xs font-medium text-slate-700 dark:text-slate-300 uppercase font-mono">
                        {getModalityIcon(item.mediaType)}
                        <span>{item.mediaType}</span>
                      </div>
                    </td>

                    {/* Verdict & Score */}
                    <td className="p-3.5">
                      {getVerdictBadge(item.verdict, item.aiProbability)}
                    </td>

                    {/* Modality Breakdown Mini Bar Preview */}
                    <td className="p-3.5 hidden md:table-cell">
                      <div className="space-y-1 w-32">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Face: {item.breakdown.face}%</span>
                          <span>Audio: {item.breakdown.audio}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-navy-950 rounded-full h-1.5 overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${Math.max(10, 100 - item.aiProbability)}%` }}
                          />
                          <div
                            className="bg-rose-500 h-full"
                            style={{ width: `${item.aiProbability}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                        <div>{formattedDate}</div>
                        <div className="text-[10px] text-slate-400">{formattedTime}</div>
                      </div>
                    </td>

                    {/* Row Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onViewItem(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                          title="View Full Forensic Result"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (item.rawResponse) {
                              const priv = getPrivacySettings();
                              generateForensicPdfReport(item.rawResponse, { faceBlur: priv.faceBlurOnExport });
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                          title="Download PDF Forensic Report"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete from local history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
