import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Building2,
  FileCheck2,
  LayoutDashboard,
} from 'lucide-react';
import { useSchoolPortal } from '../../components/layout/schoolPortalContext';
import { useInventoryStore } from './useInventoryStore';
import { InventoryDashboardView } from './components/InventoryDashboardView';
import { InventoryItemsView } from './components/InventoryItemsView';
import { InventoryRoomsView } from './components/InventoryRoomsView';
import { InventoryAuditView } from './components/InventoryAuditView';
import { ModuleToastContainer } from '../shared/ModulePrimitives';
import { cn } from '../../utils/helpers';

export type InventorySubView = 'dashboard' | 'items' | 'rooms' | 'audit';

export function InventoryModuleApp() {
  const { bundle, session } = useSchoolPortal();
  const school = bundle.school;

  const store = useInventoryStore(school.id, school.name, {
    userId: session.userId,
    fullName: session.fullName,
    role: session.role,
  });

  const [currentView, setCurrentView] = useState<InventorySubView>('dashboard');

  if (store.isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-0">
          Зареждане на инвентарната система...
        </p>
      </div>
    );
  }

  const currentLogo = school.logo_url || '';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link
            to={`/school/${school.slug}`}
            className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>Табло на училището</span>
          </Link>
          <span>/</span>
          <span className="text-navy-900 font-bold">Инвентарна система</span>
        </div>

        <div className="flex items-center gap-2">
          {store.usingSupabase ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Supabase Cloud</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold"
              title="Данните се пазят надеждно в изолирания сторидж на браузъра за това училище."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Локален режим</span>
            </span>
          )}
        </div>
      </div>

      {/* Dynamic School Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {currentLogo ? (
            <img
              src={currentLogo}
              alt={school.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-slate-50 border border-slate-200 p-1.5 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Boxes className="w-8 h-8" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 leading-tight truncate mb-1">
              Училищна инвентарна система
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mb-0">
              {school.city ? `${school.name}, гр. ${school.city}` : school.name}
            </p>
          </div>
        </div>
      </div>

      {/* Module Sub-Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'dashboard', label: 'Табло', icon: LayoutDashboard },
          { id: 'items', label: 'Инвентар и Активи', icon: Boxes },
          { id: 'rooms', label: 'Кабинети и Зали', icon: Building2 },
          { id: 'audit', label: 'Ревизия и Движение', icon: FileCheck2 },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentView(tab.id as InventorySubView)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              )}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Subview Content */}
      <main className="space-y-6">
        {currentView === 'dashboard' && (
          <InventoryDashboardView
            items={store.items}
            rooms={store.rooms}
            categories={store.categories}
            logs={store.logs}
            onNavigateToItems={() => setCurrentView('items')}
            onNavigateToRooms={() => setCurrentView('rooms')}
            onNavigateToAudit={() => setCurrentView('audit')}
          />
        )}

        {currentView === 'items' && (
          <InventoryItemsView
            items={store.items}
            rooms={store.rooms}
            categories={store.categories}
            onCreateItem={store.createItem}
            onEditItem={store.editItem}
            onDeleteItem={store.deleteItem}
            onCreateRepairTicket={store.createRepairTicket}
            getNextCode={store.getNextInventoryCode}
          />
        )}

        {currentView === 'rooms' && (
          <InventoryRoomsView
            rooms={store.rooms}
            items={store.items}
            schoolName={school.name}
            onCreateRoom={store.createRoom}
            onEditRoom={store.editRoom}
            onDeleteRoom={store.deleteRoom}
          />
        )}

        {currentView === 'audit' && (
          <InventoryAuditView
            items={store.items}
            rooms={store.rooms}
            logs={store.logs}
            schoolName={school.name}
            onMoveItem={store.moveItem}
            onChangeCondition={store.changeItemCondition}
          />
        )}
      </main>

      {/* Module Toasts */}
      <ModuleToastContainer toasts={store.toasts} onDismiss={store.dismissToast} />
    </div>
  );
}
