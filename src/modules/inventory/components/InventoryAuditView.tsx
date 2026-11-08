import { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  FileCheck2,
  FileSpreadsheet,
  Printer,
  QrCode,
  Tag,
} from 'lucide-react';
import type {
  InventoryItem,
  InventoryLog,
  InventoryRoom,
  ItemCondition,
} from '../types';
import { CONDITION_META } from '../types';
import { ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface InventoryAuditViewProps {
  items: InventoryItem[];
  rooms: InventoryRoom[];
  logs: InventoryLog[];
  schoolName: string;
  onMoveItem: (itemId: string, targetRoomId: string, targetMol?: string, notes?: string) => Promise<void>;
  onChangeCondition: (itemId: string, condition: ItemCondition, reason?: string) => Promise<void>;
}

export function InventoryAuditView({
  items,
  rooms,
  logs,
  schoolName,
  onMoveItem,
  onChangeCondition,
}: InventoryAuditViewProps) {
  const [todayStr] = useState(() => new Date().toLocaleDateString('bg-BG'));
  const [activeSubTab, setActiveSubTab] = useState<'move' | 'checklist' | 'labels'>('checklist');

  // Relocation State
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [targetRoomId, setTargetRoomId] = useState<string>(rooms[1]?.id || rooms[0]?.id || '');
  const [targetMol, setTargetMol] = useState<string>('');
  const [moveNotes, setMoveNotes] = useState<string>('');
  const [moving, setMoving] = useState(false);

  // Checklist State
  const [auditRoomId, setAuditRoomId] = useState<string>(rooms[0]?.id || '');
  const [checkedStatus, setCheckedStatus] = useState<Record<string, ItemCondition>>({});

  // Printable Protocol Modal
  const [protocolModalOpen, setProtocolModalOpen] = useState(false);

  const selectedItemToMove = useMemo(
    () => items.find((i) => i.id === selectedItemId),
    [items, selectedItemId]
  );

  const roomForAudit = useMemo(
    () => rooms.find((r) => r.id === auditRoomId),
    [rooms, auditRoomId]
  );

  const itemsInAuditRoom = useMemo(
    () => items.filter((it) => it.room_id === auditRoomId),
    [items, auditRoomId]
  );

  const checkedCount = Object.keys(checkedStatus).length;
  const progressPct =
    itemsInAuditRoom.length > 0
      ? Math.round((checkedCount / itemsInAuditRoom.length) * 100)
      : 100;

  // Handle Relocation Submit
  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !targetRoomId) return;
    setMoving(true);
    await onMoveItem(selectedItemId, targetRoomId, targetMol.trim() || undefined, moveNotes.trim() || undefined);
    setMoveNotes('');
    setMoving(false);
  };

  // Handle Checklist Condition Click
  const handleCheckItem = async (itemId: string, cond: ItemCondition) => {
    setCheckedStatus((prev) => ({ ...prev, [itemId]: cond }));
    await onChangeCondition(itemId, cond, 'Ревизионна проверка');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-600" />
            <span>Ревизия, движение на активи и QR Етикети</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Инструменти за годишна инвентаризация, преместване между кабинети и отпечатване на баркодове
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveSubTab('checklist')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2',
              activeSubTab === 'checklist'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-navy-900'
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Инвентаризационен чек-лист</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('move')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2',
              activeSubTab === 'move'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-navy-900'
            )}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Преместване на актив</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('labels')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2',
              activeSubTab === 'labels'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-navy-900'
            )}
          >
            <QrCode className="w-4 h-4" />
            <span>QR / Баркод Етикети</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CHECKLIST */}
      {activeSubTab === 'checklist' && (
        <div className="space-y-5">
          {/* Room Selector & Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Изберете кабинет за проверка:
              </label>
              <select
                value={auditRoomId}
                onChange={(e) => {
                  setAuditRoomId(e.target.value);
                  setCheckedStatus({});
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:outline-none focus:border-blue-500"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-500">Проверени активи:</div>
                <div className="text-sm font-bold text-navy-900">
                  {checkedCount} от {itemsInAuditRoom.length} ({progressPct}%)
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProtocolModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Генерирай протокол (A4)</span>
              </button>
            </div>
          </div>

          {/* Checklist Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Инв. Код</th>
                    <th className="px-4 py-3">Артикул</th>
                    <th className="px-4 py-3">Сериен номер</th>
                    <th className="px-4 py-3 text-center">Количество</th>
                    <th className="px-4 py-3">Текущо състояние</th>
                    <th className="px-4 py-3 text-right">Бърза верификация</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsInAuditRoom.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        В този кабинет няма заведени инвентарни активи.
                      </td>
                    </tr>
                  ) : (
                    itemsInAuditRoom.map((it) => {
                      const effectiveCond = checkedStatus[it.id] || it.condition;
                      const cMeta = CONDITION_META[effectiveCond] || CONDITION_META.good;

                      return (
                        <tr key={it.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-navy-900 whitespace-nowrap">
                            {it.inventory_code}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-navy-900">{it.name}</span>
                            {it.brand_or_model && (
                              <span className="text-[11px] text-slate-500 block">
                                {it.brand_or_model}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                            {it.serial_number || '—'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            {it.quantity} бр.
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'text-[11px] font-semibold px-2 py-0.5 rounded-md border',
                                cMeta.badge
                              )}
                            >
                              {cMeta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCheckItem(it.id, 'good')}
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                                  effectiveCond === 'good' || effectiveCond === 'new'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                    : 'border-slate-300 text-slate-600 hover:bg-emerald-50'
                                )}
                              >
                                Наличен
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCheckItem(it.id, 'needs_repair')}
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                                  effectiveCond === 'needs_repair'
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                    : 'border-slate-300 text-slate-600 hover:bg-amber-50'
                                )}
                              >
                                Повреден
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCheckItem(it.id, 'missing')}
                                className={cn(
                                  'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
                                  effectiveCond === 'missing'
                                    ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                                    : 'border-slate-300 text-slate-600 hover:bg-red-50'
                                )}
                              >
                                Липсва
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MOVE / RELOCATION */}
      {activeSubTab === 'move' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Relocation Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                <span>Преместване на актив</span>
              </h3>
              <p className="text-xs text-slate-500 mb-0">
                Прехвърляне на отговорността и физическото местоположение на артикул
              </p>
            </div>

            <form onSubmit={handleMoveSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Изберете актив за преместване *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      [{it.inventory_code}] {it.name} — Кабинет: {it.room_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedItemToMove && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div>
                    Текущ кабинет: <strong>{selectedItemToMove.room_name}</strong>
                  </div>
                  <div>
                    Текущ МОЛ: <strong>{selectedItemToMove.assigned_to || 'Не е посочен'}</strong>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Нов кабинет / зала *
                </label>
                <select
                  value={targetRoomId}
                  onChange={(e) => {
                    setTargetRoomId(e.target.value);
                    const found = rooms.find((r) => r.id === e.target.value);
                    if (found?.responsible_person) {
                      setTargetMol(found.responsible_person);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Нов МОЛ / Отговорник
                </label>
                <input
                  type="text"
                  value={targetMol}
                  onChange={(e) => setTargetMol(e.target.value)}
                  placeholder="напр. инж. Георги Димитров"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Основание / Причина за преместване
                </label>
                <textarea
                  rows={2}
                  value={moveNotes}
                  onChange={(e) => setMoveNotes(e.target.value)}
                  placeholder="напр. Преместен за нуждите на новата STEM лаборатория..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={moving || !selectedItemId || !targetRoomId}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-2xs transition-colors"
              >
                {moving ? 'Преместване...' : 'Премести актива и запиши в журнала'}
              </button>
            </form>
          </div>

          {/* Movement Audit Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              <span>Хронология на преместванията</span>
            </h3>
            <div className="space-y-3">
              {logs.filter((l) => l.action.includes('Преместване') || l.action.includes('актив')).length === 0 ? (
                <p className="text-xs text-slate-500 mb-0">
                  Все още няма записани премествания на активи.
                </p>
              ) : (
                logs
                  .filter((l) => l.action.includes('Преместване') || l.action.includes('актив'))
                  .slice(0, 6)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1"
                    >
                      <div className="font-bold text-navy-900">{log.action}</div>
                      {log.notes && <div className="text-slate-600">{log.notes}</div>}
                      <div className="text-[11px] text-slate-400">
                        {log.actor_name} • {new Date(log.created_at).toLocaleString('bg-BG')}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: QR / BARCODE LABELS GENERATOR */}
      {activeSubTab === 'labels' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <span>Инвентарни етикети (QR стикери за активи)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-0">
                Готови за печат табелки и стикери за залепване върху техниката и обзавеждането
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Разпечатай етикетите (A4)</span>
            </button>
          </div>

          {/* Printable Labels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="bg-white border-2 border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 font-sans print:break-inside-avoid"
              >
                <div className="min-w-0 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 truncate">
                    {schoolName}
                  </div>
                  <div className="text-xs font-bold text-navy-900 leading-tight truncate">
                    {it.name}
                  </div>
                  <div className="text-sm font-mono font-black text-slate-900 tracking-wider">
                    {it.inventory_code}
                  </div>
                  <div className="text-[10px] text-slate-600 truncate">
                    {it.room_name} • МОЛ: {it.assigned_to || 'Училище'}
                  </div>
                </div>

                {/* SVG Visual QR Matrix Representation */}
                <div className="w-16 h-16 bg-slate-900 text-white p-1.5 rounded-xl shrink-0 flex flex-col items-center justify-center">
                  <QrCode className="w-full h-full text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINTABLE PROTOCOL MODAL */}
      <ModuleModal
        open={protocolModalOpen}
        onClose={() => setProtocolModalOpen(false)}
        title="Официален Протокол за инвентаризация (A4)"
        maxWidthClass="max-w-3xl"
      >
        <div className="space-y-6">
          <div className="p-8 bg-white border border-slate-300 rounded-2xl text-slate-900 space-y-6 text-xs font-sans">
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                {schoolName}
              </div>
              <h2 className="text-base sm:text-lg font-bold uppercase font-serif">
                ПРИЕМО-ПРЕДАВАТЕЛЕН И ИНВЕНТАРИЗАЦИОНЕН ПРОТОКОЛ
              </h2>
              <div className="text-slate-600">
                За извършена проверка на наличното оборудване в: <strong>{roomForAudit?.name}</strong>
              </div>
              <div className="text-slate-500 text-[11px]">
                Дата на съставяне: {todayStr}
              </div>
            </div>

            <p className="leading-relaxed">
              Днес, <strong>{todayStr}</strong>, комисия в състав с
              участието на МОЛ <strong>{roomForAudit?.responsible_person || '.....................'}</strong> извърши
              инвентаризация на наличното материално имущество и техника в съответното помещение.
            </p>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-100 font-bold">
                  <th className="p-2 w-8">№</th>
                  <th className="p-2">Инв. Код</th>
                  <th className="p-2">Наименование</th>
                  <th className="p-2 text-center">Количество</th>
                  <th className="p-2">Установено състояние</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {itemsInAuditRoom.map((it, idx) => {
                  const effectiveCond = checkedStatus[it.id] || it.condition;
                  const cMeta = CONDITION_META[effectiveCond] || CONDITION_META.good;

                  return (
                    <tr key={it.id}>
                      <td className="p-2 font-semibold text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-mono font-bold">{it.inventory_code}</td>
                      <td className="p-2">{it.name}</td>
                      <td className="p-2 text-center font-bold">{it.quantity} бр.</td>
                      <td className="p-2 font-semibold">{cMeta.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pt-8 grid grid-cols-2 gap-8 text-xs">
              <div className="space-y-6">
                <div>Предал / МОЛ:</div>
                <div className="border-b border-slate-500 w-44" />
                <div className="text-[11px] text-slate-500">
                  / {roomForAudit?.responsible_person || '.............................'} /
                </div>
              </div>
              <div className="space-y-6 text-right">
                <div>Утвърдил (Директор):</div>
                <div className="border-b border-slate-500 w-44 ml-auto" />
                <div className="text-[11px] text-slate-500">/ ............................. / (Печат)</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setProtocolModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
            >
              Затвори
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Печат на протокола</span>
            </button>
          </div>
        </div>
      </ModuleModal>
    </div>
  );
}
