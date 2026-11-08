import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useSchoolPortal } from '../../../components/layout/schoolPortalContext';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';

interface SchoolTicket {
  id: string;
  title: string;
  description: string;
  room_or_location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

const PRIORITY_LABELS: Record<SchoolTicket['priority'], { label: string; cls: string }> = {
  low: { label: 'Нисък', cls: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Нормален', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  high: { label: 'Висок', cls: 'bg-amber-50 text-amber-800 border border-amber-200' },
  urgent: { label: 'Спешен', cls: 'bg-red-50 text-red-700 border border-red-200' },
};

const STATUS_LABELS: Record<SchoolTicket['status'], { label: string; cls: string }> = {
  open: { label: 'Нова заявка', cls: 'bg-blue-600 text-white' },
  in_progress: { label: 'В процес', cls: 'bg-amber-500 text-navy-950' },
  resolved: { label: 'Решена', cls: 'bg-emerald-600 text-white' },
  closed: { label: 'Затворена', cls: 'bg-slate-200 text-slate-700' },
};

export function TicketsModulePage() {
  const { bundle } = useSchoolPortal();
  const schoolId = bundle.school.id;
  const storageKey = `tl_tickets_module_${schoolId}`;

  const [tickets, setTickets] = useState<SchoolTicket[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('');
  const [priority, setPriority] = useState<SchoolTicket['priority']>('medium');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setTickets(data as SchoolTicket[]);
        return;
      }

      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          setTickets(JSON.parse(raw));
          return;
        } catch {
          // ignore
        }
      }

      const seed: SchoolTicket[] = [
        {
          id: 'tk-1',
          title: 'Проблем с интерактивен дисплей в кабинет 204',
          description: 'Тъчскрийнът не реагира при калибриране от учителския компютър.',
          room_or_location: 'Кабинет 204 (Етаж 2)',
          priority: 'high',
          status: 'open',
          created_at: new Date().toISOString(),
        },
        {
          id: 'tk-2',
          title: 'Зареждане на тонер за мрежов принтер',
          description: 'Принтерът в учителската стая изписва предупреждение за нисък тонер.',
          room_or_location: 'Учителска стая',
          priority: 'medium',
          status: 'in_progress',
          created_at: new Date().toISOString(),
        },
      ];
      setTickets(seed);
      localStorage.setItem(storageKey, JSON.stringify(seed));
    };

    void loadTickets();
  }, [schoolId, storageKey]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const item: SchoolTicket = {
      id: `tk-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      room_or_location: room.trim() || 'Неуточнен кабинет',
      priority,
      status: 'open',
      created_at: new Date().toISOString(),
    };

    const next = [item, ...tickets];
    setTickets(next);
    localStorage.setItem(storageKey, JSON.stringify(next));

    await supabase.from('tickets').insert({
      school_id: schoolId,
      title: item.title,
      description: item.description,
      room_or_location: item.room_or_location,
      priority: item.priority,
      status: item.status,
    });

    setTitle('');
    setRoom('');
    setDescription('');
    setShowNewForm(false);
  };

  const handleStatusChange = async (id: string, status: SchoolTicket['status']) => {
    const next = tickets.map((t) => (t.id === id ? { ...t, status } : t));
    setTickets(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    await supabase.from('tickets').update({ status }).eq('id', id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Link to={`/school/${bundle.school.slug}`} className="hover:underline">
              Табло на училището
            </Link>
            <span>/</span>
            <span>Система за заявки</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1">
            Система за заявки — {bundle.school.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-0">
            Подаване и проследяване на технически и административни сигнали по кабинети
          </p>
        </div>

        <Button size="sm" onClick={() => setShowNewForm((prev) => !prev)}>
          <Icon name="Plus" size={16} className="mr-1.5" />
          {showNewForm ? 'Затвори формата' : 'Нова заявка'}
        </Button>
      </div>

      {showNewForm && (
        <form
          onSubmit={handleCreateTicket}
          className="bg-white rounded-2xl border border-blue-200 p-5 sm:p-6 space-y-4 shadow-sm"
        >
          <h2 className="text-base sm:text-lg font-heading font-bold text-navy-900">
            Подаване на нова техническа заявка
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Кратко заглавие на проблема *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="напр. Няма интернет в STEM кабинет 302"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Кабинет / Помещение
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Кабинет 302"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SchoolTicket['priority'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Нисък</option>
                <option value="medium">Нормален</option>
                <option value="high">Висок</option>
                <option value="urgent">Спешен</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Описание *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишете какъв е проблемът и кога се проявява..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowNewForm(false)}>
              Отказ
            </Button>
            <Button type="submit" size="sm">
              Изпрати заявката
            </Button>
          </div>
        </form>
      )}

      {/* Tickets List */}
      <div className="space-y-3">
        {tickets.map((tk) => (
          <div
            key={tk.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${STATUS_LABELS[tk.status].cls}`}>
                  {STATUS_LABELS[tk.status].label}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${PRIORITY_LABELS[tk.priority].cls}`}>
                  Приоритет: {PRIORITY_LABELS[tk.priority].label}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  📍 {tk.room_or_location}
                </span>
              </div>
              <h3 className="text-base font-heading font-bold text-navy-900">
                {tk.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-0">
                {tk.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={tk.status}
                onChange={(e) => handleStatusChange(tk.id, e.target.value as SchoolTicket['status'])}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 font-medium text-navy-900 focus:outline-none focus:border-blue-500"
              >
                <option value="open">Нова заявка</option>
                <option value="in_progress">В процес</option>
                <option value="resolved">Решена</option>
                <option value="closed">Затворена</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
