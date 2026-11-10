import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRightLeft,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Edit2,
  FileSpreadsheet,
  Plus,
  Printer,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Trash2,
  User,
  Wrench,
} from 'lucide-react';
import type {
  InventoryCategory,
  InventoryItem,
  InventoryRoom,
  ItemCondition,
} from '../types';
import {
  CONDITION_META,
  ROOM_TYPE_LABELS,
  formatEur,
  getRoomTypeLabel,
} from '../types';
import { QrCodeDisplay } from './QrCodeDisplay';
import { ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface InventoryRoomDetailViewProps {
  room: InventoryRoom;
  allRooms: InventoryRoom[];
  items: InventoryItem[];
  categories: InventoryCategory[];
  schoolName: string;
  onBack: () => void;
  onOpenCreateItemInRoom: (roomId: string) => void;
  onEditRoom: (room: InventoryRoom) => void;
  onToggleArchiveRoom: (roomId: string, archived: boolean) => Promise<void>;
  onEditItem: (item: InventoryItem) => void;
  onMoveItemClick: (item: InventoryItem) => void;
  onRepairTicketClick: (item: InventoryItem) => void;
  onWriteOffClick: (item: InventoryItem) => void;
}

export function InventoryRoomDetailView({
  room,
  allRooms,
  items,
  categories,
  schoolName,
  onBack,
  onOpenCreateItemInRoom,
  onEditRoom,
  onToggleArchiveRoom,
  onEditItem,
  onMoveItemClick,
  onRepairTicketClick,
  onWriteOffClick,
}: InventoryRoomDetailViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');

  // Preview QR Modal
  const [qrItem, setQrItem] = useState<InventoryItem | null>(null);

  // Wall Inventory Sheet Print Modal
  const [showWallSheet, setShowWallSheet] = useState(false);

  // Room QR Labels Print Modal
  const [showRoomLabels, setShowRoomLabels] = useState(false);

  // Filter items belonging to this room
  const roomItems = useMemo(() => {
    return items.filter((it) => it.room_id === room.id && !it.is_archived);
  }, [items, room.id]);

  const stats = useMemo(() => {
    let totalUnits = 0;
    let totalValueEur = 0;
    let inWarrantyCount = 0;
    let needsRepairCount = 0;
    let missingCount = 0;

    const now = Date.now();
    roomItems.forEach((it) => {
      const q = it.quantity || 1;
      totalUnits += q;
      if (it.purchase_price) {
        totalValueEur += it.purchase_price * q;
      }
      if (it.warranty_until && new Date(it.warranty_until).getTime() > now) {
        inWarrantyCount += q;
      }
      if (it.condition === 'needs_repair') {
        needsRepairCount += q;
      }
      if (it.condition === 'missing') {
        missingCount += q;
      }
    });

    return {
      positionsCount: roomItems.length,
      totalUnits,
      totalValueEur,
      inWarrantyCount,
      needsRepairCount,
      missingCount,
    };
  }, [roomItems]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roomItems.filter((it) => {
      if (selectedCatId !== 'all' && it.category_id !== selectedCatId) return false;
      if (selectedCondition !== 'all' && it.condition !== selectedCondition) return false;

      if (q) {
        const matchName = it.name.toLowerCase().includes(q);
        const matchCode = it.inventory_code.toLowerCase().includes(q);
        const matchSerial = it.serial_number?.toLowerCase().includes(q) || false;
        const matchBrand = (it.brand_or_model || it.manufacturer || '')
          .toLowerCase()
          .includes(q);
        if (!matchName && !matchCode && !matchSerial && !matchBrand) return false;
      }
      return true;
    });
  }, [roomItems, search, selectedCatId, selectedCondition]);

  const roomTypeLabel = getRoomTypeLabel(room.room_type);

  const todayFormatted = new Date().toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Обратно към всички кабинети и зали</span>
        </button>

        <div className="flex items-center gap-2">
          {room.is_archived && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold">
              Архивирано помещение
            </span>
          )}
          <span className="text-xs text-slate-500 font-medium">
            Код на залата: <strong className="text-navy-900">{room.room_number || room.name}</strong>
          </span>
        </div>
      </div>

      {/* Main Room Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {room.room_number && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-xs font-bold tracking-wide">
                    № {room.room_number}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {roomTypeLabel}
                </span>
                {(room.building || room.floor || room.building_or_floor) && (
                  <span className="text-xs text-slate-500 font-medium">
                    📍 {room.building ? `${room.building}, ` : ''}
                    {room.floor || room.building_or_floor}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-navy-900">
                {room.name}
              </h1>

              {room.description && (
                <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {room.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <User className="w-4 h-4 text-blue-600" />
                  МОЛ (Отговорник):{' '}
                  <strong className="text-navy-900">
                    {room.responsible_person || 'Не е посочено'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCreateItemInRoom(room.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Добави актив тук</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWallSheet(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-semibold transition-colors"
              title="Печат на официален стенен опис за поставяне до вратата на кабинета"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Стенен опис (A4)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRoomLabels(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-semibold transition-colors"
              title="Генерирай и отпечатай QR етикети за всички активи в това помещение"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
              <span>QR Етикети</span>
            </button>

            <button
              type="button"
              onClick={() => onEditRoom(room)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-semibold transition-colors"
              title="Редактирай данни за залата"
            >
              <Edit2 className="w-4 h-4 text-slate-600" />
              <span>Редакция</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleArchiveRoom(room.id, !room.is_archived)}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-amber-700 transition-colors"
              title={room.is_archived ? 'Възстанови помещението' : 'Архивирай помещението'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Stats Cards for the Room */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mb-1">
              Брой активи
            </span>
            <div className="text-xl sm:text-2xl font-heading font-bold text-navy-900">
              {stats.totalUnits} <span className="text-xs font-normal text-slate-500">бр.</span>
            </div>
            <span className="text-[11px] text-slate-500">
              в <strong>{stats.positionsCount}</strong> заведени позиции
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
              Обща стойност (€)
            </span>
            <div className="text-xl sm:text-2xl font-heading font-bold text-emerald-800">
              {formatEur(stats.totalValueEur)}
            </div>
            <span className="text-[11px] text-slate-500">придобивна цена</span>
          </div>

          <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-100">
            <span className="text-[11px] font-semibold text-cyan-700 uppercase tracking-wider block mb-1">
              В Гаранция
            </span>
            <div className="text-xl sm:text-2xl font-heading font-bold text-navy-900">
              {stats.inWarrantyCount}
            </div>
            <span className="text-[11px] text-slate-500">активен сервизен срок</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
              За ремонт / Липсващи
            </span>
            <div className="text-xl sm:text-2xl font-heading font-bold text-amber-800">
              {stats.needsRepairCount + stats.missingCount}
            </div>
            <span className="text-[11px] text-slate-500">
              {stats.needsRepairCount} за ремонт • {stats.missingCount} липсващи
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Asset Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-0.5 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" />
              <span>Оборудване в {room.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-0">
              Единен инвентарен запис: всяка промяна тук се отразява незабавно и в общия училищен регистър.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Показани са <strong>{filteredItems.length}</strong> от {roomItems.length} позиции
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търсене по инв. №, модел, сериен №..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
          >
            <option value="all">Всички категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
          >
            <option value="all">Всички състояния</option>
            {Object.entries(CONDITION_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        {/* Items Table */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Boxes className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-navy-900 mb-0">
              Няма намерени активи в това помещение
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-0">
              Използвайте бутона „Добави актив тук“ или преместете оборудване от друго помещение.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Инв. номер</th>
                  <th className="py-3 px-3.5">Наименование и Модел</th>
                  <th className="py-3 px-3.5">Категория</th>
                  <th className="py-3 px-3.5 text-center">Кол.</th>
                  <th className="py-3 px-3.5 text-right">Стойност (€)</th>
                  <th className="py-3 px-3.5">Гаранция</th>
                  <th className="py-3 px-3.5">Състояние</th>
                  <th className="py-3 px-3.5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredItems.map((it) => {
                  const condMeta = CONDITION_META[it.condition] || CONDITION_META.good;
                  const cat = categories.find((c) => c.id === it.category_id);
                  const isIndividual = it.tracking_type === 'individual' || !it.tracking_type;
                  const qty = it.quantity || 1;
                  const totalItemVal = (it.purchase_price || 0) * qty;

                  const isWarrantyActive =
                    it.warranty_until && new Date(it.warranty_until).getTime() > Date.now();

                  return (
                    <tr key={it.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Inv Code + Tracking Type Badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-navy-900 text-xs px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                            {it.inventory_code}
                          </code>
                          <span
                            className={cn(
                              'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                              isIndividual
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            )}
                            title={isIndividual ? 'Индивидуален актив с уникален QR код' : 'Групова количествена позиция'}
                          >
                            {isIndividual ? 'Инд.' : 'Парт.'}
                          </span>
                        </div>
                      </td>

                      {/* Name & Model */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-navy-900">{it.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {it.manufacturer || it.brand_or_model}
                          {it.model ? ` • ${it.model}` : ''}
                          {it.serial_number && (
                            <span className="font-mono ml-1 text-slate-400">
                              (S/N: {it.serial_number})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        {cat?.name || 'Общо оборудване'}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3.5 text-center font-bold text-navy-900">
                        {qty}
                      </td>

                      {/* Value in EUR */}
                      <td className="py-3 px-3.5 text-right font-bold text-navy-900 whitespace-nowrap">
                        {totalItemVal > 0 ? formatEur(totalItemVal) : '—'}
                      </td>

                      {/* Warranty */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-xs">
                        {it.warranty_until ? (
                          isWarrantyActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {new Date(it.warranty_until).toLocaleDateString('bg-BG')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                              Изтекла ({new Date(it.warranty_until).toLocaleDateString('bg-BG')})
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Condition Badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                            condMeta.colorClass
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', condMeta.dotColor)} />
                          {condMeta.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {isIndividual && (
                            <button
                              type="button"
                              onClick={() => setQrItem(it)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Преглед на QR код и печат на етикет"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onMoveItemClick(it)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Премести в друго помещение"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRepairTicketClick(it)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Заяви ремонт / сервиз"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditItem(it)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                            title="Редактирай актив"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onWriteOffClick(it)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Маркирай като бракуван"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Preview Modal */}
      {qrItem && (
        <ModuleModal
          isOpen={true}
          title={`Инвентарен QR Етикет: ${qrItem.inventory_code}`}
          onClose={() => setQrItem(null)}
          size="md"
        >
          <div className="space-y-4">
            <QrCodeDisplay
              inventoryCode={qrItem.inventory_code}
              assetName={qrItem.name}
              roomName={room.name}
              schoolName={schoolName}
              serialNumber={qrItem.serial_number}
              size={220}
              showLabelSheetButton={true}
              onOpenLabelSheet={() => {
                setQrItem(null);
                setShowRoomLabels(true);
              }}
            />
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <div>
                <strong>Модел:</strong> {qrItem.brand_or_model || qrItem.model || '—'}
              </div>
              <div>
                <strong>Материално отговорно лице:</strong>{' '}
                {qrItem.assigned_to || room.responsible_person || 'Не е зададено'}
              </div>
              <div>
                <strong>Помещение:</strong> {room.name} (№ {room.room_number || '—'})
              </div>
            </div>
          </div>
        </ModuleModal>
      )}

      {/* Printable Wall Sheet Modal (A4) */}
      {showWallSheet && (
        <ModuleModal
          isOpen={true}
          title={`Стенен опис на оборудването (A4): ${room.name}`}
          onClose={() => setShowWallSheet(false)}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span>
                Официален опис на материалните активи за разпечатване на хартиен носител (А4) и
                поставяне на видно място в помещението.
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shrink-0 shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Печат</span>
              </button>
            </div>

            {/* Printable Sheet View */}
            <div
              id="printable-wall-sheet"
              className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 text-navy-900 space-y-5 print:border-none print:p-0 print:m-0"
            >
              {/* Official Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="text-xs font-semibold tracking-wider uppercase text-slate-600">
                  {schoolName}
                </div>
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900">
                  СТЕНЕН ИНВЕНТАРЕН ОПИС НА НАЛИЧНОТО ОБОРУДВАНЕ
                </h2>
                <div className="text-sm font-semibold text-slate-700">
                  Помещение: <strong>{room.name}</strong> {room.room_number ? `(Кабинет № ${room.room_number})` : ''}
                </div>
                <div className="text-xs text-slate-600 flex justify-center gap-4 pt-1">
                  <span>Тип: {roomTypeLabel}</span>
                  {(room.building || room.floor || room.building_or_floor) && (
                    <span>
                      Местоположение: {room.building ? `${room.building}, ` : ''}
                      {room.floor || room.building_or_floor}
                    </span>
                  )}
                  <span>МОЛ: {room.responsible_person || '..........................'}</span>
                </div>
              </div>

              {/* Table of Assets */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 bg-slate-100 font-bold">
                      <th className="py-2 px-2 border border-slate-300 w-10 text-center">№</th>
                      <th className="py-2 px-2 border border-slate-300">Инв. номер</th>
                      <th className="py-2 px-2 border border-slate-300">Наименование и технически характеристики</th>
                      <th className="py-2 px-2 border border-slate-300">Сериен №</th>
                      <th className="py-2 px-2 border border-slate-300 text-center">Кол.</th>
                      <th className="py-2 px-2 border border-slate-300 text-right">Стойност (€)</th>
                      <th className="py-2 px-2 border border-slate-300">Състояние</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {roomItems.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="py-1.5 px-2 border border-slate-300 text-center font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 font-mono font-bold">
                          {it.inventory_code}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300">
                          <div className="font-semibold">{it.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {it.manufacturer || it.brand_or_model} {it.model ? ` • ${it.model}` : ''}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 font-mono text-[11px]">
                          {it.serial_number || '—'}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 text-center font-bold">
                          {it.quantity || 1}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 text-right font-medium">
                          {it.purchase_price ? formatEur(it.purchase_price * (it.quantity || 1)) : '—'}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 text-[11px]">
                          {CONDITION_META[it.condition]?.label || 'В изправност'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 bg-slate-50 font-bold">
                      <td colSpan={4} className="py-2 px-2 border border-slate-300 text-right">
                        ОБЩО ЗА ПОМЕЩЕНИЕТО:
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-center">
                        {stats.totalUnits} бр.
                      </td>
                      <td className="py-2 px-2 border border-slate-300 text-right text-emerald-800">
                        {formatEur(stats.totalValueEur)}
                      </td>
                      <td className="py-2 px-2 border border-slate-300"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures Footer */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="font-semibold mb-6">
                    Материално отговорно лице (МОЛ):
                  </div>
                  <div>
                    Подпис: ........................................ / {room.responsible_person || '..........................'} /
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-6">
                    Училищна комисия по инвентаризация / Директор:
                  </div>
                  <div>
                    Подпис: ........................................ / ........................................ /
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 text-center pt-2">
                Дата на утвърждаване: {todayFormatted} г. • Генерирано от TideLayer SaaS
              </div>
            </div>
          </div>
        </ModuleModal>
      )}

      {/* Room QR Labels Sheet Modal (A4 Grid) */}
      {showRoomLabels && (
        <ModuleModal
          isOpen={true}
          title={`QR Етикети за печат (А4): ${room.name}`}
          onClose={() => setShowRoomLabels(false)}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span>
                Лист с инвентарни QR стикери за индивидуалните активи в това помещение, форматиран
                за самозалепващи се А4 етикети.
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shrink-0 shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Печат на стикери</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto p-2">
              {roomItems
                .filter((it) => it.tracking_type === 'individual' || !it.tracking_type)
                .map((it) => (
                  <div
                    key={it.id}
                    className="p-3 border-2 border-slate-300 rounded-xl bg-white flex flex-col justify-between gap-2 shadow-2xs print:border-black print:break-inside-avoid"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 truncate">
                        {schoolName}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {room.room_number ? `Зала ${room.room_number}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="shrink-0 bg-white p-1 rounded border border-slate-200">
                        <QrCodeDisplay
                          inventoryCode={it.inventory_code}
                          assetName={it.name}
                          roomName={room.name}
                          schoolName={schoolName}
                          size={70}
                          showActions={false}
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <code className="text-xs font-mono font-bold text-navy-900 block truncate">
                          {it.inventory_code}
                        </code>
                        <div className="text-[11px] font-bold text-navy-900 line-clamp-2 leading-tight">
                          {it.name}
                        </div>
                        {it.serial_number && (
                          <div className="text-[9px] font-mono text-slate-500 truncate">
                            S/N: {it.serial_number}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-1 flex items-center justify-between text-[9px] text-slate-500">
                      <span className="truncate">{room.name}</span>
                      <span>МОЛ: {it.assigned_to || room.responsible_person || '—'}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </ModuleModal>
      )}
    </div>
  );
}
