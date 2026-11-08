import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import {
  ORDER_STATUS_LABELS,
  formatEur,
  type OrderStatus,
  type SchoolTicket,
  type TicketOrder,
} from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';

interface OrdersViewProps {
  orders: TicketOrder[];
  tickets: SchoolTicket[];
  isStaffOrAdmin: boolean;
  onCreateOrder: (input: {
    item_name: string;
    quantity: number;
    estimated_price?: number | null;
    ticket_id?: string | null;
  }) => Promise<void>;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

export function OrdersView({
  orders,
  tickets,
  isStaffOrAdmin,
  onCreateOrder,
  onUpdateStatus,
  onDeleteOrder,
}: OrdersViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchItem = o.item_name.toLowerCase().includes(q);
        const matchTicket = (o.ticket_title || '').toLowerCase().includes(q);
        if (!matchItem && !matchTicket) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const totalCostEur = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.estimated_price || 0) * (o.quantity || 1), 0);
  }, [filteredOrders]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    setSubmitting(true);
    await onCreateOrder({
      item_name: itemName.trim(),
      quantity: Math.max(1, Number(quantity) || 1),
      estimated_price: estimatedPrice ? Number(estimatedPrice) : null,
      ticket_id: ticketId || null,
    });
    setSubmitting(false);
    setItemName('');
    setQuantity('1');
    setEstimatedPrice('');
    setTicketId('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-purple-600" />
            <span>Заявки за доставки и поръчки</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Оборудване, консумативи, тонери и резервни части (цените са в евро — €)
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Нова поръчка</span>
          </button>
        )}
      </div>

      {/* Filter and Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търсене на артикул..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50/60 font-medium text-navy-900 focus:bg-white"
          >
            <option value="all">Всички статуси</option>
            <option value="pending">Чака одобрение</option>
            <option value="approved">Одобрена</option>
            <option value="ordered">Поръчана</option>
            <option value="delivered">Доставена</option>
            <option value="rejected">Отхвърлена</option>
          </select>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-xl self-start sm:self-auto">
          Ориентировъчна сума: <strong className="text-purple-950 font-bold">{formatEur(totalCostEur)}</strong>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] text-xs sm:text-sm">
            <thead>
              <tr className="bg-navy-900 text-white font-heading font-semibold">
                <th className="py-3.5 px-4">Артикул / Консуматив</th>
                <th className="py-3.5 px-3">Свързана заявка</th>
                <th className="py-3.5 px-3">К-во</th>
                <th className="py-3.5 px-3">Цена за бр. (€)</th>
                <th className="py-3.5 px-3">Общо (€)</th>
                <th className="py-3.5 px-3">Статус</th>
                {isStaffOrAdmin && <th className="py-3.5 px-4 text-right">Действия</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => {
                const st = ORDER_STATUS_LABELS[ord.status] || ORDER_STATUS_LABELS.pending;
                const totalItemEur = (ord.estimated_price || 0) * (ord.quantity || 1);

                return (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-900">{ord.item_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(ord.created_at).toLocaleDateString('bg-BG')}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {ord.ticket_title ? (
                        <span className="truncate max-w-[200px] block" title={ord.ticket_title}>
                          🎫 {ord.ticket_title}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Обща поръчка</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-navy-900">
                      {ord.quantity} бр.
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      {formatEur(ord.estimated_price)}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-purple-700">
                      {formatEur(totalItemEur)}
                    </td>
                    <td className="py-3.5 px-3">
                      {isStaffOrAdmin ? (
                        <select
                          value={ord.status}
                          onChange={(e) => void onUpdateStatus(ord.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${st.bg} ${st.text}`}
                        >
                          <option value="pending">Чака одобрение</option>
                          <option value="approved">Одобрена</option>
                          <option value="ordered">Поръчана</option>
                          <option value="delivered">Доставена</option>
                          <option value="rejected">Отхвърлена</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      )}
                    </td>
                    {isStaffOrAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(ord.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                          title="Изтрий"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={isStaffOrAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                    Няма регистрирани поръчки.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      <ModuleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Нова заявка за поръчка на материали"
        subtitle="Въведете артикул, количество и прогнозна цена в евро (€)"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Наименование на артикула *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="напр. Клавиатури USB 5 броя или Тонер HP"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Количество
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Цена за брой (€)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="25.00"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Свържи със съществуваща заявка (по избор)
            </label>
            <select
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
            >
              <option value="">Няма (самостоятелна поръчка)</option>
              {tickets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.room_or_location || 'Без стая'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={submitting || !itemName.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold"
            >
              {submitting ? 'Записване...' : 'Запиши поръчката'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Delete Confirmation */}
      <ModuleConfirmDialog
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) await onDeleteOrder(deleteTargetId);
        }}
        title="Изтриване на поръчка"
        confirmLabel="Изтрий"
        tone="danger"
        description="Сигурни ли сте, че искате да изтриете този запис за поръчка?"
      />
    </div>
  );
}
