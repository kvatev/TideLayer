import { useState, useMemo } from 'react';
import {
  Archive,
  Calendar,
  Clock,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Presentation,
  Search,
  User,
} from 'lucide-react';
import {
  DOCUMENT_TYPE_META,
  formatFileSize,
  getDocumentRetentionInfo,
  type DocumentFileType,
  type SchoolTicket,
  type TaskDocumentAttachment,
} from '../types';
import { ModuleModal } from '../../shared/ModulePrimitives';

interface DocumentsHistoryViewProps {
  documents: TaskDocumentAttachment[];
  tickets: SchoolTicket[];
  currentUserId?: string;
  onNavigateToTask: (taskId: string) => void;
}

export function DocumentsHistoryView({
  documents,
  tickets,
  currentUserId,
  onNavigateToTask,
}: DocumentsHistoryViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'sent_by_me' | 'received_by_me'>('all');
  const [selectedType, setSelectedType] = useState<DocumentFileType | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<TaskDocumentAttachment | null>(null);

  // Map task title
  const taskMap = useMemo(() => new Map(tickets.map((t) => [t.id, t])), [tickets]);

  // Extract unique months for filtering
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      const date = new Date(d.uploaded_at);
      if (!isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        set.add(key);
      }
    });
    return Array.from(set).sort().reverse();
  }, [documents]);

  const monthLabel = (yearMonth: string) => {
    const [y, m] = yearMonth.split('-');
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' });
  };

  // Filter documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // 1-year retention filter (365 days)
      const retInfo = getDocumentRetentionInfo(doc.uploaded_at);
      if (!retInfo.isWithinRetention) return false;

      // Ownership filter
      const task = taskMap.get(doc.task_id);
      if (activeTab === 'sent_by_me') {
        if (doc.uploaded_by_user_id !== currentUserId) return false;
      } else if (activeTab === 'received_by_me') {
        const isAssignee = task?.assigned_to_user_id === currentUserId;
        const isGroup = Boolean(task?.assigned_role_target);
        if (!isAssignee && !isGroup) return false;
      }

      // Type filter
      if (selectedType !== 'all' && doc.file_type !== selectedType) {
        return false;
      }

      // Month filter
      if (selectedMonth !== 'all') {
        const d = new Date(doc.uploaded_at);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (ym !== selectedMonth) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = doc.file_name.toLowerCase().includes(q);
        const matchTask = task?.title.toLowerCase().includes(q) || false;
        const matchUploader = doc.uploaded_by_name.toLowerCase().includes(q);
        if (!matchName && !matchTask && !matchUploader) return false;
      }

      return true;
    });
  }, [documents, activeTab, selectedType, selectedMonth, searchQuery, currentUserId, taskMap]);

  // Group by month
  const groupedByMonth = useMemo(() => {
    const map = new Map<string, TaskDocumentAttachment[]>();
    filteredDocs.forEach((doc) => {
      const d = new Date(doc.uploaded_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const list = map.get(key) || [];
      list.push(doc);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [filteredDocs]);

  // Total statistics
  const totalSizeBytes = useMemo(() => {
    return filteredDocs.reduce((acc, d) => acc + (d.file_size_bytes || 0), 0);
  }, [filteredDocs]);

  const handleDownloadFile = (doc: TaskDocumentAttachment) => {
    const a = document.createElement('a');
    a.href = doc.file_url || '#';
    a.download = doc.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    filteredDocs.forEach((doc, idx) => {
      setTimeout(() => {
        handleDownloadFile(doc);
      }, idx * 250);
    });
  };

  const renderFileIcon = (fileType: DocumentFileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'word':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'powerpoint':
        return <Presentation className="w-5 h-5 text-amber-600" />;
      default:
        return <File className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1-Year Retention Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-navy-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                1 Календарна Година
              </span>
              <span className="text-xs text-slate-300">Срок на съхранение (365 дни)</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-heading font-bold text-white mb-0">
              История на училищните документи
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mb-0">
              Всички заповеди, годишни планове, справки, таблици и презентации, изпратени през задачите, се съхраняват и индексират за 365 дни за пълна отчетност и прозрачност.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-4 py-2.5 text-center">
              <div className="text-xs text-slate-300 uppercase tracking-wider font-medium">
                Документи в архива
              </div>
              <div className="text-lg sm:text-xl font-heading font-bold text-white">
                {filteredDocs.length} бр.
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-4 py-2.5 text-center">
              <div className="text-xs text-slate-300 uppercase tracking-wider font-medium">
                Общ обем
              </div>
              <div className="text-lg sm:text-xl font-heading font-bold text-white">
                {formatFileSize(totalSizeBytes)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter & Navigation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Ownership Subtabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
              }`}
            >
              Всички документи (последната 1 г.)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sent_by_me')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'sent_by_me'
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
              }`}
            >
              Изпратени от мен
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('received_by_me')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'received_by_me'
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
              }`}
            >
              Получени от мен
            </button>
          </div>

          {filteredDocs.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Изтегли всички ({filteredDocs.length})</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Търси по име на файл, задача или подател..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="md:col-span-4 flex items-center gap-1 overflow-x-auto">
            {(['all', 'pdf', 'word', 'excel', 'powerpoint'] as const).map((t) => {
              const isSelected = selectedType === t;
              const label =
                t === 'all'
                  ? 'Всички'
                  : t === 'pdf'
                  ? 'PDF'
                  : t === 'word'
                  ? 'Word'
                  : t === 'excel'
                  ? 'Excel'
                  : 'PowerPoint';

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Month Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
            >
              <option value="all">Всички периоди (1 година)</option>
              {availableMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {monthLabel(ym)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List Grouped by Month */}
      {groupedByMonth.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Archive className="w-7 h-7" />
          </div>
          <h3 className="text-base font-heading font-bold text-navy-900 mb-0">
            Няма намерени документи за избрания период
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-0">
            Всички документи, които качите към задачи и отчети, ще се появят тук и ще се пазят 365 дни.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByMonth.map(([ym, docsInMonth]) => {
            const monthTotalBytes = docsInMonth.reduce(
              (acc, d) => acc + (d.file_size_bytes || 0),
              0
            );

            return (
              <div key={ym} className="space-y-3">
                {/* Month Group Header */}
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm sm:text-base font-heading font-bold text-navy-900 capitalize mb-0">
                      {monthLabel(ym)}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {docsInMonth.length} {docsInMonth.length === 1 ? 'файл' : 'файла'} •{' '}
                      {formatFileSize(monthTotalBytes)}
                    </span>
                  </div>
                </div>

                {/* Document Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {docsInMonth.map((doc) => {
                    const meta = DOCUMENT_TYPE_META[doc.file_type] || DOCUMENT_TYPE_META.other;
                    const task = taskMap.get(doc.task_id);
                    const retInfo = getDocumentRetentionInfo(doc.uploaded_at);

                    return (
                      <div
                        key={doc.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
                      >
                        {/* Top: Icon + Badge + Retention */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                              {renderFileIcon(doc.file_type)}
                            </div>
                            <div className="min-w-0">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${meta.badgeBg}`}
                              >
                                {meta.badgeText}
                              </span>
                              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                {formatFileSize(doc.file_size_bytes)}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                              title={retInfo.retentionLabel}
                            >
                              <Clock className="w-2.5 h-2.5 text-blue-600" />
                              <span>{retInfo.daysRemaining} дни</span>
                            </span>
                          </div>
                        </div>

                        {/* Middle: File Name & Associated Task */}
                        <div className="space-y-1">
                          <h4
                            className="text-xs sm:text-sm font-semibold text-navy-900 group-hover:text-blue-600 transition-colors break-words line-clamp-2 mb-0"
                            title={doc.file_name}
                          >
                            {doc.file_name}
                          </h4>

                          {task && (
                            <button
                              type="button"
                              onClick={() => onNavigateToTask(task.id)}
                              className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline text-left truncate block w-full cursor-pointer"
                              title={`Към задача: ${task.title}`}
                            >
                              Задача: {task.title}
                            </button>
                          )}
                        </div>

                        {/* Bottom: Uploader & Action Buttons */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate min-w-0">
                            <User className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate">
                              {doc.uploaded_by_name} ({doc.uploaded_by_role})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Преглед на документа"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                              title="Изтегли документа"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <ModuleModal
          open={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Преглед на документ: ${previewDoc.file_name}`}
          maxWidthClass="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div>
                <div className="font-bold text-navy-900 break-words">{previewDoc.file_name}</div>
                <div className="text-slate-500 text-xs mt-0.5">
                  Формат: {previewDoc.file_type.toUpperCase()} • Размер: {formatFileSize(previewDoc.file_size_bytes)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadFile(previewDoc)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Изтегли</span>
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="bg-slate-100 rounded-xl border border-slate-200 p-8 text-center min-h-[220px] flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                {renderFileIcon(previewDoc.file_type)}
              </div>
              <div>
                <div className="text-sm font-heading font-bold text-navy-900 mb-1">
                  {previewDoc.file_name}
                </div>
                <p className="text-xs text-slate-500 max-w-sm mb-0">
                  Документът е съхранен в училищния защитен архив на TideLayer. Можете да го прегледате или изтеглите локално на вашето устройство.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewDoc)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Изтегли на компютъра
                </button>
                {previewDoc.file_url && previewDoc.file_url.startsWith('http') && (
                  <a
                    href={previewDoc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Отвори в нов таб</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </ModuleModal>
      )}
    </div>
  );
}

