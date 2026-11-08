import { useState } from 'react';
import {
  Hash,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import type { ChannelMessage, TicketChannel } from '../types';
import { ModuleConfirmDialog, ModuleModal } from '../../shared/ModulePrimitives';

interface ChannelsViewProps {
  channels: TicketChannel[];
  channelMessages: ChannelMessage[];
  isStaffOrAdmin: boolean;
  onCreateChannel: (name: string, type?: string) => Promise<void>;
  onToggleActive?: (channelId: string, isActive: boolean) => Promise<void>;
  onDeleteChannel: (channelId: string) => Promise<void>;
  onSendMessage: (channelId: string, content: string) => void;
}

export function ChannelsView({
  channels,
  channelMessages,
  isStaffOrAdmin,
  onCreateChannel,
  onToggleActive: _onToggleActive,
  onDeleteChannel,
  onSendMessage,
}: ChannelsViewProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');
  const [newMsg, setNewMsg] = useState('');

  // Create Channel Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [chanName, setChanName] = useState('');
  const [chanType, setChanType] = useState('general');
  const [creating, setCreating] = useState(false);

  // Delete Channel Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const messagesForActive = activeChannel
    ? channelMessages.filter((m) => m.channel_id === activeChannel.id)
    : [];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chanName.trim()) return;
    setCreating(true);
    await onCreateChannel(chanName.trim(), chanType);
    setCreating(false);
    setChanName('');
    setCreateOpen(false);
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChannel) return;
    onSendMessage(activeChannel.id, newMsg.trim());
    setNewMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1 flex items-center gap-2">
            <Hash className="w-6 h-6 text-emerald-600" />
            <span>Училищни комуникационни канали</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            Вътрешни тематични канали за бърза връзка между учители, ръководство и технически екип
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Нов канал</span>
          </button>
        )}
      </div>

      {/* Main Channels Layout: Sidebar + Discussion Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Channel List Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-navy-900 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Канали ({channels.length})</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {channels.map((chan) => {
              const isSel = activeChannel?.id === chan.id;
              const count = channelMessages.filter((m) => m.channel_id === chan.id).length;

              return (
                <div
                  key={chan.id}
                  onClick={() => setSelectedChannelId(chan.id)}
                  className={`p-3.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    isSel ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Hash
                      className={`w-4 h-4 shrink-0 ${isSel ? 'text-emerald-600' : 'text-slate-400'}`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-navy-900 truncate">
                        {chan.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{chan.channel_type}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {count}
                    </span>
                    {isStaffOrAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(chan.id);
                        }}
                        className="text-slate-300 hover:text-red-600 p-1 transition-colors"
                        title="Изтрий"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {channels.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400 mb-0">
                Няма създадени канали.
              </p>
            )}
          </div>
        </div>

        {/* Discussion Area (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col min-h-[460px] overflow-hidden">
          {activeChannel ? (
            <>
              {/* Channel Header */}
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-heading font-bold text-navy-900 flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-emerald-600" />
                    <span>{activeChannel.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mb-0">
                    Тематична дискусия за училището • {activeChannel.channel_type}
                  </p>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-5 space-y-3.5 overflow-y-auto max-h-[380px]">
                {messagesForActive.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-navy-900">{msg.sender_name}</strong>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">
                          {msg.sender_role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(msg.created_at).toLocaleTimeString('bg-BG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-0">
                      {msg.content}
                    </p>
                  </div>
                ))}

                {messagesForActive.length === 0 && (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    Няма съобщения в този канал. Бъдете първият, който ще пише!
                  </div>
                )}
              </div>

              {/* Send Box */}
              <form onSubmit={handleSendSubmit} className="p-3.5 border-t border-slate-200 bg-slate-50/60 flex gap-2">
                <input
                  type="text"
                  required
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder={`Съобщение в #${activeChannel.name}...`}
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!newMsg.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Изпрати</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-sm">
              Изберете или създайте канал за разговор.
            </div>
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      <ModuleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Създаване на нов канал"
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Име на канала *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={chanName}
              onChange={(e) => setChanName(e.target.value)}
              placeholder="напр. учителска-колегия"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Категория / Тип
            </label>
            <select
              value={chanType}
              onChange={(e) => setChanType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
            >
              <option value="general">Общ (всички учители)</option>
              <option value="stem">STEM оборудване</option>
              <option value="tech">Технически персонал</option>
              <option value="admin">Училищно ръководство</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={creating || !chanName.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold"
            >
              {creating ? 'Създаване...' : 'Създай'}
            </button>
          </div>
        </form>
      </ModuleModal>

      {/* Delete Confirmation */}
      <ModuleConfirmDialog
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (deleteTargetId) await onDeleteChannel(deleteTargetId);
        }}
        title="Изтриване на канал"
        confirmLabel="Изтрий канала"
        tone="danger"
        description="Сигурни ли сте, че искате да изтриете този канал? Всички съобщения в него ще бъдат премахнати."
      />
    </div>
  );
}
