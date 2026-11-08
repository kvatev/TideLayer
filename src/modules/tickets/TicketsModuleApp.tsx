import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  Hash,
  History,
  LayoutDashboard,
  Megaphone,
  Plus,
  ShoppingCart,
  Ticket,
  Wrench,
} from 'lucide-react';
import { useSchoolPortal } from '../../components/layout/schoolPortalContext';
import { useTicketsStore } from './useTicketsStore';
import { TicketsDashboardView } from './components/TicketsDashboardView';
import { TicketsListView } from './components/TicketsListView';
import { TicketCreateView } from './components/TicketCreateView';
import { TicketDetailView } from './components/TicketDetailView';
import { OrdersView } from './components/OrdersView';
import { ChannelsView } from './components/ChannelsView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { DepartmentsAdminView } from './components/DepartmentsAdminView';
import { ReportsView } from './components/ReportsView';
import { AuditLogsView } from './components/AuditLogsView';
import { ModuleToastContainer } from '../shared/ModulePrimitives';
import { cn } from '../../utils/helpers';

export type TicketsSubView =
  | 'dashboard'
  | 'list'
  | 'create'
  | 'detail'
  | 'orders'
  | 'channels'
  | 'announcements'
  | 'departments'
  | 'reports'
  | 'audit';

export function TicketsModuleApp() {
  const { bundle, session } = useSchoolPortal();
  const school = bundle.school;

  const store = useTicketsStore(school, session, bundle.users);

  const isStaffOrAdmin =
    session.isSuperAdminPreview ||
    session.role === 'school_admin' ||
    session.role === 'technician' ||
    session.role === 'staff';

  const [currentView, setCurrentView] = useState<TicketsSubView>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleNavigate = (view: string, params?: { ticketId?: string }) => {
    if (params?.ticketId) {
      setSelectedTicketId(params.ticketId);
    }
    setCurrentView(view as TicketsSubView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (store.isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-0">
          Зареждане на системата за заявки...
        </p>
      </div>
    );
  }

  const selectedTicket = store.tickets.find((t) => t.id === selectedTicketId) || null;

  return (
    <div className="space-y-5">
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
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="hover:underline text-navy-900 font-bold"
          >
            Система за заявки
          </button>
          {currentView === 'detail' && selectedTicket && (
            <>
              <span>/</span>
              <span className="text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                {selectedTicket.title}
              </span>
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
              title="Таблиците в Supabase още не са инициализирани. Промените се пазят надеждно локално."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Локален режим</span>
            </span>
          )}
        </div>
      </div>

      {/* Module Title & Sub-navigation bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-heading font-bold text-navy-900 leading-tight mb-0.5">
                Система за заявки и поддръжка
              </h1>
              <p className="text-xs text-slate-500 mb-0">
                {school.name}
                {school.city ? ` • гр. ${school.city}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('create')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Подай заявка</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav
          aria-label="Навигация в модул Заявки"
          className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 border-t border-slate-100 scrollbar-none"
        >
          {[
            { id: 'dashboard', label: 'Табло', icon: LayoutDashboard },
            { id: 'list', label: 'Заявки', icon: Ticket },
            { id: 'orders', label: 'Поръчки (€)', icon: ShoppingCart },
            { id: 'channels', label: 'Канали', icon: Hash },
            { id: 'announcements', label: 'Съобщения', icon: Megaphone },
            ...(isStaffOrAdmin
              ? [
                  { id: 'departments', label: 'Отдели', icon: Building2 },
                  { id: 'reports', label: 'Справки', icon: BarChart3 },
                  { id: 'audit', label: 'Журнал', icon: History },
                ]
              : []),
          ].map((tab) => {
            const IconEl = tab.icon;
            const isCurrent =
              currentView === tab.id || (tab.id === 'list' && currentView === 'detail');

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'list' && currentView === 'detail') {
                    // stay in detail or switch to list
                    setCurrentView('list');
                  } else {
                    setCurrentView(tab.id as TicketsSubView);
                  }
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                  isCurrent
                    ? 'bg-navy-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                )}
              >
                <IconEl className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main View Render */}
      <div>
        {currentView === 'dashboard' && (
          <TicketsDashboardView
            tickets={store.tickets}
            departments={store.departments}
            announcements={store.announcements}
            onNavigate={handleNavigate}
            canCreateTicket={true}
          />
        )}

        {currentView === 'list' && (
          <TicketsListView
            tickets={store.tickets}
            departments={store.departments}
            currentUserId={session.userId}
            onNavigate={handleNavigate}
            canCreateTicket={true}
          />
        )}

        {currentView === 'create' && (
          <TicketCreateView
            departments={store.departments}
            schoolUsers={bundle.users}
            isStaffOrAdmin={isStaffOrAdmin}
            onBack={() => setCurrentView('list')}
            onCreate={store.createTicket}
          />
        )}

        {currentView === 'detail' && selectedTicket && (
          <TicketDetailView
            ticket={selectedTicket}
            departments={store.departments}
            schoolUsers={bundle.users}
            messages={store.messages}
            auditLogs={store.auditLogs}
            orders={store.orders}
            isStaffOrAdmin={isStaffOrAdmin}
            onBack={() => setCurrentView('list')}
            onStatusChange={store.updateTicketStatus}
            onPriorityChange={store.updateTicketPriority}
            onAssigneeChange={store.updateTicketAssignee}
            onSendMessage={store.sendMessage}
            onEditTicket={store.editTicket}
            onDeleteTicket={store.deleteTicket}
            onCreateOrder={store.createOrder}
          />
        )}

        {currentView === 'orders' && (
          <OrdersView
            orders={store.orders}
            tickets={store.tickets}
            isStaffOrAdmin={isStaffOrAdmin}
            onCreateOrder={store.createOrder}
            onUpdateStatus={store.updateOrderStatus}
            onDeleteOrder={store.deleteOrder}
          />
        )}

        {currentView === 'channels' && (
          <ChannelsView
            channels={store.channels}
            channelMessages={store.channelMessages}
            isStaffOrAdmin={isStaffOrAdmin}
            onCreateChannel={store.createChannel}
            onToggleActive={store.toggleChannelActive}
            onDeleteChannel={store.deleteChannel}
            onSendMessage={store.sendChannelMessage}
          />
        )}

        {currentView === 'announcements' && (
          <AnnouncementsView
            announcements={store.announcements}
            isStaffOrAdmin={isStaffOrAdmin}
            onCreateAnnouncement={store.createAnnouncement}
            onTogglePin={store.togglePinAnnouncement}
            onDeleteAnnouncement={store.deleteAnnouncement}
          />
        )}

        {currentView === 'departments' && isStaffOrAdmin && (
          <DepartmentsAdminView
            departments={store.departments}
            tickets={store.tickets}
            onCreateDepartment={store.createDepartment}
            onUpdateDepartment={store.updateDepartment}
            onDeleteDepartment={store.deleteDepartment}
          />
        )}

        {currentView === 'reports' && isStaffOrAdmin && (
          <ReportsView
            tickets={store.tickets}
            departments={store.departments}
            orders={store.orders}
            onExportCsv={store.exportTicketsCsv}
          />
        )}

        {currentView === 'audit' && isStaffOrAdmin && (
          <AuditLogsView
            logs={store.auditLogs}
            onDeleteLog={store.deleteAuditLog}
            onClearAll={store.clearAuditLogs}
          />
        )}
      </div>

      {/* Shared Module Toasts */}
      <ModuleToastContainer toasts={store.toasts} onDismiss={store.dismissToast} />
    </div>
  );
}

