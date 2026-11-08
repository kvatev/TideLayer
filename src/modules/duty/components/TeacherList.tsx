import { useState, type DragEvent } from 'react';
import {
  CalendarOff,
  Check,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Shuffle,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { WEEKDAY_TO_BG, type SchoolStage, type Teacher, type UnavailabilityEntry, type Weekday } from '../types';
import { TeacherBadge } from './TeacherBadge';
import { TeacherUnavailabilityDialog } from './TeacherUnavailabilityDialog';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';

interface TeacherListProps {
  teachers: Teacher[];
  counts: Record<string, number>;
  canEdit: boolean;
  onAddTeacher: (name: string) => Promise<boolean>;
  onRemoveTeacher: (id: string) => Promise<void>;
  onRenameTeacher: (id: string, newName: string) => Promise<boolean>;
  onAutoArrange: () => Promise<void>;
  onClearSchedule: () => Promise<boolean>;
  currentStage: SchoolStage;
  getTeacherUnavailabilities: (teacherId: string) => UnavailabilityEntry[];
  onAddWeekdayUnavail: (teacherId: string, wd: Weekday, note?: string) => Promise<boolean>;
  onAddDateUnavail: (teacherId: string, iso: string, note?: string) => Promise<boolean>;
  onRemoveUnavail: (id: string) => Promise<boolean>;
  onNotify?: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

export function TeacherList({
  teachers,
  counts,
  canEdit,
  onAddTeacher,
  onRemoveTeacher,
  onRenameTeacher,
  onAutoArrange,
  onClearSchedule,
  currentStage,
  getTeacherUnavailabilities,
  onAddWeekdayUnavail,
  onAddDateUnavail,
  onRemoveUnavail,
  onNotify,
}: TeacherListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [unavailTeacher, setUnavailTeacher] = useState<Teacher | null>(null);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const sortedTeachers = [...teachers].sort((a, b) => a.name.localeCompare(b.name, 'bg'));
  const filteredTeachers = sortedTeachers.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTeacherName.trim();
    if (!clean) return;
    const ok = await onAddTeacher(clean);
    if (ok) {
      setNewTeacherName('');
      setAddModalOpen(false);
      onNotify?.('success', `Учителят „${clean}“ е добавен.`);
    } else {
      onNotify?.('error', 'Учител с това име вече съществува в този етап.');
    }
  };

  const confirmRename = async (teacherId: string) => {
    const clean = editingName.trim();
    const orig = teachers.find((t) => t.id === teacherId);
    if (!clean || (orig && clean === orig.name)) {
      setEditingTeacherId(null);
      setEditingName('');
      return;
    }
    const ok = await onRenameTeacher(teacherId, clean);
    if (ok) {
      onNotify?.('success', `Преименуван на „${clean}“.`);
    } else {
      onNotify?.('error', 'Вече съществува учител с това име.');
    }
    setEditingTeacherId(null);
    setEditingName('');
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, teacher: Teacher) => {
    if (!canEdit) return;
    e.dataTransfer.setData('teacherId', teacher.id);
    e.dataTransfer.setData('source', 'list');
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:max-h-[calc(100vh-200px)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 bg-navy-900 text-white flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-4 h-4 text-blue-300 shrink-0" />
          <h2 className="text-sm font-heading font-bold text-white truncate">
            {currentStage === 'primary' ? 'Учители I – IV клас' : 'Учители V – XII клас'}
          </h2>
        </div>
        <span className="text-xs font-mono bg-navy-800 px-2 py-0.5 rounded-md text-slate-200 shrink-0">
          {filteredTeachers.length}/{teachers.length}
        </span>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-200 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Търси учител..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Scrollable Teachers */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2 max-h-[380px] lg:max-h-none">
        {filteredTeachers.map((teacher) => {
          const teacherUnavail = getTeacherUnavailabilities(teacher.id);
          const weekdaysShort = teacherUnavail
            .filter((e) => e.weekday && WEEKDAY_TO_BG[e.weekday])
            .map((e) => WEEKDAY_TO_BG[e.weekday!].slice(0, 2))
            .join(', ');
          const extraDatesCount = teacherUnavail.filter((e) => e.specific_date).length;

          return (
            <div key={teacher.id} className="flex items-start gap-1.5">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setUnavailTeacher(teacher)}
                  className={cn(
                    'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors mt-0.5',
                    teacherUnavail.length > 0
                      ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-600 hover:text-white'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-blue-600 hover:border-blue-300'
                  )}
                  title={
                    teacherUnavail.length > 0
                      ? `Зададени ${teacherUnavail.length} ограничения за достъпност`
                      : 'Задай дни на недостъпност'
                  }
                >
                  <CalendarOff className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="flex-1 min-w-0">
                {canEdit && editingTeacherId === teacher.id ? (
                  <div className="flex items-center gap-1 bg-white border border-blue-400 rounded-lg px-2 py-1">
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void confirmRename(teacher.id);
                        if (e.key === 'Escape') {
                          setEditingTeacherId(null);
                          setEditingName('');
                        }
                      }}
                      className="flex-1 min-w-0 text-xs sm:text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => void confirmRename(teacher.id)}
                      className="text-emerald-600 hover:text-emerald-700 p-0.5"
                      title="Запази"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTeacherId(null);
                        setEditingName('');
                      }}
                      className="text-slate-400 hover:text-red-600 p-0.5"
                      title="Отказ"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeacherId(teacher.id);
                          setEditingName(teacher.name);
                        }}
                        className="text-slate-400 hover:text-blue-600 p-0.5 shrink-0"
                        title="Преименувай учителя"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <TeacherBadge
                        id={teacher.id}
                        name={teacher.name}
                        count={counts[teacher.id] || 0}
                        canEdit={canEdit}
                        draggable={canEdit}
                        onDragStart={canEdit ? (e) => handleDragStart(e, teacher) : undefined}
                        showRemove={canEdit}
                        onRemove={() => void onRemoveTeacher(teacher.id)}
                        onNotify={onNotify}
                      />
                    </div>
                  </div>
                )}

                {teacherUnavail.length > 0 && (
                  <p className="text-[10px] text-red-600 mt-0.5 ml-1 flex items-center gap-1 mb-0">
                    <CalendarOff className="w-2.5 h-2.5 shrink-0" />
                    <span>
                      Не може: {weekdaysShort}
                      {extraDatesCount > 0 ? ` +${extraDatesCount} дата(и)` : ''}
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {filteredTeachers.length === 0 && (
          <p className="text-xs sm:text-sm text-slate-500 text-center py-6 mb-0">
            Няма намерени учители.
          </p>
        )}
      </div>

      {/* Bottom Actions */}
      {canEdit && (
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2 shrink-0">
          <button
            type="button"
            onClick={() => void onAutoArrange()}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Shuffle className="w-4 h-4" />
            <span>Автоматично разпределение</span>
          </button>

          <button
            type="button"
            onClick={() => setClearModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs sm:text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Изчисти графика</span>
          </button>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Добави учител</span>
          </button>
        </div>
      )}

      {/* Add Teacher Modal */}
      <ModuleModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={`Добави учител (${currentStage === 'primary' ? 'I–IV клас' : 'V–XII клас'})`}
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="duty-new-teacher"
              className="block text-xs font-semibold text-navy-900 mb-1"
            >
              Име и фамилия *
            </label>
            <input
              id="duty-new-teacher"
              autoFocus
              type="text"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              placeholder="напр. Мария Иванова"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
            >
              Отказ
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold"
            >
              Добави
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Clear Schedule Confirm */}
      <ModuleConfirmDialog
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={async () => {
          await onClearSchedule();
        }}
        title={`Изчистване на графика (${
          currentStage === 'primary' ? 'I – IV клас' : 'V – XII клас'
        })`}
        confirmLabel="Изчисти графика"
        tone="warning"
        description={
          <>
            Сигурни ли сте, че искате да изчистите всички дежурства за{' '}
            <strong>
              {currentStage === 'primary'
                ? 'начален етап (I – IV клас)'
                : 'прогимназиален/гимназиален етап (V – XII клас)'}
            </strong>
            ?
            <br />
            <br />
            Списъкът с учители ще се запази непокътнат.
          </>
        }
      />

      {/* Unavailability Dialog */}
      {unavailTeacher && (
        <TeacherUnavailabilityDialog
          open={!!unavailTeacher}
          onClose={() => setUnavailTeacher(null)}
          teacherId={unavailTeacher.id}
          teacherName={unavailTeacher.name}
          entries={getTeacherUnavailabilities(unavailTeacher.id)}
          onAddWeekday={onAddWeekdayUnavail}
          onAddDate={onAddDateUnavail}
          onRemove={onRemoveUnavail}
          onNotify={onNotify}
        />
      )}
    </div>
  );
}

