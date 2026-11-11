import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  ChevronDown,
  ClipboardList,
  FileText,
  Hash,
  History,
  LayoutDashboard,
  Megaphone,
  Plus,
  Settings,
} from 'lucide-react';
import { useSchoolPortal } from '../../components/layout/schoolPortalContext';
import { useTicketsStore } from './useTicketsStore';
import { TicketsDashboardView } from './components/TicketsDashboardView';
import { TicketsListView } from './components/TicketsListView';
import { TicketCreateView } from './components/TicketCreateView';
import { TicketDetailView } from './components/TicketDetailView';
import { DocumentRegisterView } from './components/DocumentRegisterView';
import { DocumentsHistoryView } from './components/DocumentsHistoryView';
import { InAppNotificationsPopover } from './components/InAppNotificationsPopover';
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
  | 'documents'
  | 'reports'
  | 'departments'
  | 'audit'
  | 'channels'
  | 'announcements';

export function TicketsModuleApp() {
  const { bundle, session } = useSchoolPortal();
  const school = bundle.school;

  const store = useTicketsStore(school, session, bundle.users);

  const isStaffOrAdmin =
    session.isSuperAdminPreview ||
    session.role === 'director' ||
    session.role === 'school_admin' ||
    session.role === 'deputy_director' ||
    session.role === 'administration' ||
    session.role === 'technician' ||
    session.role === 'staff';

  const [currentView, setCurrentView] = useState<TicketsSubView>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [documentsSubTab, setDocumentsSubTab] = useState<'register' | 'history'>('register');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

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
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-0">
          Зареждане на системата за задачи и документи...
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
            className="hover:underline text-navy-900 font-bold cursor-pointer"
          >
            Задачи и Документи
          </button>
          {currentView === 'detail' && selectedTicket && (
            <>
              <span>/</span>
              <span className="text-slate-400 truncate max-w-[180px] sm:max-w-xs font-mono font-bold">
                {selectedTicket.code || selectedTicket.title}
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

      {/* Module Title & Navigation Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-heading font-bold text-navy-900 leading-tight mb-0.5">
                Система за управление на задачи и документи
              </h1>
              <p className="text-xs text-slate-500 mb-0">
                {school.name}
                {school.city ? ` • гр. ${school.city}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* In-App Notifications Bell */}
            <InAppNotificationsPopover
              notifications={store.notifications}
              unreadCount={store.unreadNotificationsCount}
              onMarkAsRead={store.markNotificationAsRead}
              onMarkAllAsRead={store.markAllNotificationsAsRead}
              onDeleteNotification={store.deleteNotification}
              onNavigateToTask={(taskId) => handleNavigate('detail', { ticketId: taskId })}
              onNavigateToDocument={() => {
                setDocumentsSubTab('register');
                setCurrentView('documents');
              }}
            />

            {/* Quick Action: Create Task */}
            <button
              type="button"
              onClick={() => setCurrentView('create')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Възложи задача</span>
            </button>

            {/* Administrator Settings Dropdown */}
            {store.isDirectorOrAdmin && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer',
                    currentView === 'departments' || currentView === 'audit' || currentView === 'channels' || currentView === 'announcements'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Администрация</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {adminMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 space-y-1"
                    onClick={() => setAdminMenuOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setCurrentView('departments')}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer',
                        currentView === 'departments'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Направления и Отдели</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentView('audit')}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer',
                        currentView === 'audit'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <History className="w-4 h-4 text-emerald-600" />
                      <span>Журнал на събитията</span>
                    </button>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setCurrentView('channels')}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer',
                          currentView === 'channels'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <Hash className="w-4 h-4 text-slate-500" />
                        <span>Комуникационни канали</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentView('announcements')}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer',
                          currentView === 'announcements'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <Megaphone className="w-4 h-4 text-amber-500" />
                        <span>Официални съобщения</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4 Primary Navigation Tabs */}
        <nav
          aria-label="Навигация в модул Задачи и Документи"
          className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 border-t border-slate-100 scrollbar-none"
        >
          {[
            { id: 'dashboard', label: 'Табло', icon: LayoutDashboard },
            { id: 'list', label: 'Задачи', icon: ClipboardList },
            { id: 'documents', label: 'Документи', icon: FileText },
            { id: 'reports', label: 'Справки', icon: BarChart3 },
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
                    setCurrentView('list');
                  } else {
                    setCurrentView(tab.id as TicketsSubView);
                  }
                }}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer',
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
        {/* 1. Dashboard View */}
        {currentView === 'dashboard' && (
          <TicketsDashboardView
            tickets={store.tickets}
            departments={store.departments}
            announcements={store.announcements}
            allDocuments={store.allDocuments}
            taskActivityLogs={store.taskActivityLogs}
            notifications={store.notifications}
            currentUserId={session.userId}
            userRole={session.role}
            isDirectorOrAdmin={store.isDirectorOrAdmin}
            onNavigate={handleNavigate}
            canCreateTicket={true}
          />
        )}

        {/* 2. Tasks List View */}
        {currentView === 'list' && (
          <TicketsListView
            tickets={store.tickets}
            departments={store.departments}
            currentUserId={session.userId}
            onNavigate={handleNavigate}
            canCreateTicket={true}
          />
        )}

        {/* 3. Documents View (with sub-view toggle: Register vs Attachments History) */}
        {currentView === 'documents' && (
          <div className="space-y-4">
            {/* Sub-view switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs w-fit">
              <button
                type="button"
                onClick={() => setDocumentsSubTab('register')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  documentsSubTab === 'register'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-navy-900'
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Деловоден регистър (ВХ / ИЗХ / ВЪТР)</span>
              </button>

              <button
                type="button"
                onClick={() => setDocumentsSubTab('history')}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  documentsSubTab === 'history'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-navy-900'
                )}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Прикачени към задачи (1 г. архив)</span>
              </button>
            </div>

            {documentsSubTab === 'register' ? (
              <DocumentRegisterView
                documents={store.documentRegister}
                departments={store.departments}
                schoolUsers={bundle.users}
                tickets={store.tickets}
                currentUserId={session.userId}
                isStaffOrAdmin={isStaffOrAdmin}
                onRegisterDocument={store.registerDocument}
                onUpdateDocument={store.updateRegisterDocument}
                onDeleteDocument={store.deleteRegisterDocument}
                onToggleArchive={store.toggleArchiveRegisterDocument}
                onLinkToTask={store.linkRegisterDocumentToTask}
                onExportCsv={store.exportDocumentRegisterCsv}
                onNavigateToTask={(taskId) => handleNavigate('detail', { ticketId: taskId })}
              />
            ) : (
              <DocumentsHistoryView
                documents={store.allDocuments}
                tickets={store.tickets}
                currentUserId={session.userId}
                onNavigateToTask={(ticketId) => handleNavigate('detail', { ticketId })}
              />
            )}
          </div>
        )}

        {/* 4. Reports View */}
        {currentView === 'reports' && (
          <ReportsView
            tickets={store.tickets}
            departments={store.departments}
            allDocuments={store.allDocuments}
            documentRegister={store.documentRegister}
            schoolUsers={bundle.users}
            onExportCsv={store.exportTicketsCsv}
            onExportDocumentRegisterCsv={store.exportDocumentRegisterCsv}
          />
        )}

        {/* 5. Create Task View */}
        {currentView === 'create' && (
          <TicketCreateView
            session={session}
            departments={store.departments}
            schoolUsers={bundle.users}
            isStaffOrAdmin={isStaffOrAdmin}
            onBack={() => setCurrentView('list')}
            onCreate={store.createTicket}
          />
        )}

        {/* 6. Task Detail View */}
        {currentView === 'detail' && selectedTicket && (
          <TicketDetailView
            ticket={selectedTicket}
            departments={store.departments}
            schoolUsers={bundle.users}
            messages={store.messages}
            auditLogs={store.auditLogs}
            taskActivityLogs={store.taskActivityLogs}
            isStaffOrAdmin={isStaffOrAdmin}
            canApprove={store.canUserApproveTask(selectedTicket)}
            canManage={store.canUserManageTask(selectedTicket)}
            currentUserId={session.userId}
            onBack={() => setCurrentView('list')}
            onStatusChange={store.updateTicketStatus}
            onPriorityChange={store.updateTicketPriority}
            onAssigneeChange={store.updateTicketAssignee}
            onSendMessage={store.sendMessage}
            onStartWork={store.startWork}
            onSubmitForApproval={store.submitForApproval}
            onApproveTask={store.approveTask}
            onReturnForCorrection={store.returnForCorrection}
            onUpdateDeadline={store.updateTaskDeadline}
            onAddAttachment={store.addAttachmentToTask}
            onDeleteAttachment={store.deleteAttachment}
            onEditTicket={store.editTicket}
            onDeleteTicket={store.deleteTicket}
          />
        )}

        {/* 7. Departments & Members Admin View */}
        {currentView === 'departments' && store.isDirectorOrAdmin && (
          <DepartmentsAdminView
            departments={store.departments}
            tickets={store.tickets}
            schoolUsers={bundle.users}
            departmentMemberships={store.departmentMemberships}
            onCreateDepartment={store.createDepartment}
            onUpdateDepartment={store.updateDepartment}
            onDeleteDepartment={store.deleteDepartment}
            onAddMember={store.addDepartmentMember}
            onRemoveMember={store.removeDepartmentMember}
            onToggleLead={store.toggleDepartmentMemberLead}
          />
        )}

        {/* 8. Administrative Protected Journal View */}
        {currentView === 'audit' && store.isDirectorOrAdmin && (
          <AuditLogsView
            logs={store.auditLogs}
            onDeleteLog={store.deleteAuditLog}
            onClearAll={store.clearAuditLogs}
          />
        )}

        {/* 9. Channels View */}
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

        {/* 10. Announcements View */}
        {currentView === 'announcements' && (
          <AnnouncementsView
            announcements={store.announcements}
            isStaffOrAdmin={isStaffOrAdmin}
            onCreateAnnouncement={store.createAnnouncement}
            onTogglePin={store.togglePinAnnouncement}
            onDeleteAnnouncement={store.deleteAnnouncement}
          />
        )}
      </div>

      {/* Shared Module Toasts */}
      <ModuleToastContainer toasts={store.toasts} onDismiss={store.dismissToast} />
    </div>
  );
}
