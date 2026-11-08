import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Edit2,
  MessageSquare,
  Plus,
  Send,
  ShoppingCart,
  Trash2,
  User,
} from 'lucide-react';
import type { SchoolUserRecord } from '../../../lib/supabase';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatEur,
  type SchoolTicket,
  type TicketAuditLog,
  type TicketDepartment,
  type TicketMessage,
  type TicketOrder,
  type TicketPriority,
  type TicketStatus,
} from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';

interface TicketDetailViewProps {
  ticket: SchoolTicket;
  departments: TicketDepartment[];
  schoolUsers: SchoolUserRecord[];
  messages: TicketMessage[];
  auditLogs: TicketAuditLog[];
  orders: TicketOrder[];
  isStaffOrAdmin: boolean;
  onBack: () => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => Promise<void>;
  onPriorityChange: (ticketId: string, priority: TicketPriority) => Promise<void>;
  onAssigneeChange: (ticketId: string, userId: string | null) => Promise<void>;
  onSendMessage: (ticketId: string, text: string) => Promise<void>;
  onEditTicket: (
    ticketId: string,
    patch: {
      title: string;
      description: string;
      room_or_location?: string | null;
      department_id?: string | null;
    }
  ) => Promise<void>;
  onDeleteTicket: (ticketId: string) => Promise<void>;
  onCreateOrder: (input: {
    item_name: string;
    quantity: number;
    estimated_price?: number | null;
    ticket_id?: string | null;
  }) => Promise<void>;
}

export function TicketDetailView({
  ticket,
  departments,
  schoolUsers,
  messages,
  auditLogs,
  orders,
  isStaffOrAdmin,
  onBack,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onSendMessage,
  onEditTicket,
  onDeleteTicket,
  onCreateOrder,
}: TicketDetailViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Edit ticket state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDesc, setEditDesc] = useState(ticket.description);
  const [editRoom, setEditRoom] = useState(ticket.room_or_location || '');
  const [editDeptId, setEditDeptId] = useState(ticket.department_id || '');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Quick Order Modal
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderItem, setOrderItem] = useState('');
  const [orderQty, setOrderQty] = useState('1');
  const [orderPrice, setOrderPrice] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);

  const ticketMessages = messages.filter((m) => m.ticket_id === ticket.id);
  const ticketLogs = auditLogs.filter((l) => l.ticket_id === ticket.id);
  const ticketOrders = orders.filter((o) => o.ticket_id === ticket.id);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    await onSendMessage(ticket.id, newMessage);
    setNewMessage('');
    setSendingMsg(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDesc.trim()) return;
    setSavingEdit(true);
    await onEditTicket(ticket.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      room_or_location: editRoom.trim() || null,
      department_id: editDeptId || null,
    });
    setSavingEdit(false);
    setEditOpen(false);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderItem.trim()) return;
    setSavingOrder(true);
    await onCreateOrder({
      item_name: orderItem.trim(),
      quantity: Math.max(1, Number(orderQty) || 1),
      estimated_price: orderPrice ? Number(orderPrice) : null,
      ticket_id: ticket.id,
    });
    setOrderItem('');
    setOrderQty('1');
    setOrderPrice('');
    setSavingOrder(false);
    setOrderModalOpen(false);
  };

  const st = STATUS_LABELS[ticket.status];
  const pr = PRIORITY_LABELS[ticket.priority];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top back & actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад към списъка със заявки</span>
        </button>

        <div className="flex items-center gap-2">
          {isStaffOrAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditTitle(ticket.title);
                  setEditDesc(ticket.description);
                  setEditRoom(ticket.room_or_location || '');
                  setEditDeptId(ticket.department_id || '');
                  setEditOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-navy-900 text-xs font-semibold shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Редактирай</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Изтрий</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Details (8 cols) + Sidebar Control (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details, Description, Messages (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Detail Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${st.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${pr.bg} ${pr.text} ${pr.border}`}>
                Приоритет: {pr.label}
              </span>
              {ticket.room_or_location && (
                <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-0.5 rounded-md">
                  📍 {ticket.room_or_location}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 leading-snug">
              {ticket.title}
            </h1>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Подател: <strong>{ticket.creator_name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Подадена на: <strong>{new Date(ticket.created_at).toLocaleString('bg-BG')}</strong>
                </span>
              </div>
              <div>
                Отдел: <strong>{ticket.department_name}</strong>
              </div>
            </div>
          </div>

          {/* Messages & Discussion Thread */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h3 className="text-base font-heading font-bold text-navy-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Коментари и действия ({ticketMessages.length})</span>
              </h3>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {ticketMessages.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-navy-900">{m.sender_name}</strong>
                      <span className="text-slate-400">
                        {new Date(m.created_at).toLocaleDateString('bg-BG')}{' '}
                        {new Date(m.created_at).toLocaleTimeString('bg-BG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-0">
                      {m.message}
                    </p>
                  </div>
                ))}

                {ticketMessages.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400 mb-0">
                    Все още няма изпратени съобщения по тази заявка.
                  </p>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Напишете коментар или съобщение..."
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !newMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Изпрати</span>
                </button>
              </form>
            </div>
          </div>

          {/* Activity / Audit Timeline */}
          {ticketLogs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-heading font-bold text-navy-900">
                Хронология на промените
              </h3>
              <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
                {ticketLogs.map((log) => (
                  <div key={log.id} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                    <div>
                      <strong className="text-navy-900">{log.actor_name}</strong>: {log.action}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString('bg-BG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status & Assignment Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Status Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-heading font-bold text-navy-900">
              Управление на заявката
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Статус на изпълнение
              </label>
              <select
                value={ticket.status}
                disabled={!isStaffOrAdmin}
                onChange={(e) => void onStatusChange(ticket.id, e.target.value as TicketStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-navy-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="open">Нова заявка</option>
                <option value="in_progress">В процес на работа</option>
                <option value="resolved">Решена</option>
                <option value="closed">Затворена</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Приоритет
              </label>
              <select
                value={ticket.priority}
                disabled={!isStaffOrAdmin}
                onChange={(e) => void onPriorityChange(ticket.id, e.target.value as TicketPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-navy-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Нисък</option>
                <option value="medium">Нормален</option>
                <option value="high">Висок</option>
                <option value="urgent">🚨 Спешен</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Отговорник (Техник / Служител)
              </label>
              <select
                value={ticket.assigned_to_user_id || ''}
                disabled={!isStaffOrAdmin}
                onChange={(e) => void onAssigneeChange(ticket.id, e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-navy-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Неразпределен</option>
                {schoolUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linked Orders / Supplies in EUR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-heading font-bold text-navy-900 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-purple-600" />
                <span>Свързани поръчки (€)</span>
              </h3>
              {isStaffOrAdmin && (
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Поръчай</span>
                </button>
              )}
            </div>

            <div className="space-y-2 text-xs">
              {ticketOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-navy-900 truncate">{ord.item_name}</div>
                    <div className="text-[11px] text-slate-500">
                      {ord.quantity} бр. • {formatEur(ord.estimated_price)}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold shrink-0">
                    {ord.status}
                  </span>
                </div>
              ))}

              {ticketOrders.length === 0 && (
                <p className="text-xs text-slate-400 py-2 mb-0 text-center">
                  Няма поръчани части или консумативи към тази заявка.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Ticket Modal */}
      <ModuleModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Редакция на заявката"
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">Заглавие *</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">Отдел</label>
              <select
                value={editDeptId}
                onChange={(e) => setEditDeptId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Кабинет / Помещение
              </label>
              <input
                type="text"
                value={editRoom}
                onChange={(e) => setEditRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">Описание *</label>
            <textarea
              rows={4}
              required
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={savingEdit || !editTitle.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold"
            >
              {savingEdit ? 'Запазване...' : 'Запази промените'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Delete Ticket Confirmation */}
      <ModuleConfirmDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await onDeleteTicket(ticket.id);
          onBack();
        }}
        title="Изтриване на заявка"
        confirmLabel="Изтрий заявката"
        tone="danger"
        description="Сигурни ли сте, че искате да изтриете тази заявка? Всички коментари и прикачени поръчки към нея ще бъдат премахнати."
      />

      {/* Create Order Modal (in € EUR) */}
      <ModuleModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title="Заявка за поръчка на част / консуматив"
        subtitle={`Към заявка: ${ticket.title}`}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Артикул / Модел *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={orderItem}
              onChange={(e) => setOrderItem(e.target.value)}
              placeholder="напр. HDMI Кабел 5м или Тонер касета"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Количество (бр.)
              </label>
              <input
                type="number"
                min={1}
                required
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Ориентировъчна цена (€)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
                placeholder="напр. 24.50"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOrderModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={savingOrder || !orderItem.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold"
            >
              {savingOrder ? 'Записване...' : 'Създай поръчка'}
            </button>
          </div>
        </form>
      </ModuleModal>
    </div>
  );
}
