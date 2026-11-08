import { useState, type DragEvent } from 'react';
import { Ban, GripVertical, X } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import { CANTEEN_DUTY_PRESETS, SHIFT_PRESETS } from '../types';
import { ModuleModal } from '../../shared/ModulePrimitives';

interface TeacherBadgeProps {
  id: string;
  name: string;
  count: number;
  canEdit?: boolean;
  onRemove?: () => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
  unavailable?: boolean;
  unavailableNote?: string | null;
  hasDayConflict?: boolean;
  dayConflictCount?: number;
  dayName?: string;
  showRemove?: boolean;
  size?: 'xs' | 'sm' | 'md';
  shiftNumber?: string | number | null;
  onShiftNumberChange?: (shiftNumber: string | number | null) => void;
  note?: string | null;
  allowNote?: boolean;
  onNoteChange?: (note: string | null) => void;
  onNotify?: (type: 'error' | 'warning' | 'info' | 'success', msg: string) => void;
}

function getCountClasses(count: number): string {
  if (count === 0) return 'bg-slate-100 text-slate-800 border-slate-300';
  if (count === 1) return 'bg-emerald-500 text-white border-emerald-600';
  if (count === 2) return 'bg-blue-600 text-white border-blue-700';
  if (count === 3) return 'bg-orange-500 text-white border-orange-600';
  return 'bg-red-500 text-white border-red-600';
}

export function TeacherBadge({
  id,
  name,
  count,
  canEdit = false,
  onRemove,
  draggable = false,
  onDragStart,
  onDragEnd,
  showRemove = false,
  size = 'md',
  unavailable = false,
  unavailableNote,
  hasDayConflict = false,
  dayConflictCount,
  dayName,
  shiftNumber,
  onShiftNumberChange,
  note,
  allowNote = false,
  onNoteChange,
  onNotify,
}: TeacherBadgeProps) {
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [tempShift, setTempShift] = useState(
    shiftNumber !== null && shiftNumber !== undefined ? String(shiftNumber) : ''
  );

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [tempNote, setTempNote] = useState(note || '');

  const canDrag = draggable && canEdit && !shiftModalOpen && !noteModalOpen;
  const isXs = size === 'xs';
  const canEditNote = allowNote && canEdit && !!onNoteChange;

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    onDragStart?.(e);
  };

  return (
    <>
      <div
        className={cn(
          'inline-flex items-center rounded-lg border font-medium select-none transition-all shadow-2xs',
          isXs ? 'gap-1 px-1.5 py-0.5 text-[11px] leading-tight' : 'gap-1.5 px-2.5 py-1 text-xs',
          getCountClasses(count),
          hasDayConflict &&
            '!bg-red-600 !border-red-700 !text-white ring-1 ring-red-400/60',
          unavailable &&
            !hasDayConflict &&
            '!bg-red-700 !border-red-800 !text-white',
          canDrag && 'hover:shadow-md cursor-grab active:cursor-grabbing'
        )}
        draggable={canDrag}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        data-teacher-id={id}
      >
        {canDrag && !isXs && (
          <GripVertical className="w-3 h-3 opacity-60 shrink-0" />
        )}

        {hasDayConflict && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNotify?.(
                'warning',
                `Внимание: ${name} има ${dayConflictCount || 2} дежурства в ${
                  dayName || 'този ден'
                }!`
              );
            }}
            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white text-red-600 text-[9px] font-black leading-none shrink-0"
            title={`Внимание: ${name} има ${dayConflictCount || 2} дежурства в ${
              dayName || 'този ден'
            }!`}
            aria-label="Предупреждение за съвпадащо дежурство"
          >
            ✕
          </button>
        )}

        {shiftNumber !== undefined &&
          (canEdit && onShiftNumberChange ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTempShift(
                  shiftNumber !== null && shiftNumber !== undefined
                    ? String(shiftNumber)
                    : ''
                );
                setShiftModalOpen(true);
              }}
              className={cn(
                'flex items-center justify-center rounded font-bold px-1 border transition-colors',
                isXs ? 'min-w-[16px] h-4 text-[10px]' : 'min-w-[20px] h-5 text-xs',
                shiftNumber
                  ? 'bg-white text-navy-900 border-white shadow-2xs hover:bg-slate-100'
                  : 'bg-white/25 text-current border-white/40 hover:bg-white/40'
              )}
              title={
                shiftNumber
                  ? `Смяна: ${shiftNumber} (кликнете за промяна)`
                  : 'Задаване на смяна (1, 2 или 1, 2)'
              }
            >
              {shiftNumber || '–'}
            </button>
          ) : (
            <span
              className={cn(
                'flex items-center justify-center rounded font-bold px-1 select-none',
                isXs ? 'min-w-[16px] h-4 text-[10px]' : 'min-w-[20px] h-5 text-xs',
                shiftNumber ? 'bg-white/80 text-navy-900' : 'bg-white/20 text-current opacity-80'
              )}
            >
              {shiftNumber || '–'}
            </span>
          ))}

        <span className={cn('truncate', isXs ? 'max-w-[95px]' : 'max-w-[145px]')}>
          {name}
        </span>

        {canEditNote ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTempNote(note || '');
              setNoteModalOpen(true);
            }}
            className={cn(
              'rounded font-medium shrink-0 border transition-colors',
              note
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-white/25 hover:bg-white/40 text-current border-dashed border-white/50',
              isXs ? 'text-[9px] px-1 py-0' : 'text-[10px] px-1.5 py-0.5'
            )}
            title={note ? `Пост: ${note} (кликнете за редакция)` : 'Задай пост (напр. фоайе)'}
          >
            {note || '+ пост'}
          </button>
        ) : (
          note && (
            <span
              className={cn(
                'font-medium rounded border shrink-0 bg-amber-100 text-amber-900 border-amber-300',
                isXs ? 'text-[9px] px-1 py-0' : 'text-[10px] px-1.5 py-0.5'
              )}
            >
              {note}
            </span>
          )
        )}

        {unavailable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNotify?.(
                'error',
                unavailableNote
                  ? `${name}: Не е свободен (${unavailableNote})`
                  : `${name} не е свободен този ден`
              );
            }}
            className="shrink-0 opacity-90 hover:opacity-100"
            title={unavailableNote || 'Не е свободен този ден'}
            aria-label="Учителят не е свободен"
          >
            <Ban className="w-3 h-3" />
          </button>
        )}

        <span
          className={cn(
            'flex items-center justify-center rounded-full font-bold px-1 shrink-0',
            isXs ? 'min-w-[16px] h-4 text-[10px]' : 'min-w-[20px] h-5 text-[11px]',
            count === 0
              ? 'bg-slate-200 text-slate-700'
              : 'bg-white/25 text-white'
          )}
        >
          {count}
        </span>

        {showRemove && canEdit && onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemove();
            }}
            className="rounded-full p-0.5 hover:bg-black/20 transition-colors shrink-0"
            aria-label={`Премахни ${name}`}
            title={`Премахни ${name}`}
          >
            <X className={isXs ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
          </button>
        )}
      </div>

      {/* Shift Number Modal */}
      {onShiftNumberChange && (
        <ModuleModal
          open={shiftModalOpen}
          onClose={() => setShiftModalOpen(false)}
          title={`Смяна за ${name}`}
          subtitle="Изберете или въведете цифра на смяната (1, 2 или 1, 2)"
          maxWidthClass="max-w-xs"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {SHIFT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    onShiftNumberChange(preset);
                    setShiftModalOpen(false);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                    tempShift.replace(/\s+/g, '') === preset.replace(/\s+/g, '')
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-navy-900 border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={tempShift}
              onChange={(e) => setTempShift(e.target.value)}
              placeholder="1, 2 или 1,2"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  onShiftNumberChange(null);
                  setShiftModalOpen(false);
                }}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Без смяна
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShiftModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Отказ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onShiftNumberChange(tempShift.trim() || null);
                    setShiftModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  Запази
                </button>
              </div>
            </div>
          </div>
        </ModuleModal>
      )}

      {/* Canteen / Post Note Modal */}
      {onNoteChange && (
        <ModuleModal
          open={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          title={`Пост / зона за ${name}`}
          subtitle="Посочете конкретно място (напр. фоайе, столова)"
          maxWidthClass="max-w-xs"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {CANTEEN_DUTY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTempNote(preset)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                    tempNote.toLowerCase() === preset.toLowerCase()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-navy-900 border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="напр. фоайе"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  onNoteChange(null);
                  setNoteModalOpen(false);
                }}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Премахни
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Отказ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNoteChange(tempNote.trim() || null);
                    setNoteModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  Запази
                </button>
              </div>
            </div>
          </div>
        </ModuleModal>
      )}
    </>
  );
}

