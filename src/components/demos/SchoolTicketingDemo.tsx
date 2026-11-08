import { useState } from 'react';
import {
  Euro,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

interface DemoTicket {
  id: string;
  title: string;
  room: string;
  dept: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  creator: string;
  assignee: string;
  messages: { sender: string; text: string; time: string }[];
}

const SAMPLE_TICKETS: DemoTicket[] = [
  {
    id: 'TK-1082',
    title: 'Не реагира тъч сензорът на интерактивен дисплей Clevertouch',
    room: 'STEM Лаборатория 101',
    dept: 'ИТ и STEM Поддръжка',
    priority: 'urgent',
    status: 'in_progress',
    creator: 'Даниела Стоянова (Учител)',
    assignee: 'инж. Г. Димитров',
    messages: [
      { sender: 'Даниела Стоянова', text: 'По време на първия час екранът спря да отчита докосвания. Престартирах го от бутона, но няма резултат.', time: '08:45 ч.' },
      { sender: 'инж. Г. Димитров', text: 'Прието. Ще мина в голямото междучасие да проверя USB кабела към OPS компютъра и драйверите.', time: '09:05 ч.' },
    ],
  },
  {
    id: 'TK-1083',
    title: 'Счупен патрон и блокирана брава на вратата',
    room: 'Кабинет 204 (Български език)',
    dept: 'Домакин и Материална база',
    priority: 'high',
    status: 'open',
    creator: 'Мария Георгиева',
    assignee: 'Красимир Тодоров (Домакин)',
    messages: [
      { sender: 'Мария Георгиева', text: 'Ключът превърта на празно и не може да се заключи стаята след часовете.', time: '10:15 ч.' },
    ],
  },
  {
    id: 'TK-1084',
    title: 'Поръчка на тонери и копирна хартия A4 за учителската стая',
    room: 'Копирен център / Корпус А',
    dept: 'Канцелария и Доставки',
    priority: 'medium',
    status: 'in_progress',
    creator: 'Секретар Канцелария',
    assignee: 'Финансов Отдел',
    messages: [
      { sender: 'Канцелария', text: 'Заявени 2 бр. тонер касети Konica Minolta (общо 140.00 €) и 10 кашона хартия (общо 48.00 €).', time: '11:20 ч.' },
      { sender: 'Главен счетоводител', text: 'Одобрено за плащане на обща стойност 188.00 €. Доставката се очаква в четвъртък.', time: '11:45 ч.' },
    ],
  },
  {
    id: 'TK-1081',
    title: 'Прекъсване на безжичната WiFi мрежа по време на онлайн тест',
    room: 'Кабинет 302',
    dept: 'ИТ и Мрежова инфраструктура',
    priority: 'high',
    status: 'resolved',
    creator: 'Петър Василев (МАТ)',
    assignee: 'TideLayer IT Support',
    messages: [
      { sender: 'Петър Василев', text: 'Учениците бяха изхвърлени от теста в 13:10 ч.', time: 'Вчера 13:15 ч.' },
      { sender: 'TideLayer IT', text: 'Рестартиран е PoE суичът на 3-ти етаж и е подменен пач кабелът на точката за достъп. Сигналът е стабилен.', time: 'Вчера 14:00 ч.' },
    ],
  },
];

const ORDERS_BUDGET = [
  { item: 'Тонер касети Konica Minolta bizhub', qty: 2, totalEur: 140.0, status: 'Одобрена' },
  { item: 'Копирна хартия A4 Double A (10 кашона)', qty: 10, totalEur: 48.0, status: 'Доставена' },
  { item: 'Кабелни организатори и пач кабели Cat6', qty: 15, totalEur: 35.5, status: 'Поръчана' },
  { item: 'Маркери за бяла дъска и гъби (к-т)', qty: 6, totalEur: 22.0, status: 'Доставена' },
];

export function SchoolTicketingDemo() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'budget'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<DemoTicket>(SAMPLE_TICKETS[0]);
  const [newComment, setNewComment] = useState('');
  const [ticketList, setTicketList] = useState(SAMPLE_TICKETS);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const updated = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        { sender: 'Вие (Директор / Демо)', text: newComment.trim(), time: 'Току-що' },
      ],
    };

    setSelectedTicket(updated);
    setTicketList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setNewComment('');
  };

  return (
    <div className="rounded-3xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
      {/* Title Bar */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-slate-400 font-medium hidden sm:inline">
            tidelayer.com/school/demo-school/tickets
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Интерактивна Демонстрация</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
              activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            )}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Заявки и Чат на живо</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
              activeTab === 'budget' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            )}
          >
            <Euro className="w-3.5 h-3.5 text-emerald-400" />
            <span>Бюджет и Поръчки (€)</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Кликнете върху заявка за преглед на коментарите
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 bg-slate-900/60 min-h-[380px]">
        {activeTab === 'tickets' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Tickets Left Column */}
            <div className="lg:col-span-5 space-y-2.5">
              {ticketList.map((t) => {
                const isSelected = selectedTicket.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={cn(
                      'p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2',
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-blue-400">{t.id}</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase',
                          t.priority === 'urgent' && 'bg-red-500/20 text-red-400 border border-red-500/30',
                          t.priority === 'high' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                          t.priority === 'medium' && 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        )}
                      >
                        {t.priority === 'urgent' ? 'Спешна' : t.priority === 'high' ? 'Висок' : 'Нормален'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
                      {t.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>📍 {t.room}</span>
                      <span className="text-slate-300 font-medium">💬 {t.messages.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ticket Details & Comments Right Column */}
            <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{selectedTicket.dept}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">
                      {selectedTicket.status === 'resolved' ? 'Решена' : 'В процес на работа'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    {selectedTicket.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex flex-wrap gap-3 pt-1">
                    <span>Подадена от: <strong className="text-slate-200">{selectedTicket.creator}</strong></span>
                    <span>Отговорник: <strong className="text-blue-400">{selectedTicket.assignee}</strong></span>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {selectedTicket.messages.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-blue-300">{m.sender}</span>
                        <span className="text-slate-500">{m.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-0 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Напишете отговор или инструкция към екипа..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
                >
                  Изпрати
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* TAB 2: BUDGET & ORDERS VIEW IN EUR € */
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-semibold uppercase">Одобрен бюджет (€)</div>
                <div className="text-2xl font-bold text-emerald-400">2,500.00 €</div>
                <div className="text-[11px] text-slate-500">за текущия учебен срок</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-semibold uppercase">Изразходвани до момента</div>
                <div className="text-2xl font-bold text-blue-400">245.50 €</div>
                <div className="text-[11px] text-slate-500">по 4 заявки за консумативи</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-semibold uppercase">Оставащ свободен лимит</div>
                <div className="text-2xl font-bold text-slate-100">2,254.50 €</div>
                <div className="text-[11px] text-emerald-400 font-semibold">90.2% от бюджета</div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Материал / Артикул</th>
                    <th className="p-3 text-center">Количество</th>
                    <th className="p-3 text-right">Стойност в Евро (€)</th>
                    <th className="p-3 text-right">Статус на поръчката</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {ORDERS_BUDGET.map((o, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-slate-100">{o.item}</td>
                      <td className="p-3 text-center font-bold">{o.qty} бр.</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{o.totalEur.toFixed(2)} €</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-semibold text-[11px]">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
