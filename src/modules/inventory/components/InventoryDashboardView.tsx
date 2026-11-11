import { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Euro,
  FileCheck2,
  Layers,
  ShieldAlert,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react';
import type {
  InventoryAuditSession,
  InventoryCategory,
  InventoryItem,
  InventoryLog,
  InventoryMovement,
  InventoryNotification,
  InventoryRoom,
} from '../types';
import { ROOM_TYPE_LABELS, formatEur, getRoomTypeLabel } from '../types';
import { cn } from '../../../utils/helpers';

interface InventoryDashboardViewProps {
  items: InventoryItem[];
  rooms: InventoryRoom[];
  categories: InventoryCategory[];
  logs: InventoryLog[];
  audits: InventoryAuditSession[];
  movements: InventoryMovement[];
  notifications: InventoryNotification[];
  onNavigateToItems: () => void;
  onNavigateToRooms: () => void;
  onNavigateToAudit: () => void;
  onSelectRoomDetail: (room: InventoryRoom) => void;
}

export function InventoryDashboardView({
  items,
  rooms,
  categories,
  logs,
  audits,
  movements,
  notifications,
  onNavigateToItems,
  onNavigateToRooms,
  onNavigateToAudit,
  onSelectRoomDetail,
}: InventoryDashboardViewProps) {
  const [currentTimestamp] = useState(() => Date.now());

  // Active items (excluding archived and written off)
  const activeItems = useMemo(
    () => items.filter((it) => !it.is_archived && !it.is_written_off),
    [items]
  );

  // Active audit
  const activeAudit = useMemo(
    () => audits.find((a) => a.status === 'in_progress'),
    [audits]
  );

  // Comprehensive KPI Stats
  const stats = useMemo(() => {
    let totalPhysicalUnits = 0;
    let totalValueEur = 0;
    let inWarrantyCount = 0;
    let needsRepairCount = 0;
    let missingCount = 0;

    activeItems.forEach((it) => {
      const q = it.quantity || 1;
      totalPhysicalUnits += q;
      if (it.purchase_price) {
        totalValueEur += it.purchase_price * q;
      }
      if (it.warranty_until && new Date(it.warranty_until).getTime() > currentTimestamp) {
        inWarrantyCount += q;
      }
      if (it.condition === 'needs_repair') {
        needsRepairCount += q;
      }
      if (it.condition === 'missing') {
        missingCount += q;
      }
    });

    // Unverified items in active audit
    const unverifiedCount = activeAudit
      ? (activeAudit.items || []).filter((ai) => ai.status === 'unverified').length
      : 0;

    return {
      positionsCount: activeItems.length,
      totalPhysicalUnits,
      totalValueEur,
      inWarrantyCount,
      needsRepairCount,
      missingCount,
      unverifiedCount,
    };
  }, [activeItems, activeAudit, currentTimestamp]);

  // Breakdown by Category
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catItems = activeItems.filter((it) => it.category_id === cat.id);
      const qty = catItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
      const value = catItems.reduce(
        (acc, it) => acc + (it.purchase_price ? it.purchase_price * (it.quantity || 1) : 0),
        0
      );
      return {
        ...cat,
        itemsCount: catItems.length,
        qty,
        value,
      };
    });
  }, [categories, activeItems]);

  // Room Summary Statistics
  const roomSummaries = useMemo(() => {
    return rooms
      .filter((r) => !r.is_archived)
      .map((r) => {
        const roomItems = activeItems.filter((it) => it.room_id === r.id);
        const physicalUnits = roomItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
        const totalValue = roomItems.reduce(
          (acc, it) => acc + (it.purchase_price ? it.purchase_price * (it.quantity || 1) : 0),
          0
        );
        return {
          room: r,
          positionsCount: roomItems.length,
          physicalUnits,
          totalValue,
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue);
  }, [rooms, activeItems]);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* Notification Alerts Banner                                     */}
      {/* ------------------------------------------------------------- */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.slice(0, 3).map((notif) => {
            const isCritical = notif.severity === 'critical';
            const isWarning = notif.severity === 'warning';

            return (
              <div
                key={notif.id}
                className={cn(
                  'p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm transition-all',
                  isCritical
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : isWarning
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                      isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    )}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isWarning ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <strong className="font-bold">{notif.title}</strong>
                    <div className="text-xs opacity-90">{notif.message}</div>
                  </div>
                </div>

                {notif.type === 'audit_in_progress' ? (
                  <button
                    type="button"
                    onClick={onNavigateToAudit}
                    className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 shadow-2xs"
                  >
                    Към ревизията →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onNavigateToItems}
                    className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shrink-0 shadow-2xs"
                  >
                    Преглед →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6 Upgraded KPI Cards                                           */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Physical Units vs Positions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Общо активи
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-navy-900">
              {stats.totalPhysicalUnits} <span className="text-xs font-normal text-slate-500">бр.</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              в <strong>{stats.positionsCount}</strong> заведени позиции
            </div>
          </div>
        </div>

        {/* Total Valuation EUR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Обща стойност (€)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Euro className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-emerald-700">
              {formatEur(stats.totalValueEur)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">придобивна цена</div>
          </div>
        </div>

        {/* Active Rooms */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Кабинети и зали
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-navy-900">
              {rooms.filter((r) => !r.is_archived).length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">оборудвани помещения</div>
          </div>
        </div>

        {/* In Warranty */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              В Гаранция
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-navy-900">
              {stats.inWarrantyCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">с активен сервизен срок</div>
          </div>
        </div>

        {/* Needs Repair or Missing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              За ремонт / Липсващи
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-amber-700">
              {stats.needsRepairCount + stats.missingCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.needsRepairCount} за сервиз • {stats.missingCount} липсващи
            </div>
          </div>
        </div>

        {/* Unverified In Audit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Ревизии
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-navy-900">
              {stats.unverifiedCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">непроверени позиции</div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION: ИНВЕНТАР ПО ПОМЕЩЕНИЯ (Room Inventory Summary)       */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-0.5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Инвентар по помещения</span>
            </h3>
            <p className="text-xs text-slate-500 mb-0">
              Брой активи и обща материална стойност на оборудването във всяка зала и кабинет
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToRooms}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>Всички кабинети</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {roomSummaries.map(({ room, positionsCount, physicalUnits, totalValue }) => {
            const roomTypeLabel = getRoomTypeLabel(room.room_type);

            return (
              <div
                key={room.id}
                onClick={() => onSelectRoomDetail(room)}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {room.room_number ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        № {room.room_number}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500">{roomTypeLabel}</span>
                    )}

                    <span className="text-[11px] font-bold text-emerald-800">
                      {formatEur(totalValue)}
                    </span>
                  </div>

                  <h4 className="font-bold text-navy-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                    {room.name}
                  </h4>

                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate">МОЛ: {room.responsible_person || '—'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    <strong>{physicalUnits} бр.</strong> ({positionsCount} поз.)
                  </span>
                  <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Отвори →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Category Breakdown & Recent Activity                           */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-navy-900 mb-0.5 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Разпределение на инвентара по категории</span>
              </h3>
              <p className="text-xs text-slate-500 mb-0">
                Стойност и брой активи във всяко направление
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToItems}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Към целия списък →
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((c) => {
              const maxVal = Math.max(...categoryStats.map((s) => s.value), 1);
              const pct = Math.min(100, Math.round((c.value / maxVal) * 100));

              return (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                    <span className="font-bold text-navy-900 truncate">
                      {c.name}
                    </span>
                    <div className="text-right shrink-0">
                      <strong className="text-navy-900">{formatEur(c.value)}</strong>
                      <span className="text-slate-500 text-xs ml-1.5 font-medium">
                        ({c.qty} бр.)
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Recent Movements Chronicle */}
        <div className="space-y-6">
          {/* Quick Actions Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-heading font-bold text-navy-900">
              Бързи действия
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={onNavigateToItems}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-navy-900 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between text-left"
              >
                <span>📦 Списък и добавяне на активи</span>
                <span className="text-blue-600">→</span>
              </button>
              <button
                type="button"
                onClick={onNavigateToRooms}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-navy-900 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between text-left"
              >
                <span>🏫 Опис на кабинети за печат (A4)</span>
                <span className="text-blue-600">→</span>
              </button>
              <button
                type="button"
                onClick={onNavigateToAudit}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-navy-900 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between text-left"
              >
                <span>🏷️ QR Етикети и Годишна ревизия</span>
                <span className="text-blue-600">→</span>
              </button>
            </div>
          </div>

          {/* Recent Movements / Logs Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-heading font-bold text-navy-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Последна активност и премествания</span>
            </h4>
            <div className="space-y-2.5">
              {movements.length > 0
                ? movements.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="text-xs border-l-2 border-blue-500 pl-3 py-0.5 space-y-0.5"
                    >
                      <div className="font-semibold text-navy-900">
                        {m.item_name} ({m.inventory_code})
                      </div>
                      <div className="text-slate-500 truncate">
                        {m.from_room_name || 'Склад'} → <strong>{m.to_room_name}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {m.actor_name || 'Служител'} •{' '}
                        {new Date(m.created_at).toLocaleDateString('bg-BG')}
                      </div>
                    </div>
                  ))
                : logs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className="text-xs border-l-2 border-blue-500 pl-3 py-0.5 space-y-0.5"
                    >
                      <div className="font-semibold text-navy-900">{log.action}</div>
                      {log.notes && <div className="text-slate-500 truncate">{log.notes}</div>}
                      <div className="text-[10px] text-slate-400">
                        {log.actor_name} • {new Date(log.created_at).toLocaleDateString('bg-BG')}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
