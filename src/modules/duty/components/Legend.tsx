import { Info, Printer } from 'lucide-react';
import { cn } from '../../../utils/helpers';

interface LegendProps {
  onExportPDF?: () => void;
  className?: string;
}

export function Legend({ onExportPDF, className }: LegendProps) {
  return (
    <div
      className={cn(
        'rounded-xl px-3 py-2.5 bg-slate-50 border border-slate-200 text-xs sm:text-sm',
        className
      )}
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="flex items-center gap-1.5 text-slate-600 shrink-0">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-navy-900">Брой дежурства:</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs font-medium lg:flex-1 lg:justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 inline-block" />
            <span className="text-slate-600">0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600 inline-block" />
            <span className="text-slate-700">1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-500 border border-blue-600 inline-block" />
            <span className="text-slate-700">2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-orange-500 border border-orange-600 inline-block" />
            <span className="text-slate-700">3</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-red-500 border border-red-600 inline-block" />
            <span className="text-slate-700">4+</span>
          </div>
          <div
            className="flex items-center gap-1.5 pl-2 border-l border-slate-300"
            title="Учителят има 2 или повече дежурства в един и същи ден"
          >
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 border border-red-700 text-white text-[11px] font-semibold leading-none shadow-2xs">
              <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-white text-red-600 text-[9px] font-black leading-none">
                ✕
              </span>
              <span>2+ в деня</span>
            </div>
          </div>
        </div>

        {onExportPDF && (
          <button
            type="button"
            onClick={onExportPDF}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-400 text-navy-900 text-xs font-semibold transition-colors w-full lg:w-auto lg:shrink-0 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Печат / PDF</span>
          </button>
        )}
      </div>
    </div>
  );
}

