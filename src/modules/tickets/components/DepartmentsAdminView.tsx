import { useState } from 'react';
import {
  Building2,
  Edit2,
  FolderOpen,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import type { SchoolTicket, TicketDepartment } from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface DepartmentsAdminViewProps {
  departments: TicketDepartment[];
  tickets: SchoolTicket[];
  onCreateDepartment: (name: string, description?: string, color?: string, manager_name?: string) => Promise<void>;
  onUpdateDepartment: (id: string, name: string, description?: string, color?: string, manager_name?: string) => Promise<void>;
  onDeleteDepartment: (id: string) => Promise<boolean>;
}

const COLOR_OPTIONS: { id: string; label: string; badge: string; bg: string; text: string }[] = [
  { id: 'blue', label: 'Синьо', badge: 'bg-blue-100 text-blue-700 border-blue-200', bg: 'bg-blue-50 text-blue-600', text: 'text-blue-600' },
  { id: 'emerald', label: 'Зелено', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bg: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-600' },
  { id: 'purple', label: 'Лилаво', badge: 'bg-purple-100 text-purple-700 border-purple-200', bg: 'bg-purple-50 text-purple-600', text: 'text-purple-600' },
  { id: 'amber', label: 'Оранжево', badge: 'bg-amber-100 text-amber-800 border-amber-200', bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700' },
  { id: 'red', label: 'Червено', badge: 'bg-red-100 text-red-700 border-red-200', bg: 'bg-red-50 text-red-600', text: 'text-red-600' },
  { id: 'navy', label: 'Тъмносиньо', badge: 'bg-slate-200 text-slate-800 border-slate-300', bg: 'bg-navy-50 text-navy-900', text: 'text-navy-900' },
];

export function DepartmentsAdminView({
  departments,
  tickets,
  onCreateDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}: DepartmentsAdminViewProps) {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<TicketDepartment | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [managerName, setManagerName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setColor('blue');
    setManagerName('');
    setModalOpen(true);
  };

  const openEdit = (dept: TicketDepartment) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setColor(dept.color || 'blue');
    setManagerName(dept.manager_name || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    if (editingDept) {
      await onUpdateDepartment(
        editingDept.id,
        name.trim(),
        description.trim() || undefined,
        color,
        managerName.trim() || undefined
      );
    } else {
      await onCreateDepartment(
        name.trim(),
        description.trim() || undefined,
        color,
        managerName.trim() || undefined
      );
    }
    setSubmitting(false);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Управление на отдели</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Организация на техническите и административни направления в училището
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Нов отдел</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const linkedTickets = tickets.filter((t) => t.department_id === dept.id);
          const openTickets = linkedTickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
          const colorMeta = COLOR_OPTIONS.find((c) => c.id === dept.color) || COLOR_OPTIONS[0];

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colorMeta.bg)}>
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Редактирай"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(dept.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Изтрий"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-base font-heading font-bold text-navy-900 leading-snug">
                    {dept.name}
                  </h3>
                  <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-md border', colorMeta.badge)}>
                    {colorMeta.label}
                  </span>
                </div>

                {dept.manager_name && (
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Отговорник: <strong>{dept.manager_name}</strong></span>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {dept.description || 'Няма въведено описание.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Общо задачи: <strong>{linkedTickets.length}</strong></span>
                <span className="text-amber-700 font-semibold">
                  Активни: {openTickets.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <ModuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Редактиране на отдел' : 'Създаване на нов отдел'}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Наименование на отдела *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. ИТ и STEM поддръжка"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Отговорник / МОЛ на отдела
            </label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder="напр. инж. Георги Димитров"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Цветен етикет
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setColor(opt.id)}
                  className={cn(
                    'py-1.5 px-2.5 rounded-lg border text-xs font-semibold text-center transition-all',
                    color === opt.id
                      ? `${opt.badge} ring-2 ring-blue-500 font-bold shadow-2xs`
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Описание и обхват на дейностите
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Какви въпроси и оборудване се поемат от този отдел..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

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
              disabled={submitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold"
            >
              {submitting ? 'Запазване...' : 'Запази'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Delete Confirmation */}
      <ModuleConfirmDialog
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) await onDeleteDepartment(deleteTargetId);
        }}
        title="Изтриване на отдел"
        confirmLabel="Изтрий отдела"
        tone="danger"
        description="Сигурни ли сте, че искате да изтриете това направление? Ако в него има свързани задачи, системата няма да позволи изтриването преди те да бъдат преместени."
      />
    </div>
  );
}

