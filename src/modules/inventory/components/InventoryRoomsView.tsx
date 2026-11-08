import { useState, useMemo } from 'react';
import {
  Building2,
  Edit2,
  Plus,
  Printer,
  Trash2,
  User,
} from 'lucide-react';
import type { InventoryItem, InventoryRoom } from '../types';
import { CONDITION_META, formatEur } from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';

interface InventoryRoomsViewProps {
  rooms: InventoryRoom[];
  items: InventoryItem[];
  schoolName: string;
  onCreateRoom: (name: string, buildingOrFloor?: string, responsiblePerson?: string) => Promise<void>;
  onEditRoom: (id: string, name: string, buildingOrFloor?: string, responsiblePerson?: string) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<boolean>;
}

export function InventoryRoomsView({
  rooms,
  items,
  schoolName,
  onCreateRoom,
  onEditRoom,
  onDeleteRoom,
}: InventoryRoomsViewProps) {
  const [todayStr] = useState(() => new Date().toLocaleDateString('bg-BG'));
  // Modal state for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<InventoryRoom | null>(null);
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [mol, setMol] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Print Sheet Modal State
  const [printRoom, setPrintRoom] = useState<InventoryRoom | null>(null);

  const roomStats = useMemo(() => {
    return rooms.map((r) => {
      const roomItems = items.filter((it) => it.room_id === r.id);
      const totalQty = roomItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
      const totalValue = roomItems.reduce(
        (acc, it) => acc + (it.purchase_price ? it.purchase_price * (it.quantity || 1) : 0),
        0
      );
      return {
        ...r,
        itemsCount: roomItems.length,
        totalQty,
        totalValue,
        roomItems,
      };
    });
  }, [rooms, items]);

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setName('');
    setFloor('');
    setMol('');
    setModalOpen(true);
  };

  const handleOpenEdit = (r: InventoryRoom) => {
    setEditingRoom(r);
    setName(r.name);
    setFloor(r.building_or_floor || '');
    setMol(r.responsible_person || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    if (editingRoom) {
      await onEditRoom(editingRoom.id, name.trim(), floor.trim() || undefined, mol.trim() || undefined);
    } else {
      await onCreateRoom(name.trim(), floor.trim() || undefined, mol.trim() || undefined);
    }

    setSubmitting(false);
    setModalOpen(false);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Кабинети, зали и помещения</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Организация на инвентара по зали и генериране на официални стенни описи за печат
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Нов кабинет / зала</span>
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roomStats.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(r)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Редактирай"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(r.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Изтрий"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-heading font-bold text-navy-900 leading-snug">
                  {r.name}
                </h3>
                {r.building_or_floor && (
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    📍 {r.building_or_floor}
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>МОЛ: <strong>{r.responsible_person || 'Не е определено'}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Заведени: <strong>{r.totalQty} бр.</strong></span>
                <span className="font-bold text-emerald-700">{formatEur(r.totalValue)}</span>
              </div>

              <button
                type="button"
                onClick={() => setPrintRoom(r)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-navy-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Инвентарен опис за печат (A4)</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT ROOM MODAL */}
      <ModuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoom ? 'Редактиране на кабинет' : 'Добавяне на нов кабинет'}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Наименование на кабинета / залата *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. Кабинет 201 — Информационни технологии"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Сграда / Корпус / Етаж
            </label>
            <input
              type="text"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="напр. Корпус А, Етаж 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Материално отговорно лице (МОЛ)
            </label>
            <input
              type="text"
              value={mol}
              onChange={(e) => setMol(e.target.value)}
              placeholder="напр. инж. Георги Димитров"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold"
            >
              {submitting ? 'Запазване...' : 'Запази'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* PRINT ROOM SHEET MODAL (A4 READY) */}
      <ModuleModal
        open={!!printRoom}
        onClose={() => setPrintRoom(null)}
        title="Официален инвентарен опис на помещението (A4)"
        subtitle="Готов за разпечатване и поставяне на стената в съответния кабинет"
        maxWidthClass="max-w-3xl"
      >
        {printRoom && (
          <div className="space-y-5">
            {/* Printable Paper Canvas */}
            <div
              id="room-inventory-printable-sheet"
              className="p-6 sm:p-8 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-800 space-y-6 font-sans"
            >
              {/* Sheet Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                <div className="text-xs uppercase tracking-widest font-semibold text-slate-500">
                  {schoolName}
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 uppercase">
                  ИНВЕНТАРЕН ОПИС НА НАЛИЧНОТО ОБОРУДВАНЕ
                </h2>
                <div className="text-xs text-slate-600 font-medium">
                  Помещение: <strong>{printRoom.name}</strong> • Разположение: <strong>{printRoom.building_or_floor || 'Основен корпус'}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  Материално отговорно лице (МОЛ): <strong>{printRoom.responsible_person || 'Не е посочено'}</strong> • Дата:{' '}
                  {todayStr}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 font-bold bg-slate-100">
                    <th className="p-2 w-10 text-center">№</th>
                    <th className="p-2">Инв. Код</th>
                    <th className="p-2">Наименование и Марка/Модел</th>
                    <th className="p-2">Сериен номер</th>
                    <th className="p-2 text-center w-14">Брой</th>
                    <th className="p-2">Състояние</th>
                    <th className="p-2">Бележки</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items
                    .filter((it) => it.room_id === printRoom.id)
                    .map((it, idx) => {
                      const cMeta = CONDITION_META[it.condition] || CONDITION_META.good;
                      return (
                        <tr key={it.id}>
                          <td className="p-2 text-center font-semibold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="p-2 font-mono font-bold">{it.inventory_code}</td>
                          <td className="p-2">
                            <span className="font-semibold">{it.name}</span>
                            {it.brand_or_model && (
                              <span className="text-slate-500 block text-[11px]">
                                {it.brand_or_model}
                              </span>
                            )}
                          </td>
                          <td className="p-2 font-mono text-[11px]">{it.serial_number || '—'}</td>
                          <td className="p-2 text-center font-bold">{it.quantity}</td>
                          <td className="p-2 text-[11px]">{cMeta.label}</td>
                          <td className="p-2 text-slate-500 text-[11px]">{it.notes || '—'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {/* Signatures Footer */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs">
                <div className="space-y-6">
                  <div>Материално отговорно лице (МОЛ):</div>
                  <div className="border-b border-slate-500 w-48" />
                  <div className="text-[11px] text-slate-500">
                    / {printRoom.responsible_person || '.............................'} /
                  </div>
                </div>

                <div className="space-y-6 text-right">
                  <div>Директор:</div>
                  <div className="border-b border-slate-500 w-48 ml-auto" />
                  <div className="text-[11px] text-slate-500">
                    / ....................................... / (Печат)
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">
                Печатът отпечатва листа във формат A4 за поставяне в кабинета
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintRoom(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
                >
                  Затвори
                </button>
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Разпечатай листа</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </ModuleModal>

      {/* DELETE CONFIRM */}
      <ModuleConfirmDialog
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) await onDeleteRoom(deleteTargetId);
        }}
        title="Изтриване на кабинет"
        confirmLabel="Изтрий кабинета"
        tone="danger"
        description="Сигурни ли сте, че искате да изтриете този кабинет? Ако в него има заведени активи, преместете ги в друго помещение преди изтриването."
      />
    </div>
  );
}
