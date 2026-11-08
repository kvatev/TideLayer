import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type {
  InventoryCategory,
  InventoryItem,
  InventoryLog,
  InventoryRoom,
  ItemCondition,
} from './types';
import { isValidUuid, makeUuid } from './types';
import {
  getDefaultCategories,
  getDefaultItems,
  getDefaultLogs,
  getDefaultRooms,
} from './defaultInventoryData';
import type { ToastMessage } from '../shared/ModulePrimitives';

interface LocalInventorySnapshot {
  categories: InventoryCategory[];
  rooms: InventoryRoom[];
  items: InventoryItem[];
  logs: InventoryLog[];
}

export interface CreateItemInput {
  name: string;
  inventory_code?: string;
  brand_or_model?: string;
  serial_number?: string;
  category_id?: string | null;
  room_id?: string | null;
  assigned_to?: string;
  quantity?: number;
  condition?: ItemCondition;
  purchase_date?: string;
  warranty_until?: string;
  purchase_price?: number | null; // in EUR €
  notes?: string;
}

export function useInventoryStore(
  schoolId: string,
  schoolName: string,
  userSession: { userId: string; fullName: string; role: string }
) {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [rooms, setRooms] = useState<InventoryRoom[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const storageKey = `tl_inventory_saas_v2_${schoolId}`;

  const pushToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = makeUuid();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save to local storage mirror
  const saveLocalMirror = useCallback(
    (patch: Partial<LocalInventorySnapshot>) => {
      try {
        const raw = localStorage.getItem(storageKey);
        const existing: LocalInventorySnapshot = raw
          ? JSON.parse(raw)
          : { categories: [], rooms: [], items: [], logs: [] };
        const updated: LocalInventorySnapshot = { ...existing, ...patch };
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  // Add Log Entry
  const addLog = useCallback(
    async (action: string, itemId: string | null, notes?: string, itemName?: string) => {
      const logItem: InventoryLog = {
        id: makeUuid(),
        school_id: schoolId,
        item_id: itemId,
        item_name: itemName,
        actor_name: userSession.fullName || 'Служител',
        action,
        notes: notes || null,
        created_at: new Date().toISOString(),
      };

      setLogs((prev) => [logItem, ...prev]);
      saveLocalMirror({ logs: [logItem, ...logs] });

      if (usingSupabase) {
        await supabase.from('inventory_logs').insert({
          id: logItem.id,
          school_id: schoolId,
          item_id: isValidUuid(itemId) ? itemId : null,
          actor_name: logItem.actor_name,
          action: logItem.action,
          notes: logItem.notes,
        });
      }
    },
    [schoolId, userSession.fullName, logs, usingSupabase, saveLocalMirror]
  );

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const [cRes, rRes, iRes, lRes] = await Promise.all([
        supabase.from('inventory_categories').select('*').eq('school_id', schoolId),
        supabase.from('inventory_rooms').select('*').eq('school_id', schoolId),
        supabase.from('inventory_items').select('*').eq('school_id', schoolId).order('created_at', { ascending: false }),
        supabase.from('inventory_logs').select('*').eq('school_id', schoolId).order('created_at', { ascending: false }),
      ]);

      if (!active) return;
      const supabaseAvailable = !cRes.error && !rRes.error && !iRes.error;

      if (
        supabaseAvailable &&
        ((cRes.data && cRes.data.length > 0) ||
          (rRes.data && rRes.data.length > 0) ||
          (iRes.data && iRes.data.length > 0))
      ) {
        setUsingSupabase(true);
        setCategories(cRes.data as InventoryCategory[]);
        setRooms(rRes.data as InventoryRoom[]);
        setItems(
          (iRes.data || []).map((row) => ({
            ...row,
            purchase_price: row.purchase_price !== null ? Number(row.purchase_price) : null,
          })) as InventoryItem[]
        );
        setLogs((lRes.data as InventoryLog[]) || []);
        setIsLoading(false);
        return;
      }

      // Try Local Mirror
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          const snap = JSON.parse(raw) as LocalInventorySnapshot;
          if (snap.items?.length || snap.rooms?.length) {
            setCategories(snap.categories || []);
            setRooms(snap.rooms || []);
            setItems(snap.items || []);
            setLogs(snap.logs || []);
            setUsingSupabase(false);
            setIsLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      // Seed default starter data for school
      const defCats = getDefaultCategories(schoolId);
      const defRooms = getDefaultRooms(schoolId);
      const defItems = getDefaultItems(schoolId, defCats, defRooms);
      const defLogs = getDefaultLogs(schoolId, defItems);

      setCategories(defCats);
      setRooms(defRooms);
      setItems(defItems);
      setLogs(defLogs);
      setUsingSupabase(false);

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          categories: defCats,
          rooms: defRooms,
          items: defItems,
          logs: defLogs,
        })
      );

      setIsLoading(false);
    };

    void loadData();
    return () => {
      active = false;
    };
  }, [schoolId, storageKey]);

  // Fast maps
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Joined Items with Room & Category Names
  const enrichedItems = useMemo(() => {
    return items.map((it) => ({
      ...it,
      room_name: it.room_id ? roomMap.get(it.room_id)?.name || 'Неразпределен' : 'Неразпределен',
      category_name: it.category_id ? catMap.get(it.category_id)?.name || 'Общи' : 'Общи',
    }));
  }, [items, roomMap, catMap]);

  // Auto-generate next inventory code: INV-2026-0042
  const getNextInventoryCode = useCallback(() => {
    const year = new Date().getFullYear();
    const count = items.length + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  }, [items.length]);

  // CREATE ITEM
  const createItem = useCallback(
    async (input: CreateItemInput): Promise<InventoryItem> => {
      const now = new Date().toISOString();
      const code = input.inventory_code?.trim() || getNextInventoryCode();
      const validRoomId = input.room_id && isValidUuid(input.room_id) ? input.room_id : input.room_id || null;
      const validCatId = input.category_id && isValidUuid(input.category_id) ? input.category_id : input.category_id || null;

      const newItem: InventoryItem = {
        id: makeUuid(),
        school_id: schoolId,
        room_id: validRoomId,
        category_id: validCatId,
        name: input.name.trim(),
        inventory_code: code,
        brand_or_model: input.brand_or_model?.trim() || null,
        serial_number: input.serial_number?.trim() || null,
        quantity: Math.max(1, input.quantity || 1),
        condition: input.condition || 'good',
        assigned_to: input.assigned_to?.trim() || null,
        purchase_date: input.purchase_date || null,
        warranty_until: input.warranty_until || null,
        purchase_price:
          input.purchase_price !== null && input.purchase_price !== undefined
            ? Number(input.purchase_price)
            : null,
        notes: input.notes?.trim() || null,
        created_at: now,
        updated_at: now,
      };

      const next = [newItem, ...items];
      setItems(next);
      saveLocalMirror({ items: next });

      if (usingSupabase) {
        await supabase.from('inventory_items').insert({
          id: newItem.id,
          school_id: schoolId,
          room_id: isValidUuid(newItem.room_id) ? newItem.room_id : null,
          category_id: isValidUuid(newItem.category_id) ? newItem.category_id : null,
          name: newItem.name,
          inventory_code: newItem.inventory_code,
          serial_number: newItem.serial_number,
          quantity: newItem.quantity,
          condition: newItem.condition,
          assigned_to: newItem.assigned_to,
          purchase_date: newItem.purchase_date,
          purchase_price: newItem.purchase_price,
          notes: newItem.notes,
        });
      }

      await addLog('Завеждане на нов актив', newItem.id, `Код: ${newItem.inventory_code}`, newItem.name);
      pushToast('success', `Активът „${newItem.name}“ е добавен в инвентара.`);
      return newItem;
    },
    [schoolId, items, getNextInventoryCode, usingSupabase, saveLocalMirror, addLog, pushToast]
  );

  // EDIT ITEM
  const editItem = useCallback(
    async (itemId: string, patch: Partial<CreateItemInput>) => {
      const now = new Date().toISOString();
      const validRoomId = patch.room_id !== undefined ? (patch.room_id && isValidUuid(patch.room_id) ? patch.room_id : patch.room_id || null) : undefined;
      const validCatId = patch.category_id !== undefined ? (patch.category_id && isValidUuid(patch.category_id) ? patch.category_id : patch.category_id || null) : undefined;

      const next = items.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          ...(patch.name ? { name: patch.name.trim() } : {}),
          ...(patch.inventory_code ? { inventory_code: patch.inventory_code.trim() } : {}),
          ...(patch.brand_or_model !== undefined ? { brand_or_model: patch.brand_or_model?.trim() || null } : {}),
          ...(patch.serial_number !== undefined ? { serial_number: patch.serial_number?.trim() || null } : {}),
          ...(validRoomId !== undefined ? { room_id: validRoomId } : {}),
          ...(validCatId !== undefined ? { category_id: validCatId } : {}),
          ...(patch.assigned_to !== undefined ? { assigned_to: patch.assigned_to?.trim() || null } : {}),
          ...(patch.quantity !== undefined ? { quantity: Math.max(1, patch.quantity) } : {}),
          ...(patch.condition !== undefined ? { condition: patch.condition } : {}),
          ...(patch.purchase_date !== undefined ? { purchase_date: patch.purchase_date || null } : {}),
          ...(patch.warranty_until !== undefined ? { warranty_until: patch.warranty_until || null } : {}),
          ...(patch.purchase_price !== undefined ? { purchase_price: patch.purchase_price !== null ? Number(patch.purchase_price) : null } : {}),
          ...(patch.notes !== undefined ? { notes: patch.notes?.trim() || null } : {}),
          updated_at: now,
        };
      });

      setItems(next);
      saveLocalMirror({ items: next });

      const updated = next.find((it) => it.id === itemId);

      if (usingSupabase && isValidUuid(itemId) && updated) {
        await supabase
          .from('inventory_items')
          .update({
            name: updated.name,
            inventory_code: updated.inventory_code,
            serial_number: updated.serial_number,
            room_id: isValidUuid(updated.room_id) ? updated.room_id : null,
            category_id: isValidUuid(updated.category_id) ? updated.category_id : null,
            assigned_to: updated.assigned_to,
            quantity: updated.quantity,
            condition: updated.condition,
            purchase_date: updated.purchase_date,
            purchase_price: updated.purchase_price,
            notes: updated.notes,
            updated_at: now,
          })
          .eq('id', itemId)
          .eq('school_id', schoolId);
      }

      await addLog('Редакция на данни за актив', itemId, `Обновени параметри`, updated?.name);
      pushToast('success', 'Данните за актива са обновени.');
    },
    [items, usingSupabase, schoolId, saveLocalMirror, addLog, pushToast]
  );

  // DELETE ITEM
  const deleteItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      const target = items.find((i) => i.id === itemId);
      const next = items.filter((i) => i.id !== itemId);
      setItems(next);
      saveLocalMirror({ items: next });

      if (usingSupabase && isValidUuid(itemId)) {
        await supabase.from('inventory_items').delete().eq('id', itemId).eq('school_id', schoolId);
      }

      await addLog('Изтриване от инвентара', null, `Изтрит артикул: ${target?.name} (${target?.inventory_code})`);
      pushToast('info', 'Артикулът е изтрит от инвентара.');
      return true;
    },
    [items, usingSupabase, schoolId, saveLocalMirror, addLog, pushToast]
  );

  // MOVE ITEM (Relocation)
  const moveItem = useCallback(
    async (itemId: string, targetRoomId: string, targetMol?: string, notes?: string) => {
      const target = items.find((i) => i.id === itemId);
      if (!target) return;

      const oldRoomName = roomMap.get(target.room_id || '')?.name || 'Предишно помещение';
      const newRoomName = roomMap.get(targetRoomId)?.name || 'Ново помещение';
      const effectiveMol = targetMol || roomMap.get(targetRoomId)?.responsible_person || target.assigned_to;

      await editItem(itemId, {
        room_id: targetRoomId,
        assigned_to: effectiveMol || undefined,
        notes: notes ? `${target.notes ? target.notes + ' | ' : ''}Преместен: ${notes}` : target.notes || undefined,
      });

      await addLog(
        `Преместване на актив: ${oldRoomName} → ${newRoomName}`,
        itemId,
        `Нов МОЛ: ${effectiveMol || 'Няма'}. Бележка: ${notes || 'няма'}`,
        target.name
      );

      pushToast('success', `Активът е преместен в „${newRoomName}“.`);
    },
    [items, roomMap, editItem, addLog, pushToast]
  );

  // CHANGE CONDITION (Quick status)
  const changeItemCondition = useCallback(
    async (itemId: string, condition: ItemCondition, reason?: string) => {
      const target = items.find((i) => i.id === itemId);
      if (!target) return;

      await editItem(itemId, { condition });
      await addLog(
        `Промяна на състоянието: ${condition}`,
        itemId,
        reason || `Актуализация на статуса`,
        target.name
      );
    },
    [items, editItem, addLog]
  );

  // CROSS-MODULE: CREATE REPAIR TICKET IN `tickets` MODULE
  const createRepairTicket = useCallback(
    async (
      itemId: string,
      problemTitle: string,
      details: string,
      priority: 'low' | 'medium' | 'high' | 'urgent' = 'high'
    ) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const roomName = roomMap.get(item.room_id || '')?.name || 'Неуточнена стая';
      const fullTitle = `[Инвентар: ${item.inventory_code}] ${problemTitle || item.name}`;
      const description = `${details}\n\n• Актив: ${item.name} (${item.brand_or_model || 'Няма модел'})\n• Инвентарен номер: ${item.inventory_code}\n• Сериен номер: ${item.serial_number || 'Няма'}\n• Помещение: ${roomName}\n• МОЛ: ${item.assigned_to || 'Няма'}`;

      // Update condition to needs_repair
      await changeItemCondition(itemId, 'needs_repair', `Подадена сервизна заявка: ${problemTitle}`);

      // Push to tickets in Supabase / Local tickets store
      const newTicketId = makeUuid();
      const now = new Date().toISOString();

      try {
        if (usingSupabase) {
          await supabase.from('tickets').insert({
            id: newTicketId,
            school_id: schoolId,
            title: fullTitle,
            description,
            room_or_location: roomName,
            priority,
            status: 'open',
          });
        }
      } catch {
        // ignore
      }

      // Also mirror into local tickets store if exists
      try {
        const ticketKey = `tl_tickets_saas_v2_${schoolId}`;
        const raw = localStorage.getItem(ticketKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const tks = parsed.tickets || [];
          tks.unshift({
            id: newTicketId,
            school_id: schoolId,
            department_id: null,
            created_by_user_id: userSession.userId || null,
            assigned_to_user_id: null,
            title: fullTitle,
            description,
            room_or_location: roomName,
            priority,
            status: 'open',
            created_at: now,
            updated_at: now,
          });
          localStorage.setItem(ticketKey, JSON.stringify({ ...parsed, tickets: tks }));
        }
      } catch {
        // ignore
      }

      pushToast('success', `Задачата за ремонт на „${item.name}“ е регистрирана в Система за задачи и документи!`);
    },
    [items, roomMap, schoolId, userSession.userId, usingSupabase, changeItemCondition, pushToast]
  );

  // CRUD ROOMS
  const createRoom = useCallback(
    async (name: string, buildingOrFloor?: string, responsiblePerson?: string) => {
      const room: InventoryRoom = {
        id: makeUuid(),
        school_id: schoolId,
        name: name.trim(),
        building_or_floor: buildingOrFloor?.trim() || null,
        responsible_person: responsiblePerson?.trim() || null,
        created_at: new Date().toISOString(),
      };

      const next = [...rooms, room];
      setRooms(next);
      saveLocalMirror({ rooms: next });

      if (usingSupabase) {
        await supabase.from('inventory_rooms').insert({
          id: room.id,
          school_id: schoolId,
          name: room.name,
          building_or_floor: room.building_or_floor,
          responsible_person: room.responsible_person,
        });
      }

      await addLog(`Създадено помещение „${room.name}“`, null, `Етаж: ${room.building_or_floor || 'няма'}`);
      pushToast('success', `Кабинетът „${room.name}“ е добавен.`);
    },
    [rooms, schoolId, usingSupabase, saveLocalMirror, addLog, pushToast]
  );

  const editRoom = useCallback(
    async (roomId: string, name: string, buildingOrFloor?: string, responsiblePerson?: string) => {
      const next = rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              name: name.trim(),
              building_or_floor: buildingOrFloor?.trim() || null,
              responsible_person: responsiblePerson?.trim() || null,
            }
          : r
      );
      setRooms(next);
      saveLocalMirror({ rooms: next });

      if (usingSupabase && isValidUuid(roomId)) {
        await supabase
          .from('inventory_rooms')
          .update({
            name: name.trim(),
            building_or_floor: buildingOrFloor?.trim() || null,
            responsible_person: responsiblePerson?.trim() || null,
          })
          .eq('id', roomId)
          .eq('school_id', schoolId);
      }

      pushToast('success', 'Данните за кабинета са обновени.');
    },
    [rooms, usingSupabase, schoolId, saveLocalMirror, pushToast]
  );

  const deleteRoom = useCallback(
    async (roomId: string): Promise<boolean> => {
      const linkedItems = items.filter((i) => i.room_id === roomId);
      if (linkedItems.length > 0) {
        pushToast(
          'error',
          `Кабинетът не може да бъде изтрит, защото съдържа ${linkedItems.length} заведени актива. Преместете ги първо.`
        );
        return false;
      }

      const next = rooms.filter((r) => r.id !== roomId);
      setRooms(next);
      saveLocalMirror({ rooms: next });

      if (usingSupabase && isValidUuid(roomId)) {
        await supabase.from('inventory_rooms').delete().eq('id', roomId).eq('school_id', schoolId);
      }

      pushToast('info', 'Кабинетът е изтрит.');
      return true;
    },
    [rooms, items, usingSupabase, schoolId, saveLocalMirror, pushToast]
  );

  // CRUD CATEGORIES
  const createCategory = useCallback(
    async (name: string, description?: string) => {
      const cat: InventoryCategory = {
        id: makeUuid(),
        school_id: schoolId,
        name: name.trim(),
        description: description?.trim() || null,
        created_at: new Date().toISOString(),
      };

      const next = [...categories, cat];
      setCategories(next);
      saveLocalMirror({ categories: next });

      if (usingSupabase) {
        await supabase.from('inventory_categories').insert({
          id: cat.id,
          school_id: schoolId,
          name: cat.name,
          description: cat.description,
        });
      }

      pushToast('success', `Категорията „${cat.name}“ е добавена.`);
    },
    [categories, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  return {
    isLoading,
    usingSupabase,
    categories,
    rooms,
    items: enrichedItems,
    rawItems: items,
    logs,
    toasts,
    pushToast,
    dismissToast,

    // Items
    createItem,
    editItem,
    deleteItem,
    moveItem,
    changeItemCondition,
    createRepairTicket,
    getNextInventoryCode,

    // Rooms
    createRoom,
    editRoom,
    deleteRoom,

    // Categories
    createCategory,
  };
}
