import { useState, useMemo } from 'react';
import {
  Archive,
  ArrowRight,
  Boxes,
  Building2,
  CheckCircle2,
  Edit2,
  FolderOpen,
  Plus,
  Printer,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import type { InventoryItem, InventoryRoom, RoomType } from '../types';
import { CONDITION_META, ROOM_TYPE_LABELS, formatEur, getRoomTypeLabel } from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface InventoryRoomsViewProps {
  rooms: InventoryRoom[];
  items: InventoryItem[];
  schoolName: string;
  onSelectRoom: (room: InventoryRoom) => void;
  onCreateRoom: (input: {
    name: string;
    room_number?: string;
    room_type?: RoomType;
    building?: string;
    floor?: string;
    building_or_floor?: string;
    responsible_person?: string;
    description?: string;
  }) => Promise<void>;
  onEditRoom: (id: string, patch: Partial<InventoryRoom>) => Promise<void>;
  onArchiveRoom: (id: string, archived: boolean) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<boolean>;
}

export function InventoryRoomsView({
  rooms,
  items,
  schoolName,
  onSelectRoom,
  onCreateRoom,
  onEditRoom,
  onArchiveRoom,
  onDeleteRoom,
}: InventoryRoomsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewTab, setViewTab] = useState<'active' | 'archived'>('active');

  // Modal state for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<InventoryRoom | null>(null);

  // Form Fields
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('classroom');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [mol, setMol] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Print Sheet Modal State
  const [printRoom, setPrintRoom] = useState<InventoryRoom | null>(null);

  const roomStats = useMemo(() => {
    return rooms.map((r) => {
      const roomItems = items.filter((it) => it.room_id === r.id && !it.is_archived);
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

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roomStats.filter((r) => {
      // Tab filter
      const isArchived = Boolean(r.is_archived);
      if (viewTab === 'active' && isArchived) return false;
      if (viewTab === 'archived' && !isArchived) return false;

      // Type filter
      if (selectedType !== 'all' && r.room_type !== selectedType) return false;

      // Search filter
      if (q) {
        const matchName = r.name.toLowerCase().includes(q);
        const matchNum = r.room_number?.toLowerCase().includes(q) || false;
        const matchMol = r.responsible_person?.toLowerCase().includes(q) || false;
        const matchBuild = r.building?.toLowerCase().includes(q) || false;
        if (!matchName && !matchNum && !matchMol && !matchBuild) return false;
      }
      return true;
    });
  }, [roomStats, viewTab, selectedType, search]);

  const activeCount = roomStats.filter((r) => !r.is_archived).length;
  const archivedCount = roomStats.filter((r) => r.is_archived).length;

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setName('');
    setRoomType('classroom');
    setBuilding('');
    setFloor('');
    setMol('');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (r: InventoryRoom) => {
    setEditingRoom(r);
    setRoomNumber(r.room_number || '');
    setName(r.name);
    setRoomType(r.room_type || 'classroom');
    setBuilding(r.building || '');
    setFloor(r.floor || r.building_or_floor || '');
    setMol(r.responsible_person || '');
    setDescription(r.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const bOrF = [building.trim(), floor.trim()].filter(Boolean).join(', ') || undefined;

    if (editingRoom) {
      await onEditRoom(editingRoom.id, {
        name: name.trim(),
        room_number: roomNumber.trim() || undefined,
        room_type: roomType,
        building: building.trim() || undefined,
        floor: floor.trim() || undefined,
        building_or_floor: bOrF,
        responsible_person: mol.trim() || undefined,
        description: description.trim() || undefined,
      });
    } else {
      await onCreateRoom({
        name: name.trim(),
        room_number: roomNumber.trim() || undefined,
        room_type: roomType,
        building: building.trim() || undefined,
        floor: floor.trim() || undefined,
        building_or_floor: bOrF,
        responsible_person: mol.trim() || undefined,
        description: description.trim() || undefined,
      });
    }

    setSubmitting(false);
    setModalOpen(false);
  };

  const targetRoomForDelete = useMemo(
    () => rooms.find((r) => r.id === deleteTargetId),
    [rooms, deleteTargetId]
  );
  const targetRoomItemsCount = useMemo(() => {
    if (!deleteTargetId) return 0;
    return items.filter((it) => it.room_id === deleteTargetId && !it.is_archived).length;
  }, [items, deleteTargetId]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Кабинети, зали и помещения</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Организация на активите по зали, сгради и материално отговорни лица (МОЛ)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Нов кабинет / зала</span>
        </button>
      </div>

      {/* Tabs and Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Active / Archived Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setViewTab('active')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewTab === 'active'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              Активни помещения ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setViewTab('archived')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                viewTab === 'archived'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              Архивирани ({archivedCount})
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Намерени: <strong>{filteredRooms.length}</strong> помещения
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търсене по номер, име, сграда, МОЛ..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
          >
            <option value="all">Всички типове помещения</option>
            {Object.entries(ROOM_TYPE_LABELS).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 bg-white rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-navy-900 mb-0">
            {viewTab === 'active'
              ? 'Няма намерени активни помещения по тези критерии.'
              : 'Няма архивирани помещения.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((r) => {
            const roomTypeLabel = getRoomTypeLabel(r.room_type);

            return (
              <div
                key={r.id}
                className={cn(
                  'bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:border-blue-300',
                  r.is_archived ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                )}
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon, Number, Badges, Dropdown */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        {r.room_number ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            № {r.room_number}
                          </span>
                        ) : null}
                        <span className="text-[11px] font-medium text-slate-500 ml-1.5">
                          {roomTypeLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                        title="Редактирай данни"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onArchiveRoom(r.id, !r.is_archived)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                        title={r.is_archived ? 'Възстанови помещението' : 'Архивирай'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                        title="Изтрий помещение"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Room Name & Location */}
                  <div>
                    <h3
                      onClick={() => onSelectRoom(r)}
                      className="text-base sm:text-lg font-heading font-bold text-navy-900 leading-snug cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {r.name}
                    </h3>

                    {(r.building || r.floor || r.building_or_floor) && (
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span>📍</span>
                        <span>
                          {r.building ? `${r.building}, ` : ''}
                          {r.floor || r.building_or_floor}
                        </span>
                      </div>
                    )}

                    {r.description && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>
                    )}
                  </div>

                  {/* Responsible Person (MOL) */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      МОЛ:{' '}
                      <strong className="text-navy-900">
                        {r.responsible_person || 'Няма назначено лице'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Bottom Section: Metrics & Open Room Button */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Активи:</span>{' '}
                      <strong className="text-navy-900">{r.totalQty} бр.</strong>{' '}
                      <span className="text-[10px] text-slate-400">({r.itemsCount} поз.)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500">Стойност:</span>{' '}
                      <strong className="text-emerald-700">{formatEur(r.totalValue)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectRoom(r)}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 group"
                    >
                      <span>Преглед на оборудването</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrintRoom(r)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      title="Печат на стенен опис (A4)"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <ModuleModal
        isOpen={modalOpen}
        title={editingRoom ? `Редакция: ${editingRoom.name}` : 'Добавяне на ново помещение'}
        onClose={() => setModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Номер на кабинет / зала
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="напр. 101, 204, Б-12"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Тип помещение *
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
                required
              >
                {Object.entries(ROOM_TYPE_LABELS).map(([k, meta]) => (
                  <option key={k} value={k}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Наименование на помещението *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. Компютърен кабинет 1 (Информатика)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Сграда / Корпус
              </label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="напр. Основна сграда, Корпус Б"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Етаж / Крило
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="напр. Етаж 2, Източно крило"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Материално отговорно лице (МОЛ)
            </label>
            <input
              type="text"
              value={mol}
              onChange={(e) => setMol(e.target.value)}
              placeholder="Име и фамилия на отговорния учител или служител"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Описание и предназначение
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Допълнителни бележки за оборудването и ползването на залата..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              {submitting ? 'Запазване...' : editingRoom ? 'Запази промените' : 'Създай помещение'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Delete Confirmation Dialog */}
      <ModuleConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Изтриване на помещение"
        message={
          targetRoomItemsCount > 0
            ? `Внимание: В „${targetRoomForDelete?.name}“ има заведени ${targetRoomItemsCount} актив(а). Системата не позволява изтриване на помещение с налично оборудване! Моля първо преместете активите или използвайте опцията „Архивирай“.`
            : `Сигурни ли сте, че искате да изтриете помещението „${targetRoomForDelete?.name}“? Това действие не може да бъде отменено.`
        }
        confirmLabel={targetRoomItemsCount > 0 ? 'Разбрах' : 'Изтрий'}
        confirmVariant={targetRoomItemsCount > 0 ? 'primary' : 'danger'}
        onConfirm={async () => {
          if (targetRoomItemsCount > 0) {
            setDeleteTargetId(null);
            return;
          }
          if (deleteTargetId) {
            await onDeleteRoom(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Quick Wall Sheet Print Modal for room */}
      {printRoom && (
        <ModuleModal
          isOpen={true}
          title={`Стенен опис (A4): ${printRoom.name}`}
          onClose={() => setPrintRoom(null)}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span>Готов за отпечатване стенен инвентарен опис (формат А4).</span>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shrink-0 shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Печат</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-300 text-navy-900 space-y-4">
              <div className="text-center border-b-2 border-slate-800 pb-3 space-y-1">
                <div className="text-xs font-bold uppercase text-slate-600">{schoolName}</div>
                <h3 className="text-base font-bold uppercase text-slate-900">
                  ИНВЕНТАРЕН ОПИС НА НАЛИЧНОТО ОБОРУДВАНЕ
                </h3>
                <div className="text-xs text-slate-700">
                  Помещение: <strong>{printRoom.name}</strong>{' '}
                  {printRoom.room_number ? `(№ ${printRoom.room_number})` : ''} • МОЛ:{' '}
                  <strong>{printRoom.responsible_person || '....................'}</strong>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-100 font-bold">
                      <th className="p-1.5 border border-slate-300 w-8 text-center">№</th>
                      <th className="p-1.5 border border-slate-300">Инв. №</th>
                      <th className="p-1.5 border border-slate-300">Наименование</th>
                      <th className="p-1.5 border border-slate-300">Сериен №</th>
                      <th className="p-1.5 border border-slate-300 text-center">Кол.</th>
                      <th className="p-1.5 border border-slate-300 text-right">Стойност (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((it) => it.room_id === printRoom.id && !it.is_archived)
                      .map((it, idx) => (
                        <tr key={it.id}>
                          <td className="p-1.5 border border-slate-300 text-center">{idx + 1}</td>
                          <td className="p-1.5 border border-slate-300 font-mono font-bold">
                            {it.inventory_code}
                          </td>
                          <td className="p-1.5 border border-slate-300 font-medium">{it.name}</td>
                          <td className="p-1.5 border border-slate-300 font-mono text-[11px]">
                            {it.serial_number || '—'}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center font-bold">
                            {it.quantity || 1}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-right font-medium">
                            {it.purchase_price ? formatEur(it.purchase_price * (it.quantity || 1)) : '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ModuleModal>
      )}
    </div>
  );
}
