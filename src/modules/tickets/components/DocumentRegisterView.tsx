import { useState, useMemo, useRef } from 'react';
import {
  Archive,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Filter,
  Link as LinkIcon,
  Plus,
  Presentation,
  Search,
  Trash2,
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import {
  REGISTER_DOC_TYPE_META,
  formatFileSize,
  detectDocumentType,
  DOCUMENT_TYPE_META,
  type DocumentFileType,
  type DocumentRegisterItem,
  type RegisterDocType,
  type SchoolTicket,
  type TicketDepartment,
} from '../types';
import type { SchoolUserRecord } from '../../../lib/supabase';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface DocumentRegisterViewProps {
  documents: DocumentRegisterItem[];
  departments: TicketDepartment[];
  schoolUsers: SchoolUserRecord[];
  tickets: SchoolTicket[];
  currentUserId?: string;
  isStaffOrAdmin: boolean;
  onRegisterDocument: (input: {
    doc_type: RegisterDocType;
    reg_number?: string;
    reg_date?: string;
    title: string;
    sender?: string;
    recipient?: string;
    department_id?: string | null;
    responsible_user_id?: string | null;
    file_name?: string;
    file_url?: string;
    file_size_bytes?: number;
    file_type?: DocumentFileType;
    mime_type?: string;
    linked_task_id?: string | null;
    notes?: string;
  }) => Promise<DocumentRegisterItem>;
  onUpdateDocument: (
    id: string,
    patch: Partial<{
      title: string;
      sender: string | null;
      recipient: string | null;
      department_id: string | null;
      responsible_user_id: string | null;
      linked_task_id: string | null;
      notes: string | null;
      reg_date: string;
    }>
  ) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onToggleArchive: (id: string, archived: boolean) => Promise<void>;
  onLinkToTask: (docId: string, taskId: string | null) => Promise<void>;
  onExportCsv: () => void;
  onNavigateToTask?: (taskId: string) => void;
}

export function DocumentRegisterView({
  documents,
  departments,
  schoolUsers,
  tickets,
  isStaffOrAdmin,
  onRegisterDocument,
  onDeleteDocument,
  onToggleArchive,
  onExportCsv,
  onNavigateToTask,
}: DocumentRegisterViewProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [detailDoc, setDetailDoc] = useState<DocumentRegisterItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentRegisterItem | null>(null);

  // Form State for new document
  const [docType, setDocType] = useState<RegisterDocType>('incoming');
  const [regNumber, setRegNumber] = useState('');
  const [regDate, setRegDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [deptId, setDeptId] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload state for register modal
  const [uploadedFile, setUploadedFile] = useState<{
    file_name: string;
    file_size_bytes: number;
    file_type: DocumentFileType;
    mime_type: string;
    file_url: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lookup maps
  const deptMap = useMemo(() => new Map(departments.map((d) => [d.id, d.name])), [departments]);
  const userMap = useMemo(() => new Map(schoolUsers.map((u) => [u.id, u.full_name])), [schoolUsers]);
  const taskMap = useMemo(() => new Map(tickets.map((t) => [t.id, t])), [tickets]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: documents.filter((d) => !d.is_archived).length,
      incoming: documents.filter((d) => d.doc_type === 'incoming' && !d.is_archived).length,
      outgoing: documents.filter((d) => d.doc_type === 'outgoing' && !d.is_archived).length,
      internal: documents.filter((d) => d.doc_type === 'internal' && !d.is_archived).length,
      archived: documents.filter((d) => d.is_archived).length,
    };
  }, [documents]);

  // Filtered documents
  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      // Archive filter
      if (showArchived) {
        if (!doc.is_archived) return false;
      } else {
        if (doc.is_archived) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && doc.doc_type !== typeFilter) return false;

      // Department filter
      if (deptFilter !== 'all' && doc.department_id !== deptFilter) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const numMatch = doc.reg_number.toLowerCase().includes(q);
        const titleMatch = doc.title.toLowerCase().includes(q);
        const senderMatch = doc.sender ? doc.sender.toLowerCase().includes(q) : false;
        const recipientMatch = doc.recipient ? doc.recipient.toLowerCase().includes(q) : false;
        const notesMatch = doc.notes ? doc.notes.toLowerCase().includes(q) : false;
        if (!numMatch && !titleMatch && !senderMatch && !recipientMatch && !notesMatch) {
          return false;
        }
      }

      return true;
    });
  }, [documents, showArchived, typeFilter, deptFilter, search]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = detectDocumentType(file.name, file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        file_name: file.name,
        file_size_bytes: file.size,
        file_type: fileType,
        mime_type: file.type || 'application/octet-stream',
        file_url: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleOpenRegister = () => {
    setTitle('');
    setSender('');
    setRecipient('');
    setDeptId(departments[0]?.id || '');
    setResponsibleUserId('');
    setLinkedTaskId('');
    setNotes('');
    setRegDate(new Date().toISOString().slice(0, 10));
    setUploadedFile(null);
    setDocType('incoming');
    setRegNumber('');
    setIsRegisterModalOpen(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onRegisterDocument({
        doc_type: docType,
        reg_number: regNumber.trim() || undefined,
        reg_date: regDate,
        title: title.trim(),
        sender: sender.trim() || undefined,
        recipient: recipient.trim() || undefined,
        department_id: deptId || null,
        responsible_user_id: responsibleUserId || null,
        linked_task_id: linkedTaskId || null,
        notes: notes.trim() || undefined,
        file_name: uploadedFile?.file_name,
        file_url: uploadedFile?.file_url,
        file_size_bytes: uploadedFile?.file_size_bytes,
        file_type: uploadedFile?.file_type,
        mime_type: uploadedFile?.mime_type,
      });
      setIsRegisterModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileIcon = (type?: DocumentFileType | null) => {
    switch (type) {
      case 'word':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'powerpoint':
        return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'pdf':
        return <File className="w-4 h-4 text-rose-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => {
            setShowArchived(false);
            setTypeFilter('all');
          }}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
            !showArchived && typeFilter === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={cn('text-xs font-semibold', !showArchived && typeFilter === 'all' ? 'text-blue-100' : 'text-slate-500')}>
              Всички действащи
            </span>
            <FileText className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading">{counts.total}</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowArchived(false);
            setTypeFilter('incoming');
          }}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
            !showArchived && typeFilter === 'incoming'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={cn('text-xs font-semibold', !showArchived && typeFilter === 'incoming' ? 'text-blue-100' : 'text-slate-500')}>
              Входящи (ВХ)
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading">{counts.incoming}</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowArchived(false);
            setTypeFilter('outgoing');
          }}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
            !showArchived && typeFilter === 'outgoing'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={cn('text-xs font-semibold', !showArchived && typeFilter === 'outgoing' ? 'text-emerald-100' : 'text-slate-500')}>
              Изходящи (ИЗХ)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading">{counts.outgoing}</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowArchived(false);
            setTypeFilter('internal');
          }}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
            !showArchived && typeFilter === 'internal'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={cn('text-xs font-semibold', !showArchived && typeFilter === 'internal' ? 'text-purple-100' : 'text-slate-500')}>
              Вътрешни (ВЪТР)
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading">{counts.internal}</div>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowArchived(true);
            setTypeFilter('all');
          }}
          className={cn(
            'p-3.5 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1',
            showArchived
              ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={cn('text-xs font-semibold', showArchived ? 'text-slate-200' : 'text-slate-500')}>
              Архивирани
            </span>
            <Archive className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading">{counts.archived}</div>
        </button>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търсене по рег. №, заглавие, кореспондент..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              title="Експорт в CSV формат"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Експорт CSV</span>
            </button>

            {isStaffOrAdmin && (
              <button
                type="button"
                onClick={handleOpenRegister}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Регистрирай документ</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Филтри:</span>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Всички видове</option>
            <option value="incoming">Входящи (ВХ)</option>
            <option value="outgoing">Изходящи (ИЗХ)</option>
            <option value="internal">Вътрешни (ВЪТР)</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Всички направления</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Archive Toggle Pill */}
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1',
              showArchived
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            )}
          >
            <Archive className="w-3 h-3" />
            <span>{showArchived ? 'Показване на архив' : 'Архив'}</span>
          </button>
        </div>
      </div>

      {/* Documents Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold text-slate-700 mb-1">
              Няма намерени документи в деловодния регистър
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {search || typeFilter !== 'all' || deptFilter !== 'all'
                ? 'Опитайте да изчистите зададените филтри.'
                : 'Регистрирайте първия входящ, изходящ или вътрешен документ.'}
            </p>
            {isStaffOrAdmin && (
              <button
                type="button"
                onClick={handleOpenRegister}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Регистрирай документ</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Рег. номер</th>
                  <th className="py-3 px-3">Дата</th>
                  <th className="py-3 px-4">Относно / Заглавие</th>
                  <th className="py-3 px-3">Кореспондент</th>
                  <th className="py-3 px-3">Направление / Отговорник</th>
                  <th className="py-3 px-3">Файл / Задача</th>
                  <th className="py-3 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.map((doc) => {
                  const meta = REGISTER_DOC_TYPE_META[doc.doc_type];
                  const linkedTask = doc.linked_task_id ? taskMap.get(doc.linked_task_id) : null;
                  const deptName = doc.department_id ? deptMap.get(doc.department_id) : null;
                  const respName = doc.responsible_user_id ? userMap.get(doc.responsible_user_id) : null;

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setDetailDoc(doc)}
                    >
                      {/* Reg Number */}
                      <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold',
                            meta.badgeClass
                          )}
                        >
                          {doc.reg_number}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{doc.reg_date}</span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 max-w-xs md:max-w-md">
                        <p className="font-semibold text-navy-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-0.5">
                          {doc.title}
                        </p>
                        {doc.notes && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 italic mb-0">
                            {doc.notes}
                          </p>
                        )}
                      </td>

                      {/* Correspondent */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {doc.doc_type === 'incoming' && (
                          <span className="text-slate-700 font-medium">
                            {doc.sender || '—'}
                          </span>
                        )}
                        {doc.doc_type === 'outgoing' && (
                          <span className="text-slate-700 font-medium">
                            {doc.recipient || '—'}
                          </span>
                        )}
                        {doc.doc_type === 'internal' && (
                          <span className="text-purple-700 font-medium text-[11px]">
                            Вътрешно ({doc.sender || 'Директор'} → {doc.recipient || 'Персонал'})
                          </span>
                        )}
                      </td>

                      {/* Department / Responsible */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-[11px]">
                          {deptName && (
                            <p className="font-medium text-slate-800 line-clamp-1 mb-0">
                              {deptName}
                            </p>
                          )}
                          {respName && (
                            <p className="text-slate-500 flex items-center gap-1 mb-0">
                              <User className="w-2.5 h-2.5" />
                              <span>{respName}</span>
                            </p>
                          )}
                          {!deptName && !respName && <span className="text-slate-400">—</span>}
                        </div>
                      </td>

                      {/* File / Task Links */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          {doc.file_name && (
                            <a
                              href={doc.file_url || '#'}
                              download={doc.file_name}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors"
                              title={`Свали ${doc.file_name}`}
                            >
                              {renderFileIcon(doc.file_type)}
                              <span className="truncate max-w-[90px]">{doc.file_name}</span>
                            </a>
                          )}

                          {linkedTask && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onNavigateToTask) onNavigateToTask(linkedTask.id);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-medium"
                              title={`Отвори задача ${linkedTask.code || linkedTask.title}`}
                            >
                              <LinkIcon className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[100px]">
                                {linkedTask.code || 'Задача'}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setDetailDoc(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Детайли"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isStaffOrAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => void onToggleArchive(doc.id, !doc.is_archived)}
                                className={cn(
                                  'p-1.5 rounded-lg transition-colors cursor-pointer',
                                  doc.is_archived
                                    ? 'text-amber-600 hover:bg-amber-50'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                )}
                                title={doc.is_archived ? 'Възстанови от архив' : 'Архивирай'}
                              >
                                <Archive className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDocToDelete(doc)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Изтрий от регистъра"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <ModuleModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          title="Регистрация на документ в деловодния регистър"
          size="lg"
        >
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5">
                Вид на документа <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'incoming', label: 'Входящ (ВХ)', desc: 'От външни институции' },
                  { id: 'outgoing', label: 'Изходящ (ИЗХ)', desc: 'Към МОН, РУО, родители' },
                  { id: 'internal', label: 'Вътрешен (ВЪТР)', desc: 'Заповеди, протоколи, ПС' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDocType(item.id as RegisterDocType)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                      docType === item.id
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    )}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reg Number & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Регистрационен номер <span className="text-slate-400 font-normal">(по избор, автономерация)</span>
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder={`напр. ${docType === 'incoming' ? 'ВХ-103/2026' : docType === 'outgoing' ? 'ИЗХ-43/2026' : 'ВЪТР-16/2026'}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Дата на регистрация <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Относно / Заглавие на документа <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="напр. Писмо относно графици за държавни зрелостни изпити"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sender / Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {docType === 'incoming' ? 'Подател / Кореспондент' : 'Подател (вътрешен)'}
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder={docType === 'incoming' ? 'МОН / РУО / Община / Институция' : 'Директор / ЗАС'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {docType === 'outgoing' ? 'Получател / Институция' : 'Получател (вътрешен/външен)'}
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={docType === 'outgoing' ? 'МОН / РУО / Родител / Фирма' : 'Педагогически съвет / Учители'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Department & Responsible Person */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Отговорно направление
                </label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Без конкретно направление --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Отговорен служител
                </label>
                <select
                  value={responsibleUserId}
                  onChange={(e) => setResponsibleUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Без конкретен отговорник --</option>
                  {schoolUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Link to Task */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Връзка със задача <span className="text-slate-400 font-normal">(по избор)</span>
              </label>
              <select
                value={linkedTaskId}
                onChange={(e) => setLinkedTaskId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Без връзка със задача --</option>
                {tickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code || 'TSK'} - {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Прикачен документ / Файл
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              />

              {uploadedFile ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 min-w-0">
                    {renderFileIcon(uploadedFile.file_type)}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate mb-0">
                        {uploadedFile.file_name}
                      </p>
                      <p className="text-[10px] text-slate-400 mb-0">
                        {formatFileSize(uploadedFile.file_size_bytes)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-6 h-6 mb-1 text-slate-400" />
                  <span className="text-xs font-semibold">Качи файл (PDF, DOCX, XLSX, JPG, PNG)</span>
                  <span className="text-[10px] text-slate-400">Максимален размер до 25MB</span>
                </button>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Допълнителни бележки
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Вътрешни указания, входящ номер от оригиналната институция и др."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Запази в регистъра</span>
              </button>
            </div>
          </form>
        </ModuleModal>
      )}

      {/* Document Detail & Preview Modal */}
      {detailDoc && (
        <ModuleModal
          isOpen={!!detailDoc}
          onClose={() => setDetailDoc(null)}
          title={`Детайли за документ ${detailDoc.reg_number}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold',
                  REGISTER_DOC_TYPE_META[detailDoc.doc_type].badgeClass
                )}
              >
                {REGISTER_DOC_TYPE_META[detailDoc.doc_type].label}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Регистриран на {detailDoc.reg_date}</span>
              </span>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold text-navy-900 leading-snug mb-1">
                {detailDoc.title}
              </h3>
              {detailDoc.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed mb-0">
                  {detailDoc.notes}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Подател / Кореспондент:</span>
                <span className="font-semibold text-slate-800">{detailDoc.sender || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Получател:</span>
                <span className="font-semibold text-slate-800">{detailDoc.recipient || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Направление:</span>
                <span className="font-semibold text-slate-800">
                  {detailDoc.department_id ? deptMap.get(detailDoc.department_id) || '—' : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Отговорен служител:</span>
                <span className="font-semibold text-slate-800">
                  {detailDoc.responsible_user_id
                    ? userMap.get(detailDoc.responsible_user_id) || '—'
                    : '—'}
                </span>
              </div>
            </div>

            {/* Linked Task */}
            {detailDoc.linked_task_id && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-blue-900 mb-0">
                      Свързана задача в системата:
                    </p>
                    <p className="text-[11px] text-blue-700 mb-0">
                      {taskMap.get(detailDoc.linked_task_id)?.title || detailDoc.linked_task_id}
                    </p>
                  </div>
                </div>
                {onNavigateToTask && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToTask(detailDoc.linked_task_id!);
                      setDetailDoc(null);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    <span>Към задачата</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Attached file preview & download */}
            {detailDoc.file_name && (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderFileIcon(detailDoc.file_type)}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-900 truncate mb-0">
                      {detailDoc.file_name}
                    </p>
                    <p className="text-[10px] text-slate-400 mb-0">
                      {formatFileSize(detailDoc.file_size_bytes || 0)}
                    </p>
                  </div>
                </div>
                <a
                  href={detailDoc.file_url || '#'}
                  download={detailDoc.file_name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Свали файла</span>
                </a>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {isStaffOrAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await onToggleArchive(detailDoc.id, !detailDoc.is_archived);
                      setDetailDoc({ ...detailDoc, is_archived: !detailDoc.is_archived });
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1',
                      detailDoc.is_archived
                        ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{detailDoc.is_archived ? 'Възстанови от архив' : 'Архивирай'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDocToDelete(detailDoc);
                      setDetailDoc(null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Изтрий</span>
                  </button>
                </div>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setDetailDoc(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Затвори
              </button>
            </div>
          </div>
        </ModuleModal>
      )}

      {/* Delete Confirmation Dialog */}
      {docToDelete && (
        <ModuleConfirmDialog
          isOpen={!!docToDelete}
          title="Изтриване на документ от регистъра"
          message={`Сигурни ли сте, че искате да изтриете документ ${docToDelete.reg_number} (${docToDelete.title})? Това действие не може да бъде отменено.`}
          confirmLabel="Изтрий документа"
          tone="danger"
          onConfirm={async () => {
            await onDeleteDocument(docToDelete.id);
            setDocToDelete(null);
          }}
          onCancel={() => setDocToDelete(null)}
        />
      )}
    </div>
  );
}
