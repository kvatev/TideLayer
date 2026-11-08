import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import type { SchoolUserRecord } from '../../../lib/supabase';
import type { TicketDepartment, TicketPriority } from '../types';

interface TicketCreateViewProps {
  departments: TicketDepartment[];
  schoolUsers: SchoolUserRecord[];
  isStaffOrAdmin: boolean;
  onBack: () => void;
  onCreate: (input: {
    title: string;
    description: string;
    room_or_location?: string;
    department_id?: string | null;
    priority: TicketPriority;
    assigned_to_user_id?: string | null;
  }) => Promise<unknown>;
}

export function TicketCreateView({
  departments,
  schoolUsers,
  isStaffOrAdmin,
  onBack,
  onCreate,
}: TicketCreateViewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState('');
  const [departmentId, setDepartmentId] = useState<string>(departments[0]?.id || '');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        room_or_location: room.trim() || undefined,
        department_id: departmentId || null,
        priority,
        assigned_to_user_id: assigneeId || null,
      });
      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Назад към заявките</span>
      </button>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1">
            Подаване на нова заявка
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Опишете възникналия технически или битов проблем в сградата на училището
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Кратко заглавие на проблема *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. Няма интернет в STEM кабинет 302"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Отдел / Направление *
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Кабинет / Помещение / Етаж
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="напр. Кабинет 204 (Етаж 2)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Приоритет на проблема
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Нисък — не възпрепятства учебния процес</option>
                <option value="medium">Нормален — стандартен технически сигнал</option>
                <option value="high">Висок — спешна нужда от съдействие в час</option>
                <option value="urgent">🚨 Спешен — авария / пълен блокаж на техника</option>
              </select>
            </div>

            {isStaffOrAdmin && (
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Разпредели към техник / отговорник
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Неразпределен (ще се поеме от дежурен)</option>
                  {schoolUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Подробно описание на проблема *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишете какво точно се случва, кои устройства са засегнати и правени ли са опити за рестартиране..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Изпращане...' : 'Изпрати заявката'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

