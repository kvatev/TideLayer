import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Building2,
  FileCheck2,
  LayoutDashboard,
  QrCode,
  Search,
} from 'lucide-react';
import { useSchoolPortal } from '../../components/layout/schoolPortalContext';
import { useInventoryStore } from './useInventoryStore';
import { InventoryDashboardView } from './components/InventoryDashboardView';
import { InventoryItemsView } from './components/InventoryItemsView';
import { InventoryRoomsView } from './components/InventoryRoomsView';
import { InventoryRoomDetailView } from './components/InventoryRoomDetailView';
import { InventoryAuditView } from './components/InventoryAuditView';
import { ModuleToastContainer, ModuleModal } from '../shared/ModulePrimitives';
import type { InventoryItem, InventoryRoom } from './types';
import { cn } from '../../utils/helpers';

export type InventorySubView = 'dashboard' | 'items' | 'rooms' | 'room_detail' | 'audit';

export function InventoryModuleApp() {
  const { bundle, session } = useSchoolPortal();
  const school = bundle.school;

  const store = useInventoryStore(school.id, school.name, {
    userId: session.userId,
    fullName: session.fullName,
    role: session.role,
  });

  const [currentView, setCurrentView] = useState<InventorySubView>('dashboard');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  // Quick Search / QR Scan State
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [quickScanModalOpen, setQuickScanModalOpen] = useState(false);
  const [scanInputText, setScanInputText] = useState('');

  // Selected Room Object
  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null;
    return store.rooms.find((r) => r.id === selectedRoomId) || null;
  }, [store.rooms, selectedRoomId]);

  // Handle Quick Search or QR scan submit
  const handlePerformLookup = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    // 1. Try to find asset by code, serial, or name
    const foundItem = store.items.find((it) => {
      const codeMatch = it.inventory_code.toLowerCase() === q;
      const serialMatch = it.serial_number?.toLowerCase() === q;
      const qrMatch = q.includes(it.inventory_code.toLowerCase());
      return codeMatch || serialMatch || qrMatch;
    });

    if (foundItem) {
      setFocusedItemId(foundItem.id);
      setCurrentView('items');
      setQuickScanModalOpen(false);
      setQuickSearchQuery('');
      setScanInputText('');
      store.pushToast('info', `Намерен актив: ${foundItem.name} (${foundItem.inventory_code})`);
      return;
    }

    // 2. Try to find room by room number or name
    const foundRoom = store.rooms.find((r) => {
      const numMatch = r.room_number?.toLowerCase() === q;
      const nameMatch = r.name.toLowerCase() === q;
      return numMatch || nameMatch;
    });

    if (foundRoom) {
      setSelectedRoomId(foundRoom.id);
      setCurrentView('room_detail');
      setQuickScanModalOpen(false);
      setQuickSearchQuery('');
      setScanInputText('');
      store.pushToast('info', `Намерено помещение: ${foundRoom.name}`);
      return;
    }

    // Fallback: switch to items and filter by query
    setCurrentView('items');
    setQuickScanModalOpen(false);
    store.pushToast('warning', `Няма точен единичен запис за „${query}“. Пренасочване към списъка с активи.`);
  };

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
          {currentView === 'room_detail' && selectedRoom && (
            <>
              <span>/</span>
              <span className="text-blue-600 font-semibold">{selectedRoom.name}</span>
            </>
          )}
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

      {/* Dynamic School Header + Quick QR Search */}
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

        {/* Quick QR & Barcode Lookup */}
        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformLookup(quickSearchQuery);
            }}
            className="relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickSearchQuery}
              onChange={(e) => setQuickSearchQuery(e.target.value)}
              placeholder="Инв. номер или S/N..."
              className="w-44 sm:w-56 pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
            />
          </form>

          <button
            type="button"
            onClick={() => setQuickScanModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
            title="Сканиране или бързо въвеждане на QR код"
          >
            <QrCode className="w-5 h-5" />
          </button>
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
          const isActive =
            currentView === tab.id || (tab.id === 'rooms' && currentView === 'room_detail');

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'rooms') {
                  setSelectedRoomId(null);
                }
                setCurrentView(tab.id as InventorySubView);
              }}
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
            audits={store.audits}
            movements={store.movements}
            notifications={store.notifications}
            onNavigateToItems={() => setCurrentView('items')}
            onNavigateToRooms={() => {
              setSelectedRoomId(null);
              setCurrentView('rooms');
            }}
            onNavigateToAudit={() => setCurrentView('audit')}
            onSelectRoomDetail={(r) => {
              setSelectedRoomId(r.id);
              setCurrentView('room_detail');
            }}
          />
        )}

        {currentView === 'items' && (
          <InventoryItemsView
            items={store.items}
            rooms={store.rooms}
            categories={store.categories}
            movements={store.movements}
            schoolName={school.name}
            onCreateItem={store.createItem}
            onEditItem={store.editItem}
            onDeleteItem={store.deleteItem}
            onWriteOffItem={store.writeOffItem}
            onArchiveItem={store.archiveItem}
            onSplitBatchItem={store.splitBatchItem}
            onMoveItem={store.moveItem}
            onCreateRepairTicket={store.createRepairTicket}
            onExportCsv={store.exportToCsv}
            onBulkImport={async (newItems) => {
              let count = 0;
              for (const it of newItems) {
                await store.createItem(it);
                count++;
              }
              return count;
            }}
            getNextCode={store.getNextInventoryCode}
            initialFocusedItemId={focusedItemId}
          />
        )}

        {currentView === 'rooms' && (
          <InventoryRoomsView
            rooms={store.rooms}
            items={store.items}
            schoolName={school.name}
            onSelectRoom={(r) => {
              setSelectedRoomId(r.id);
              setCurrentView('room_detail');
            }}
            onCreateRoom={store.createRoom}
            onEditRoom={store.editRoom}
            onArchiveRoom={store.archiveRoom}
            onDeleteRoom={store.deleteRoom}
          />
        )}

        {currentView === 'room_detail' && selectedRoom && (
          <InventoryRoomDetailView
            room={selectedRoom}
            allRooms={store.rooms}
            items={store.items}
            categories={store.categories}
            schoolName={school.name}
            onBack={() => {
              setSelectedRoomId(null);
              setCurrentView('rooms');
            }}
            onOpenCreateItemInRoom={() => {
              setCurrentView('items');
            }}
            onEditRoom={(r) => {
              store.editRoom(r.id, r);
            }}
            onToggleArchiveRoom={async (id, archived) => {
              await store.archiveRoom(id, archived);
              setSelectedRoomId(null);
              setCurrentView('rooms');
            }}
            onEditItem={(item) => {
              setFocusedItemId(item.id);
              setCurrentView('items');
            }}
            onMoveItemClick={(item) => {
              setFocusedItemId(item.id);
              setCurrentView('items');
            }}
            onRepairTicketClick={(item) => {
              setFocusedItemId(item.id);
              setCurrentView('items');
            }}
            onWriteOffClick={async (item) => {
              await store.writeOffItem(item.id, 'Бракуван от страница на помещението');
            }}
          />
        )}

        {currentView === 'audit' && (
          <InventoryAuditView
            items={store.items}
            rooms={store.rooms}
            categories={store.categories}
            audits={store.audits}
            movements={store.movements}
            logs={store.logs}
            schoolName={school.name}
            onStartAudit={store.startAudit}
            onCheckAuditItem={store.checkAuditItem}
            onCompleteAudit={store.completeAudit}
            onMoveItem={store.moveItem}
            onChangeCondition={store.changeItemCondition}
            currentUser={{
              fullName: session.fullName,
              role: session.role,
            }}
          />
        )}
      </main>

      {/* Quick QR Scanner / Lookup Modal */}
      <ModuleModal
        isOpen={quickScanModalOpen}
        title="Бързо намиране на актив по QR код или баркод"
        onClose={() => setQuickScanModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            Сканирайте баркода с хардуерен или телефонен баркод четец, или въведете инвентарния
            номер ръчно. Системата ще ви отведе директно в картона на актива.
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformLookup(scanInputText);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Въведете или сканирайте код:
              </label>
              <input
                type="text"
                autoFocus
                value={scanInputText}
                onChange={(e) => setScanInputText(e.target.value)}
                placeholder="напр. INV-2026-001 или SN-75-9821..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-sm font-bold focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickScanModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={!scanInputText.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-2xs"
              >
                Търси актив
              </button>
            </div>
          </form>
        </div>
      </ModuleModal>

      {/* Module Toasts */}
      <ModuleToastContainer toasts={store.toasts} onDismiss={store.dismissToast} />
    </div>
  );
}
