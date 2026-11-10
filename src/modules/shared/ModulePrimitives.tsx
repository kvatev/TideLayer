import { useEffect, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export function ModuleToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-96 pointer-events-none"
    >
      {toasts.map((t) => {
        const tone =
          t.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-700 text-emerald-50'
            : t.type === 'error'
              ? 'bg-red-950/95 border-red-700 text-red-50'
              : t.type === 'warning'
                ? 'bg-amber-950/95 border-amber-700 text-amber-50'
                : 'bg-navy-900/95 border-navy-700 text-white';

        const IconEl =
          t.type === 'success'
            ? CheckCircle2
            : t.type === 'error'
              ? XCircle
              : t.type === 'warning'
                ? AlertTriangle
                : Info;

        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto rounded-xl border px-4 py-3 shadow-xl flex items-start gap-2.5 text-xs sm:text-sm animate-fade-in',
              tone
            )}
          >
            <IconEl className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{t.message}</div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="opacity-70 hover:opacity-100 shrink-0"
              aria-label="Затвори известието"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

interface ModuleModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  maxWidthClass?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: ReactNode;
  footer?: ReactNode;
}

export function ModuleModal({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidthClass,
  size,
  children,
  footer,
}: ModuleModalProps) {
  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(open);

  const effectiveMaxWidthClass =
    maxWidthClass ||
    (size === 'sm'
      ? 'max-w-sm'
      : size === 'md'
      ? 'max-w-lg'
      : size === 'lg'
      ? 'max-w-2xl'
      : size === 'xl'
      ? 'max-w-4xl'
      : size === '2xl'
      ? 'max-w-6xl'
      : 'max-w-lg');

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen, onClose]);

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl w-full max-h-[92dvh] flex flex-col overflow-hidden animate-scale-in',
          effectiveMaxWidthClass
        )}
      >
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-0">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-navy-900 hover:bg-slate-200/70 transition-colors shrink-0"
            aria-label="Затвори"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          {children}
        </div>

        {footer && (
          <div className="px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ModuleConfirmDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'primary';
  confirmVariant?: 'danger' | 'warning' | 'primary';
}

export function ModuleConfirmDialog({
  open,
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  message,
  confirmLabel = 'Потвърди',
  cancelLabel = 'Отказ',
  tone,
  confirmVariant,
}: ModuleConfirmDialogProps) {
  const isDialogOpen = isOpen !== undefined ? isOpen : Boolean(open);
  const handleClose = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const effectiveTone = confirmVariant || tone || 'danger';
  const effectiveDescription = message !== undefined ? message : description;

  const confirmCls =
    effectiveTone === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : effectiveTone === 'warning'
        ? 'bg-amber-600 hover:bg-amber-700 text-white'
        : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <ModuleModal
      open={isDialogOpen}
      onClose={handleClose}
      title={title}
      maxWidthClass="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              handleClose();
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs',
              confirmCls
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm text-slate-700 leading-relaxed">{effectiveDescription}</div>
    </ModuleModal>
  );
}

