import { useRef, useState, type DragEvent } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import {
  CANTEEN_DUTY_PRESETS,
  SHIFT_PRESETS,
  type CellTeacher,
  type Teacher,
  type UnavailabilityEntry,
} from '../types';
import { TeacherBadge } from './TeacherBadge';
import { ModuleModal } from '../../shared/ModulePrimitives';

interface ScheduleCellProps {
  day: string;
  location: string;
  teachers: CellTeacher[];
  counts: Record<string, number>;
  canEdit: boolean;
  onAssign: (
    teacherId: string,
    day: string,
    location: string,
    shiftNumber?: string | number | null,
    note?: string | null
  ) => Promise<boolean>;
  onUnassign: (teacherId: string, day: string, location: string) => Promise<void>;
  onMove: (
    teacherId: string,
    fromDay: string,
    fromLocation: string,
    toDay: string,
    toLocation: string
  ) => Promise<void>;
  onUpdateShiftNumber: (
    teacherId: string,
    day: string,
    location: string,
    shiftNumber: string | number | null
  ) => Promise<void>;
  onUpdateNote: (
    teacherId: string,
    day: string,
    location: string,
    note: string | null
  ) => Promise<void>;
  isShiftLocation?: boolean;
  getTeacherName: (teacherId: string) => string | undefined;
  isTeacherUnavailable: (teacherId: string, day: string) => UnavailabilityEntry | null;
  getTeacherDayCount: (teacherId: string, day: string) => number;
  allTeachers: Teacher[];
  onNotify?: (type: 'error' | 'warning' | 'info' | 'success', msg: string) => void;
}

export function ScheduleCell({
  day,
  location,
  teachers,
  counts,
  canEdit,
  onAssign,
  onUnassign,
  onMove,
  onUpdateShiftNumber,
  onUpdateNote,
  isShiftLocation = false,
  getTeacherName,
  isTeacherUnavailable,
  getTeacherDayCount,
  allTeachers,
  onNotify,
}: ScheduleCellProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchTeacher, setSearchTeacher] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedNote, setSelectedNote] = useState('');
  const isDroppingRef = useRef(false);

  const isNoteLocation =
    location.toLowerCase().includes('стол') ||
    location.toLowerCase().includes('музик') ||
    location.toLowerCase().includes('фоай');

  const notifyIfUnavailable = (teacherId: string) => {
    const u = isTeacherUnavailable(teacherId, day);
    if (u) {
      const name = getTeacherName(teacherId) || 'Учителят';
      onNotify?.(
        'error',
        `${name} не е свободен в ${day}${u.note ? ` (${u.note})` : ''}`
      );
    }
  };

  const notifyIfConflict = (teacherId: string) => {
    const count = getTeacherDayCount(teacherId, day);
    if (count >= 1) {
      const name = getTeacherName(teacherId) || 'Учителят';
      onNotify?.(
        'warning',
        `Внимание: ${name} вече има друго дежурство в ${day}!`
      );
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!canEdit) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (!canEdit) return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!canEdit) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isDroppingRef.current) return;
    isDroppingRef.current = true;

    try {
      const teacherId = e.dataTransfer.getData('teacherId');
      const source = e.dataTransfer.getData('source');
      if (!teacherId) return;

      if (teachers.some((t) => t.id === teacherId)) {
        onNotify?.('error', 'Този учител вече е добавен в тази клетка.');
        return;
      }

      if (source === 'cell') {
        const fromDay = e.dataTransfer.getData('fromDay');
        const fromLocation = e.dataTransfer.getData('fromLocation');
        if (fromDay && fromLocation && (fromDay !== day || fromLocation !== location)) {
          await onMove(teacherId, fromDay, fromLocation, day, location);
          notifyIfUnavailable(teacherId);
          notifyIfConflict(teacherId);
        }
      } else {
        const ok = await onAssign(teacherId, day, location);
        if (ok) {
          notifyIfUnavailable(teacherId);
          notifyIfConflict(teacherId);
        } else {
          onNotify?.('error', 'Този учител вече е добавен в тази клетка.');
        }
      }
    } finally {
      setTimeout(() => {
        isDroppingRef.current = false;
      }, 150);
    }
  };

  const handleBadgeDragStart = (e: DragEvent<HTMLDivElement>, teacher: CellTeacher) => {
    e.dataTransfer.setData('teacherId', teacher.id);
    e.dataTransfer.setData('source', 'cell');
    e.dataTransfer.setData('fromDay', day);
    e.dataTransfer.setData('fromLocation', location);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleQuickAssign = async (teacherId: string) => {
    if (teachers.some((t) => t.id === teacherId)) {
      onNotify?.('error', 'Този учител вече е в тази клетка.');
      return;
    }
    const shiftToAssign =
      isShiftLocation && selectedShift.trim() ? selectedShift.trim() : null;
    const noteToAssign =
      isNoteLocation && selectedNote.trim() ? selectedNote.trim() : null;

    const ok = await onAssign(teacherId, day, location, shiftToAssign, noteToAssign);
    if (ok) {
      notifyIfUnavailable(teacherId);
      notifyIfConflict(teacherId);
      setPickerOpen(false);
      setSearchTeacher('');
      setSelectedNote('');
      setSelectedShift('');
    }
  };

  const availableTeachers = allTeachers
    .filter((t) => !teachers.some((assigned) => assigned.id === t.id))
    .filter((t) => t.name.toLowerCase().includes(searchTeacher.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'bg'));

  return (
    <>
      <div
        className={cn(
          'min-h-[72px] p-1.5 rounded-xl transition-all',
          canEdit &&
            'border border-dashed border-slate-300/90 hover:border-blue-400 bg-slate-50/40',
          isDragOver && canEdit && 'border-blue-600 bg-blue-50 ring-2 ring-blue-300/60'
        )}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={(e) => void handleDrop(e)}
      >
        <div className={cn('flex flex-wrap items-center', teachers.length >= 4 ? 'gap-1' : 'gap-1.5')}>
          {teachers.map((teacher) => {
            const unavail = isTeacherUnavailable(teacher.id, day);
            const dayDutyCount = getTeacherDayCount(teacher.id, day);
            const hasDayConflict = dayDutyCount >= 2;

            return (
              <TeacherBadge
                key={teacher.id}
                id={teacher.id}
                name={teacher.name}
                count={counts[teacher.id] || 0}
                canEdit={canEdit}
                size={teachers.length >= 4 ? 'xs' : 'sm'}
                unavailable={!!unavail}
                unavailableNote={unavail?.note}
                hasDayConflict={hasDayConflict}
                dayConflictCount={dayDutyCount}
                dayName={day}
                draggable={canEdit}
                onDragStart={(e) => handleBadgeDragStart(e, teacher)}
                showRemove={canEdit}
                onRemove={() => void onUnassign(teacher.id, day, location)}
                shiftNumber={isShiftLocation ? teacher.shiftNumber : undefined}
                onShiftNumberChange={
                  isShiftLocation && canEdit
                    ? (sn) => void onUpdateShiftNumber(teacher.id, day, location, sn)
                    : undefined
                }
                note={teacher.note}
                allowNote={isNoteLocation}
                onNoteChange={
                  isNoteLocation && canEdit
                    ? (newNote) => void onUpdateNote(teacher.id, day, location, newNote)
                    : undefined
                }
                onNotify={onNotify}
              />
            );
          })}

          {canEdit && teachers.length > 0 && allTeachers.length > 0 && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-6 h-6 rounded-full border border-slate-300 bg-white hover:border-blue-500 hover:text-blue-600 text-slate-500 flex items-center justify-center transition-colors"
              title="Добави още дежурен в тази клетка"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {teachers.length === 0 &&
            (canEdit ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full py-2 px-2 rounded-lg text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50/70 flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добави дежурен</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic px-1 py-1">
                Няма дежурен
              </span>
            ))}
        </div>
      </div>

      {/* Quick Assign Modal */}
      {canEdit && (
        <ModuleModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title="Добавяне на дежурен учител"
          subtitle={`${day} • ${location}`}
          maxWidthClass="max-w-md"
        >
          <div className="space-y-3">
            {isShiftLocation && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-navy-900">
                  <span>Смяна (по избор):</span>
                  {selectedShift && (
                    <button
                      type="button"
                      onClick={() => setSelectedShift('')}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Изчисти
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SHIFT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setSelectedShift(
                          selectedShift.replace(/\s+/g, '') === preset.replace(/\s+/g, '')
                            ? ''
                            : preset
                        )
                      }
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors',
                        selectedShift.replace(/\s+/g, '') === preset.replace(/\s+/g, '')
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-navy-900 border-slate-300 hover:bg-slate-100'
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  placeholder="Или въведете 1, 2 или 1, 2..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {isNoteLocation && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-navy-900">
                  <span>Разпределение / Пост (по избор):</span>
                  {selectedNote && (
                    <button
                      type="button"
                      onClick={() => setSelectedNote('')}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Изчисти
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CANTEEN_DUTY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setSelectedNote(
                          selectedNote.toLowerCase() === preset.toLowerCase() ? '' : preset
                        )
                      }
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                        selectedNote.toLowerCase() === preset.toLowerCase()
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-navy-900 border-slate-300 hover:bg-slate-100'
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={selectedNote}
                  onChange={(e) => setSelectedNote(e.target.value)}
                  placeholder="Или въведете пост (напр. фоайе)..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
                placeholder="Търси учител по име..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="border border-slate-200 rounded-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
              {availableTeachers.map((t) => {
                const unavail = isTeacherUnavailable(t.id, day);
                const sameDay = getTeacherDayCount(t.id, day);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => void handleQuickAssign(t.id)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-navy-900 truncate">
                        {t.name}
                      </div>
                      {(unavail || sameDay > 0) && (
                        <div className="flex flex-wrap gap-2 mt-0.5 text-[11px]">
                          {unavail && (
                            <span className="text-red-600 font-medium">
                              Не е свободен{unavail.note ? ` (${unavail.note})` : ''}
                            </span>
                          )}
                          {sameDay > 0 && (
                            <span className="text-amber-700 font-medium">
                              Вече има {sameDay} деж. в {day}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
                      {counts[t.id] || 0} деж.
                    </span>
                  </button>
                );
              })}

              {availableTeachers.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  Няма налични учители за добавяне.
                </div>
              )}
            </div>
          </div>
        </ModuleModal>
      )}
    </>
  );
}

