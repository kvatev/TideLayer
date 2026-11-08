import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { DutyBroadcast } from '../types';
import { cn } from '../../../utils/helpers';

interface BroadcastBannerProps {
  broadcasts: DutyBroadcast[];
  dismissedIds: string[];
  onDismiss: (id: string) => void;
}

const PRIORITY_STYLES: Record<
  DutyBroadcast['priority'],
  { bg: string; border: string; text: string; heading: string }
> = {
  urgent: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    heading: '🚨 СПЕШНО СЪОБЩЕНИЕ',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    heading: '⚠️ ВАЖНО СЪОБЩЕНИЕ',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    heading: '📢 СЪОБЩЕНИЕ',
  },
};

export function BroadcastBanner({
  broadcasts,
  dismissedIds,
  onDismiss,
}: BroadcastBannerProps) {
  const visible = broadcasts.filter((b) => !dismissedIds.includes(b.id));
  if (visible.length === 0) return null;

  const order: Record<DutyBroadcast['priority'], number> = {
    urgent: 0,
    warning: 1,
    info: 2,
  };
  const sorted = [...visible].sort((a, b) => order[a.priority] - order[b.priority]);

  return (
    <div className="space-y-2.5">
      {sorted.map((b) => {
        const st = PRIORITY_STYLES[b.priority] || PRIORITY_STYLES.info;
        const IconComp =
          b.priority === 'urgent'
            ? AlertCircle
            : b.priority === 'warning'
              ? AlertTriangle
              : Info;

        return (
          <div
            key={b.id}
            className={cn(
              'rounded-xl px-4 py-3.5 border flex items-start gap-3 shadow-2xs',
              st.bg,
              st.border
            )}
          >
            <IconComp className={cn('w-5 h-5 mt-0.5 shrink-0', st.text)} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={cn('text-xs font-bold uppercase tracking-wider', st.text)}>
                  {b.title ? `${st.heading}: ${b.title}` : st.heading}
                </span>
                {b.created_at && (
                  <span className="text-[11px] text-slate-500">
                    •{' '}
                    {new Date(b.created_at).toLocaleDateString('bg-BG', {
                      day: '2-digit',
                      month: '2-digit',
                    })}{' '}
                    {new Date(b.created_at).toLocaleTimeString('bg-BG', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-navy-900 font-medium leading-relaxed whitespace-pre-wrap mb-0">
                {b.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(b.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-navy-900 hover:bg-white/60 transition-colors shrink-0"
              title="Скрий съобщението"
              aria-label="Скрий съобщението"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

