import { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Lock,
  Plus,
  Printer,
  QrCode,
  Search,
  Tag,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import type {
  AuditItemStatus,
  AuditScope,
  AuditStatus,
  InventoryAuditItem,
  InventoryAuditSession,
  InventoryCategory,
  InventoryItem,
  InventoryLog,
  InventoryMovement,
  InventoryRoom,
  ItemCondition,
} from '../types';
import {
  AUDIT_ITEM_STATUS_META,
  AUDIT_STATUS_META,
  CONDITION_META,
  formatEur,
} from '../types';
import { QrCodeDisplay } from './QrCodeDisplay';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';
import { cn } from '../../../utils/helpers';

interface InventoryAuditViewProps {
  items: InventoryItem[];
  rooms: InventoryRoom[];
  categories: InventoryCategory[];
  audits: InventoryAuditSession[];
  movements: InventoryMovement[];
  logs: InventoryLog[];
  schoolName: string;
  onStartAudit: (input: {
    title: string;
    order_number?: string;
    scope: AuditScope;
    room_ids?: string[];
    category_ids?: string[];
    committee?: string[];
  }) => Promise<InventoryAuditSession>;
  onCheckAuditItem: (
    auditId: string,
    itemId: string,
    status: AuditItemStatus,
    notes?: string
  ) => Promise<void>;
  onCompleteAudit: (auditId: string, notes?: string) => Promise<void>;
  onMoveItem: (
    itemId: string,
    targetRoomId: string,
    targetMol?: string,
    notes?: string
  ) => Promise<void>;
  onChangeCondition: (
    itemId: string,
    condition: ItemCondition,
    reason?: string
  ) => Promise<void>;
  currentUser?: { fullName?: string; role?: string };
}

export function InventoryAuditView({
  items,
  rooms,
  categories,
  audits,
  movements,
  logs,
  schoolName,
  onStartAudit,
  onCheckAuditItem,
  onCompleteAudit,
  onMoveItem,
  onChangeCondition,
  currentUser,
}: InventoryAuditViewProps) {
  // Main sub-tabs
  const [activeTab, setActiveTab] = useState<'revisions' | 'movements' | 'labels'>('revisions');

  // Lookup maps
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Active / selected audit
  const activeAudit = useMemo(
    () => audits.find((a) => a.status === 'in_progress') || audits[0] || null,
    [audits]
  );
  const [selectedAuditId, setSelectedAuditId] = useState<string>(activeAudit?.id || '');

  const currentAudit = useMemo(
    () => audits.find((a) => a.id === selectedAuditId) || activeAudit,
    [audits, selectedAuditId, activeAudit]
  );

  // New Audit Modal state
  const [newAuditModalOpen, setNewAuditModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrderNumber, setNewOrderNumber] = useState('');
  const [newScope, setNewScope] = useState<AuditScope>('all');
  const [selectedRoomIdsForAudit, setSelectedRoomIdsForAudit] = useState<string[]>([]);
  const [selectedCatIdsForAudit, setSelectedCatIdsForAudit] = useState<string[]>([]);
  const [committeeInput, setCommitteeInput] = useState('');
  const [startingAudit, setStartingAudit] = useState(false);

  // Complete Audit Confirmation
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  // Printable Protocol Modal
  const [protocolAudit, setProtocolAudit] = useState<InventoryAuditSession | null>(null);

  // Audit items filter inside active audit
  const [auditFilterStatus, setAuditFilterStatus] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState('');

  // -------------------------------------------------------------
  // Movement Sub-tab state
  // -------------------------------------------------------------
  const [moveItemId, setMoveItemId] = useState<string>(items[0]?.id || '');
  const [moveTargetRoomId, setMoveTargetRoomId] = useState<string>(rooms[1]?.id || rooms[0]?.id || '');
  const [moveTargetMol, setMoveTargetMol] = useState<string>('');
  const [moveNotes, setMoveNotes] = useState<string>('');
  const [moving, setMoving] = useState(false);
  const [movementSearch, setMovementSearch] = useState('');

  // -------------------------------------------------------------
  // QR Labels Sub-tab state
  // -------------------------------------------------------------
  const [labelRoomFilter, setLabelRoomFilter] = useState<string>('all');
  const [labelCatFilter, setLabelCatFilter] = useState<string>('all');
  const [labelSearch, setLabelSearch] = useState<string>('');

  // -------------------------------------------------------------
  // Active Audit Calculations
  // -------------------------------------------------------------
  const auditItemsList = useMemo(() => {
    if (!currentAudit) return [];
    return currentAudit.items || [];
  }, [currentAudit]);

  const auditStats = useMemo(() => {
    let present = 0;
    let missing = 0;
    let damaged = 0;
    let discrepancy = 0;
    let unverified = 0;
    let inspectedValue = 0;

    auditItemsList.forEach((ai) => {
      const it = itemMap.get(ai.item_id);
      const val = (it?.purchase_price || 0) * (it?.quantity || 1);
      inspectedValue += val;

      if (ai.status === 'present') present++;
      else if (ai.status === 'missing') missing++;
      else if (ai.status === 'damaged') damaged++;
      else if (ai.status === 'discrepancy') discrepancy++;
      else unverified++;
    });

    const total = auditItemsList.length;
    const checked = total - unverified;
    const progressPct = total > 0 ? Math.round((checked / total) * 100) : 100;
    const discrepanciesTotal = missing + damaged + discrepancy;

    return {
      total,
      checked,
      present,
      missing,
      damaged,
      discrepancy,
      unverified,
      progressPct,
      discrepanciesTotal,
      inspectedValue,
    };
  }, [auditItemsList, itemMap]);

  const filteredAuditItems = useMemo(() => {
    const q = auditSearch.trim().toLowerCase();
    return auditItemsList.filter((ai) => {
      if (auditFilterStatus !== 'all') {
        if (auditFilterStatus === 'discrepancies') {
          if (ai.status === 'present' || ai.status === 'unverified') return false;
        } else if (ai.status !== auditFilterStatus) {
          return false;
        }
      }
      if (q) {
        const it = itemMap.get(ai.item_id);
        const matchCode = ai.inventory_code.toLowerCase().includes(q);
        const matchName = ai.item_name.toLowerCase().includes(q);
        const matchSerial = it?.serial_number?.toLowerCase().includes(q) || false;
        if (!matchCode && !matchName && !matchSerial) return false;
      }
      return true;
    });
  }, [auditItemsList, auditFilterStatus, auditSearch, itemMap]);

  // -------------------------------------------------------------
  // Start Audit Handler
  // -------------------------------------------------------------
  const handleOpenStartAudit = () => {
    const year = new Date().getFullYear();
    setNewTitle(`Инвентаризационна проверка ${year} г.`);
    setNewOrderNumber(`Заповед № РД-09-${Math.floor(Math.random() * 800 + 100)}/${new Date().toLocaleDateString('bg-BG')}`);
    setNewScope('all');
    setSelectedRoomIdsForAudit([]);
    setSelectedCatIdsForAudit([]);
    setCommitteeInput('Председател: зам.-директор\nЧлен 1: гл. учител\nЧлен 2: счетоводител');
    setNewAuditModalOpen(true);
  };

  const handleConfirmStartAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setStartingAudit(true);

    const committee = committeeInput
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const session = await onStartAudit({
        title: newTitle.trim(),
        order_number: newOrderNumber.trim() || undefined,
        scope: newScope,
        room_ids: newScope === 'rooms' ? selectedRoomIdsForAudit : undefined,
        category_ids: newScope === 'categories' ? selectedCatIdsForAudit : undefined,
        committee: committee.length > 0 ? committee : undefined,
      });
      setSelectedAuditId(session.id);
      setNewAuditModalOpen(false);
    } finally {
      setStartingAudit(false);
    }
  };

  // -------------------------------------------------------------
  // Close / Seal Audit Handler
  // -------------------------------------------------------------
  const handleConfirmCompleteAudit = async () => {
    if (!currentAudit) return;
    setCompleting(true);
    try {
      await onCompleteAudit(currentAudit.id, completeNotes.trim() || undefined);
      setCompleteModalOpen(false);
    } finally {
      setCompleting(false);
    }
  };

  // -------------------------------------------------------------
  // Relocation Handler
  // -------------------------------------------------------------
  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveItemId || !moveTargetRoomId) return;
    setMoving(true);
    try {
      await onMoveItem(
        moveItemId,
        moveTargetRoomId,
        moveTargetMol.trim() || undefined,
        moveNotes.trim() || undefined
      );
      setMoveNotes('');
    } finally {
      setMoving(false);
    }
  };

  // -------------------------------------------------------------
  // Filtered Movements
  // -------------------------------------------------------------
  const filteredMovements = useMemo(() => {
    const q = movementSearch.trim().toLowerCase();
    return movements.filter((m) => {
      if (!q) return true;
      const matchCode = m.inventory_code.toLowerCase().includes(q);
      const matchItem = m.item_name.toLowerCase().includes(q);
      const matchActor = m.actor_name?.toLowerCase().includes(q) || false;
      const matchFrom = m.from_room_name?.toLowerCase().includes(q) || false;
      const matchTo = m.to_room_name.toLowerCase().includes(q);
      return matchCode || matchItem || matchActor || matchFrom || matchTo;
    });
  }, [movements, movementSearch]);

  // -------------------------------------------------------------
  // Filtered Items for QR Labels Sheet
  // -------------------------------------------------------------
  const filteredLabelsItems = useMemo(() => {
    const q = labelSearch.trim().toLowerCase();
    return items
      .filter((it) => !it.is_archived && !it.is_written_off)
      .filter((it) => it.tracking_type === 'individual' || !it.tracking_type)
      .filter((it) => {
        if (labelRoomFilter !== 'all' && it.room_id !== labelRoomFilter) return false;
        if (labelCatFilter !== 'all' && it.category_id !== labelCatFilter) return false;
        if (q) {
          const matchCode = it.inventory_code.toLowerCase().includes(q);
          const matchName = it.name.toLowerCase().includes(q);
          const matchSerial = it.serial_number?.toLowerCase().includes(q) || false;
          if (!matchCode && !matchName && !matchSerial) return false;
        }
        return true;
      });
  }, [items, labelRoomFilter, labelCatFilter, labelSearch]);

  const isCurrentAuditLocked = currentAudit?.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Top Banner with Sub-Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-blue-600" />
              <span>Ревизии, движение на активи и QR Етикети</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              Комисионни инвентаризации, протоколи за констатирани липси/повреди, движение и баркодове
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenStartAudit}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Нова ревизия</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Revisions, Movements, QR Labels */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('revisions')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2',
              activeTab === 'revisions'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-navy-900'
            )}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Инвентаризационни проверки ({audits.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('movements')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2',
              activeTab === 'movements'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-navy-900'
            )}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Движение между помещенията ({movements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('labels')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2',
              activeTab === 'labels'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-navy-900'
            )}
          >
            <QrCode className="w-4 h-4" />
            <span>Печат на QR Етикети (А4 листи)</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: REVISIONS & AUDITS                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'revisions' && (
        <div className="space-y-6">
          {audits.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 bg-white rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-navy-900 mb-0">
                Няма създадени инвентаризационни ревизии
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-0">
                Стартирайте първата проверка за цялото училище или за конкретни кабинети и зали.
              </p>
              <button
                type="button"
                onClick={handleOpenStartAudit}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Започни ревизия сега</span>
              </button>
            </div>
          ) : (
            <>
              {/* Audit Selector & Header Workspace */}
              {currentAudit && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Selector if multiple audits */}
                        <select
                          value={currentAudit.id}
                          onChange={(e) => setSelectedAuditId(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-navy-900 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-600"
                        >
                          {audits.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.title} {a.status === 'completed' ? '✓ (Приключена)' : '⚡ (В процес)'}
                            </option>
                          ))}
                        </select>

                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1',
                            AUDIT_STATUS_META[currentAudit.status]?.colorClass
                          )}
                        >
                          {isCurrentAuditLocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {AUDIT_STATUS_META[currentAudit.status]?.label}
                        </span>

                        {currentAudit.order_number && (
                          <span className="text-xs text-slate-500 font-medium">
                            {currentAudit.order_number}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap gap-4 pt-1">
                        <span>
                          Обхват:{' '}
                          <strong className="text-navy-900">
                            {currentAudit.scope === 'all' || (currentAudit.scope as any) === 'all_school'
                              ? 'Цялото училище'
                              : currentAudit.scope === 'rooms'
                              ? 'Избрани помещения'
                              : 'Избрани категории'}
                          </strong>
                        </span>
                        <span>
                          Дата на откриване:{' '}
                          <strong className="text-navy-900">
                            {new Date(currentAudit.started_at).toLocaleDateString('bg-BG')}
                          </strong>
                        </span>
                        {currentAudit.completed_at && (
                          <span>
                            Приключена на:{' '}
                            <strong className="text-emerald-700">
                              {new Date(currentAudit.completed_at).toLocaleDateString('bg-BG')}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions on this Audit */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setProtocolAudit(currentAudit)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-navy-900 text-xs sm:text-sm font-semibold transition-colors"
                      >
                        <Printer className="w-4 h-4 text-slate-600" />
                        <span>Ревизионен протокол (A4)</span>
                      </button>

                      {!isCurrentAuditLocked && (
                        <button
                          type="button"
                          onClick={() => setCompleteModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Приключи и запечатай</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audit Progress & KPI Cards */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">
                        Проверени: <strong>{auditStats.checked}</strong> от {auditStats.total} актива
                      </span>
                      <span className="text-blue-600 font-bold">{auditStats.progressPct}% завършеност</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${auditStats.progressPct}%` }}
                      />
                    </div>

                    {/* 5 Status Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[11px] font-semibold text-emerald-800 uppercase block">
                          Налични
                        </span>
                        <div className="text-xl font-bold text-emerald-900">{auditStats.present}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                        <span className="text-[11px] font-semibold text-rose-800 uppercase block">
                          Липсващи
                        </span>
                        <div className="text-xl font-bold text-rose-900">{auditStats.missing}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="text-[11px] font-semibold text-amber-800 uppercase block">
                          Повредени
                        </span>
                        <div className="text-xl font-bold text-amber-900">{auditStats.damaged}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                        <span className="text-[11px] font-semibold text-purple-800 uppercase block">
                          Несъответствия
                        </span>
                        <div className="text-xl font-bold text-purple-900">{auditStats.discrepancy}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-700 uppercase block">
                          Непроверени
                        </span>
                        <div className="text-xl font-bold text-slate-800">{auditStats.unverified}</div>
                      </div>
                    </div>
                  </div>

                  {/* Filter bar for items inside audit */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'all', label: `Всички (${auditStats.total})` },
                        { id: 'discrepancies', label: `Разлики и проблеми (${auditStats.discrepanciesTotal})` },
                        { id: 'unverified', label: `Непроверени (${auditStats.unverified})` },
                        { id: 'present', label: `Налични (${auditStats.present})` },
                        { id: 'missing', label: `Липсващи (${auditStats.missing})` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAuditFilterStatus(tab.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                            auditFilterStatus === tab.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:text-navy-900'
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        placeholder="Търсене на позиция..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Audit Checklist Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3.5">Инв. номер</th>
                          <th className="py-3 px-3.5">Наименование на актива</th>
                          <th className="py-3 px-3.5">Помещение</th>
                          <th className="py-3 px-3.5 text-right">Стойност (€)</th>
                          <th className="py-3 px-3.5 text-center">Констатация / Статус</th>
                          <th className="py-3 px-3.5">Бележки</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredAuditItems.map((ai) => {
                          const it = itemMap.get(ai.item_id);
                          const statusMeta = AUDIT_ITEM_STATUS_META[ai.status];
                          const room = roomMap.get(ai.room_id || it?.room_id || '');

                          return (
                            <tr key={ai.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-navy-900">
                                {ai.inventory_code}
                              </td>

                              <td className="py-3 px-3.5">
                                <div className="font-bold text-navy-900">{ai.item_name}</div>
                                {it?.serial_number && (
                                  <div className="text-[11px] font-mono text-slate-400">
                                    S/N: {it.serial_number}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-3.5 text-slate-600">
                                {room?.name || '—'} {room?.room_number ? `(№ ${room.room_number})` : ''}
                              </td>

                              <td className="py-3 px-3.5 text-right font-bold text-navy-900">
                                {it?.purchase_price ? formatEur(it.purchase_price * (it.quantity || 1)) : '—'}
                              </td>

                              {/* Interactive verification buttons */}
                              <td className="py-3 px-3.5 whitespace-nowrap text-center">
                                {isCurrentAuditLocked ? (
                                  <span
                                    className={cn(
                                      'px-2.5 py-1 rounded-full text-xs font-semibold inline-block',
                                      statusMeta.colorClass
                                    )}
                                  >
                                    {statusMeta.label}
                                  </span>
                                ) : (
                                  <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                    <button
                                      type="button"
                                      onClick={() => onCheckAuditItem(currentAudit.id, ai.item_id, 'present')}
                                      className={cn(
                                        'px-2 py-1 rounded text-[11px] font-bold transition-colors',
                                        ai.status === 'present'
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-emerald-700'
                                      )}
                                      title="Наличен на място"
                                    >
                                      ✓ Наличен
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onCheckAuditItem(currentAudit.id, ai.item_id, 'missing')}
                                      className={cn(
                                        'px-2 py-1 rounded text-[11px] font-bold transition-colors',
                                        ai.status === 'missing'
                                          ? 'bg-rose-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-rose-700'
                                      )}
                                      title="Липсва при проверката"
                                    >
                                      ✗ Липсва
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onCheckAuditItem(currentAudit.id, ai.item_id, 'damaged')}
                                      className={cn(
                                        'px-2 py-1 rounded text-[11px] font-bold transition-colors',
                                        ai.status === 'damaged'
                                          ? 'bg-amber-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-amber-700'
                                      )}
                                      title="Повреден актив"
                                    >
                                      ⚠️ Повреден
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => onCheckAuditItem(currentAudit.id, ai.item_id, 'discrepancy')}
                                      className={cn(
                                        'px-2 py-1 rounded text-[11px] font-bold transition-colors',
                                        ai.status === 'discrepancy'
                                          ? 'bg-purple-600 text-white shadow-2xs'
                                          : 'text-slate-600 hover:text-purple-700'
                                      )}
                                      title="Несъответствие в местоположението или данните"
                                    >
                                      ? Несъответствие
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Notes */}
                              <td className="py-3 px-3.5 text-xs text-slate-500">
                                {ai.notes || (ai.verified_at ? `Проверен на ${new Date(ai.verified_at).toLocaleDateString('bg-BG')}` : '—')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: INTER-ROOM MOVEMENTS                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'movements' && (
        <div className="space-y-6">
          {/* Quick Relocation Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              <span>Преместване на актив в друго помещение</span>
            </h3>
            <p className="text-xs text-slate-500">
              Всички движения се записват с дата, старо/ново помещение и отговорно лице в официалната история.
            </p>

            <form onSubmit={handleMoveSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Избор на актив *
                </label>
                <select
                  value={moveItemId}
                  onChange={(e) => setMoveItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-600"
                  required
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.inventory_code} - {it.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Ново помещение *
                </label>
                <select
                  value={moveTargetRoomId}
                  onChange={(e) => {
                    setMoveTargetRoomId(e.target.value);
                    const rm = roomMap.get(e.target.value);
                    if (rm?.responsible_person) setMoveTargetMol(rm.responsible_person);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:border-blue-600"
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
                  Ново МОЛ
                </label>
                <input
                  type="text"
                  value={moveTargetMol}
                  onChange={(e) => setMoveTargetMol(e.target.value)}
                  placeholder="Отговорно лице"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={moving || !moveItemId || !moveTargetRoomId}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
                >
                  {moving ? 'Преместване...' : 'Премести актив'}
                </button>
              </div>
            </form>
          </div>

          {/* Movements History Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <span>Хронология на преместванията</span>
                </h3>
                <p className="text-xs text-slate-500 mb-0">
                  Пълен одит на преместванията на техника и оборудване в училището
                </p>
              </div>

              <div className="relative sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={movementSearch}
                  onChange={(e) => setMovementSearch(e.target.value)}
                  placeholder="Филтър по код, актив, зала..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {filteredMovements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                Няма регистрирани премествания.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">Дата и час</th>
                      <th className="py-3 px-3.5">Инв. номер</th>
                      <th className="py-3 px-3.5">Актив</th>
                      <th className="py-3 px-3.5">Старо помещение</th>
                      <th className="py-3 px-3.5">Ново помещение</th>
                      <th className="py-3 px-3.5">Извършено от</th>
                      <th className="py-3 px-3.5">Основание / Бележки</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 text-xs">
                          {new Date(m.created_at).toLocaleString('bg-BG', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-navy-900 whitespace-nowrap">
                          {m.inventory_code}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-navy-900">{m.item_name}</td>
                        <td className="py-3 px-3.5 text-slate-600">{m.from_room_name || '—'}</td>
                        <td className="py-3 px-3.5 font-semibold text-blue-700">{m.to_room_name}</td>
                        <td className="py-3 px-3.5 text-slate-600 text-xs">{m.actor_name || 'Служител'}</td>
                        <td className="py-3 px-3.5 text-slate-500 text-xs">{m.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: QR LABELS SHEET (A4)                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'labels' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <span>Печат на инвентарни QR стикери (формат А4)</span>
                </h3>
                <p className="text-xs text-slate-500 mb-0">
                  Генерирайте лист със стикери за директен печат върху самозалепваща хартия за залепване върху корпусите на компютрите и дисплеите.
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Печат на листа (A4)</span>
              </button>
            </div>

            {/* Filter controls for labels */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <select
                value={labelRoomFilter}
                onChange={(e) => setLabelRoomFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
              >
                <option value="all">Всички помещения</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.room_number ? `(№ ${r.room_number})` : ''}
                  </option>
                ))}
              </select>

              <select
                value={labelCatFilter}
                onChange={(e) => setLabelCatFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
              >
                <option value="all">Всички категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={labelSearch}
                onChange={(e) => setLabelSearch(e.target.value)}
                placeholder="Търсене по инв. № или име..."
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Готови за печат: <strong>{filteredLabelsItems.length}</strong> индивидуални етикета
            </div>
          </div>

          {/* Labels Printable Sheet Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200">
            {filteredLabelsItems.map((it) => {
              const room = roomMap.get(it.room_id || '');
              return (
                <div
                  key={it.id}
                  className="p-3 border-2 border-slate-300 rounded-xl bg-white flex flex-col justify-between gap-2 shadow-2xs print:border-black print:break-inside-avoid"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 truncate">
                      {schoolName}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {room?.room_number ? `Зала ${room.room_number}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="shrink-0 bg-white p-1 rounded border border-slate-200">
                      <QrCodeDisplay
                        inventoryCode={it.inventory_code}
                        assetName={it.name}
                        roomName={room?.name}
                        schoolName={schoolName}
                        size={72}
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
                    <span className="truncate">{room?.name || 'Общ склад'}</span>
                    <span>МОЛ: {it.assigned_to || room?.responsible_person || '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Start New Audit Modal */}
      <ModuleModal
        isOpen={newAuditModalOpen}
        title="Стартиране на нова инвентаризационна проверка"
        onClose={() => setNewAuditModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleConfirmStartAudit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Наименование на ревизията *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="напр. Годишна инвентаризация 2026 г."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Заповед на директора № / дата
            </label>
            <input
              type="text"
              value={newOrderNumber}
              onChange={(e) => setNewOrderNumber(e.target.value)}
              placeholder="напр. Заповед № РД-09-412/15.10.2026 г."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Обхват на проверката *
            </label>
            <select
              value={newScope}
              onChange={(e) => setNewScope(e.target.value as AuditScope)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
            >
              <option value="all">Цялото училище (всички помещения и категории)</option>
              <option value="rooms">Избрани кабинети и зали</option>
              <option value="categories">Избрани категории техника</option>
            </select>
          </div>

          {newScope === 'rooms' && (
            <div className="max-h-36 overflow-y-auto border border-slate-200 p-2 rounded-xl space-y-1 text-xs">
              <span className="font-bold block mb-1 text-navy-900">Изберете помещения:</span>
              {rooms.map((r) => (
                <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoomIdsForAudit.includes(r.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedRoomIdsForAudit([...selectedRoomIdsForAudit, r.id]);
                      else setSelectedRoomIdsForAudit(selectedRoomIdsForAudit.filter((id) => id !== r.id));
                    }}
                  />
                  <span>
                    {r.name} {r.room_number ? `(№ ${r.room_number})` : ''}
                  </span>
                </label>
              ))}
            </div>
          )}

          {newScope === 'categories' && (
            <div className="max-h-36 overflow-y-auto border border-slate-200 p-2 rounded-xl space-y-1 text-xs">
              <span className="font-bold block mb-1 text-navy-900">Изберете категории:</span>
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCatIdsForAudit.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCatIdsForAudit([...selectedCatIdsForAudit, c.id]);
                      else setSelectedCatIdsForAudit(selectedCatIdsForAudit.filter((id) => id !== c.id));
                    }}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Членове на комисията по инвентаризация (по един на ред)
            </label>
            <textarea
              rows={3}
              value={committeeInput}
              onChange={(e) => setCommitteeInput(e.target.value)}
              placeholder="Председател: ...&#10;Член: ..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setNewAuditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={startingAudit || !newTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-2xs"
            >
              {startingAudit ? 'Стартиране...' : 'Стартирай ревизия'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Complete Audit Confirmation Modal */}
      <ModuleModal
        isOpen={completeModalOpen}
        title="Приключване и запечатване на ревизията"
        onClose={() => setCompleteModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-bold">Внимание: Запечатване на резултатите!</div>
            <div>
              След приключване ревизията ще бъде официално архивирана и резултатите няма да могат
              да се променят незабелязано.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Заключение на комисията / Обобщени бележки
            </label>
            <textarea
              rows={3}
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="напр. Ревизията приключи с установени 2 повредени проектора за ремонт и 0 липсващи актива."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCompleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={handleConfirmCompleteAudit}
              disabled={completing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-2xs"
            >
              {completing ? 'Запечатване...' : 'Потвърди и запечатай ревизията'}
            </button>
          </div>
        </div>
      </ModuleModal>

      {/* Printable Official Protocol (A4) */}
      {protocolAudit && (
        <ModuleModal
          isOpen={true}
          title={`Ревизионен протокол (A4): ${protocolAudit.title}`}
          onClose={() => setProtocolAudit(null)}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <span>
                Официален инвентаризационен протокол за одит и счетоводен отчет (формат А4).
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shrink-0 shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Печат на протокола</span>
              </button>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 text-navy-900 space-y-5 print:border-none print:p-0">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="text-xs font-bold uppercase text-slate-700">{schoolName}</div>
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900">
                  ПРОТОКОЛ ОТ ИНВЕНТАРИЗАЦИЯ НА МАТЕРИАЛНИТЕ АКТИВИ
                </h2>
                <div className="text-sm font-semibold text-slate-800">
                  {protocolAudit.title} • {protocolAudit.order_number || 'Заповед на Директора'}
                </div>
                <div className="text-xs text-slate-600">
                  Дата на проверка:{' '}
                  {protocolAudit.completed_at
                    ? new Date(protocolAudit.completed_at).toLocaleDateString('bg-BG')
                    : new Date().toLocaleDateString('bg-BG')}{' '}
                  г.
                </div>
              </div>

              {/* Committee Members Block */}
              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-bold">Комисия, назначена със заповед на Директора:</div>
                {(protocolAudit.committee || ['Директор', 'Зам.-директор', 'Счетоводител']).map(
                  (c, idx) => (
                    <div key={idx}>• {c}</div>
                  )
                )}
              </div>

              {/* Findings Summary Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  1. Обобщени резултати от проверката
                </div>
                <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-medium bg-slate-50">Общ брой проверени активи:</td>
                      <td className="p-2 font-bold">{protocolAudit.items.length} бр.</td>
                      <td className="p-2 font-medium bg-slate-50">Налични в изправност:</td>
                      <td className="p-2 font-bold text-emerald-800">
                        {protocolAudit.items.filter((i) => i.status === 'present').length} бр.
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 font-medium bg-slate-50">Констатирани липси:</td>
                      <td className="p-2 font-bold text-rose-700">
                        {protocolAudit.items.filter((i) => i.status === 'missing').length} бр.
                      </td>
                      <td className="p-2 font-medium bg-slate-50">Повредени активи за сервиз:</td>
                      <td className="p-2 font-bold text-amber-800">
                        {protocolAudit.items.filter((i) => i.status === 'damaged').length} бр.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Discrepancies Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Опис на констатираните несъответствия, липси и повреди
                </div>

                {protocolAudit.items.filter((i) => i.status !== 'present').length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200">
                    Не са установени липси, повреди или несъответствия. Всички инвентарни активи са
                    налични по места.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border border-slate-300 font-bold">
                        <th className="p-1.5 border border-slate-300">Инв. номер</th>
                        <th className="p-1.5 border border-slate-300">Наименование</th>
                        <th className="p-1.5 border border-slate-300">Помещение</th>
                        <th className="p-1.5 border border-slate-300">Статус</th>
                        <th className="p-1.5 border border-slate-300">Констатация</th>
                      </tr>
                    </thead>
                    <tbody>
                      {protocolAudit.items
                        .filter((i) => i.status !== 'present')
                        .map((ai) => {
                          const room = roomMap.get(ai.room_id || '');
                          return (
                            <tr key={ai.id} className="border border-slate-300">
                              <td className="p-1.5 border border-slate-300 font-mono font-bold">
                                {ai.inventory_code}
                              </td>
                              <td className="p-1.5 border border-slate-300 font-semibold">
                                {ai.item_name}
                              </td>
                              <td className="p-1.5 border border-slate-300">{room?.name || '—'}</td>
                              <td className="p-1.5 border border-slate-300 font-bold">
                                {AUDIT_ITEM_STATUS_META[ai.status]?.label}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-slate-600">
                                {ai.notes || '—'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="font-semibold mb-6">Членове на комисията:</div>
                  <div className="space-y-4">
                    <div>1. ..................................................... / .................................... /</div>
                    <div>2. ..................................................... / .................................... /</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-6">Утвърдил (Директор):</div>
                  <div>Подпис и печат: .....................................................</div>
                </div>
              </div>
            </div>
          </div>
        </ModuleModal>
      )}
    </div>
  );
}
