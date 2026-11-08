import { useState, useRef } from 'react';
import {
  ArrowLeft,
  File,
  FileSpreadsheet,
  FileText,
  Presentation,
  Send,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  canAssignTaskToRole,
  ROLE_HIERARCHY_LEVEL,
  ROLE_LABELS,
  type SchoolPortalSession,
  type SchoolUserRecord,
} from '../../../lib/supabase';
import {
  detectDocumentType,
  DOCUMENT_TYPE_META,
  formatFileSize,
  type DocumentFileType,
  type TicketDepartment,
  type TicketPriority,
} from '../types';

interface PreparedFile {
  file_name: string;
  file_size_bytes: number;
  file_type: DocumentFileType;
  mime_type: string;
  file_url: string;
}

interface TicketCreateViewProps {
  session: SchoolPortalSession;
  departments: TicketDepartment[];
  schoolUsers: SchoolUserRecord[];
  isStaffOrAdmin?: boolean;
  onBack: () => void;
  onCreate: (input: {
    title: string;
    description: string;
    room_or_location?: string;
    department_id?: string | null;
    priority: TicketPriority;
    assigned_to_user_id?: string | null;
    assigned_role_target?: string | null;
    due_date?: string | null;
    attachments?: PreparedFile[];
  }) => Promise<unknown>;
}

export function TicketCreateView({
  session,
  departments,
  schoolUsers,
  isStaffOrAdmin: _isStaffOrAdmin,
  onBack,
  onCreate,
}: TicketCreateViewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState('');
  const [departmentId, setDepartmentId] = useState<string>(departments[0]?.id || '');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [assignmentMode, setAssignmentMode] = useState<'individual' | 'group'>('individual');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [groupTarget, setGroupTarget] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [preparedFiles, setPreparedFiles] = useState<PreparedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hierarchy role level
  const userLevel = ROLE_HIERARCHY_LEVEL[session.role] ?? 4;
  const isLeadership = userLevel <= 2; // Director or Deputy
  const isAdministration = userLevel === 3;

  // Filter assignable users based on strict hierarchy
  const eligibleAssignees = schoolUsers.filter((u) => {
    // Cannot assign to yourself
    if (u.id === session.userId) return false;
    // Main Admin Preview can assign to anyone
    if (session.isSuperAdminPreview) return true;
    return canAssignTaskToRole(session.role, u.role);
  });

  const handleProcessFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      const detectedType = detectDocumentType(file.name, file.type);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreparedFiles((prev) => [
          ...prev,
          {
            file_name: file.name,
            file_size_bytes: file.size,
            file_type: detectedType,
            mime_type: file.type || 'application/octet-stream',
            file_url: dataUrl,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setPreparedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        room_or_location: room.trim() || undefined,
        department_id: departmentId || null,
        priority,
        assigned_to_user_id: assignmentMode === 'individual' && assigneeId ? assigneeId : null,
        assigned_role_target: assignmentMode === 'group' && groupTarget ? groupTarget : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        attachments: preparedFiles,
      });
      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileIcon = (fileType: DocumentFileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'word':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'powerpoint':
        return <Presentation className="w-4 h-4 text-amber-600" />;
      default:
        return <File className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Назад към задачите</span>
      </button>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-0">
              Възлагане на нова задача
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              {ROLE_LABELS[session.role] || session.role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Задайте ясни инструкции, прикачете необходимите образци или бланки (PDF, Word, Excel, PowerPoint) и определете краен срок.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Заглавие на задачата <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. Предаване на годишен тематичен план и график за контролни работи"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Направление / Отдел <span className="text-red-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Място / Кабинет / Дигитален портал
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="напр. Учителска стая / Канцелария"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="low">Нисък — текуща задача без бързане</option>
                <option value="medium">Нормален — стандартен срок</option>
                <option value="high">Висок — важен училищен срок</option>
                <option value="urgent">🚨 Спешен — критичен отчет към МОН / РУО</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Краен срок за изпълнение (Опция)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Hierarchy-based Assignee Selector */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-0">
                Възложи на (Изпълнител)
              </label>

              {(isLeadership || isAdministration) && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAssignmentMode('individual')}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                      assignmentMode === 'individual'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Конкретен колега
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignmentMode('group')}
                    className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                      assignmentMode === 'group'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Цяла група / Отдел
                  </button>
                </div>
              )}
            </div>

            {assignmentMode === 'individual' ? (
              <div>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Неразпределена (обща задача за екипа)</option>
                  {eligibleAssignees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} — {ROLE_LABELS[u.role] || u.role} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1 mb-0">
                  Списъкът е автоматично филтриран спрямо училищната йерархия на длъжността ви.
                </p>
              </div>
            ) : (
              <div>
                <select
                  value={groupTarget}
                  onChange={(e) => setGroupTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Изберете целева група...</option>
                  <option value="all_teachers">Всички учители (целия педагогически състав)</option>
                  {isLeadership && (
                    <option value="all_administration">
                      Всички в администрацията и канцеларията (ЗАС, Счетоводство)
                    </option>
                  )}
                  <option value="all_staff">Целия персонал и поддръжка</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1 mb-0">
                  Задачата ще бъде възложена едновременно на всички членове на избраната група.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Подробно описание и указания за изпълнение <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишете изискванията, какво трябва да съдържа отговорът и по какъв образец да се попълни..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Multi-Document Upload Zone (PDF, Word, Excel, PowerPoint) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-0">
                Прикачени документи (PDF, Word, Excel, PowerPoint)
              </label>
              <span className="text-xs text-slate-500">
                {preparedFiles.length} {preparedFiles.length === 1 ? 'файл' : 'файла'}
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleProcessFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="hidden"
                onChange={(e) => handleProcessFiles(e.target.files)}
              />

              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-navy-900 mb-0.5">
                Плъзнете файлове тук или щракнете за избор
              </div>
              <p className="text-xs text-slate-500 mb-0">
                Поддържат се: <strong>PDF</strong>, <strong>Word (.docx)</strong>, <strong>Excel (.xlsx)</strong>, <strong>PowerPoint (.pptx)</strong> (до 10 файла наведнъж)
              </p>
            </div>

            {/* Chosen Files List */}
            {preparedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {preparedFiles.map((file, idx) => {
                  const meta = DOCUMENT_TYPE_META[file.file_type] || DOCUMENT_TYPE_META.other;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          {renderFileIcon(file.file_type)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-navy-900 truncate" title={file.file_name}>
                            {file.file_name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${meta.badgeBg}`}>
                              {meta.badgeText}
                            </span>
                            <span>{formatFileSize(file.file_size_bytes)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(idx);
                        }}
                        className="w-6 h-6 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                        title="Премахни файла"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Възлагане...' : 'Възложи задачата'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
