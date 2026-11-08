import { useState, useMemo } from 'react';
import {
  Boxes,
  Edit2,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  Wrench,
} from 'lucide-react';
import type {
  InventoryCategory,
  InventoryItem,
  InventoryRoom,
  ItemCondition,
} from '../types';
import { CONDITION_META, formatEur } from '../types';
import type { CreateItemInput } from '../useInventoryStore';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface InventoryItemsViewProps {
  items: InventoryItem[];
  rooms: InventoryRoom[];
  categories: InventoryCategory[];
  onCreateItem: (input: CreateItemInput) => Promise<InventoryItem>;
  onEditItem: (id: string, patch: Partial<CreateItemInput>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<boolean>;
  onCreateRepairTicket: (
    itemId: string,
    problemTitle: string,
    details: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ) => Promise<void>;
  getNextCode: () => string;
}

export function InventoryItemsView({
  items,
  rooms,
  categories,
  onCreateItem,
  onEditItem,
  onDeleteItem,
  onCreateRepairTicket,
  getNextCode,
}: InventoryItemsViewProps) {
  // Filters & Search
  const [nowMs] = useState(() => Date.now());
  const [search, setSearch] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [invCode, setInvCode] = useState('');
  const [brand, setBrand] = useState('');
  const [serial, setSerial] = useState('');
  const [roomId, setRoomId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyUntil, setWarrantyUntil] = useState('');
  const [priceEur, setPriceEur] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Repair Dialog State (Cross-Module)
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [repairItem, setRepairItem] = useState<InventoryItem | null>(null);
  const [repairTitle, setRepairTitle] = useState('');
  const [repairDetails, setRepairDetails] = useState('');
  const [repairPriority, setRepairPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [submittingRepair, setSubmittingRepair] = useState(false);

  // Filtered Items
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (selectedRoomId !== 'all' && it.room_id !== selectedRoomId) return false;
      if (selectedCatId !== 'all' && it.category_id !== selectedCatId) return false;
      if (selectedCondition !== 'all' && it.condition !== selectedCondition) return false;

      if (q) {
        const matchesName = it.name.toLowerCase().includes(q);
        const matchesCode = it.inventory_code.toLowerCase().includes(q);
        const matchesSerial = it.serial_number?.toLowerCase().includes(q) || false;
        const matchesMol = it.assigned_to?.toLowerCase().includes(q) || false;
        const matchesBrand = it.brand_or_model?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesCode && !matchesSerial && !matchesMol && !matchesBrand) {
          return false;
        }
      }
      return true;
    });
  }, [items, search, selectedRoomId, selectedCatId, selectedCondition]);

  const totalFilteredValue = useMemo(() => {
    return filtered.reduce(
      (acc, it) => acc + (it.purchase_price ? it.purchase_price * (it.quantity || 1) : 0),
      0
    );
  }, [filtered]);

  // Open Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setName('');
    setInvCode(getNextCode());
    setBrand('');
    setSerial('');
    setRoomId(rooms[0]?.id || '');
    setCategoryId(categories[0]?.id || '');
    setAssignedTo(rooms[0]?.responsible_person || '');
    setQuantity(1);
    setCondition('good');
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setWarrantyUntil('');
    setPriceEur('');
    setNotes('');
    setModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (it: InventoryItem) => {
    setEditingItem(it);
    setName(it.name);
    setInvCode(it.inventory_code);
    setBrand(it.brand_or_model || '');
    setSerial(it.serial_number || '');
    setRoomId(it.room_id || '');
    setCategoryId(it.category_id || '');
    setAssignedTo(it.assigned_to || '');
    setQuantity(it.quantity || 1);
    setCondition(it.condition);
    setPurchaseDate(it.purchase_date || '');
    setWarrantyUntil(it.warranty_until || '');
    setPriceEur(it.purchase_price !== null && it.purchase_price !== undefined ? String(it.purchase_price) : '');
    setNotes(it.notes || '');
    setModalOpen(true);
  };

  // Submit Save
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const priceNum = priceEur.trim() ? parseFloat(priceEur.replace(',', '.')) : null;

    if (editingItem) {
      await onEditItem(editingItem.id, {
        name: name.trim(),
        inventory_code: invCode.trim(),
        brand_or_model: brand.trim() || undefined,
        serial_number: serial.trim() || undefined,
        room_id: roomId || null,
        category_id: categoryId || null,
        assigned_to: assignedTo.trim() || undefined,
        quantity,
        condition,
        purchase_date: purchaseDate || undefined,
        warranty_until: warrantyUntil || undefined,
        purchase_price: priceNum,
        notes: notes.trim() || undefined,
      });
    } else {
      await onCreateItem({
        name: name.trim(),
        inventory_code: invCode.trim(),
        brand_or_model: brand.trim() || undefined,
        serial_number: serial.trim() || undefined,
        room_id: roomId || null,
        category_id: categoryId || null,
        assigned_to: assignedTo.trim() || undefined,
        quantity,
        condition,
        purchase_date: purchaseDate || undefined,
        warranty_until: warrantyUntil || undefined,
        purchase_price: priceNum,
        notes: notes.trim() || undefined,
      });
    }

    setSubmitting(false);
    setModalOpen(false);
  };

  // Open Repair Dialog
  const handleOpenRepair = (it: InventoryItem) => {
    setRepairItem(it);
    setRepairTitle(`Сервиз / Ремонт: ${it.name}`);
    setRepairDetails(`Технически проблем с ${it.name} (Инв. № ${it.inventory_code}). Изисква оглед или сервиз.`);
    setRepairPriority('high');
    setRepairModalOpen(true);
  };

  const handleSubmitRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairItem) return;
    setSubmittingRepair(true);

    await onCreateRepairTicket(
      repairItem.id,
      repairTitle.trim(),
      repairDetails.trim(),
      repairPriority
    );

    setSubmittingRepair(false);
    setRepairModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & New Button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            <span>Списък с училищен инвентар</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Заведени активи, техника, оборудване и обзавеждане
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Нов инвентарен актив</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търсене по наименование, инв. код, сериен номер, марка или МОЛ..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'table' ? 'bg-white text-navy-900 shadow-2xs' : 'text-slate-500'
              )}
              title="Табличен изглед"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-semibold transition-all',
                viewMode === 'cards' ? 'bg-white text-navy-900 shadow-2xs' : 'text-slate-500'
              )}
              title="Картичен изглед"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Кабинет / Помещение:
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Всички кабинети ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Категория на актива:
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Всички категории ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Състояние на актива:
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Всички състояния</option>
              <option value="new">Отлично (Ново)</option>
              <option value="good">Добро (Изправно)</option>
              <option value="needs_repair">За ремонт / Сервиз</option>
              <option value="written_off">Бракувано</option>
              <option value="missing">Липсващо</option>
            </select>
          </div>
        </div>

        {/* Counter Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Показани <strong>{filtered.length}</strong> от {items.length} заведени позиции
          </span>
          <span>
            Обща стойност на филтрираните: <strong className="text-emerald-700">{formatEur(totalFilteredValue)}</strong>
          </span>
        </div>
      </div>

      {/* ITEMS LIST (TABLE VIEW) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Инв. Код</th>
                  <th className="px-4 py-3">Наименование и Модел</th>
                  <th className="px-4 py-3">Кабинет</th>
                  <th className="px-4 py-3">МОЛ / Отговорник</th>
                  <th className="px-4 py-3 text-center">Брой</th>
                  <th className="px-4 py-3 text-right">Ед. Цена (€)</th>
                  <th className="px-4 py-3">Състояние</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                      Няма намерени инвентарни активи по избраните критерии.
                    </td>
                  </tr>
                ) : (
                  filtered.map((it) => {
                    const cMeta = CONDITION_META[it.condition] || CONDITION_META.good;
                    const inWarranty = it.warranty_until && new Date(it.warranty_until).getTime() > nowMs;

                    return (
                      <tr key={it.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-navy-900 whitespace-nowrap">
                          {it.inventory_code}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-navy-900">
                            {it.name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            {it.brand_or_model && <span>{it.brand_or_model}</span>}
                            {it.serial_number && <span>SN: {it.serial_number}</span>}
                            {inWarranty && (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                В гаранция
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                          {it.room_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {it.assigned_to || '—'}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-navy-900">
                          {it.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                          {formatEur(it.purchase_price)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
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
                          <div className="flex items-center justify-end gap-1">
                            {/* Cross-Module Repair Request Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenRepair(it)}
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Подай заявка за ремонт в модул Заявки"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(it)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                              title="Редактирай"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetId(it.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Изтрий"
                            >
                              <Trash2 className="w-4 h-4" />
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
      ) : (
        /* ITEMS LIST (CARDS VIEW) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it) => {
            const cMeta = CONDITION_META[it.condition] || CONDITION_META.good;
            const inWarranty = it.warranty_until && new Date(it.warranty_until).getTime() > nowMs;

            return (
              <div
                key={it.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {it.inventory_code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {inWarranty && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Гаранция
                        </span>
                      )}
                      <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-md border', cMeta.badge)}>
                        {cMeta.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-heading font-bold text-navy-900 leading-snug">
                    {it.name}
                  </h3>

                  <div className="text-xs text-slate-600 space-y-1">
                    {it.brand_or_model && <div>Модел: <strong>{it.brand_or_model}</strong></div>}
                    <div>Кабинет: <strong>{it.room_name}</strong></div>
                    <div>МОЛ: <strong>{it.assigned_to || 'Не е посочен'}</strong></div>
                    {it.serial_number && <div>SN: <code className="font-mono text-slate-700">{it.serial_number}</code></div>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Количество: <strong>{it.quantity} бр.</strong></span>
                    <div className="font-bold text-emerald-700 text-sm">{formatEur(it.purchase_price)}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenRepair(it)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition-colors flex items-center gap-1 border border-amber-200"
                      title="Подай заявка за ремонт"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Заявка</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(it)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(it.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT ITEM MODAL */}
      <ModuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Редактиране на актив' : 'Завеждане на нов инвентарен актив'}
        subtitle="Въведете детайли за актива, инвентарен номер и отговорник"
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Инвентарен номер *
              </label>
              <input
                type="text"
                required
                value={invCode}
                onChange={(e) => setInvCode(e.target.value)}
                placeholder="напр. INV-2026-0042"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Наименование на актива *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="напр. Интерактивен дисплей 75"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Марка / Модел
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="напр. Clevertouch Impact Plus"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Сериен номер (SN)
              </label>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="напр. SN99182374"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Кабинет / Помещение
              </label>
              <select
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  const found = rooms.find((r) => r.id === e.target.value);
                  if (found?.responsible_person && !assignedTo) {
                    setAssignedTo(found.responsible_person);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Изберете помещение --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Категория
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Изберете категория --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                МОЛ / Отговорник
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="инж. Георги Димитров"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Количество
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Единична цена в Евро (€)
              </label>
              <input
                type="text"
                value={priceEur}
                onChange={(e) => setPriceEur(e.target.value)}
                placeholder="напр. 650.00"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Състояние
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="new">Отлично (Ново)</option>
                <option value="good">Добро (Изправно)</option>
                <option value="needs_repair">За ремонт / Сервиз</option>
                <option value="written_off">Бракувано</option>
                <option value="missing">Липсващо</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Дата на придобиване
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Гаранция до дата
              </label>
              <input
                type="date"
                value={warrantyUntil}
                onChange={(e) => setWarrantyUntil(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Бележки и спецификации
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Допълнителни данни за актива..."
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
              {submitting ? 'Запазване...' : 'Запази актива'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* CROSS-MODULE REPAIR TICKET MODAL */}
      <ModuleModal
        open={repairModalOpen}
        onClose={() => setRepairModalOpen(false)}
        title="Подаване на заявка за ремонт към системата за заявки"
        subtitle="Автоматично ще бъде създадена нова работна задача за техническия екип"
        maxWidthClass="max-w-lg"
      >
        {repairItem && (
          <form onSubmit={handleSubmitRepair} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-700" />
                <span>Засегнат актив: {repairItem.name}</span>
              </div>
              <div className="text-amber-800">
                Инв. код: <strong>{repairItem.inventory_code}</strong> • Помещение:{' '}
                <strong>{repairItem.room_name}</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Заглавие на проблема *
              </label>
              <input
                type="text"
                required
                value={repairTitle}
                onChange={(e) => setRepairTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Спешност / Приоритет
              </label>
              <select
                value={repairPriority}
                onChange={(e) =>
                  setRepairPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Нисък</option>
                <option value="medium">Нормален</option>
                <option value="high">Висок</option>
                <option value="urgent">Спешен</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Описание на повредата и симптоми *
              </label>
              <textarea
                rows={3}
                required
                value={repairDetails}
                onChange={(e) => setRepairDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRepairModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={submittingRepair}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-2xs"
              >
                {submittingRepair ? 'Изпращане...' : 'Изпрати заявката'}
              </button>
            </div>
          </form>
        )}
      </ModuleModal>

      {/* DELETE CONFIRM */}
      <ModuleConfirmDialog
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) await onDeleteItem(deleteTargetId);
        }}
        title="Изтриване на инвентарен актив"
        confirmLabel="Изтрий актива"
        tone="danger"
        description="Сигурни ли сте, че искате да изтриете този актив от инвентара? Действието се записва в системния журнал."
      />
    </div>
  );
}
