import { Backpack, GraduationCap } from 'lucide-react';
import type { SchoolStage } from '../types';
import { cn } from '../../../utils/helpers';

interface StageSelectorProps {
  currentStage: SchoolStage;
  onStageChange: (stage: SchoolStage) => void;
  className?: string;
}

export function StageSelector({
  currentStage,
  onStageChange,
  className,
}: StageSelectorProps) {
  return (
    <div
      className={cn(
        'flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1 w-full sm:w-auto',
        className
      )}
      role="tablist"
      aria-label="Избор на образователен етап"
    >
      <button
        type="button"
        role="tab"
        aria-selected={currentStage === 'secondary'}
        onClick={() => onStageChange('secondary')}
        className={cn(
          'flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none',
          currentStage === 'secondary'
            ? 'bg-white text-navy-900 shadow-xs ring-1 ring-slate-200'
            : 'text-slate-600 hover:text-navy-900 hover:bg-white/60'
        )}
      >
        <GraduationCap
          className={cn(
            'w-4 h-4 shrink-0',
            currentStage === 'secondary' ? 'text-blue-600' : 'text-slate-500'
          )}
        />
        <div className="flex flex-col items-start leading-tight text-left">
          <span className="truncate">Прогимназия / Гимназия</span>
          <span className="text-[10px] font-normal text-slate-500">V – XII клас</span>
        </div>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={currentStage === 'primary'}
        onClick={() => onStageChange('primary')}
        className={cn(
          'flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none',
          currentStage === 'primary'
            ? 'bg-white text-navy-900 shadow-xs ring-1 ring-slate-200'
            : 'text-slate-600 hover:text-navy-900 hover:bg-white/60'
        )}
      >
        <Backpack
          className={cn(
            'w-4 h-4 shrink-0',
            currentStage === 'primary' ? 'text-amber-600' : 'text-slate-500'
          )}
        />
        <div className="flex flex-col items-start leading-tight text-left">
          <span className="truncate">Начален етап</span>
          <span className="text-[10px] font-normal text-slate-500">I – IV клас</span>
        </div>
      </button>
    </div>
  );
}

