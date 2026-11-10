import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Edit2,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Paperclip,
  Plus,
  Presentation,
  Send,
  Trash2,
  UploadCloud,
  User,
} from 'lucide-react';
import {
  ROLE_LABELS,
  type SchoolUserRecord,
} from '../../../lib/supabase';
import {
  detectDocumentType,
  DOCUMENT_TYPE_META,
  formatFileSize,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type DocumentFileType,
  type SchoolTicket,
  type TaskDocumentAttachment,
  type TicketAuditLog,
  type TicketDepartment,
  type TicketMessage,
  type TicketPriority,
  type TicketStatus,
} from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';

interface TicketDetailViewProps {
  ticket: SchoolTicket;
  departments: TicketDepartment[];
  schoolUsers: SchoolUserRecord[];
  messages: TicketMessage[];
  auditLogs: TicketAuditLog[];
  isStaffOrAdmin: boolean;
  onBack: () => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => Promise<void>;
  onPriorityChange: (ticketId: string, priority: TicketPriority) => Promise<void>;
  onAssigneeChange: (ticketId: string, userId: string | null) => Promise<void>;
  onSendMessage: (ticketId: string, text: string) => Promise<void>;
  onAddAttachment?: (
    taskId: string,
    doc: {
      file_name: string;
      file_size_bytes: number;
      file_type: DocumentFileType;
      mime_type: string;
      file_url: string;
    }
  ) => Promise<unknown>;
  onDeleteAttachment?: (attachmentId: string) => Promise<unknown>;
  onEditTicket: (
    ticketId: string,
    patch: {
      title: string;
      description: string;
      room_or_location?: string | null;
      department_id?: string | null;
    }
  ) => Promise<void>;
  onDeleteTicket: (ticketId: string) => Promise<void>;
}

export function TicketDetailView({
  ticket,
  departments,
  schoolUsers,
  messages,
  auditLogs,
  isStaffOrAdmin,
  onBack,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onSendMessage,
  onAddAttachment,
  onDeleteAttachment,
  onEditTicket,
  onDeleteTicket,
}: TicketDetailViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Edit ticket state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDesc, setEditDesc] = useState(ticket.description);
  const [editRoom, setEditRoom] = useState(ticket.room_or_location || '');
  const [editDeptId, setEditDeptId] = useState(ticket.department_id || '');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Add Document Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<TaskDocumentAttachment | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ticketMessages = messages.filter((m) => m.ticket_id === ticket.id);
  const ticketLogs = auditLogs.filter((l) => l.ticket_id === ticket.id);
  const attachments = ticket.attachments || [];

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    await onSendMessage(ticket.id, newMessage);
    setNewMessage('');
    setSendingMsg(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onAddAttachment) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const detectedType = detectDocumentType(file.name, file.type);
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = async () => {
            await onAddAttachment(ticket.id, {
              file_name: file.name,
              file_size_bytes: file.size,
              file_type: detectedType,
              mime_type: file.type || 'application/octet-stream',
              file_url: (reader.result as string) || '#',
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      setUploadModalOpen(false);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadFile = (doc: TaskDocumentAttachment) => {
    const a = document.createElement('a');
    a.href = doc.file_url || '#';
    a.download = doc.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllAttachments = () => {
    attachments.forEach((doc, idx) => {
      setTimeout(() => {
        handleDownloadFile(doc);
      }, idx * 250);
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDesc.trim()) return;
    setSavingEdit(true);
    await onEditTicket(ticket.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      room_or_location: editRoom.trim() || null,
      department_id: editDeptId || null,
    });
    setSavingEdit(false);
    setEditOpen(false);
  };

  const st = STATUS_LABELS[ticket.status] || STATUS_LABELS.open;
  const pr = PRIORITY_LABELS[ticket.priority] || PRIORITY_LABELS.medium;

  const [nowMs] = useState(() => Date.now());

  // Due date countdown
  const renderDueDateInfo = () => {
    if (!ticket.due_date) return null;
    const dueMs = new Date(ticket.due_date).getTime();
    const diffDays = Math.ceil((dueMs - nowMs) / (1000 * 60 * 60 * 24));
    const isOverdue = diffDays < 0;

    return (
      <span
        className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border inline-flex items-center gap-1 ${
          isOverdue
            ? 'bg-red-50 text-red-700 border-red-200'
            : diffDays <= 2
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}
      >
        <Clock className="w-3 h-3" />
        <span>
          {isOverdue
            ? `Срокът е изтекъл преди ${Math.abs(diffDays)} дни`
            : diffDays === 0
            ? 'Краен срок: Днес'
            : `Краен срок: ${new Date(ticket.due_date).toLocaleDateString('bg-BG')} (остават ${diffDays} дни)`}
        </span>
      </span>
    );
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
    <div className="space-y-6 animate-fade-in">
      {/* Top back & actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад към списъка със задачи</span>
        </button>

        <div className="flex items-center gap-2">
          {isStaffOrAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditTitle(ticket.title);
                  setEditDesc(ticket.description);
                  setEditRoom(ticket.room_or_location || '');
                  setEditDeptId(ticket.department_id || '');
                  setEditOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-navy-900 text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Редактирай</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Изтрий</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Details (8 cols) + Sidebar Control (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details, Documents, Discussion Thread (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Detail Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${st.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${pr.bg} ${pr.text} ${pr.border}`}>
                Приоритет: {pr.label}
              </span>
              {renderDueDateInfo()}
              {ticket.room_or_location && (
                <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-0.5 rounded-md">
                  📍 {ticket.room_or_location}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 leading-snug">
              {ticket.title}
            </h1>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>

            {/* Task Meta Footer */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Възложител:{' '}
                  <strong>
                    {ticket.creator_name}
                    {ticket.creator_role ? ` (${ticket.creator_role})` : ''}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Възложена на:{' '}
                  <strong>{new Date(ticket.created_at).toLocaleString('bg-BG')}</strong>
                </span>
              </div>
              <div>
                Отдел / Направление: <strong>{ticket.department_name}</strong>
              </div>
            </div>
          </div>

          {/* Structured Attached Documents Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-heading font-bold text-navy-900 mb-0">
                  Прикачени документи към задачата ({attachments.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {attachments.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllAttachments}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Изтегли всички</span>
                  </button>
                )}

                {onAddAttachment && (
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Прикачи файл</span>
                  </button>
                )}
              </div>
            </div>

            {attachments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs sm:text-sm text-slate-500 mb-2">
                  Към тази задача все още няма прикачени файлове или бланки.
                </p>
                {onAddAttachment && (
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Прикачи първи документ (PDF, Word, Excel, PPTX)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {attachments.map((doc) => {
                  const meta = DOCUMENT_TYPE_META[doc.file_type] || DOCUMENT_TYPE_META.other;

                  return (
                    <div
                      key={doc.id}
                      className="bg-slate-50 hover:bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            {renderFileIcon(doc.file_type)}
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${meta.badgeBg}`}
                            >
                              {meta.badgeText}
                            </span>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {formatFileSize(doc.file_size_bytes)}
                            </div>
                          </div>
                        </div>

                        {onDeleteAttachment && isStaffOrAdmin && (
                          <button
                            type="button"
                            onClick={() => onDeleteAttachment(doc.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                            title="Изтрий файла"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <h4
                          className="text-xs sm:text-sm font-semibold text-navy-900 group-hover:text-blue-600 transition-colors break-words line-clamp-2 mb-0"
                          title={doc.file_name}
                        >
                          {doc.file_name}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Качен от: {doc.uploaded_by_name} ({doc.uploaded_by_role})
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 text-xs font-medium cursor-pointer inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-blue-600" />
                          <span>Преглед</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(doc)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Изтегли</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages & Discussion Thread */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h3 className="text-base font-heading font-bold text-navy-900 flex items-center gap-2 mb-0">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Отчети и коментари по изпълнението ({ticketMessages.length})</span>
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {ticketMessages.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-navy-900">{m.sender_name}</strong>
                      <span className="text-slate-400">
                        {new Date(m.created_at).toLocaleDateString('bg-BG')}{' '}
                        {new Date(m.created_at).toLocaleTimeString('bg-BG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-0">
                      {m.message}
                    </p>
                  </div>
                ))}

                {ticketMessages.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400 mb-0">
                    Все още няма изпратени отчети или коментари по тази задача.
                  </p>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Предайте отчет, статус на изпълнение или бележка..."
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !newMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Изпрати</span>
                </button>
              </form>
            </div>
          </div>

          {/* Activity / Audit Timeline */}
          {ticketLogs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-heading font-bold text-navy-900 mb-0">
                Хронология на задачата
              </h3>
              <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
                {ticketLogs.map((log) => (
                  <div key={log.id} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                    <div>
                      <strong className="text-navy-900">{log.actor_name}</strong>: {log.action}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString('bg-BG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status & Assignment Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Status Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-heading font-bold text-navy-900 mb-0">
              Управление на задачата
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Статус на задачата
              </label>
              <select
                value={ticket.status}
                onChange={(e) => void onStatusChange(ticket.id, e.target.value as TicketStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-navy-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="open">Нова задача</option>
                <option value="in_progress">В процес на изпълнение</option>
                <option value="resolved">Изпълнена / Предадена за преглед</option>
                {isStaffOrAdmin && <option value="closed">Приключена / Одобрена</option>}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Приоритет
              </label>
              <select
                value={ticket.priority}
                disabled={!isStaffOrAdmin}
                onChange={(e) => void onPriorityChange(ticket.id, e.target.value as TicketPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-navy-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Нисък</option>
                <option value="medium">Нормален</option>
                <option value="high">Висок</option>
                <option value="urgent">🚨 Спешен</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Изпълнител
              </label>
              {ticket.assigned_role_target ? (
                <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
                  Групово възложена: {ticket.assignee_name}
                </div>
              ) : (
                <select
                  value={ticket.assigned_to_user_id || ''}
                  disabled={!isStaffOrAdmin}
                  onChange={(e) => void onAssigneeChange(ticket.id, e.target.value || null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-navy-900 bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Неразпределена</option>
                  {schoolUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({ROLE_LABELS[u.role] || u.role})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <ModuleModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Прикачване на документи към задачата"
          subtitle={`Задача: ${ticket.title}`}
          maxWidthClass="max-w-md"
        >
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-navy-900">
                {isUploading ? 'Качване...' : 'Изберете документи от компютъра'}
              </div>
              <p className="text-xs text-slate-500 mb-0 mt-1">
                Поддържат се: PDF, Word, Excel, PowerPoint
              </p>
            </div>
          </div>
        </ModuleModal>
      )}

      {/* Document Preview Modal */}
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

            <div className="bg-slate-100 rounded-xl border border-slate-200 p-8 text-center min-h-[200px] flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                {renderFileIcon(previewDoc.file_type)}
              </div>
              <div>
                <div className="text-sm font-heading font-bold text-navy-900 mb-1">
                  {previewDoc.file_name}
                </div>
                <p className="text-xs text-slate-500 max-w-sm mb-0">
                  Документът е съхранен в сигурния училищен облак на TideLayer. Можете да го прегледате или запазите на вашето устройство.
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
              </div>
            </div>
          </div>
        </ModuleModal>
      )}

      {/* Edit Ticket Modal */}
      <ModuleModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Редакция на задачата"
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">Заглавие *</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">Отдел / Направление</label>
              <select
                value={editDeptId}
                onChange={(e) => setEditDeptId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
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
                Кабинет / Помещение
              </label>
              <input
                type="text"
                value={editRoom}
                onChange={(e) => setEditRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">Описание *</label>
            <textarea
              rows={4}
              required
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={savingEdit || !editTitle.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold cursor-pointer"
            >
              {savingEdit ? 'Запазване...' : 'Запази промените'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Delete Ticket Confirmation */}
      <ModuleConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await onDeleteTicket(ticket.id);
          onBack();
        }}
        title="Изтриване на задача"
        confirmLabel="Изтрий задачата"
        tone="danger"
        description="Сигурни ли сте, че искате да изтриете тази задача? Всички коментари, хронология и прикачени документи към нея ще бъдат премахнати."
      />
    </div>
  );
}
