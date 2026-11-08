import { useState } from 'react';
import {
  Calendar,
  Clock,
  Download,
  Euro,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Paperclip,
  Presentation,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

interface DemoDocument {
  id: string;
  name: string;
  size: string;
  type: 'word' | 'excel' | 'pdf' | 'powerpoint';
  uploadedBy: string;
  uploadedAt: string;
  daysRemaining: number;
  taskTitle: string;
  previewSnippet: string;
}

interface DemoTask {
  id: string;
  title: string;
  hierarchy: string;
  creator: string;
  assignee: string;
  dueDate: string;
  daysDiff: number;
  dept: string;
  priority: 'urgent' | 'high' | 'medium';
  status: 'open' | 'in_progress' | 'resolved';
  documents: DemoDocument[];
  messages: { sender: string; role: string; text: string; time: string }[];
}

const SAMPLE_DOCS: DemoDocument[] = [
  {
    id: 'doc-1',
    name: 'Tematichen_Plan_Obrazec_2026_2027.docx',
    size: '142 KB',
    type: 'word',
    uploadedBy: 'инж. Радослав Петров (Директор)',
    uploadedAt: '03.11.2026',
    daysRemaining: 360,
    taskTitle: 'Предаване на годишни тематични разпределения',
    previewSnippet: 'МИНИСТЕРСТВО НА ОБРАЗОВАНИЕТО И НАУКАТА\nУтвърден образец на годишно тематично разпределение за учебната 2026/2027 година.\nВключва задължителни модули, часове за упражнения и междинни контролни.',
  },
  {
    id: 'doc-2',
    name: 'Grafik_Kontrolni_Raboti_I_Srok.xlsx',
    size: '98 KB',
    type: 'excel',
    uploadedBy: 'Мария Иванова (Зам.-директор УД)',
    uploadedAt: '04.11.2026',
    daysRemaining: 361,
    taskTitle: 'Предаване на годишни тематични разпределения',
    previewSnippet: 'ТАБЛИЦА: ГРАФИК ЗА КЛАСТИТЕ И КОНТРОЛНИТЕ РАБОТИ\nКлас | Предмет | Дата на провеждане | Макс. брой точки | Преподавател\n8А | Математика | 18.11.2026 | 50 т. | П. Василев\n9Б | Български език | 24.11.2026 | 60 т. | М. Георгиева',
  },
  {
    id: 'doc-3',
    name: 'Instruktsiya_MON_Razpredelenia.pdf',
    size: '520 KB',
    type: 'pdf',
    uploadedBy: 'инж. Радослав Петров (Директор)',
    uploadedAt: '03.11.2026',
    daysRemaining: 360,
    taskTitle: 'Предаване на годишни тематични разпределения',
    previewSnippet: 'ОФИЦИАЛНО ПИСМО № 14-08/2026 ОТ МИНИСТЕРСТВО НА ОБРАЗОВАНИЕТО\nУказания относно организирането на контролните оценки и срочния контрол.\nИзисква се задължително съгласуване със зам.-директора по учебната дейност.',
  },
  {
    id: 'doc-4',
    name: 'Predstaviane_Pedagogicheski_Savet.pptx',
    size: '1.8 MB',
    type: 'powerpoint',
    uploadedBy: 'инж. Радослав Петров (Директор)',
    uploadedAt: '03.11.2026',
    daysRemaining: 360,
    taskTitle: 'Предаване на годишни тематични разпределения',
    previewSnippet: 'ПРЕЗЕНТАЦИЯ ЗА ПЕДАГОГИЧЕСКИ СЪВЕТ\nСлайд 1: Цели на учебната 2026/2027 г.\nСлайд 2: Срокове за разпределения и планове\nСлайд 3: Мониторинг на резултатите по STEM предмети',
  },
  {
    id: 'doc-5',
    name: 'Protokol_Vhodno_Nivo_Matematika.docx',
    size: '84 KB',
    type: 'word',
    uploadedBy: 'Петър Василев (Учител)',
    uploadedAt: '06.11.2026',
    daysRemaining: 363,
    taskTitle: 'Предаване на протоколи от входни нива',
    previewSnippet: 'ПРОТОКОЛ ЗА РЕЗУЛТАТИТЕ ОТ ВХОДНО НИВО ПО МАТЕМАТИКА\n10 клас (Паралелки А и Б). Среден успех на випуска: 4.82.\nУстановени пропуски: Квадратни уравнения и тригонометрични функции.',
  },
  {
    id: 'doc-6',
    name: 'Otsenki_Vhodno_Nivo_Tablitsa.xlsx',
    size: '62 KB',
    type: 'excel',
    uploadedBy: 'Мария Георгиева (Учител)',
    uploadedAt: '06.11.2026',
    daysRemaining: 363,
    taskTitle: 'Предаване на протоколи от входни нива',
    previewSnippet: 'ОБОБЩЕНА ВЕДОМОСТ ВХОДНИ НИВА\nУченици: 52 бр. Отлични: 14 | Мн. добри: 22 | Добри: 12 | Средни: 4\nФайлът е подготвен за качване в НЕИСПУО.',
  },
  {
    id: 'doc-7',
    name: 'Opis_Laboratorno_Oborudvane.xlsx',
    size: '115 KB',
    type: 'excel',
    uploadedBy: 'Елена Димитрова (ЗАС)',
    uploadedAt: '02.11.2026',
    daysRemaining: 359,
    taskTitle: 'Инвентаризация на кабинет по природни науки',
    previewSnippet: 'ИНВЕНТАРЕН ОПИС — КАБИНЕТ ПО ПРИРОДНИ НАУКИ № 305\nИнв. номер | Наименование | Количество | Състояние\nINV-4011 | Микроскопи бинокулярни | 12 бр. | Изправни\nINV-4012 | Комплект стъклария и колби | 8 к-та | Частично попълнени',
  },
  {
    id: 'doc-8',
    name: 'Otchet_Biudzet_Q3_2026.pdf',
    size: '680 KB',
    type: 'pdf',
    uploadedBy: 'Светла Николова (Гл. счетоводител)',
    uploadedAt: '30.10.2026',
    daysRemaining: 356,
    taskTitle: 'Годишен финансов отчет за делегиран бюджет',
    previewSnippet: 'ОТЧЕТ ЗА КАСОВОТО ИЗПЪЛНЕНИЕ НА ДЕЛЕГИРАНИЯ БЮДЖЕТ (Q3 2026)\nПриходи: 342,000.00 €\nРазходи: 298,450.00 €\nПреходен остатък: 43,550.00 €',
  },
];

const SAMPLE_TASKS: DemoTask[] = [
  {
    id: 'TSK-201',
    title: 'Предаване на годишни тематични разпределения и графици за контролни работи',
    hierarchy: 'Ниво 1 ➔ Всички учители (Ниво 4)',
    creator: 'инж. Радослав Петров (Директор)',
    assignee: 'Всички учители (Педагогически съвет)',
    dueDate: '15.11.2026',
    daysDiff: 7,
    dept: 'Учебна дейност',
    priority: 'high',
    status: 'in_progress',
    documents: [SAMPLE_DOCS[0], SAMPLE_DOCS[1], SAMPLE_DOCS[2], SAMPLE_DOCS[3]],
    messages: [
      {
        sender: 'инж. Радослав Петров',
        role: 'Директор (Ниво 1)',
        text: 'Колеги, качил съм утвърдения от МОН образец в Word и таблицата за график в Excel. Моля до 15.11 да качите попълнените файлове тук.',
        time: '03.11, 09:30 ч.',
      },
      {
        sender: 'Мария Иванова',
        role: 'Зам.-директор УД (Ниво 2)',
        text: 'Напомням, че контролните работи за една паралелка не могат да съвпадат в един и същи ден. Следете таблицата Grafik_Kontrolni_Raboti_I_Srok.xlsx.',
        time: '04.11, 11:15 ч.',
      },
      {
        sender: 'Петър Василев',
        role: 'Учител по математика (Ниво 4)',
        text: 'Разпределенията по математика за 8-ми и 9-ти клас са готови и съгласувани. Качвам ги за финално одобрение.',
        time: '05.11, 14:20 ч.',
      },
    ],
  },
  {
    id: 'TSK-202',
    title: 'Предаване на протоколи и обобщени ведомости от входни нива за 2026/2027',
    hierarchy: 'Ниво 2 ➔ Учители по предмети (Ниво 4)',
    creator: 'Мария Иванова (Зам.-директор УД)',
    assignee: 'Учители по БЕЛ и Математика',
    dueDate: '10.11.2026',
    daysDiff: 2,
    dept: 'Учебна дейност',
    priority: 'urgent',
    status: 'in_progress',
    documents: [SAMPLE_DOCS[4], SAMPLE_DOCS[5]],
    messages: [
      {
        sender: 'Мария Иванова',
        role: 'Зам.-директор (Ниво 2)',
        text: 'Срокът изтича след 2 дни. Моля учителите по БЕЛ и математика да предадат протоколите, за да подготвим анализа за Педагогическия съвет.',
        time: '06.11, 08:45 ч.',
      },
    ],
  },
  {
    id: 'TSK-203',
    title: 'Инвентаризация на кабинет по природни науки и заявка за химически консумативи',
    hierarchy: 'Ниво 3 ➔ Учител по химия (Ниво 4)',
    creator: 'Елена Димитрова (ЗАС)',
    assignee: 'Катя Тодорова (Учител химия)',
    dueDate: '01.12.2026',
    daysDiff: 23,
    dept: 'Материална база',
    priority: 'medium',
    status: 'open',
    documents: [SAMPLE_DOCS[6]],
    messages: [
      {
        sender: 'Елена Димитрова',
        role: 'Администрация / ЗАС (Ниво 3)',
        text: 'Г-жо Тодорова, моля попълнете инвентарния опис и отбележете липсващите реактиви за лабораторните упражнения през втория срок.',
        time: '02.11, 10:10 ч.',
      },
    ],
  },
  {
    id: 'TSK-204',
    title: 'Годишен финансов отчет за делегиран бюджет и касово изпълнение (Q3 2026)',
    hierarchy: 'Ниво 1 ➔ Счетоводство (Ниво 3)',
    creator: 'инж. Радослав Петров (Директор)',
    assignee: 'Светла Николова (Гл. счетоводител)',
    dueDate: '31.10.2026',
    daysDiff: -8,
    dept: 'Счетоводство',
    priority: 'high',
    status: 'resolved',
    documents: [SAMPLE_DOCS[7]],
    messages: [
      {
        sender: 'Светла Николова',
        role: 'Главен счетоводител (Ниво 3)',
        text: 'Отчетът е изготвен, подписан с КЕП и качен в системата. Наличният свободен преходен остатък е 43,550.00 €.',
        time: '30.10, 16:30 ч.',
      },
      {
        sender: 'инж. Радослав Петров',
        role: 'Директор (Ниво 1)',
        text: 'Отчетът е приет и одобрен. Задачата е приключена.',
        time: '31.10, 09:00 ч.',
      },
    ],
  },
];

const ORDERS_BUDGET = [
  { item: 'Тонер касети Konica Minolta bizhub (к-т)', qty: 2, totalEur: 140.0, status: 'Одобрена' },
  { item: 'Копирна хартия A4 Double A (10 кашона)', qty: 10, totalEur: 48.0, status: 'Доставена' },
  { item: 'Кабелни организатори и пач кабели Cat6', qty: 15, totalEur: 35.5, status: 'Поръчана' },
  { item: 'Маркери за бяла дъска и магнитни гъби (к-т)', qty: 6, totalEur: 22.0, status: 'Доставена' },
];

export function SchoolTicketingDemo() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'archive' | 'budget'>('tasks');
  const [selectedTask, setSelectedTask] = useState<DemoTask>(SAMPLE_TASKS[0]);
  const [taskList, setTaskList] = useState(SAMPLE_TASKS);
  const [newComment, setNewComment] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DemoDocument | null>(null);
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'word' | 'excel' | 'pdf' | 'powerpoint'>('all');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const updated = {
      ...selectedTask,
      messages: [
        ...selectedTask.messages,
        {
          sender: 'Вие (Демо Директор)',
          role: 'Директор (Ниво 1)',
          text: newComment.trim(),
          time: 'Току-що',
        },
      ],
    };

    setSelectedTask(updated);
    setTaskList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setNewComment('');
  };

  const getDocBadge = (type: DemoDocument['type']) => {
    switch (type) {
      case 'word':
        return { label: 'DOCX', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: FileText };
      case 'excel':
        return { label: 'XLSX', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: FileSpreadsheet };
      case 'pdf':
        return { label: 'PDF', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: FileText };
      case 'powerpoint':
        return { label: 'PPTX', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Presentation };
    }
  };

  const filteredArchiveDocs = SAMPLE_DOCS.filter((d) => {
    if (docTypeFilter !== 'all' && d.type !== docTypeFilter) return false;
    return true;
  });

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
          <span>Интерактивна Демонстрация • Задачи & Документи</span>
        </div>
      </div>

      {/* Toolbar with 3 Tabs */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
              activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Задачи и Йерархия ({taskList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archive')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
              activeTab === 'archive' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            )}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>1-годишен архив на документи (365 дни)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
              activeTab === 'budget' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            )}
          >
            <Euro className="w-3.5 h-3.5 text-emerald-400" />
            <span>Бюджет и Поръчки (€)</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden lg:inline">
          {activeTab === 'tasks'
            ? 'Кликнете върху задача за преглед на документите и чата'
            : activeTab === 'archive'
            ? 'Преглед на съхранените документи с 365 дни гаранция'
            : 'Контрол на разходите за материали'}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 bg-slate-900/60 min-h-[440px]">
        {/* TAB 1: TASKS & DOCUMENTS VIEW */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Task list (5 cols) */}
            <div className="lg:col-span-5 space-y-2.5">
              {taskList.map((t) => {
                const isSelected = selectedTask.id === t.id;
                const isOverdue = t.daysDiff < 0;
                const isUrgentDue = t.daysDiff >= 0 && t.daysDiff <= 2;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={cn(
                      'p-3.5 rounded-2xl border cursor-pointer transition-all space-y-2',
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <span className="font-mono font-bold text-blue-400">{t.id}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase',
                            t.priority === 'urgent' && 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
                            t.priority === 'high' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                            t.priority === 'medium' && 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          )}
                        >
                          {t.priority === 'urgent' ? 'Спешна' : t.priority === 'high' ? 'Висок' : 'Нормален'}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1',
                            isOverdue
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : isUrgentDue
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          )}
                        >
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{t.dueDate}</span>
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
                      {t.title}
                    </h4>

                    {/* Hierarchy badge */}
                    <div className="text-[11px] text-purple-300 bg-purple-950/50 border border-purple-800/40 rounded-lg px-2 py-1 flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="truncate">{t.hierarchy}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                      <span className="text-blue-300 font-medium flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        <span>{t.documents.length} прикрепени файла</span>
                      </span>
                      <span className="text-slate-300 font-medium">💬 {t.messages.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Task Detail (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b border-slate-800 pb-3 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                      {selectedTask.hierarchy}
                    </span>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                        selectedTask.status === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      )}
                    >
                      {selectedTask.status === 'resolved' ? '✓ Одобрена / Приключена' : 'В процес на работа'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                    {selectedTask.title}
                  </h3>

                  <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <span>
                      Възложител: <strong className="text-slate-200">{selectedTask.creator}</strong>
                    </span>
                    <span>
                      Изпълнител: <strong className="text-blue-400">{selectedTask.assignee}</strong>
                    </span>
                    <span>
                      Краен срок: <strong className="text-amber-300">{selectedTask.dueDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Attached Documents Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                      <span>Прикачени работни документи ({selectedTask.documents.length})</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Word, Excel, PDF, PowerPoint</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedTask.documents.map((doc) => {
                      const meta = getDocBadge(doc.type);
                      const IconComponent = meta.icon;

                      return (
                        <div
                          key={doc.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-2"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 flex items-center gap-1', meta.bg)}>
                              <IconComponent className="w-3 h-3" />
                              <span>{meta.label}</span>
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-slate-200 truncate" title={doc.name}>
                                {doc.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {doc.size} • {doc.uploadedAt}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/60">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-blue-400" />
                              <span>Преглед</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => alert(`Демо сваляне на: ${doc.name}`)}
                              className="px-2 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Изтегли</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-300">
                    Хронология и коментари по изпълнението:
                  </div>
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {selectedTask.messages.map((m, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-blue-300">{m.sender}</span>
                          <span className="text-slate-500">{m.time}</span>
                        </div>
                        <div className="text-[10px] text-purple-400 font-medium">{m.role}</div>
                        <p className="text-xs text-slate-300 mb-0 leading-relaxed">{m.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Въведете обратна връзка или инструкция..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Изпрати
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: 1-YEAR DOCUMENT ARCHIVE */}
        {activeTab === 'archive' && (
          <div className="space-y-5">
            {/* 365-day Retention Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>365 дни автоматично съхранение</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-100 mb-0">
                  Пълна история на училищните документи за последната 1 календарна година
                </h4>
                <p className="text-xs text-slate-400 mb-0">
                  Всеки качен план, протокол или ведомост се съхранява надеждно с гарантиран достъп и бързо изтегляне.
                </p>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-right shrink-0">
                <div className="text-base font-bold text-emerald-400">{SAMPLE_DOCS.length} документа</div>
                <div className="text-[11px] text-slate-400">Общ обем: 3.44 MB</div>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
                <Filter className="w-3.5 h-3.5" />
                <span>Тип файл:</span>
              </div>
              {[
                { id: 'all', label: `Всички (${SAMPLE_DOCS.length})` },
                { id: 'word', label: 'Word (DOCX)' },
                { id: 'excel', label: 'Excel (XLSX)' },
                { id: 'pdf', label: 'PDF документи' },
                { id: 'powerpoint', label: 'PowerPoint (PPTX)' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setDocTypeFilter(btn.id as typeof docTypeFilter)}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    docTypeFilter === btn.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Documents Archive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {filteredArchiveDocs.map((doc) => {
                const meta = getDocBadge(doc.type);

                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border', meta.bg)}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-semibold">
                          Остават {doc.daysRemaining} дни
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-100 line-clamp-2" title={doc.name}>
                        {doc.name}
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-0.5">
                        <div className="truncate">Качен от: {doc.uploadedBy}</div>
                        <div>Дата: {doc.uploadedAt} • {doc.size}</div>
                        <div className="text-purple-300 truncate pt-1">
                          ↳ {doc.taskTitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Преглед</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => alert(`Демо сваляне на архивен файл: ${doc.name}`)}
                        className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Изтегли</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: BUDGET & ORDERS VIEW IN EUR € */}
        {activeTab === 'budget' && (
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

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="max-w-xl w-full bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden space-y-4 p-5 sm:p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className={cn('px-2 py-0.5 rounded text-[11px] font-bold border', getDocBadge(previewDoc.type).bg)}>
                  {getDocBadge(previewDoc.type).label}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-xs">
                  {previewDoc.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto">
              {previewDoc.previewSnippet}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div>
                Качен от <strong>{previewDoc.uploadedBy}</strong> ({previewDoc.size})
              </div>
              <button
                type="button"
                onClick={() => {
                  alert(`Демо сваляне на: ${previewDoc.name}`);
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Изтегли документа</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
