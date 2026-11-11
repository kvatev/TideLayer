import { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Crown,
  Edit2,
  FolderOpen,
  History,
  Plus,
  Shield,
  Star,
  Trash2,
  User,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import type { DepartmentMembership, SchoolTicket, TicketDepartment } from '../types';
import type { SchoolUserRecord, SchoolUserRole } from '../../../lib/supabase';
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
  onMoveMember?: (
    membershipId: string,
    newDepartmentId: string,
    isLead?: boolean
  ) => Promise<unknown>;
  onDeactivateEmployee?: (userId: string, reason?: string) => Promise<unknown>;
  onReactivateEmployee?: (userId: string) => Promise<unknown>;
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
  onMoveMember,
  onDeactivateEmployee,
  onReactivateEmployee,
}: DepartmentsAdminViewProps) {
  const [activeTab, setActiveTab] = useState<'departments' | 'users'>('departments');
  const [historyMode, setHistoryMode] = useState<'active' | 'all'>('active');

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

  // Move Member Modal State
  const [movingMembership, setMovingMembership] = useState<DepartmentMembership | null>(null);
  const [moveTargetDeptId, setMoveTargetDeptId] = useState('');
  const [moveIsLead, setMoveIsLead] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Deactivate User Modal State
  const [userToDeactivate, setUserToDeactivate] = useState<SchoolUserRecord | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);

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

  const handleMoveMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingMembership || !moveTargetDeptId || !onMoveMember) return;
    setIsMoving(true);
    try {
      await onMoveMember(movingMembership.id, moveTargetDeptId, moveIsLead);
      setMovingMembership(null);
      setMoveTargetDeptId('');
    } finally {
      setIsMoving(false);
    }
  };

  const handleDeactivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToDeactivate || !onDeactivateEmployee) return;
    setIsDeactivating(true);
    try {
      await onDeactivateEmployee(userToDeactivate.id, deactivationReason.trim() || undefined);
      setUserToDeactivate(null);
      setDeactivationReason('');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleReactivateClick = async (user: SchoolUserRecord) => {
    if (!onReactivateEmployee) return;
    await onReactivateEmployee(user.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1">
            Направления, отдели и персонал
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Организационна структура, зачисляване на служители и хронологична история на членството
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'departments' && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ново направление</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Tab Switcher: Departments vs Staff */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('departments')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'departments'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-navy-900'
            )}
          >
            <Building2 className="w-4 h-4" />
            <span>Направления и състав ({departments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-navy-900'
            )}
          >
            <Users className="w-4 h-4" />
            <span>Училищен персонал ({schoolUsers.length})</span>
          </button>
        </div>

        {activeTab === 'departments' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setHistoryMode('active')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                historyMode === 'active'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              Активен състав
            </button>
            <button
              type="button"
              onClick={() => setHistoryMode('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1',
                historyMode === 'all'
                  ? 'bg-white text-navy-900 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              <History className="w-3 h-3" />
              <span>Пълна история</span>
            </button>
          </div>
        )}
      </div>

      {/* View 1: Departments Grid */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const linkedTickets = tickets.filter((t) => t.department_id === dept.id);
            const activeTickets = linkedTickets.filter(
              (t) => t.status !== 'completed' && t.status !== 'closed'
            );
            const colorMeta = COLOR_OPTIONS.find((c) => c.id === dept.color) || COLOR_OPTIONS[0];

            // Members for this dept
            const allDeptMembers = departmentMemberships.filter((m) => m.department_id === dept.id);
            const members =
              historyMode === 'active'
                ? allDeptMembers.filter((m) => m.is_active !== false)
                : allDeptMembers;

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
                        <span>
                          {historyMode === 'active' ? 'Зачислени служители' : 'История на състава'} (
                          {members.length})
                        </span>
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
                      {members.map((m) => {
                        const isHistorical = m.is_active === false;

                        return (
                          <div
                            key={m.id}
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-all',
                              isHistorical
                                ? 'bg-slate-100 text-slate-500 border-slate-300 opacity-80'
                                : m.is_lead
                                  ? 'bg-amber-50 text-amber-900 border-amber-200 font-bold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
                            )}
                          >
                            {m.is_lead && !isHistorical && (
                              <Star className="w-3 h-3 text-amber-600 fill-amber-500 shrink-0" />
                            )}
                            <span>{m.user_name || 'Служител'}</span>

                            {isHistorical ? (
                              <span className="text-[10px] text-slate-400 font-mono ml-1">
                                (бивш: {m.started_at ? new Date(m.started_at).toLocaleDateString('bg-BG') : '—'} - {m.ended_at ? new Date(m.ended_at).toLocaleDateString('bg-BG') : 'сега'})
                              </span>
                            ) : (
                              <>
                                {m.started_at && (
                                  <span className="text-[10px] text-slate-400 font-mono ml-0.5" title={`Зачислен на ${new Date(m.started_at).toLocaleString('bg-BG')}`}>
                                    (от {new Date(m.started_at).toLocaleDateString('bg-BG')})
                                  </span>
                                )}

                                {m.user_is_active === false && (
                                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-rose-100 text-rose-700 ml-0.5">
                                    Деактивиран
                                  </span>
                                )}

                                {onMoveMember && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMovingMembership(m);
                                      setMoveTargetDeptId('');
                                      setMoveIsLead(Boolean(m.is_lead));
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-blue-600 rounded ml-0.5 cursor-pointer"
                                    title="Премести в друго направление"
                                  >
                                    <ArrowRightLeft className="w-2.5 h-2.5" />
                                  </button>
                                )}

                                {onToggleLead && (
                                  <button
                                    type="button"
                                    onClick={() => void onToggleLead(m.id, !m.is_lead)}
                                    className="p-0.5 text-slate-400 hover:text-amber-600 rounded ml-0.5 cursor-pointer"
                                    title={
                                      m.is_lead
                                        ? 'Премахни статут на отговорник'
                                        : 'Задай като отговорник'
                                    }
                                  >
                                    <Crown className="w-2.5 h-2.5" />
                                  </button>
                                )}

                                {onRemoveMember && (
                                  <button
                                    type="button"
                                    onClick={() => void onRemoveMember(m.id)}
                                    className="p-0.5 text-slate-400 hover:text-rose-600 rounded ml-0.5 cursor-pointer"
                                    title="Отчисли от направлението (запазва историческия запис)"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}

                      {members.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">
                          {historyMode === 'active'
                            ? 'Все още няма зачислени конкретни служители.'
                            : 'Няма записана история за това направление.'}
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
      )}

      {/* View 2: Staff Management Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-bold text-navy-900 mb-0.5">
                Регистър на училищния персонал
              </h3>
              <p className="text-xs text-slate-500 mb-0">
                Управление на активността, деактивация при напускане и непрекъсната отчетност
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {schoolUsers.length} служители
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="py-3 px-4">Служител</th>
                  <th className="py-3 px-4">Длъжност / Роля</th>
                  <th className="py-3 px-4">Направления</th>
                  <th className="py-3 px-4">Статус на акаунта</th>
                  <th className="py-3 px-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schoolUsers.map((u) => {
                  const isActive = u.is_active !== false;
                  const userDepts = departmentMemberships
                    .filter((m) => m.user_id === u.id && m.is_active !== false)
                    .map((m) => m.department_name)
                    .filter(Boolean);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                              isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                            )}
                          >
                            {u.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-navy-900">{u.full_name}</div>
                            {u.email && (
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700">
                          {ROLE_LABELS[u.role as SchoolUserRole] || u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {userDepts.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {userDepts.map((dName, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold"
                              >
                                {dName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Няма зачислени</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Активен профил</span>
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <UserX className="w-3.5 h-3.5 text-rose-600" />
                              <span>Деактивиран</span>
                            </span>
                            {u.deactivation_reason && (
                              <div className="text-[11px] text-slate-500 italic max-w-xs truncate">
                                „{u.deactivation_reason}“
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isActive ? (
                          onDeactivateEmployee && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToDeactivate(u);
                                setDeactivationReason('');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Деактивирай акаунт
                            </button>
                          )
                        ) : (
                          onReactivateEmployee && (
                            <button
                              type="button"
                              onClick={() => void handleReactivateClick(u)}
                              className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Активирай отново
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* Move Member Modal */}
      {movingMembership && (
        <ModuleModal
          isOpen={!!movingMembership}
          onClose={() => setMovingMembership(null)}
          title={`Преместване на ${movingMembership.user_name || 'служител'} в друго направление`}
          size="md"
        >
          <form onSubmit={handleMoveMemberSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
              <strong>Хронологична приемственост:</strong> Членството в досегашното направление ще
              бъде приключено с днешна дата и запазено в историята, а за новото направление ще се
              създаде нов активен период.
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Целево направление <span className="text-rose-500">*</span>
              </label>
              <select
                value={moveTargetDeptId}
                required
                onChange={(e) => setMoveTargetDeptId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Изберете ново направление --</option>
                {departments
                  .filter((d) => d.id !== movingMembership.department_id)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={moveIsLead}
                onChange={(e) => setMoveIsLead(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-bold text-navy-900">
                Задай като Ръководител (Lead) в новото направление
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMovingMembership(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={isMoving || !moveTargetDeptId}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {isMoving ? 'Преместване...' : 'Премести служителя'}
              </button>
            </div>
          </form>
        </ModuleModal>
      )}

      {/* Deactivate User Modal */}
      {userToDeactivate && (
        <ModuleModal
          isOpen={!!userToDeactivate}
          onClose={() => setUserToDeactivate(null)}
          title={`Деактивиране на акаунт: ${userToDeactivate.full_name}`}
          size="md"
        >
          <form onSubmit={handleDeactivateSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
              <strong>Внимание:</strong> Служителят вече няма да може да влиза в системата или да му
              бъдат възлагани нови задачи. <strong>Всички негови досегашни задачи, документи,
              коментари и действия остават напълно запазени</strong> в историческия регистър с
              пълното му име.
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Основание / Причина за деактивацията <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="напр. Прекратяване на трудов договор по взаимно съгласие / Преместване в друго училище / Пенсиониране"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDeactivate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={isDeactivating || !deactivationReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {isDeactivating ? 'Деактивиране...' : 'Потвърди деактивацията'}
              </button>
            </div>
          </form>
        </ModuleModal>
      )}
    </div>
  );
}
