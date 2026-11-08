import { useState, useMemo } from 'react';
import {
  Boxes,
  Building2,
  CheckCircle2,
  Euro,
  Layers,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import type {
  InventoryCategory,
  InventoryItem,
  InventoryLog,
  InventoryRoom,
} from '../types';
import { formatEur } from '../types';

interface InventoryDashboardViewProps {
  items: InventoryItem[];
  rooms: InventoryRoom[];
  categories: InventoryCategory[];
  logs: InventoryLog[];
  onNavigateToItems: () => void;
  onNavigateToRooms: () => void;
  onNavigateToAudit: () => void;
}

export function InventoryDashboardView({
  items,
  rooms,
  categories,
  logs,
  onNavigateToItems,
  onNavigateToRooms,
  onNavigateToAudit,
}: InventoryDashboardViewProps) {
  const [currentTimestamp] = useState(() => Date.now());

  const stats = useMemo(() => {
    let totalQty = 0;
    let totalValueEur = 0;
    let inWarrantyCount = 0;
    let needsRepairCount = 0;
    let missingCount = 0;

    items.forEach((it) => {
      const q = it.quantity || 1;
      totalQty += q;
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

    return {
      totalItems: items.length,
      totalQty,
      totalValueEur,
      inWarrantyCount,
      needsRepairCount,
      missingCount,
    };
  }, [items, currentTimestamp]);

  // Breakdown by Category
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catItems = items.filter((it) => it.category_id === cat.id);
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
  }, [categories, items]);

  return (
    <div className="space-y-6">
      {/* 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Assets */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Общо активи
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-navy-900">
              {stats.totalQty}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              в <strong>{stats.totalItems}</strong> заведени позиции
            </div>
          </div>
        </div>

        {/* Total Value in EUR € */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Стойност в Евро (€)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Euro className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-emerald-700">
              {formatEur(stats.totalValueEur)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              придобивна стойност
            </div>
          </div>
        </div>

        {/* Rooms / Cabinets */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Помещения
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-navy-900">
              {rooms.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              кабинети, лаборатории и зали
            </div>
          </div>
        </div>

        {/* In Warranty */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              В Гаранция
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-navy-900">
              {stats.inWarrantyCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              с активна фабрична гаранция
            </div>
          </div>
        </div>

        {/* Needs Repair or Missing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              За ремонт / Липсващи
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
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
      </div>

      {/* Main Grid: Category Distribution & Quick Actions */}
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

        {/* Quick Actions & Recent Activity */}
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

          {/* Recent Inventory Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-heading font-bold text-navy-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Последна активност</span>
            </h4>
            <div className="space-y-2.5">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-blue-500 pl-3 py-0.5 space-y-0.5">
                  <div className="font-semibold text-navy-900">
                    {log.action}
                  </div>
                  {log.notes && (
                    <div className="text-slate-500 truncate">{log.notes}</div>
                  )}
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
