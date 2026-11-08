import { useState } from 'react';
import {
  Boxes,
  Building2,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

interface DemoRoomData {
  id: string;
  name: string;
  mol: string;
  floor: string;
  items: {
    code: string;
    name: string;
    model: string;
    qty: number;
    priceEur: number;
    inWarranty: boolean;
    condition: 'Отлично' | 'Добро' | 'За сервиз';
  }[];
}

const DEMO_ROOMS: DemoRoomData[] = [
  {
    id: 'stem',
    name: 'STEM Център и Роботика',
    mol: 'гл. учител Д. Стоянова',
    floor: 'Корпус Б, Етаж 1',
    items: [
      { code: 'INV-2026-0001', name: 'Интерактивен дисплей 75" 4K', model: 'Clevertouch Impact Plus', qty: 1, priceEur: 2450.0, inWarranty: true, condition: 'Отлично' },
      { code: 'INV-2026-0003', name: '3D Принтер за моделиране', model: 'Bambu Lab X1 Carbon', qty: 1, priceEur: 1599.0, inWarranty: true, condition: 'Отлично' },
      { code: 'INV-2026-0005', name: 'Комплект безжични сензори по физика', model: 'Vernier Science Pack', qty: 4, priceEur: 490.0, inWarranty: true, condition: 'Добро' },
    ],
  },
  {
    id: 'it104',
    name: 'Компютърен кабинет 104',
    mol: 'инж. Георги Димитров',
    floor: 'Корпус А, Етаж 2',
    items: [
      { code: 'INV-2026-0002', name: 'Работни станции Core i5 / 16GB', model: 'Lenovo ThinkCentre Tiny', qty: 16, priceEur: 680.0, inWarranty: true, condition: 'Добро' },
      { code: 'INV-2026-0006', name: 'Ергономични ученически столове', model: 'ErgoEdu Pro Blue', qty: 32, priceEur: 75.0, inWarranty: true, condition: 'Добро' },
      { code: 'INV-2026-0009', name: 'Мрежов Gigabit суич 24-порта', model: 'Ubiquiti UniFi Pro 24 PoE', qty: 1, priceEur: 420.0, inWarranty: true, condition: 'Отлично' },
    ],
  },
  {
    id: 'gym',
    name: 'Физкултурен салон и база',
    mol: 'Красимир Тодоров',
    floor: 'Спортен комплекс, Партер',
    items: [
      { code: 'INV-2026-0008', name: 'Електронно състезателно табло', model: 'Stramatel Multitop', qty: 1, priceEur: 1150.0, inWarranty: false, condition: 'Добро' },
      { code: 'INV-2026-0010', name: 'Гимнастически дюшеци и матове', model: 'SportMat 200x100x10', qty: 12, priceEur: 65.0, inWarranty: false, condition: 'Добро' },
      { code: 'INV-2026-0011', name: 'Комплект топки Molten (Баскетбол/Волейбол)', model: 'Molten BG3800', qty: 20, priceEur: 38.0, inWarranty: false, condition: 'Добро' },
    ],
  },
];

export function SchoolInventoryDemo() {
  const [selectedRoom, setSelectedRoom] = useState<DemoRoomData>(DEMO_ROOMS[0]);
  const [activeTab, setActiveTab] = useState<'assets' | 'qr' | 'sheet'>('assets');

  const totalValue = selectedRoom.items.reduce((acc, it) => acc + it.priceEur * it.qty, 0);

  return (
    <div className="rounded-3xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
      {/* Title Bar */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-mono text-slate-400 font-medium hidden sm:inline">
            tidelayer.com/school/demo-school/inventory
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Интерактивна Демонстрация</span>
        </div>
      </div>

      {/* Room Tabs & View Mode */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Room Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          {DEMO_ROOMS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRoom(r)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
                selectedRoom.id === r.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{r.name}</span>
            </button>
          ))}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              activeTab === 'assets' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            )}
          >
            <Boxes className="w-3.5 h-3.5 text-blue-400" />
            <span>Активи</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              activeTab === 'qr' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            )}
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>QR Етикети</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              activeTab === 'sheet' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            )}
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>A4 Опис</span>
          </button>
        </div>
      </div>

      {/* Room Summary Info Bar */}
      <div className="bg-slate-950/50 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          МОЛ: <strong className="text-slate-200">{selectedRoom.mol}</strong> • Разположение:{' '}
          <span className="text-slate-300">{selectedRoom.floor}</span>
        </div>
        <div>
          Обща стойност на активите в кабинета:{' '}
          <strong className="text-emerald-400 font-mono text-sm">
            {totalValue.toLocaleString('bg-BG', { minimumFractionDigits: 2 })} €
          </strong>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 bg-slate-900/60 min-h-[340px]">
        {/* TAB 1: ASSETS TABLE */}
        {activeTab === 'assets' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 shadow-inner">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="p-3">Инв. Код</th>
                  <th className="p-3">Наименование и Модел</th>
                  <th className="p-3 text-center">Брой</th>
                  <th className="p-3 text-right">Ед. Цена (€)</th>
                  <th className="p-3">Гаранция</th>
                  <th className="p-3 text-right">Състояние</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {selectedRoom.items.map((it) => (
                  <tr key={it.code} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {it.code}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-100">{it.name}</div>
                      <div className="text-[11px] text-slate-400">{it.model}</div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-100">{it.qty}</td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                      {it.priceEur.toFixed(2)} €
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {it.inWarranty ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          В гаранция
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Изтекла</span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/20">
                        {it.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: QR LABELS */}
        {activeTab === 'qr' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {selectedRoom.items.map((it) => (
              <div
                key={it.code}
                className="bg-white text-slate-900 rounded-2xl p-4 shadow-lg border-2 border-slate-800 flex items-center justify-between gap-3 font-sans"
              >
                <div className="min-w-0 space-y-1">
                  <div className="text-[9px] uppercase tracking-wider font-bold text-slate-500 truncate">
                    СУ „ПРИМЕРНО УЧИЛИЩЕ“
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {it.name}
                  </div>
                  <div className="text-sm font-mono font-black text-blue-700">
                    {it.code}
                  </div>
                  <div className="text-[10px] text-slate-600 truncate">
                    {selectedRoom.name}
                  </div>
                </div>

                <div className="w-14 h-14 bg-slate-900 text-white p-1 rounded-xl shrink-0 flex items-center justify-center">
                  <QrCode className="w-full h-full text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: A4 SHEET PREVIEW */}
        {activeTab === 'sheet' && (
          <div className="max-w-xl mx-auto p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-4 font-serif text-xs">
            <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
              <div className="text-[10px] uppercase tracking-widest font-sans font-semibold text-slate-500">
                СУ „ПРИМЕРНО УЧИЛИЩЕ“ • ИНВЕНТАРЕН ОПИС
              </div>
              <h4 className="text-sm font-bold uppercase">
                ПОМЕЩЕНИЕ: {selectedRoom.name.toUpperCase()}
              </h4>
              <div className="text-[11px] text-slate-600 font-sans">
                МОЛ: <strong>{selectedRoom.mol}</strong> • Етаж: {selectedRoom.floor}
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                  <th className="p-2 border-r border-slate-300">Инв. Код</th>
                  <th className="p-2 border-r border-slate-300">Наименование и Модел</th>
                  <th className="p-2 text-center border-r border-slate-300">Брой</th>
                  <th className="p-2 text-right">Стойност (€)</th>
                </tr>
              </thead>
              <tbody>
                {selectedRoom.items.map((it) => (
                  <tr key={it.code} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold border-r border-slate-200">{it.code}</td>
                    <td className="p-2 border-r border-slate-200 font-medium">
                      {it.name} <span className="text-[10px] text-slate-500">({it.model})</span>
                    </td>
                    <td className="p-2 text-center font-bold border-r border-slate-200">{it.qty}</td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-800">
                      {(it.priceEur * it.qty).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-4 flex items-center justify-between text-[11px] text-slate-600 font-sans">
              <span>МОЛ (Подпис): .............................</span>
              <span>Директор (Подпис & Печат): .............................</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
