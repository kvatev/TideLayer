import { useState, useMemo } from 'react';
import {
  Megaphone,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type { TicketAnnouncement } from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';

interface AnnouncementsViewProps {
  announcements: TicketAnnouncement[];
  isStaffOrAdmin: boolean;
  onCreateAnnouncement: (title: string, content: string, isPinned?: boolean) => Promise<void>;
  onTogglePin: (id: string, isPinned: boolean) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

export function AnnouncementsView({
  announcements,
  isStaffOrAdmin,
  onCreateAnnouncement,
  onTogglePin,
  onDeleteAnnouncement,
}: AnnouncementsViewProps) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
    });
  }, [announcements, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    await onCreateAnnouncement(title.trim(), content.trim(), isPinned);
    setSubmitting(false);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            <span>Училищни съобщения</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Официални съобщения, инструкции и важна информация от ръководството
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ново съобщение</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Търсене в съобщенията..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className={`rounded-2xl border p-5 sm:p-6 shadow-xs transition-all ${
              ann.is_pinned
                ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  {ann.is_pinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-bold">
                      <Pin className="w-3 h-3" />
                      <span>Забодено</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-500">
                    {new Date(ann.created_at).toLocaleDateString('bg-BG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 leading-snug">
                  {ann.title}
                </h3>
              </div>

              {isStaffOrAdmin && (
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => void onTogglePin(ann.id, !ann.is_pinned)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                    title={ann.is_pinned ? 'Отбоди съобщението' : 'Забоди най-отгоре'}
                  >
                    {ann.is_pinned ? (
                      <PinOff className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Pin className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(ann.id)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Изтрий"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-0">
              {ann.content}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            Няма съобщения.
          </div>
        )}
      </div>

      {/* New Announcement Modal */}
      <ModuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ново съобщение"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">Заглавие *</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. График за класни работи"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">Съдържание *</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Въведете подробна информация..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-navy-900">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Забоди съобщението най-отгоре в таблото</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold"
            >
              {submitting ? 'Публикуване...' : 'Публикувай'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Delete Confirmation */}
      <ModuleConfirmDialog
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) await onDeleteAnnouncement(deleteTargetId);
        }}
        title="Изтриване на съобщение"
        confirmLabel="Изтрий"
        tone="danger"
        description="Сигурни ли сте, че искате да изтриете това съобщение?"
      />
    </div>
  );
}
