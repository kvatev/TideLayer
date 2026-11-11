import { useState, useMemo } from 'react';
import {
  Building2,
  Crown,
  Edit2,
  FolderOpen,
  Plus,
  Shield,
  Star,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import type { DepartmentMembership, SchoolTicket, TicketDepartment } from '../types';
import type { SchoolUserRecord } from '../../../lib/supabase';
import { ROLE_LABELS } from '../../../lib/supabase';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface DepartmentsAdminViewProps {
  departments: TicketDepartment[];
  tickets: SchoolTicket[];
  schoolUsers?: SchoolUserRecord[];
  departmentMemberships?: DepartmentMembership[];
  onCreateDepartment: (
    name: string,
    description?: string,
    color?: string,
    manager_name?: string
  ) => Promise<void>;
  onUpdateDepartment: (
    id: string,
    name: string,
    description?: string,
    color?: string,
    manager_name?: string
  ) => Promise<void>;
  onDeleteDepartment: (id: string) => Promise<boolean>;
  onAddMember?: (departmentId: string, userId: string, isLead?: boolean) => Promise<void>;
  onRemoveMember?: (membershipId: string) => Promise<void>;
  onToggleLead?: (membershipId: string, isLead: boolean) => Promise<void>;
}

const COLOR_OPTIONS: { id: string; label: string; badge: string; bg: string; text: string }[] = [
  {
    id: 'blue',
    label: 'Синьо',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    bg: 'bg-blue-50 text-blue-600',
    text: 'text-blue-600',
  },
  {
    id: 'emerald',
    label: 'Зелено',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bg: 'bg-emerald-50 text-emerald-600',
    text: 'text-emerald-600',
  },
  {
    id: 'purple',
    label: 'Лилаво',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    bg: 'bg-purple-50 text-purple-600',
    text: 'text-purple-600',
  },
  {
    id: 'amber',
    label: 'Оранжево',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    bg: 'bg-amber-50 text-amber-600',
    text: 'text-amber-600',
  },
  {
    id: 'rose',
    label: 'Червено',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    bg: 'bg-rose-50 text-rose-600',
    text: 'text-rose-600',
  },
  {
    id: 'slate',
    label: 'Сиво',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    bg: 'bg-slate-50 text-slate-600',
    text: 'text-slate-600',
  },
];

export function DepartmentsAdminView({
  departments,
  tickets,
  schoolUsers = [],
  departmentMemberships = [],
  onCreateDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onAddMember,
  onRemoveMember,
  onToggleLead,
}: DepartmentsAdminViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<TicketDepartment | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');
  const [managerName, setManagerName] = useState('');
  const [saving, setSaving] = useState(false);

  // Add Member Modal State
  const [addMemberDept, setAddMemberDept] = useState<TicketDepartment | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isMemberLead, setIsMemberLead] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  // Delete Confirm
  const [deptToDelete, setDeptToDelete] = useState<TicketDepartment | null>(null);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setColor('blue');
    setManagerName('');
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: TicketDepartment) => {
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

    setSaving(true);
    try {
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
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMemberDept || !selectedUserId || !onAddMember) return;
    setAddingMember(true);
    try {
      await onAddMember(addMemberDept.id, selectedUserId, isMemberLead);
      setAddMemberDept(null);
      setSelectedUserId('');
      setIsMemberLead(false);
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1">
            Направления, отдели и комисии
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Организационна структура, разпределение на отговорностите и достъп по отдели
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ново направление</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => {
          const linkedTickets = tickets.filter((t) => t.department_id === dept.id);
          const activeTickets = linkedTickets.filter((t) => t.status !== 'completed' && t.status !== 'closed');
          const colorMeta = COLOR_OPTIONS.find((c) => c.id === dept.color) || COLOR_OPTIONS[0];

          // Members for this dept
          const members = departmentMemberships.filter((m) => m.department_id === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs',
                      colorMeta.bg
                    )}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Редактирай направление"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeptToDelete(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Изтрий направление"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Name & Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-heading font-bold text-navy-900 leading-snug mb-0">
                    {dept.name}
                  </h3>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-md border',
                      colorMeta.badge
                    )}
                  >
                    {colorMeta.label}
                  </span>
                </div>

                {dept.manager_name && (
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Ръководител: <strong>{dept.manager_name}</strong>
                    </span>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed mb-0">
                  {dept.description || 'Няма въведено описание.'}
                </p>

                {/* Department Members Section */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Зачислени служители ({members.length})</span>
                    </div>

                    {onAddMember && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddMemberDept(dept);
                          setSelectedUserId('');
                          setIsMemberLead(false);
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Зачисли</span>
                      </button>
                    )}
                  </div>

                  {/* Members badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs',
                          m.is_lead
                            ? 'bg-amber-50 text-amber-900 border-amber-200 font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
                        )}
                      >
                        {m.is_lead && (
                          <Star className="w-3 h-3 text-amber-600 fill-amber-500 shrink-0" />
                        )}
                        <span>{m.user_name || 'Служител'}</span>

                        {onToggleLead && (
                          <button
                            type="button"
                            onClick={() => void onToggleLead(m.id, !m.is_lead)}
                            className="p-0.5 text-slate-400 hover:text-amber-600 rounded ml-0.5 cursor-pointer"
                            title={m.is_lead ? 'Премахни статут на отговорник' : 'Задай като отговорник'}
                          >
                            <Crown className="w-2.5 h-2.5" />
                          </button>
                        )}

                        {onRemoveMember && (
                          <button
                            type="button"
                            onClick={() => void onRemoveMember(m.id)}
                            className="p-0.5 text-slate-400 hover:text-rose-600 rounded ml-0.5 cursor-pointer"
                            title="Отчисли от направлението"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    {members.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">
                        Все още няма зачислени конкретни служители.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Общо задачи: <strong>{linkedTickets.length}</strong>
                </span>
                <span className="text-amber-700 font-semibold">
                  Активни: {activeTickets.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {modalOpen && (
        <ModuleModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingDept ? 'Редактиране на направление' : 'Създаване на ново направление'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Наименование на направлението <span className="text-rose-500">*</span>
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
                Главен отговорник (по подразбиране)
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
                      'py-1.5 px-2.5 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer',
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
                placeholder="Опишете дейностите, отговорностите и процесите в това направление..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Запазване...' : editingDept ? 'Обнови направление' : 'Създай'}
              </button>
            </div>
          </form>
        </ModuleModal>
      )}

      {/* Add Member Modal */}
      {addMemberDept && (
        <ModuleModal
          isOpen={!!addMemberDept}
          onClose={() => setAddMemberDept(null)}
          title={`Зачисляване на служител към „${addMemberDept.name}“`}
          size="md"
        >
          <form onSubmit={handleAddMemberSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Изберете служител <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedUserId}
                required
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Изберете от списъка с персонал --</option>
                {schoolUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({ROLE_LABELS[u.role] || u.role})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isMemberLead}
                onChange={(e) => setIsMemberLead(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-bold text-navy-900">
                Задай като Ръководител / Отговорник на направлението (Lead)
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddMemberDept(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={addingMember || !selectedUserId}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {addingMember ? 'Зачисляване...' : 'Зачисли служител'}
              </button>
            </div>
          </form>
        </ModuleModal>
      )}

      {/* Delete Confirmation */}
      {deptToDelete && (
        <ModuleConfirmDialog
          isOpen={!!deptToDelete}
          title="Изтриване на направление"
          message={`Сигурни ли сте, че искате да изтриете направление „${deptToDelete.name}“?`}
          confirmLabel="Изтрий направлението"
          tone="danger"
          onConfirm={async () => {
            const ok = await onDeleteDepartment(deptToDelete.id);
            if (ok) setDeptToDelete(null);
          }}
          onCancel={() => setDeptToDelete(null)}
        />
      )}
    </div>
  );
}
