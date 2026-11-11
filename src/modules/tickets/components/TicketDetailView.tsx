import { useState, useRef } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Download,
  Edit2,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Paperclip,
  Play,
  Plus,
  Presentation,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  UploadCloud,
  User,
  Users,
} from 'lucide-react';
import {
  ROLE_LABELS,
  type SchoolUserRecord,
  type SchoolUserRole,
} from '../../../lib/supabase';
import {
  detectDocumentType,
  DOCUMENT_TYPE_META,
  formatFileSize,
  isTaskOverdue,
  normalizeTaskStatus,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type DocumentFileType,
  type SchoolTicket,
  type TaskActivityLog,
  type TaskDocumentAttachment,
  type TicketAuditLog,
  type TicketDepartment,
  type TicketMessage,
  type TicketPriority,
  type TicketStatus,
} from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface TicketDetailViewProps {
  ticket: SchoolTicket;
  departments: TicketDepartment[];
  schoolUsers: SchoolUserRecord[];
  messages: TicketMessage[];
  auditLogs: TicketAuditLog[];
  taskActivityLogs?: TaskActivityLog[];
  isStaffOrAdmin: boolean;
  canApprove?: boolean;
  canManage?: boolean;
  currentUserId?: string;
  onBack: () => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => Promise<void>;
  onPriorityChange: (ticketId: string, priority: TicketPriority) => Promise<void>;
  onAssigneeChange: (ticketId: string, userId: string | null) => Promise<void>;
  onSendMessage: (ticketId: string, text: string) => Promise<void>;
  onStartWork?: (ticketId: string) => Promise<void>;
  onSubmitForApproval?: (ticketId: string) => Promise<void>;
  onApproveTask?: (ticketId: string) => Promise<void>;
  onReturnForCorrection?: (ticketId: string, reason: string) => Promise<boolean>;
  onUpdateDeadline?: (ticketId: string, newDueDate: string | null) => Promise<void>;
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
  onReassignTask?: (
    taskId: string,
    newPrimaryAssigneeId: string,
    additionalAssigneeIds?: string[],
    reason?: string
  ) => Promise<unknown>;
  onArchiveTask?: (taskId: string) => Promise<unknown>;
  onRestoreTask?: (taskId: string) => Promise<unknown>;
  onEditTicket: (
    ticketId: string,
    patch: {
      title: string;
      description: string;
      room_or_location?: string | null;
      department_id?: string | null;
      due_date?: string | null;
      priority?: TicketPriority;
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
  taskActivityLogs = [],
  isStaffOrAdmin,
  canApprove = false,
  canManage = false,
  onBack,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onSendMessage,
  onStartWork,
  onSubmitForApproval,
  onApproveTask,
  onReturnForCorrection,
  onUpdateDeadline,
  onAddAttachment,
  onDeleteAttachment,
  onReassignTask,
  onArchiveTask,
  onRestoreTask,
  onEditTicket,
  onDeleteTicket,
}: TicketDetailViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDesc, setEditDesc] = useState(ticket.description);
  const [editRoom, setEditRoom] = useState(ticket.room_or_location || '');
  const [editDeptId, setEditDeptId] = useState(ticket.department_id || '');
  const [editDueDate, setEditDueDate] = useState(ticket.due_date ? ticket.due_date.slice(0, 16) : '');
  const [editPriority, setEditPriority] = useState<TicketPriority>(ticket.priority);
  const [savingEdit, setSavingEdit] = useState(false);

  // Return for correction modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReasonText, setReturnReasonText] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Reassignment modal state
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignPrimaryId, setReassignPrimaryId] = useState(
    ticket.primary_assignee_id || ticket.assigned_to_user_id || ''
  );
  const [reassignAdditionalIds, setReassignAdditionalIds] = useState<string[]>(
    ticket.assigned_user_ids || []
  );
  const [reassignReason, setReassignReason] = useState('');
  const [submittingReassign, setSubmittingReassign] = useState(false);

  // Archive & restore state
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Add Document Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<TaskDocumentAttachment | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ticketMessages = messages.filter((m) => m.ticket_id === ticket.id);
  const ticketLogs = auditLogs.filter((l) => l.ticket_id === ticket.id);
  const taskLogs = taskActivityLogs.filter((l) => l.task_id === ticket.id);
  const attachments = ticket.attachments || [];

  const normStatus = normalizeTaskStatus(ticket.status);
  const isOverdue = isTaskOverdue(ticket);

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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDesc.trim()) return;
    setSavingEdit(true);
    await onEditTicket(ticket.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      room_or_location: editRoom.trim() || null,
      department_id: editDeptId || null,
      due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
      priority: editPriority,
    });
    setSavingEdit(false);
    setEditOpen(false);
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignPrimaryId || !onReassignTask) return;
    setSubmittingReassign(true);
    try {
      const ok = await onReassignTask(
        ticket.id,
        reassignPrimaryId,
        reassignAdditionalIds,
        reassignReason.trim() || undefined
      );
      if (ok) {
        setReassignModalOpen(false);
        setReassignReason('');
      }
    } finally {
      setSubmittingReassign(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!onArchiveTask) return;
    setArchiving(true);
    try {
      await onArchiveTask(ticket.id);
      setArchiveModalOpen(false);
    } finally {
      setArchiving(false);
    }
  };

  const handleRestoreClick = async () => {
    if (!onRestoreTask) return;
    setRestoring(true);
    try {
      await onRestoreTask(ticket.id);
    } finally {
      setRestoring(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReasonText.trim() || !onReturnForCorrection) return;
    setSubmittingReturn(true);
    try {
      const ok = await onReturnForCorrection(ticket.id, returnReasonText.trim());
      if (ok) {
        setReturnModalOpen(false);
        setReturnReasonText('');
      }
    } finally {
      setSubmittingReturn(false);
    }
  };

  const st = STATUS_LABELS[normStatus] || STATUS_LABELS.new;
  const pr = PRIORITY_LABELS[ticket.priority] || PRIORITY_LABELS.medium;

  const renderDueDateInfo = () => {
    if (!ticket.due_date) return null;
    const dueMs = new Date(ticket.due_date).getTime();
    const diffDays = Math.ceil((dueMs - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <span
        className={cn(
          'px-2.5 py-0.5 rounded-md text-xs font-semibold border inline-flex items-center gap-1',
          isOverdue
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : diffDays <= 2
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
        )}
      >
        <Clock className="w-3 h-3" />
        <span>
          {isOverdue
            ? `Просрочена с ${Math.abs(diffDays)} дни`
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
        return <FileText className="w-5 h-5 text-rose-600" />;
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

  const canApproveOrManage = isStaffOrAdmin || canApprove || canManage;

  return (
    <div className="space-y-6">
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

        <div className="flex items-center gap-2 flex-wrap">
          {canApproveOrManage && (
            <>
              {onReassignTask && (
                <button
                  type="button"
                  onClick={() => {
                    setReassignPrimaryId(
                      ticket.primary_assignee_id || ticket.assigned_to_user_id || ''
                    );
                    setReassignAdditionalIds(ticket.assigned_user_ids || []);
                    setReassignReason('');
                    setReassignModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Преразпредели</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditTitle(ticket.title);
                  setEditDesc(ticket.description);
                  setEditRoom(ticket.room_or_location || '');
                  setEditDeptId(ticket.department_id || '');
                  setEditDueDate(ticket.due_date ? ticket.due_date.slice(0, 16) : '');
                  setEditPriority(ticket.priority);
                  setEditOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-navy-900 text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Редактирай</span>
              </button>

              {onArchiveTask && !ticket.is_archived && (
                <button
                  type="button"
                  onClick={() => setArchiveModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-slate-500" />
                  <span>Архивирай</span>
                </button>
              )}

              {onRestoreTask && ticket.is_archived && (
                <button
                  type="button"
                  disabled={restoring}
                  onClick={handleRestoreClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{restoring ? 'Възстановяване...' : 'Възстанови'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Изтрий</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Top Banner: Inactive Assignee Alert */}
      {ticket.has_inactive_assignee && normStatus !== 'completed' && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-rose-900">
                Внимание: Главният отговорник е деактивиран или напуснал училището!
              </div>
              <p className="text-xs text-rose-800 mb-0">
                Служителят <strong>{ticket.primary_assignee_name || ticket.assignee_name}</strong> вече няма активен акаунт. Задачата е в ход и изисква незабавно преразпределяне.
              </p>
            </div>
          </div>
          {onReassignTask && canApproveOrManage && (
            <button
              type="button"
              onClick={() => {
                setReassignPrimaryId('');
                setReassignAdditionalIds(ticket.assigned_user_ids || []);
                setReassignReason('Преразпределяне поради деактивиран/напуснал служител');
                setReassignModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Crown className="w-4 h-4" />
              <span>Преразпредели отговорника</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner: Archived Task Alert */}
      {ticket.is_archived && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Archive className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-navy-900">
                Тази задача е архивирана
              </div>
              <p className="text-xs text-slate-600 mb-0">
                Архивирана {ticket.archived_at ? `на ${new Date(ticket.archived_at).toLocaleString('bg-BG')}` : ''} {ticket.archived_by_name ? `от ${ticket.archived_by_name}` : ''}. Всички документи, комуникация и исторически данни са защитени и непроменени.
              </p>
            </div>
          </div>
          {onRestoreTask && canApproveOrManage && (
            <button
              type="button"
              disabled={restoring}
              onClick={handleRestoreClick}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <ArchiveRestore className="w-4 h-4" />
              <span>{restoring ? 'Възстановяване...' : 'Възстанови от архив'}</span>
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Details (8 cols) + Sidebar Control (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details, Return Banner, Documents, Discussion Thread (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Detail Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md">
                {ticket.code || 'TSK'}
              </span>

              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border',
                  st.bg
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', st.dot)} />
                {st.label}
              </span>

              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-md text-xs font-semibold border',
                  pr.bg,
                  pr.text,
                  pr.border
                )}
              >
                Приоритет: {pr.label}
              </span>

              {renderDueDateInfo()}

              {ticket.room_or_location && (
                <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-0.5 rounded-md">
                  📍 {ticket.room_or_location}
                </span>
              )}
            </div>

            {/* Return reason warning box if task was returned */}
            {ticket.return_reason && normStatus === 'in_progress' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Задачата е върната за корекция от ръководството:</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed pl-6 mb-0">
                  "{ticket.return_reason}"
                </p>
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 leading-snug">
              {ticket.title}
            </h1>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div>
                Направление: <strong className="text-navy-900">{ticket.department_name}</strong>
              </div>
              <div>
                Създадена от: <strong className="text-navy-900">{ticket.creator_name}</strong>
              </div>
              <div>
                Дата на възлагане:{' '}
                <strong className="text-navy-900">
                  {new Date(ticket.created_at).toLocaleDateString('bg-BG')}
                </strong>
              </div>
              {ticket.completed_at && (
                <div>
                  Приключена на:{' '}
                  <strong className="text-emerald-700">
                    {new Date(ticket.completed_at).toLocaleString('bg-BG')}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Workflow A: Task Documents & Attachments (with 1-year archive) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-heading font-bold text-navy-900 mb-0.5">
                  Прикачени документи към задачата ({attachments.length})
                </h3>
                <p className="text-xs text-slate-500 mb-0">
                  Всички файлове се пазят в защитен 1-годишен архив за оперативна отчетност
                </p>
              </div>

              {onAddAttachment && (
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Прикачи файл</span>
                </button>
              )}
            </div>

            {/* Attachments List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {renderFileIcon(doc.file_type)}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy-900 truncate mb-0.5">
                        {doc.file_name}
                      </p>
                      <p className="text-[10px] text-slate-400 mb-0">
                        {formatFileSize(doc.file_size_bytes)} • Качен от {doc.uploaded_by_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(doc)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 cursor-pointer"
                      title="Свали документа"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteAttachment && canApproveOrManage && (
                      <button
                        type="button"
                        onClick={() => void onDeleteAttachment(doc.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                        title="Изтрий файла"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {attachments.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <Paperclip className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  <p className="text-xs mb-0">Няма прикачени документи към тази задача.</p>
                </div>
              )}
            </div>
          </div>

          {/* Comments & Task Communication Thread */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm sm:text-base font-heading font-bold text-navy-900 mb-0">
                Комуникация и отчети по задачата ({ticketMessages.length})
              </h3>
            </div>

            {/* Messages Thread */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {ticketMessages.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-navy-900">{m.sender_name}</span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(m.created_at).toLocaleString('bg-BG')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-0">
                    {m.message}
                  </p>
                </div>
              ))}

              {ticketMessages.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400 mb-0">
                  Все още няма изпратени коментари или отчети по тази задача.
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
                placeholder="Въведете отчет, въпрос или бележка по задачата..."
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

          {/* Activity History Timeline */}
          {(taskLogs.length > 0 || ticketLogs.length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-bold text-navy-900 mb-0 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Неотменима хронология и журнал на действията ({taskLogs.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Защитени записи с авторски отпечатък
                </span>
              </div>

              <div className="space-y-3 divide-y divide-slate-100">
                {taskLogs.map((log) => {
                  const getActionBadge = (action: string) => {
                    switch (action) {
                      case 'created':
                        return { label: 'Създаване', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
                      case 'reassigned':
                        return { label: 'Преразпределяне', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
                      case 'status_changed':
                        return { label: 'Статус', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
                      case 'returned_for_correction':
                        return { label: 'Върната за корекция', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
                      case 'approved':
                        return { label: 'Одобрение', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                      case 'archived':
                        return { label: 'Архивиране', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
                      case 'restored':
                        return { label: 'Възстановяване', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                      case 'file_uploaded':
                        return { label: 'Прикачен файл', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
                      case 'file_deleted':
                        return { label: 'Изтрит файл', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
                      case 'comment_added':
                        return { label: 'Коментар', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
                      default:
                        return { label: action, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
                    }
                  };

                  const badge = getActionBadge(log.action);

                  return (
                    <div key={log.id} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                              badge.bg
                            )}
                          >
                            {badge.label}
                          </span>
                          <strong className="text-navy-900">{log.actor_name || 'Служител'}</strong>
                          {log.actor_role && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              ({ROLE_LABELS[log.actor_role as SchoolUserRole] || log.actor_role}
                              {log.actor_department_name ? ` • ${log.actor_department_name}` : ''})
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {new Date(log.created_at).toLocaleString('bg-BG')}
                        </span>
                      </div>

                      {/* Previous to new value diff */}
                      {(log.previous_value || log.new_value) && (
                        <div className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60 font-mono text-[11px]">
                          {log.previous_value && (
                            <span className="text-slate-500 line-through mr-1.5">
                              {log.previous_value}
                            </span>
                          )}
                          <span className="text-slate-400">➔</span>
                          <span className="text-navy-900 font-semibold ml-1.5">
                            {log.new_value || '—'}
                          </span>
                        </div>
                      )}

                      {/* Reason */}
                      {log.reason && (
                        <div className="text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 italic text-xs">
                          Основание: „{log.reason}“
                        </div>
                      )}

                      {/* Details text if present and not diff */}
                      {log.details && typeof log.details === 'string' && !log.previous_value && !log.new_value && (
                        <p className="text-slate-600 mb-0 pl-1">{log.details}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Workflow Actions & Assignment Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Real Workflow Actions Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-heading font-bold text-navy-900 mb-0">
              Работен процес и статус
            </h3>

            {/* Current status display */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Текущ етап:
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('w-2.5 h-2.5 rounded-full', st.dot)} />
                <span className="font-bold text-sm text-navy-900">{st.label}</span>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="space-y-2">
              {/* If New / Open: Start Work */}
              {normStatus === 'new' && (
                <button
                  type="button"
                  onClick={() => {
                    if (onStartWork) void onStartWork(ticket.id);
                    else void onStatusChange(ticket.id, 'in_progress');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Започни работа по задачата</span>
                </button>
              )}

              {/* If In Progress: Submit for Approval OR Approve */}
              {normStatus === 'in_progress' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSubmitForApproval) void onSubmitForApproval(ticket.id);
                      else void onStatusChange(ticket.id, 'awaiting_approval');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Предай за одобрение</span>
                  </button>

                  {canApproveOrManage && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onApproveTask) void onApproveTask(ticket.id);
                        else void onStatusChange(ticket.id, 'completed');
                      }}
                      className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Директно одобри и приключи</span>
                    </button>
                  )}
                </>
              )}

              {/* If Awaiting Approval: Approve OR Return for Correction */}
              {normStatus === 'awaiting_approval' && (
                <>
                  {canApproveOrManage ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (onApproveTask) void onApproveTask(ticket.id);
                          else void onStatusChange(ticket.id, 'completed');
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Одобри и финализирай задачата</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReturnModalOpen(true)}
                        className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Върни за корекция</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                      Задачата е предадена за преглед от ръководството. Очаква се одобрение.
                    </div>
                  )}
                </>
              )}

              {/* If Completed: Reopen if admin */}
              {normStatus === 'completed' && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Задачата е успешно одобрена и приключена.</span>
                  </div>

                  {canApproveOrManage && (
                    <button
                      type="button"
                      onClick={() => void onStatusChange(ticket.id, 'in_progress')}
                      className="w-full py-2 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Върни в процес на работа
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Status Select Fallback for Admins */}
            {canApproveOrManage && (
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Ръчна промяна на статус (Админ)
                </label>
                <select
                  value={normStatus}
                  onChange={(e) => void onStatusChange(ticket.id, e.target.value as TicketStatus)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="new">Нова задача</option>
                  <option value="in_progress">В процес</option>
                  <option value="awaiting_approval">Чака одобрение</option>
                  <option value="completed">Приключена</option>
                </select>
              </div>
            )}
          </div>

          {/* Assignee & Priority Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-heading font-bold text-navy-900 mb-0">
              Отговорници и срокове
            </h3>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Приоритет
              </label>
              <select
                value={ticket.priority}
                disabled={!canApproveOrManage}
                onChange={(e) => void onPriorityChange(ticket.id, e.target.value as TicketPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-navy-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Нисък</option>
                <option value="medium">Нормален</option>
                <option value="high">Висок</option>
                <option value="urgent">🚨 Спешен</option>
              </select>
            </div>

            {/* Mandatory Primary Assignee Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-navy-900 flex items-center gap-1.5 mb-0">
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Главен отговорник</span>
                </label>

                {canApproveOrManage && onReassignTask && (
                  <button
                    type="button"
                    onClick={() => {
                      setReassignPrimaryId(
                        ticket.primary_assignee_id || ticket.assigned_to_user_id || ''
                      );
                      setReassignAdditionalIds(ticket.assigned_user_ids || []);
                      setReassignReason('');
                      setReassignModalOpen(true);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Преразпредели
                  </button>
                )}
              </div>

              {ticket.assigned_role_target ? (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-900">
                  👥 Групово възложена: {ticket.assignee_name}
                </div>
              ) : (
                <div
                  className={cn(
                    'p-3 rounded-xl border flex items-start gap-2.5',
                    ticket.has_inactive_assignee
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-slate-50 border-slate-200 text-navy-900'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
                      ticket.has_inactive_assignee
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-blue-100 text-blue-700'
                    )}
                  >
                    {ticket.primary_assignee_name?.slice(0, 2).toUpperCase() || 'ОТ'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">
                      {ticket.primary_assignee_name || ticket.assignee_name || 'Неразпределена'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {ticket.primary_assignee_role
                        ? ROLE_LABELS[ticket.primary_assignee_role as SchoolUserRole] || ticket.primary_assignee_role
                        : 'Служител'}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {ticket.primary_assignee_is_active === false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          ⚠️ Деактивиран / Напуснал
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Активен служител</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Assignees Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-navy-900 flex items-center gap-1.5 mb-0">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Допълнителни съотговорници (
                    {ticket.additional_assignees?.length || ticket.assigned_user_ids?.length || 0})
                  </span>
                </label>

                {canApproveOrManage && onReassignTask && (
                  <button
                    type="button"
                    onClick={() => {
                      setReassignPrimaryId(
                        ticket.primary_assignee_id || ticket.assigned_to_user_id || ''
                      );
                      setReassignAdditionalIds(ticket.assigned_user_ids || []);
                      setReassignReason('');
                      setReassignModalOpen(true);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Редактирай
                  </button>
                )}
              </div>

              {ticket.additional_assignees && ticket.additional_assignees.length > 0 ? (
                <div className="space-y-1.5">
                  {ticket.additional_assignees.map((u) => (
                    <div
                      key={u.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-navy-900 truncate block">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {ROLE_LABELS[u.role as SchoolUserRole] || u.role}
                        </span>
                      </div>
                      {u.is_active === false ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">
                          Деактивиран
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-600 font-semibold shrink-0">
                          ● Активен
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic mb-0">
                  Няма добавени допълнителни съотговорници.
                </p>
              )}
            </div>

            {/* Deadline Change */}
            {canApproveOrManage && onUpdateDeadline && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Краен срок
                </label>
                <input
                  type="date"
                  value={ticket.due_date ? ticket.due_date.slice(0, 10) : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    void onUpdateDeadline(ticket.id, val ? new Date(val).toISOString() : null);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return for Correction Modal */}
      {returnModalOpen && (
        <ModuleModal
          isOpen={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          title="Връщане на задача за корекция"
          size="md"
        >
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              Моля, посочете задължително конкретните причини, забележки или липсващи документи,
              които отговорникът трябва да коригира. Статусът на задачата ще бъде върнат на "В процес".
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Причина за връщане <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={returnReasonText}
                onChange={(e) => setReturnReasonText(e.target.value)}
                required
                rows={4}
                placeholder="напр. Липсва попълнен раздел IV от тематичния план. Моля добавете и графиците за контролни работи за паралелки 8.А и 8.Б."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={submittingReturn || !returnReasonText.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {submittingReturn ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Върни задачата</span>
              </button>
            </div>
          </form>
        </ModuleModal>
      )}

      {/* Edit Ticket Modal */}
      {editOpen && (
        <ModuleModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          title={`Редакция на задача ${ticket.code || 'TSK'}`}
          size="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Заглавие на задачата <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Описание и указания <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Направление
                </label>
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Общо направление --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Локация / Кабинет
                </label>
                <input
                  type="text"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  placeholder="напр. Кабинет 204"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Краен срок
                </label>
                <input
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Приоритет
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Нисък</option>
                  <option value="medium">Нормален</option>
                  <option value="high">Висок</option>
                  <option value="urgent">Спешен</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? 'Запазване...' : 'Запази промените'}
              </button>
            </div>
          </form>
        </ModuleModal>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <ModuleModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Прикачване на документ към задачата"
          size="md"
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm font-semibold text-navy-900">
                {isUploading ? 'Качване...' : 'Изберете документи от устройството'}
              </div>
              <p className="text-xs text-slate-500 mb-0 mt-1">
                Поддържат се: PDF, Word, Excel, PowerPoint, JPG, PNG
              </p>
            </div>
          </div>
        </ModuleModal>
      )}

      {/* Delete Confirmation */}
      {deleteModalOpen && (
        <ModuleConfirmDialog
          isOpen={deleteModalOpen}
          title="Изтриване на задача"
          message={`Сигурни ли сте, че искате да изтриете задача ${ticket.code || ''} (${ticket.title})?`}
          confirmLabel="Изтрий задачата"
          tone="danger"
          onConfirm={async () => {
            await onDeleteTicket(ticket.id);
            onBack();
          }}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}

      {/* Formal Reassign Task Modal */}
      {reassignModalOpen && (
        <ModuleModal
          isOpen={reassignModalOpen}
          onClose={() => setReassignModalOpen(false)}
          title={`Преразпределяне на отговорности по задача ${ticket.code || ''}`}
          size="lg"
        >
          <form onSubmit={handleReassignSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
              <strong>Официално преразпределяне на задачата:</strong> Всяка промяна на главния
              отговорник и участниците се вписва автоматично в защитената хронология с дата, час,
              потребител и посоченото основание.
            </div>

            {/* Current assignee info */}
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <span>Досегашен отговорник:</span>
              <strong className="text-navy-900">
                {ticket.primary_assignee_name || ticket.assignee_name || 'Неразпределена'}{' '}
                {ticket.primary_assignee_is_active === false && '(⚠️ Деактивиран акаунт)'}
              </strong>
            </div>

            {/* Mandatory New Primary Assignee */}
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Нов главен отговорник <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={reassignPrimaryId}
                required
                onChange={(e) => {
                  const newId = e.target.value;
                  setReassignPrimaryId(newId);
                  setReassignAdditionalIds((prev) => prev.filter((id) => id !== newId));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-navy-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Изберете активен служител за главен отговорник --</option>
                {schoolUsers
                  .filter((u) => u.is_active !== false)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({ROLE_LABELS[u.role] || u.role})
                    </option>
                  ))}
              </select>
            </div>

            {/* Optional Additional Assignees */}
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Допълнителни съотговорници (по избор)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {schoolUsers
                  .filter((u) => u.is_active !== false && u.id !== reassignPrimaryId)
                  .map((u) => {
                    const isSelected = reassignAdditionalIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setReassignAdditionalIds((prev) => prev.filter((id) => id !== u.id));
                          } else {
                            setReassignAdditionalIds((prev) => [...prev, u.id]);
                          }
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 border',
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                        )}
                      >
                        <span>{u.full_name}</span>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Основание / Причина за преразпределянето (по избор)
              </label>
              <textarea
                rows={2}
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="напр. Служителят е в платен отпуск / Пренасочване по указание на Директора / Напуснал служител"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReassignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={submittingReassign || !reassignPrimaryId}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                {submittingReassign ? 'Запазване...' : 'Потвърди новото разпределение'}
              </button>
            </div>
          </form>
        </ModuleModal>
      )}

      {/* Archive Confirmation Dialog */}
      {archiveModalOpen && (
        <ModuleConfirmDialog
          isOpen={archiveModalOpen}
          title="Архивиране на задача"
          message={`Сигурни ли сте, че искате да архивирате задача ${ticket.code || ''} (${ticket.title})? Всички документи, коментари и история на действията остават напълно запазени за постоянна отчетност.`}
          confirmLabel={archiving ? 'Архивиране...' : 'Архивирай задачата'}
          tone="primary"
          onConfirm={handleArchiveConfirm}
          onCancel={() => setArchiveModalOpen(false)}
        />
      )}
    </div>
  );
}
