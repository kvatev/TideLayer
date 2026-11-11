import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  Trash2,
  X,
  AlertCircle,
  FileText,
  ClipboardList,
} from 'lucide-react';
import type { InAppNotification } from '../types';
import { cn } from '../../../utils/helpers';

interface InAppNotificationsPopoverProps {
  notifications: InAppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDeleteNotification: (id: string) => Promise<void>;
  onNavigateToTask?: (taskId: string) => void;
  onNavigateToDocument?: (docId: string) => void;
}

export function InAppNotificationsPopover({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigateToTask,
  onNavigateToDocument,
}: InAppNotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notif: InAppNotification) => {
    if (!notif.is_read) {
      await onMarkAsRead(notif.id);
    }
    if (notif.task_id && onNavigateToTask) {
      onNavigateToTask(notif.task_id);
      setIsOpen(false);
    } else if (notif.document_id && onNavigateToDocument) {
      onNavigateToDocument(notif.document_id);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Известия"
        className={cn(
          'relative p-2 rounded-xl border transition-colors flex items-center justify-center cursor-pointer',
          unreadCount > 0
            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-slate-200 text-slate-600 hover:text-navy-900 hover:bg-slate-50'
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-bold text-navy-900">Известия</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
                  {unreadCount} нови
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void onMarkAllAsRead()}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
                  title="Маркирай всички като прочетени"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Маркирай всички</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium mb-0">Нямате нови известия</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => void handleNotificationClick(notif)}
                  className={cn(
                    'p-3.5 transition-colors cursor-pointer flex items-start gap-3 group relative',
                    notif.is_read
                      ? 'bg-white hover:bg-slate-50 opacity-80'
                      : 'bg-blue-50/40 hover:bg-blue-50/70'
                  )}
                >
                  {/* Status dot / Icon */}
                  <div className="shrink-0 mt-0.5">
                    {notif.type === 'deadline_approaching' || notif.type === 'task_overdue' ? (
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    ) : notif.type === 'task_returned' ? (
                      <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    ) : notif.type === 'document_assigned' || notif.type === 'document_registered' ? (
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <ClipboardList className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p
                        className={cn(
                          'text-xs truncate mb-0',
                          notif.is_read ? 'font-medium text-slate-700' : 'font-bold text-navy-900'
                        )}
                      >
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-1">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{new Date(notif.created_at).toLocaleString('bg-BG')}</span>
                      {(notif.task_id || notif.document_id) && (
                        <span className="text-blue-600 font-medium flex items-center gap-0.5 group-hover:underline">
                          <span>Преглед</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void onDeleteNotification(notif.id);
                    }}
                    className="absolute right-2.5 top-3 p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Изтрий известието"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
