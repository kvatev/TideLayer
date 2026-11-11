import { useState, useMemo, useEffect } from 'react';
import {
  Archive,
  ArrowRightLeft,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Edit2,
  Euro,
  FileSpreadsheet,
  FileText,
  History,
  LayoutGrid,
  List,
  Plus,
  Printer,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  Split,
  Tag,
  Trash2,
  Upload,
  User,
  Wrench,
  X,
} from 'lucide-react';
import type {
  CreateItemInput,
  InventoryCategory,
  InventoryItem,
  InventoryMovement,
  InventoryRoom,
  ItemCondition,
  TrackingType,
} from '../types';
import { CONDITION_META, formatEur } from '../types';
import { QrCodeDisplay } from './QrCodeDisplay';
import { CsvImportModal } from './CsvImportModal';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface InventoryItemsViewProps {
  items: InventoryItem[];
  rooms: InventoryRoom[];
  categories: InventoryCategory[];
  movements: InventoryMovement[];
  schoolName: string;
  onCreateItem: (input: CreateItemInput) => Promise<InventoryItem>;
  onEditItem: (id: string, patch: Partial<InventoryItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<boolean>;
  onWriteOffItem: (id: string, reason: string, date?: string) => Promise<void>;
  onArchiveItem: (id: string, archived: boolean) => Promise<void>;
  onSplitBatchItem: (id: string, splitCount: number, codes?: string[]) => Promise<void>;
  onMoveItem: (itemId: string, targetRoomId: string, targetMol?: string, notes?: string) => Promise<void>;
  onCreateRepairTicket: (
    itemId: string,
    problemTitle: string,
    details: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ) => Promise<void>;
  onExportCsv: (scope?: 'all' | 'active' | 'in_warranty' | 'needs_repair' | 'written_off') => void;
  onBulkImport: (items: CreateItemInput[]) => Promise<number>;
  getNextCode: () => string;
  initialFocusedItemId?: string | null;
}

export function InventoryItemsView({
  items,
  rooms,
  categories,
  movements,
  schoolName,
  onCreateItem,
  onEditItem,
  onDeleteItem,
  onWriteOffItem,
  onArchiveItem,
  onSplitBatchItem,
  onMoveItem,
  onCreateRepairTicket,
  onExportCsv,
  onBulkImport,
  getNextCode,
  initialFocusedItemId,
}: InventoryItemsViewProps) {
  const [nowMs] = useState(() => Date.now());

  // Tabs: Active, Archived, Written-Off
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'written_off'>('active');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedTracking, setSelectedTracking] = useState<'all' | 'individual' | 'batch'>('all');
  const [onlyWarranty, setOnlyWarranty] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Drawer / Detail Modal
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);

  // Focus item if passed externally
  useEffect(() => {
    if (initialFocusedItemId) {
      const target = items.find((i) => i.id === initialFocusedItemId);
      if (target) {
        setDetailItem(target);
      }
    }
  }, [initialFocusedItemId, items]);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [invCode, setInvCode] = useState('');
  const [trackingType, setTrackingType] = useState<TrackingType>('individual');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [roomId, setRoomId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyUntil, setWarrantyUntil] = useState('');
  const [priceEur, setPriceEur] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // CSV Import Modal
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  // Split Batch Modal
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [splitItem, setSplitItem] = useState<InventoryItem | null>(null);
  const [splitCount, setSplitCount] = useState<number>(1);
  const [splitCodesInput, setSplitCodesInput] = useState<string>('');

  // Relocation Modal
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTargetItem, setMoveTargetItem] = useState<InventoryItem | null>(null);
  const [targetRoomId, setTargetRoomId] = useState('');
  const [targetMol, setTargetMol] = useState('');
  const [moveNotes, setMoveNotes] = useState('');
  const [moving, setMoving] = useState(false);

  // Write-Off Modal
  const [writeOffModalOpen, setWriteOffModalOpen] = useState(false);
  const [writeOffItem, setWriteOffItem] = useState<InventoryItem | null>(null);
  const [writeOffReason, setWriteOffReason] = useState('');
  const [writeOffDate, setWriteOffDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Repair Dialog State (Cross-Module)
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [repairItem, setRepairItem] = useState<InventoryItem | null>(null);
  const [repairTitle, setRepairTitle] = useState('');
  const [repairDetails, setRepairDetails] = useState('');
  const [repairPriority, setRepairPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [submittingRepair, setSubmittingRepair] = useState(false);

  // Single QR Modal
  const [qrModalItem, setQrModalItem] = useState<InventoryItem | null>(null);

  // Room lookup helper
  const roomMap = useMemo(() => {
    return new Map(rooms.map((r) => [r.id, r]));
  }, [rooms]);

  // Category lookup helper
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      active: items.filter((i) => !i.is_archived && !i.is_written_off).length,
      archived: items.filter((i) => i.is_archived).length,
      written_off: items.filter((i) => i.is_written_off).length,
    };
  }, [items]);

  // Filtered items
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      // Tab filter
      if (activeTab === 'active') {
        if (it.is_archived || it.is_written_off) return false;
      } else if (activeTab === 'archived') {
        if (!it.is_archived) return false;
      } else if (activeTab === 'written_off') {
        if (!it.is_written_off) return false;
      }

      // Room & Category
      if (selectedRoomId !== 'all' && it.room_id !== selectedRoomId) return false;
      if (selectedCatId !== 'all' && it.category_id !== selectedCatId) return false;
      if (selectedCondition !== 'all' && it.condition !== selectedCondition) return false;

      // Tracking type
      if (selectedTracking === 'individual' && it.tracking_type === 'batch') return false;
      if (selectedTracking === 'batch' && it.tracking_type !== 'batch') return false;

      // Warranty filter
      if (onlyWarranty) {
        if (!it.warranty_until || new Date(it.warranty_until).getTime() <= nowMs) {
          return false;
        }
      }

      // Search
      if (q) {
        const matchesName = it.name.toLowerCase().includes(q);
        const matchesCode = it.inventory_code.toLowerCase().includes(q);
        const matchesSerial = it.serial_number?.toLowerCase().includes(q) || false;
        const matchesMol = it.assigned_to?.toLowerCase().includes(q) || false;
        const matchesBrand =
          (it.manufacturer || it.brand_or_model || '').toLowerCase().includes(q) ||
          (it.model || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesSerial && !matchesMol && !matchesBrand) {
          return false;
        }
      }

      return true;
    });
  }, [
    items,
    activeTab,
    selectedRoomId,
    selectedCatId,
    selectedCondition,
    selectedTracking,
    onlyWarranty,
    search,
    nowMs,
  ]);

  // Total filtered summary
  const summary = useMemo(() => {
    let units = 0;
    let valueEur = 0;
    filtered.forEach((it) => {
      const q = it.quantity || 1;
      units += q;
      if (it.purchase_price) {
        valueEur += it.purchase_price * q;
      }
    });
    return { units, positions: filtered.length, valueEur };
  }, [filtered]);

  // Open Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setName('');
    setInvCode(getNextCode());
    setTrackingType('individual');
    setManufacturer('');
    setModel('');
    setSerial('');
    setRoomId(rooms[0]?.id || '');
    setCategoryId(categories[0]?.id || '');
    setAssignedTo(rooms[0]?.responsible_person || '');
    setQuantity(1);
    setCondition('good');
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setWarrantyUntil('');
    setPriceEur('');
    setDescription('');
    setModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (it: InventoryItem) => {
    setEditingItem(it);
    setName(it.name);
    setInvCode(it.inventory_code);
    setTrackingType(it.tracking_type || 'individual');
    setManufacturer(it.manufacturer || it.brand_or_model || '');
    setModel(it.model || '');
    setSerial(it.serial_number || '');
    setRoomId(it.room_id || '');
    setCategoryId(it.category_id || '');
    setAssignedTo(it.assigned_to || '');
    setQuantity(it.quantity || 1);
    setCondition(it.condition);
    setPurchaseDate(it.purchase_date || '');
    setWarrantyUntil(it.warranty_until || '');
    setPriceEur(it.purchase_price !== undefined ? String(it.purchase_price) : '');
    setDescription(it.description || it.notes || '');
    setModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !invCode.trim()) return;
    setSubmitting(true);

    const priceNum = priceEur.trim() ? parseFloat(priceEur.replace(',', '.')) : undefined;

    try {
      if (editingItem) {
        await onEditItem(editingItem.id, {
          name: name.trim(),
          inventory_code: invCode.trim(),
          tracking_type: trackingType,
          manufacturer: manufacturer.trim() || undefined,
          model: model.trim() || undefined,
          brand_or_model: [manufacturer.trim(), model.trim()].filter(Boolean).join(' ') || undefined,
          serial_number: serial.trim() || undefined,
          room_id: roomId || undefined,
          category_id: categoryId,
          assigned_to: assignedTo.trim() || undefined,
          quantity: trackingType === 'batch' ? Math.max(1, quantity) : 1,
          condition,
          purchase_date: purchaseDate || undefined,
          warranty_until: warrantyUntil || undefined,
          purchase_price: priceNum !== undefined && !isNaN(priceNum) ? priceNum : undefined,
          description: description.trim() || undefined,
          notes: description.trim() || undefined,
        });
      } else {
        await onCreateItem({
          name: name.trim(),
          inventory_code: invCode.trim(),
          tracking_type: trackingType,
          manufacturer: manufacturer.trim() || undefined,
          model: model.trim() || undefined,
          brand_or_model: [manufacturer.trim(), model.trim()].filter(Boolean).join(' ') || undefined,
          serial_number: serial.trim() || undefined,
          room_id: roomId || undefined,
          category_id: categoryId,
          assigned_to: assignedTo.trim() || undefined,
          quantity: trackingType === 'batch' ? Math.max(1, quantity) : 1,
          condition,
          purchase_date: purchaseDate || undefined,
          warranty_until: warrantyUntil || undefined,
          purchase_price: priceNum !== undefined && !isNaN(priceNum) ? priceNum : undefined,
          description: description.trim() || undefined,
          notes: description.trim() || undefined,
        });
      }
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Relocation Modal
  const handleOpenMove = (it: InventoryItem) => {
    setMoveTargetItem(it);
    setTargetRoomId(rooms.find((r) => r.id !== it.room_id)?.id || rooms[0]?.id || '');
    setTargetMol(it.assigned_to || '');
    setMoveNotes('');
    setMoveModalOpen(true);
  };

  // Execute Relocation
  const handleConfirmMove = async () => {
    if (!moveTargetItem || !targetRoomId) return;
    setMoving(true);
    try {
      await onMoveItem(
        moveTargetItem.id,
        targetRoomId,
        targetMol.trim() || undefined,
        moveNotes.trim() || undefined
      );
      setMoveModalOpen(false);
      // update detailItem if open
      if (detailItem?.id === moveTargetItem.id) {
        setDetailItem((prev) => (prev ? { ...prev, room_id: targetRoomId, assigned_to: targetMol } : null));
      }
    } finally {
      setMoving(false);
    }
  };

  // Open Split Modal
  const handleOpenSplit = (it: InventoryItem) => {
    setSplitItem(it);
    setSplitCount(1);
    setSplitCodesInput('');
    setSplitModalOpen(true);
  };

  // Confirm Split
  const handleConfirmSplit = async () => {
    if (!splitItem) return;
    const codes = splitCodesInput
      .split(/[\n,;]+/)
      .map((c) => c.trim())
      .filter(Boolean);
    await onSplitBatchItem(splitItem.id, splitCount, codes.length > 0 ? codes : undefined);
    setSplitModalOpen(false);
    if (detailItem?.id === splitItem.id) {
      setDetailItem(null);
    }
  };

  // Open Write-Off Modal
  const handleOpenWriteOff = (it: InventoryItem) => {
    setWriteOffItem(it);
    setWriteOffReason('');
    setWriteOffDate(new Date().toISOString().slice(0, 10));
    setWriteOffModalOpen(true);
  };

  const handleConfirmWriteOff = async () => {
    if (!writeOffItem) return;
    await onWriteOffItem(writeOffItem.id, writeOffReason.trim() || 'Бракуван по решение на комисия', writeOffDate);
    setWriteOffModalOpen(false);
    if (detailItem?.id === writeOffItem.id) {
      setDetailItem(null);
    }
  };

  // Open Repair Ticket
  const handleOpenRepair = (it: InventoryItem) => {
    setRepairItem(it);
    setRepairTitle(`Повреда на ${it.name} (${it.inventory_code})`);
    setRepairDetails(`Заявка за ремонт/сервиз на инвентарен актив ${it.inventory_code} в ${roomMap.get(it.room_id || '')?.name || 'неустановено помещение'}.`);
    setRepairPriority('high');
    setRepairModalOpen(true);
  };

  const handleConfirmRepair = async () => {
    if (!repairItem || !repairTitle.trim()) return;
    setSubmittingRepair(true);
    try {
      await onCreateRepairTicket(repairItem.id, repairTitle.trim(), repairDetails.trim(), repairPriority);
      setRepairModalOpen(false);
    } finally {
      setSubmittingRepair(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            <span>Единен регистър на училищните активи</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Централизирано управление на цялото оборудване: компютри, дисплеи, пособия и мебели.
          </p>
        </div>

        {/* Top Buttons: Import, Export, Add */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCsvImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-semibold transition-colors"
            title="Групов импорт от Excel / CSV файл"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Импорт от Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onExportCsv(activeTab === 'written_off' ? 'written_off' : 'active')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-semibold transition-colors"
            title="Експорт на регистъра в CSV / Excel файл"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Експорт</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Нов актив</span>
          </button>
        </div>
      </div>

      {/* Tabs and Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Active / Archived / Written-Off Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeTab === 'active'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              Активен инвентар ({counts.active})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('written_off')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeTab === 'written_off'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              Бракувани ({counts.written_off})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeTab === 'archived'
                  ? 'bg-white text-slate-700 shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              Архив ({counts.archived})
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>
              Позиции: <strong className="text-navy-900">{summary.positions}</strong>
            </span>
            <span>•</span>
            <span>
              Физически единици: <strong className="text-navy-900">{summary.units} бр.</strong>
            </span>
            <span>•</span>
            <span>
              Стойност: <strong className="text-emerald-700">{formatEur(summary.valueEur)}</strong>
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-1">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търсене по инв. номер, модел, сериен №, МОЛ..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Category */}
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

          {/* Room */}
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
          >
            <option value="all">Всички помещения</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} {r.room_number ? `(№ ${r.room_number})` : ''}
              </option>
            ))}
          </select>

          {/* Tracking Type */}
          <select
            value={selectedTracking}
            onChange={(e) => setSelectedTracking(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
          >
            <option value="all">Всички типове следене</option>
            <option value="individual">Индивидуални активи</option>
            <option value="batch">Количествени позиции</option>
          </select>

          {/* Condition */}
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

        {/* Sub-toggles: Warranty filter & Layout switch */}
        <div className="flex items-center justify-between gap-3 pt-2 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={onlyWarranty}
              onChange={(e) => setOnlyWarranty(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Покажи само активи с действаща гаранция</span>
          </label>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded text-xs transition-colors',
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
              )}
              title="Табличен изглед"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={cn(
                'p-1.5 rounded text-xs transition-colors',
                viewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
              )}
              title="Изглед с карти"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Listing View (Table or Cards) */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 bg-white rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Boxes className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-navy-900 mb-0">
            Няма намерени активи по избраните критерии
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-0">
            Опитайте да промените филтрите или добавете нов училищен актив с бутона горе.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Инв. номер</th>
                  <th className="py-3 px-3.5">Наименование и Модел</th>
                  <th className="py-3 px-3.5">Категория</th>
                  <th className="py-3 px-3.5">Помещение & МОЛ</th>
                  <th className="py-3 px-3.5 text-center">Кол.</th>
                  <th className="py-3 px-3.5 text-right">Стойност (€)</th>
                  <th className="py-3 px-3.5">Гаранция</th>
                  <th className="py-3 px-3.5">Състояние</th>
                  <th className="py-3 px-3.5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((it) => {
                  const condMeta = CONDITION_META[it.condition] || CONDITION_META.good;
                  const cat = categoryMap.get(it.category_id || '');
                  const room = roomMap.get(it.room_id || '');
                  const isIndividual = it.tracking_type === 'individual' || !it.tracking_type;
                  const qty = it.quantity || 1;
                  const totalVal = (it.purchase_price || 0) * qty;

                  const isWarrantyActive =
                    it.warranty_until && new Date(it.warranty_until).getTime() > nowMs;

                  return (
                    <tr
                      key={it.id}
                      onClick={() => setDetailItem(it)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      {/* Code + Type badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
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
                            title={isIndividual ? 'Индивидуален актив с уникален QR код' : 'Количествена партидна позиция'}
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
                        {cat?.name || '—'}
                      </td>

                      {/* Room & MOL */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-navy-900">
                          {room?.name || 'Без помещение'}
                          {room?.room_number ? ` (№ ${room.room_number})` : ''}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          МОЛ: {it.assigned_to || room?.responsible_person || '—'}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3.5 text-center font-bold text-navy-900">
                        {qty}
                      </td>

                      {/* Total Value */}
                      <td className="py-3 px-3.5 text-right font-bold text-navy-900 whitespace-nowrap">
                        {totalVal > 0 ? formatEur(totalVal) : '—'}
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
                            <span className="text-slate-400 text-[11px]">
                              Изтекла ({new Date(it.warranty_until).toLocaleDateString('bg-BG')})
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">—</span>
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

                      {/* Inline Actions */}
                      <td
                        className="py-3 px-3.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {isIndividual && (
                            <button
                              type="button"
                              onClick={() => setQrModalItem(it)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                              title="Инвентарен QR код"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenMove(it)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            title="Премести в друго помещение"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(it)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                            title="Редактирай актив"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((it) => {
            const condMeta = CONDITION_META[it.condition] || CONDITION_META.good;
            const room = roomMap.get(it.room_id || '');
            const isIndividual = it.tracking_type === 'individual' || !it.tracking_type;
            const qty = it.quantity || 1;
            const totalVal = (it.purchase_price || 0) * qty;

            return (
              <div
                key={it.id}
                onClick={() => setDetailItem(it)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
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
                      >
                        {isIndividual ? 'Индивидуален' : `Партида (${qty} бр.)`}
                      </span>
                    </div>

                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold',
                        condMeta.colorClass
                      )}
                    >
                      {condMeta.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-navy-900 text-base leading-snug">{it.name}</h3>

                  <div className="text-xs text-slate-500">
                    {it.manufacturer || it.brand_or_model} {it.model ? ` • ${it.model}` : ''}
                    {it.serial_number && <div>S/N: {it.serial_number}</div>}
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {room?.name || 'Без помещение'} {room?.room_number ? `(№ ${room.room_number})` : ''}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Стойност:</span>{' '}
                    <strong className="text-navy-900">{totalVal > 0 ? formatEur(totalVal) : '—'}</strong>
                  </div>
                  <div className="text-right text-blue-600 font-semibold hover:underline">
                    Детайли →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Asset Drawer / Modal */}
      {detailItem && (
        <ModuleModal
          isOpen={true}
          title={`Картон на актив: ${detailItem.name}`}
          onClose={() => setDetailItem(null)}
          size="lg"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold text-navy-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                    {detailItem.inventory_code}
                  </code>
                  <span
                    className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded',
                      detailItem.tracking_type === 'batch'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {detailItem.tracking_type === 'batch'
                      ? `Количествена партида (${detailItem.quantity} бр.)`
                      : 'Индивидуален актив'}
                  </span>
                </div>
                <div className="text-sm font-bold text-navy-900">{detailItem.name}</div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
                    CONDITION_META[detailItem.condition]?.colorClass
                  )}
                >
                  <span
                    className={cn('w-2 h-2 rounded-full', CONDITION_META[detailItem.condition]?.dotColor)}
                  />
                  {CONDITION_META[detailItem.condition]?.label}
                </span>

                {detailItem.is_written_off && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold">
                    Бракуван
                  </span>
                )}
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleOpenEdit(detailItem);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Редактирай</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenMove(detailItem)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs font-semibold transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Премести в друга зала</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenRepair(detailItem)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs font-semibold transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Заяви ремонт</span>
              </button>

              {detailItem.tracking_type === 'batch' && (detailItem.quantity || 1) > 1 && (
                <button
                  type="button"
                  onClick={() => handleOpenSplit(detailItem)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition-colors"
                >
                  <Split className="w-3.5 h-3.5 text-purple-600" />
                  <span>Раздели на индивидуални</span>
                </button>
              )}

              {!detailItem.is_written_off && (
                <button
                  type="button"
                  onClick={() => handleOpenWriteOff(detailItem)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Бракуване</span>
                </button>
              )}

              <button
                type="button"
                onClick={async () => {
                  await onArchiveItem(detailItem.id, !detailItem.is_archived);
                  setDetailItem(null);
                }}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                title={detailItem.is_archived ? 'Възстанови' : 'Архивирай'}
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 rounded-xl p-4 space-y-2.5 bg-white">
                <h4 className="font-bold text-navy-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Основни параметри</span>
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Производител:</span>
                  <span className="font-semibold text-navy-900">{detailItem.manufacturer || detailItem.brand_or_model || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Модел:</span>
                  <span className="font-semibold text-navy-900">{detailItem.model || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Сериен номер:</span>
                  <span className="font-mono font-semibold text-navy-900">{detailItem.serial_number || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Категория:</span>
                  <span className="font-semibold text-navy-900">{categoryMap.get(detailItem.category_id || '')?.name || '—'}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2.5 bg-white">
                <h4 className="font-bold text-navy-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Местоположение & Стойност</span>
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-500">Текущо помещение:</span>
                  <span className="font-semibold text-navy-900">{roomMap.get(detailItem.room_id || '')?.name || 'Без зала'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Материално отговорно лице:</span>
                  <span className="font-semibold text-navy-900">{detailItem.assigned_to || roomMap.get(detailItem.room_id || '')?.responsible_person || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Покупна цена:</span>
                  <span className="font-bold text-navy-900">{detailItem.purchase_price ? formatEur(detailItem.purchase_price) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Обща стойност ({detailItem.quantity || 1} бр.):</span>
                  <span className="font-bold text-emerald-700">
                    {detailItem.purchase_price ? formatEur(detailItem.purchase_price * (detailItem.quantity || 1)) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Гаранционен срок:</span>
                  <span className="font-semibold text-navy-900">
                    {detailItem.warranty_until ? new Date(detailItem.warranty_until).toLocaleDateString('bg-BG') : 'Няма'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description & Write-off info */}
            {detailItem.description && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <span className="font-bold block mb-0.5 text-navy-900">Описание / Бележки:</span>
                {detailItem.description}
              </div>
            )}

            {detailItem.is_written_off && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                <div className="font-bold">Информация за бракуване:</div>
                <div>Дата: {detailItem.written_off_date || '—'}</div>
                <div>Причина: {detailItem.written_off_reason || '—'}</div>
              </div>
            )}

            {/* QR Code and Label Section (for individual assets) */}
            {detailItem.tracking_type !== 'batch' && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>Инвентарен QR Етикет</span>
                </h4>
                <QrCodeDisplay
                  inventoryCode={detailItem.inventory_code}
                  assetName={detailItem.name}
                  roomName={roomMap.get(detailItem.room_id || '')?.name}
                  schoolName={schoolName}
                  serialNumber={detailItem.serial_number}
                  size={160}
                />
              </div>
            )}

            {/* Movement History Timeline */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
              <h4 className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-600" />
                <span>История на движенията на актива</span>
              </h4>

              {movements.filter((m) => m.item_id === detailItem.id).length === 0 ? (
                <div className="text-xs text-slate-400 py-2">
                  Няма регистрирани премествания между помещения за този актив.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {movements
                    .filter((m) => m.item_id === detailItem.id)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-navy-900">
                          <span>
                            {m.from_room_name || 'Неизвестно'} → {m.to_room_name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(m.created_at).toLocaleDateString('bg-BG')}
                          </span>
                        </div>
                        {m.notes && <div className="text-slate-500">{m.notes}</div>}
                        <div className="text-[10px] text-slate-400">
                          Извършено от: {m.actor_name || 'Служител'}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </ModuleModal>
      )}

      {/* Add / Edit Asset Modal */}
      <ModuleModal
        isOpen={modalOpen}
        title={editingItem ? `Редакция: ${editingItem.name}` : 'Добавяне на нов инвентарен актив'}
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Tracking Mode Switch */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <span className="block text-xs font-bold text-blue-900">
              Режим на инвентаризация:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTrackingType('individual')}
                className={cn(
                  'p-2.5 rounded-lg text-xs font-semibold text-left border transition-all',
                  trackingType === 'individual'
                    ? 'bg-white border-blue-600 text-blue-700 shadow-2xs'
                    : 'bg-white/60 border-slate-200 text-slate-600'
                )}
              >
                <div className="font-bold">А) Индивидуален актив</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Компютри, дисплеи, проектори с отделен QR код и сериен номер.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTrackingType('batch')}
                className={cn(
                  'p-2.5 rounded-lg text-xs font-semibold text-left border transition-all',
                  trackingType === 'batch'
                    ? 'bg-white border-purple-600 text-purple-700 shadow-2xs'
                    : 'bg-white/60 border-slate-200 text-slate-600'
                )}
              >
                <div className="font-bold">Б) Количествена позиция</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Еднакви мебели, чинове, пособия (следи се брой и обща стойност).
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Инвентарен номер *
              </label>
              <input
                type="text"
                value={invCode}
                onChange={(e) => setInvCode(e.target.value)}
                placeholder="напр. INV-2026-001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Категория *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Наименование на актива *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. Интерактивен дисплей 75'' 4K UHD"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Производител
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="напр. Lenovo, Samsung"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Модел
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="напр. ThinkPad E15 Gen 4"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Сериен номер (S/N)
              </label>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="напр. PF-3K921A"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Помещение *
              </label>
              <select
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  const selectedR = roomMap.get(e.target.value);
                  if (selectedR?.responsible_person && !assignedTo) {
                    setAssignedTo(selectedR.responsible_person);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
                required
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.room_number ? `(№ ${r.room_number})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Материално отговорно лице
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Име на учител / служител"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Количество {trackingType === 'individual' ? '(фиксирано 1)' : '*'}
              </label>
              <input
                type="number"
                min={1}
                disabled={trackingType === 'individual'}
                value={trackingType === 'individual' ? 1 : quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Покупна цена (€ без ДДС)
              </label>
              <input
                type="text"
                value={priceEur}
                onChange={(e) => setPriceEur(e.target.value)}
                placeholder="напр. 650.00"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Дата на придобиване
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Гаранция до
              </label>
              <input
                type="date"
                value={warrantyUntil}
                onChange={(e) => setWarrantyUntil(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Състояние
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
              >
                {Object.entries(CONDITION_META).map(([k, meta]) => (
                  <option key={k} value={k}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Описание / Допълнителни бележки
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="напр. Финансирано по НП 'ИКТ в училище'"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
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
              disabled={submitting || !name.trim() || !invCode.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              {submitting ? 'Запазване...' : editingItem ? 'Запази промените' : 'Създай актив'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Relocation Modal */}
      <ModuleModal
        isOpen={moveModalOpen}
        title={moveTargetItem ? `Преместване на актив: ${moveTargetItem.name}` : 'Преместване'}
        onClose={() => setMoveModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            Всяко преместване се записва постоянно в хронологичната история на актива, заедно с
            датата, старото и новото помещение и извършилия действието потребител.
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Целево помещение *
            </label>
            <select
              value={targetRoomId}
              onChange={(e) => {
                setTargetRoomId(e.target.value);
                const rm = roomMap.get(e.target.value);
                if (rm?.responsible_person) setTargetMol(rm.responsible_person);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.room_number ? `(№ ${r.room_number})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Ново отговорно лице (МОЛ)
            </label>
            <input
              type="text"
              value={targetMol}
              onChange={(e) => setTargetMol(e.target.value)}
              placeholder="Име на новия отговорник"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Основание / Бележка за преместването
            </label>
            <textarea
              rows={2}
              value={moveNotes}
              onChange={(e) => setMoveNotes(e.target.value)}
              placeholder="напр. Преместен за учебни нужди на паралелка 10А"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setMoveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={handleConfirmMove}
              disabled={moving || !targetRoomId}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-2xs"
            >
              {moving ? 'Преместване...' : 'Потвърди преместването'}
            </button>
          </div>
        </div>
      </ModuleModal>

      {/* Split Batch Modal */}
      <ModuleModal
        isOpen={splitModalOpen}
        title={`Разделяне на количествена позиция: ${splitItem?.name}`}
        onClose={() => setSplitModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
            Текущо общо количество: <strong>{splitItem?.quantity || 1} бр.</strong> Отделете бройка,
            която да се трансформира в индивидуални активи с отделни инвентарни номера и QR кодове.
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Брой единици за отделяне (от 1 до {(splitItem?.quantity || 2) - 1}):
            </label>
            <input
              type="number"
              min={1}
              max={(splitItem?.quantity || 2) - 1}
              value={splitCount}
              onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Специфични инвентарни кодове (по желание, по един на ред):
            </label>
            <textarea
              rows={3}
              value={splitCodesInput}
              onChange={(e) => setSplitCodesInput(e.target.value)}
              placeholder="Ако оставите празно, системата ще генерира автоматични уникални кодове."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSplitModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={handleConfirmSplit}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-2xs"
            >
              Раздели на {splitCount} актива
            </button>
          </div>
        </div>
      </ModuleModal>

      {/* Write-Off Modal */}
      <ModuleModal
        isOpen={writeOffModalOpen}
        title={`Бракуване на актив: ${writeOffItem?.name}`}
        onClose={() => setWriteOffModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            Бракуването снема актива от активния инвентарен отчет, но запазва пълния запис и
            история в раздел „Бракувани активи“ за счетоводен и одитен архив.
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Дата на бракуване *
            </label>
            <input
              type="date"
              value={writeOffDate}
              onChange={(e) => setWriteOffDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Основание / Протокол за брак *
            </label>
            <textarea
              rows={3}
              value={writeOffReason}
              onChange={(e) => setWriteOffReason(e.target.value)}
              placeholder="напр. Протокол за брак № 4/12.10.2026 г. поради морално и физическо износване"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWriteOffModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={handleConfirmWriteOff}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-2xs"
            >
              Маркирай като бракуван
            </button>
          </div>
        </div>
      </ModuleModal>

      {/* Repair Ticket Modal */}
      <ModuleModal
        isOpen={repairModalOpen}
        title={repairItem ? `Заявка за ремонт: ${repairItem.name}` : 'Ремонт'}
        onClose={() => setRepairModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            Тази заявка автоматично регистрира задача в модул „Система за задачи и документи“ и
            променя състоянието на актива на „За ремонт“.
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Заглавие на проблема *
            </label>
            <input
              type="text"
              value={repairTitle}
              onChange={(e) => setRepairTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Приоритет
            </label>
            <select
              value={repairPriority}
              onChange={(e) => setRepairPriority(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="low">Нисък</option>
              <option value="medium">Нормален</option>
              <option value="high">Висок</option>
              <option value="urgent">Спешен (Блокира учебния процес)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Описание на повредата
            </label>
            <textarea
              rows={3}
              value={repairDetails}
              onChange={(e) => setRepairDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRepairModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={handleConfirmRepair}
              disabled={submittingRepair || !repairTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-2xs"
            >
              {submittingRepair ? 'Изпращане...' : 'Регистрирай задача за ремонт'}
            </button>
          </div>
        </div>
      </ModuleModal>

      {/* Single QR Preview Modal */}
      {qrModalItem && (
        <ModuleModal
          isOpen={true}
          title={`Инвентарен QR Етикет: ${qrModalItem.inventory_code}`}
          onClose={() => setQrModalItem(null)}
          size="md"
        >
          <div className="space-y-4">
            <QrCodeDisplay
              inventoryCode={qrModalItem.inventory_code}
              assetName={qrModalItem.name}
              roomName={roomMap.get(qrModalItem.room_id || '')?.name}
              schoolName={schoolName}
              serialNumber={qrModalItem.serial_number}
              size={220}
            />
          </div>
        </ModuleModal>
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        existingItems={items}
        rooms={rooms}
        categories={categories}
        onImport={onBulkImport}
      />
    </div>
  );
}
