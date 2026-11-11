import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type {
  AuditItemStatus,
  AuditScope,
  AuditStatus,
  CreateItemInput,
  InventoryAuditItem,
  InventoryAuditSession,
  InventoryCategory,
  InventoryItem,
  InventoryLog,
  InventoryMovement,
  InventoryNotification,
  InventoryRoom,
  InventoryUserRole,
  ItemCondition,
  RoomType,
  TrackingType,
} from './types';
import { isValidUuid, makeUuid } from './types';
import {
  getDefaultAudits,
  getDefaultCategories,
  getDefaultItems,
  getDefaultLogs,
  getDefaultMovements,
  getDefaultRooms,
} from './defaultInventoryData';
import type { ToastMessage } from '../shared/ModulePrimitives';

interface LocalInventorySnapshot {
  categories: InventoryCategory[];
  rooms: InventoryRoom[];
  items: InventoryItem[];
  movements: InventoryMovement[];
  audits: InventoryAuditSession[];
  auditItems: InventoryAuditItem[];
  logs: InventoryLog[];
}

export type { CreateItemInput };

export interface CreateRoomInput {
  room_number?: string;
  name: string;
  room_type?: RoomType;
  building?: string;
  floor?: string;
  building_or_floor?: string;
  responsible_person?: string;
  description?: string;
}

export function useInventoryStore(
  schoolId: string,
  schoolName: string,
  userSession: { userId: string; fullName: string; role: string }
) {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [rooms, setRooms] = useState<InventoryRoom[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [audits, setAudits] = useState<InventoryAuditSession[]>([]);
  const [auditItems, setAuditItems] = useState<InventoryAuditItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const storageKey = `tl_inventory_saas_v3_${schoolId}`;

  // User role determination
  const userRole: InventoryUserRole = useMemo(() => {
    const r = userSession.role;
    if (r === 'director' || r === 'school_admin') return 'admin';
    if (r === 'administration') return 'inventory_manager';
    if (r === 'teacher' || r === 'staff' || r === 'technician') return 'room_responsible';
    return 'viewer';
  }, [userSession.role]);

  const pushToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
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
          : {
              categories: [],
              rooms: [],
              items: [],
              movements: [],
              audits: [],
              auditItems: [],
              logs: [],
            };
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
        try {
          await supabase.from('inventory_logs').insert({
            id: logItem.id,
            school_id: schoolId,
            item_id: isValidUuid(itemId) ? itemId : null,
            actor_name: logItem.actor_name,
            action: logItem.action,
            notes: logItem.notes,
          });
        } catch {
          // ignore
        }
      }
    },
    [schoolId, userSession.fullName, logs, usingSupabase, saveLocalMirror]
  );

  // Initial Data Load
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      // 1. Try Supabase
      try {
        const [cRes, rRes, iRes, mRes, aRes, aiRes, lRes] = await Promise.all([
          supabase.from('inventory_categories').select('*').eq('school_id', schoolId),
          supabase.from('inventory_rooms').select('*').eq('school_id', schoolId),
          supabase
            .from('inventory_items')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false }),
          supabase
            .from('inventory_movements')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false }),
          supabase
            .from('inventory_audits')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false }),
          supabase.from('inventory_audit_items').select('*').eq('school_id', schoolId),
          supabase
            .from('inventory_logs')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false }),
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
              tracking_type: row.tracking_type || (row.quantity > 1 ? 'batch' : 'individual'),
              purchase_price: row.purchase_price !== null ? Number(row.purchase_price) : null,
            })) as InventoryItem[]
          );
          setMovements((mRes.data as InventoryMovement[]) || []);
          setAudits((aRes.data as InventoryAuditSession[]) || []);
          setAuditItems((aiRes.data as InventoryAuditItem[]) || []);
          setLogs((lRes.data as InventoryLog[]) || []);
          setIsLoading(false);
          return;
        }
      } catch {
        // fallback to local mirror
      }

      if (!active) return;

      // 2. Try Local Mirror
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          const snap = JSON.parse(raw) as LocalInventorySnapshot;
          if (snap.items?.length || snap.rooms?.length) {
            setCategories(snap.categories || []);
            setRooms(snap.rooms || []);
            setItems(snap.items || []);
            setMovements(snap.movements || []);
            setAudits(snap.audits || []);
            setAuditItems(snap.auditItems || []);
            setLogs(snap.logs || []);
            setUsingSupabase(false);
            setIsLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      // 3. Seed default starter data for school
      const defCats = getDefaultCategories(schoolId);
      const defRooms = getDefaultRooms(schoolId);
      const defItems = getDefaultItems(schoolId, defCats, defRooms);
      const defMovs = getDefaultMovements(schoolId, defItems, defRooms);
      const { audits: defAuds, auditItems: defAudItems } = getDefaultAudits(
        schoolId,
        defRooms,
        defItems
      );
      const defLogs = getDefaultLogs(schoolId, defItems);

      setCategories(defCats);
      setRooms(defRooms);
      setItems(defItems);
      setMovements(defMovs);
      setAudits(defAuds);
      setAuditItems(defAudItems);
      setLogs(defLogs);
      setUsingSupabase(false);

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          categories: defCats,
          rooms: defRooms,
          items: defItems,
          movements: defMovs,
          audits: defAuds,
          auditItems: defAudItems,
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

  // Joined Items with Room & Category Details
  const enrichedItems = useMemo(() => {
    return items.map((it) => {
      const room = it.room_id ? roomMap.get(it.room_id) : undefined;
      const cat = it.category_id ? catMap.get(it.category_id) : undefined;
      return {
        ...it,
        room_name: room ? room.name : 'Неразпределен',
        room_number: room?.room_number || null,
        category_name: cat ? cat.name : 'Общи',
      };
    });
  }, [items, roomMap, catMap]);

  // Enriched Rooms with Aggregated Counts and Values
  const enrichedRooms = useMemo(() => {
    return rooms.map((r) => {
      const roomItems = items.filter((it) => it.room_id === r.id && !it.is_archived);
      const totalPhysicalQty = roomItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
      const totalValueEur = roomItems.reduce(
        (acc, it) => acc + (it.purchase_price ? it.purchase_price * (it.quantity || 1) : 0),
        0
      );
      return {
        ...r,
        itemsCount: roomItems.length,
        totalQty: totalPhysicalQty,
        totalValue: totalValueEur,
        roomItems,
      };
    });
  }, [rooms, items]);

  // Auto-generate next unique inventory code: INV-2026-0042
  const getNextInventoryCode = useCallback(() => {
    const year = new Date().getFullYear();
    const existingNums = items
      .map((it) => {
        const m = it.inventory_code.match(/(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextNum = maxNum + 1;
    return `INV-${year}-${String(nextNum).padStart(4, '0')}`;
  }, [items]);

  // Check if inventory code already exists
  const isCodeDuplicate = useCallback(
    (code: string, currentItemId?: string) => {
      const clean = code.trim().toLowerCase();
      return items.some((it) => it.inventory_code.toLowerCase() === clean && it.id !== currentItemId);
    },
    [items]
  );

  // ===========================================================================
  // 1. ITEMS CRUD
  // ===========================================================================

  const createItem = useCallback(
    async (input: CreateItemInput): Promise<InventoryItem | null> => {
      const now = new Date().toISOString();
      const code = input.inventory_code?.trim() || getNextInventoryCode();

      if (isCodeDuplicate(code)) {
        pushToast('error', `Инвентарен номер „${code}“ вече съществува! Моля, изберете друг.`);
        return null;
      }

      const validRoomId = input.room_id && isValidUuid(input.room_id) ? input.room_id : input.room_id || null;
      const validCatId = input.category_id && isValidUuid(input.category_id) ? input.category_id : input.category_id || null;
      const trackingType: TrackingType = input.tracking_type || ((input.quantity || 1) > 1 ? 'batch' : 'individual');

      const newItem: InventoryItem = {
        id: makeUuid(),
        school_id: schoolId,
        room_id: validRoomId,
        category_id: validCatId,
        name: input.name.trim(),
        inventory_code: code,
        tracking_type: trackingType,
        manufacturer: input.manufacturer?.trim() || null,
        model: input.model?.trim() || null,
        brand_or_model: input.brand_or_model?.trim() || (input.manufacturer && input.model ? `${input.manufacturer} ${input.model}` : null),
        serial_number: input.serial_number?.trim() || null,
        quantity: trackingType === 'individual' ? 1 : Math.max(1, input.quantity || 1),
        condition: input.condition || 'good',
        assigned_to: input.assigned_to?.trim() || null,
        purchase_date: input.purchase_date || null,
        warranty_until: input.warranty_until || null,
        purchase_price:
          input.purchase_price !== null && input.purchase_price !== undefined
            ? Number(input.purchase_price)
            : null,
        notes: input.notes?.trim() || null,
        description: input.description?.trim() || null,
        photos: input.photos || [],
        is_archived: false,
        is_written_off: false,
        created_at: now,
        updated_at: now,
      };

      const next = [newItem, ...items];
      setItems(next);
      saveLocalMirror({ items: next });

      if (usingSupabase) {
        try {
          await supabase.from('inventory_items').insert({
            id: newItem.id,
            school_id: schoolId,
            room_id: isValidUuid(newItem.room_id) ? newItem.room_id : null,
            category_id: isValidUuid(newItem.category_id) ? newItem.category_id : null,
            name: newItem.name,
            inventory_code: newItem.inventory_code,
            tracking_type: newItem.tracking_type,
            manufacturer: newItem.manufacturer,
            model: newItem.model,
            brand_or_model: newItem.brand_or_model,
            serial_number: newItem.serial_number,
            quantity: newItem.quantity,
            condition: newItem.condition,
            assigned_to: newItem.assigned_to,
            purchase_date: newItem.purchase_date,
            warranty_until: newItem.warranty_until,
            purchase_price: newItem.purchase_price,
            notes: newItem.notes,
            description: newItem.description,
          });
        } catch {
          // ignore
        }
      }

      await addLog('Завеждане на нов актив', newItem.id, `Код: ${newItem.inventory_code}`, newItem.name);
      pushToast('success', `Активът „${newItem.name}“ е добавен в инвентара.`);
      return newItem;
    },
    [schoolId, items, getNextInventoryCode, isCodeDuplicate, usingSupabase, saveLocalMirror, addLog, pushToast]
  );

  const editItem = useCallback(
    async (itemId: string, patch: Partial<CreateItemInput> & { is_archived?: boolean; is_written_off?: boolean }) => {
      const target = items.find((it) => it.id === itemId);
      if (!target) return;

      const now = new Date().toISOString();

      if (patch.inventory_code && isCodeDuplicate(patch.inventory_code, itemId)) {
        pushToast('error', `Инвентарният номер „${patch.inventory_code}“ вече се използва от друг актив!`);
        return;
      }

      const validRoomId = patch.room_id !== undefined ? (patch.room_id && isValidUuid(patch.room_id) ? patch.room_id : patch.room_id || null) : undefined;
      const validCatId = patch.category_id !== undefined ? (patch.category_id && isValidUuid(patch.category_id) ? patch.category_id : patch.category_id || null) : undefined;

      // Track automatic movement if room changed
      let newMovement: InventoryMovement | null = null;
      if (validRoomId !== undefined && validRoomId !== target.room_id) {
        const fromRoom = target.room_id ? roomMap.get(target.room_id) : null;
        const toRoom = validRoomId ? roomMap.get(validRoomId) : null;
        newMovement = {
          id: makeUuid(),
          school_id: schoolId,
          item_id: target.id,
          item_name: patch.name || target.name,
          inventory_code: patch.inventory_code || target.inventory_code,
          from_room_id: target.room_id,
          from_room_name: fromRoom?.name || 'Предишно помещение',
          to_room_id: validRoomId,
          to_room_name: toRoom?.name || 'Ново помещение',
          from_mol: target.assigned_to,
          to_mol: patch.assigned_to || toRoom?.responsible_person || target.assigned_to,
          moved_by_name: userSession.fullName || 'Служител',
          movement_date: now,
          reason: patch.notes ? `Редакция на помещение: ${patch.notes}` : 'Прехвърляне при редакция на актив',
          created_at: now,
        };
      }

      const next = items.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          ...(patch.name ? { name: patch.name.trim() } : {}),
          ...(patch.inventory_code ? { inventory_code: patch.inventory_code.trim() } : {}),
          ...(patch.tracking_type ? { tracking_type: patch.tracking_type } : {}),
          ...(patch.manufacturer !== undefined ? { manufacturer: patch.manufacturer?.trim() || null } : {}),
          ...(patch.model !== undefined ? { model: patch.model?.trim() || null } : {}),
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
          ...(patch.description !== undefined ? { description: patch.description?.trim() || null } : {}),
          ...(patch.photos !== undefined ? { photos: patch.photos } : {}),
          ...(patch.is_archived !== undefined ? { is_archived: patch.is_archived } : {}),
          ...(patch.is_written_off !== undefined ? { is_written_off: patch.is_written_off } : {}),
          updated_at: now,
        };
      });

      setItems(next);
      saveLocalMirror({ items: next });

      if (newMovement) {
        setMovements((prev) => [newMovement!, ...prev]);
        saveLocalMirror({ movements: [newMovement!, ...movements] });
      }

      if (usingSupabase && isValidUuid(itemId)) {
        const updated = next.find((it) => it.id === itemId);
        if (updated) {
          try {
            await supabase
              .from('inventory_items')
              .update({
                name: updated.name,
                inventory_code: updated.inventory_code,
                tracking_type: updated.tracking_type,
                manufacturer: updated.manufacturer,
                model: updated.model,
                brand_or_model: updated.brand_or_model,
                serial_number: updated.serial_number,
                room_id: isValidUuid(updated.room_id) ? updated.room_id : null,
                category_id: isValidUuid(updated.category_id) ? updated.category_id : null,
                assigned_to: updated.assigned_to,
                quantity: updated.quantity,
                condition: updated.condition,
                purchase_date: updated.purchase_date,
                warranty_until: updated.warranty_until,
                purchase_price: updated.purchase_price,
                notes: updated.notes,
                description: updated.description,
                is_archived: updated.is_archived,
                is_written_off: updated.is_written_off,
                updated_at: now,
              })
              .eq('id', itemId)
              .eq('school_id', schoolId);

            if (newMovement) {
              await supabase.from('inventory_movements').insert(newMovement);
            }
          } catch {
            // ignore
          }
        }
      }

      await addLog('Редакция на данни за актив', itemId, `Обновени параметри`, target.name);
      pushToast('success', 'Данните за актива са обновени.');
    },
    [items, movements, roomMap, isCodeDuplicate, usingSupabase, schoolId, userSession.fullName, saveLocalMirror, addLog, pushToast]
  );

  // Split Batch Item into individual items
  const splitBatchItem = useCallback(
    async (itemId: string, splitCount: number) => {
      const target = items.find((it) => it.id === itemId);
      if (!target || target.quantity <= 1) {
        pushToast('error', 'Този актив не е количествена позиция или количеството е 1.');
        return;
      }

      const count = Math.min(Math.max(1, splitCount), target.quantity - 1);
      const remainingQty = target.quantity - count;
      const now = new Date().toISOString();

      // Create N new individual items
      const newItems: InventoryItem[] = [];
      for (let i = 0; i < count; i++) {
        const nextCode = getNextInventoryCode();
        const splitItem: InventoryItem = {
          ...target,
          id: makeUuid(),
          inventory_code: nextCode,
          tracking_type: 'individual',
          quantity: 1,
          serial_number: target.serial_number ? `${target.serial_number}-${i + 1}` : null,
          notes: `Отделен от партида ${target.inventory_code}. ${target.notes || ''}`.trim(),
          created_at: now,
          updated_at: now,
        };
        newItems.push(splitItem);
      }

      // Update remaining batch item
      const nextItems = items.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            quantity: remainingQty,
            updated_at: now,
          };
        }
        return it;
      });

      const finalItems = [...newItems, ...nextItems];
      setItems(finalItems);
      saveLocalMirror({ items: finalItems });

      if (usingSupabase) {
        try {
          await supabase
            .from('inventory_items')
            .update({ quantity: remainingQty, updated_at: now })
            .eq('id', itemId)
            .eq('school_id', schoolId);

          for (const item of newItems) {
            await supabase.from('inventory_items').insert({
              id: item.id,
              school_id: schoolId,
              room_id: isValidUuid(item.room_id) ? item.room_id : null,
              category_id: isValidUuid(item.category_id) ? item.category_id : null,
              name: item.name,
              inventory_code: item.inventory_code,
              tracking_type: item.tracking_type,
              quantity: item.quantity,
              condition: item.condition,
              assigned_to: item.assigned_to,
              purchase_date: item.purchase_date,
              warranty_until: item.warranty_until,
              purchase_price: item.purchase_price,
              notes: item.notes,
            });
          }
        } catch {
          // ignore
        }
      }

      await addLog(
        `Разделяне на партида ${target.inventory_code}`,
        itemId,
        `Отделени ${count} бр. като индивидуални активи`,
        target.name
      );
      pushToast('success', `Успешно бяха отделени ${count} индивидуални актива с нови номера.`);
    },
    [items, getNextInventoryCode, usingSupabase, schoolId, saveLocalMirror, addLog, pushToast]
  );

  // Write Off Item (Бракуване)
  const writeOffItem = useCallback(
    async (itemId: string, reason: string, writtenOffDate?: string) => {
      const target = items.find((i) => i.id === itemId);
      if (!target) return;

      const dateStr = writtenOffDate || new Date().toISOString().slice(0, 10);
      const now = new Date().toISOString();

      const next = items.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          condition: 'written_off' as ItemCondition,
          is_written_off: true,
          written_off_date: dateStr,
          written_off_reason: reason.trim(),
          updated_at: now,
        };
      });

      setItems(next);
      saveLocalMirror({ items: next });

      if (usingSupabase && isValidUuid(itemId)) {
        try {
          await supabase
            .from('inventory_items')
            .update({
              condition: 'written_off',
              is_written_off: true,
              written_off_date: dateStr,
              written_off_reason: reason.trim(),
              updated_at: now,
            })
            .eq('id', itemId)
            .eq('school_id', schoolId);
        } catch {
          // ignore
        }
      }

      await addLog('Бракуване на актив', itemId, `Основание: ${reason}`, target.name);
      pushToast('info', `Активът „${target.name}“ бе маркиран като бракуван.`);
    },
    [items, usingSupabase, schoolId, saveLocalMirror, addLog, pushToast]
  );

  // Archive / Restore Item
  const archiveItem = useCallback(
    async (itemId: string, isArchived: boolean = true) => {
      const target = items.find((i) => i.id === itemId);
      if (!target) return;

      const now = new Date().toISOString();
      const next = items.map((it) => (it.id === itemId ? { ...it, is_archived: isArchived, updated_at: now } : it));
      setItems(next);
      saveLocalMirror({ items: next });

      if (usingSupabase && isValidUuid(itemId)) {
        try {
          await supabase
            .from('inventory_items')
            .update({ is_archived: isArchived, updated_at: now })
            .eq('id', itemId)
            .eq('school_id', schoolId);
        } catch {
          // ignore
        }
      }

      await addLog(
        isArchived ? 'Архивиране на актив' : 'Възстановяване от архив',
        itemId,
        isArchived ? 'Преместен в архива' : 'Върнат в активния инвентар',
        target.name
      );
      pushToast('info', isArchived ? 'Активът е архивиран.' : 'Активът е възстановен от архив.');
    },
    [items, usingSupabase, schoolId, saveLocalMirror, addLog, pushToast]
  );

  // Safe DELETE ITEM (Checks history to prevent accidental deletion)
  const deleteItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      const target = items.find((i) => i.id === itemId);
      if (!target) return false;

      // History check: does this item have movements or audit records?
      const hasMovements = movements.some((m) => m.item_id === itemId);
      const hasAudits = auditItems.some((a) => a.item_id === itemId);

      if (hasMovements || hasAudits) {
        pushToast(
          'error',
          `Активът „${target.name}“ има история на движения или ревизии. Не може да бъде изтрит за запазване на отчетността. Препоръчваме да го архивирате или бракувате.`
        );
        return false;
      }

      const next = items.filter((i) => i.id !== itemId);
      setItems(next);
      saveLocalMirror({ items: next });

      if (usingSupabase && isValidUuid(itemId)) {
        try {
          await supabase.from('inventory_items').delete().eq('id', itemId).eq('school_id', schoolId);
        } catch {
          // ignore
        }
      }

      await addLog('Изтриване от инвентара', null, `Изтрит артикул: ${target.name} (${target.inventory_code})`);
      pushToast('info', 'Артикулът е изтрит от инвентара.');
      return true;
    },
    [items, movements, auditItems, usingSupabase, schoolId, saveLocalMirror, addLog, pushToast]
  );

  // ===========================================================================
  // 2. MOVEMENTS / RELOCATION
  // ===========================================================================

  const moveItem = useCallback(
    async (itemId: string, targetRoomId: string, targetMol?: string, reason?: string) => {
      const target = items.find((i) => i.id === itemId);
      if (!target) return;

      const oldRoom = target.room_id ? roomMap.get(target.room_id) : null;
      const newRoom = roomMap.get(targetRoomId);
      const oldRoomName = oldRoom?.name || 'Предишно помещение';
      const newRoomName = newRoom?.name || 'Ново помещение';
      const effectiveMol = targetMol || newRoom?.responsible_person || target.assigned_to;
      const now = new Date().toISOString();

      const movement: InventoryMovement = {
        id: makeUuid(),
        school_id: schoolId,
        item_id: target.id,
        item_name: target.name,
        inventory_code: target.inventory_code,
        from_room_id: target.room_id,
        from_room_name: oldRoomName,
        to_room_id: targetRoomId,
        to_room_name: newRoomName,
        from_mol: target.assigned_to,
        to_mol: effectiveMol,
        moved_by_name: userSession.fullName || 'Служител',
        movement_date: now,
        reason: reason || 'Преместване между помещения',
        created_at: now,
      };

      const updatedItems = items.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          room_id: targetRoomId,
          assigned_to: effectiveMol,
          updated_at: now,
        };
      });

      setItems(updatedItems);
      saveLocalMirror({ items: updatedItems });

      const nextMovements = [movement, ...movements];
      setMovements(nextMovements);
      saveLocalMirror({ movements: nextMovements });

      if (usingSupabase && isValidUuid(itemId)) {
        try {
          await supabase
            .from('inventory_items')
            .update({
              room_id: isValidUuid(targetRoomId) ? targetRoomId : null,
              assigned_to: effectiveMol,
              updated_at: now,
            })
            .eq('id', itemId)
            .eq('school_id', schoolId);

          await supabase.from('inventory_movements').insert(movement);
        } catch {
          // ignore
        }
      }

      await addLog(
        `Преместване на актив: ${oldRoomName} → ${newRoomName}`,
        itemId,
        `МОЛ: ${effectiveMol || 'Няма'}. Причина: ${reason || 'няма'}`,
        target.name
      );

      pushToast('success', `Активът е преместен в „${newRoomName}“.`);
    },
    [items, movements, roomMap, schoolId, userSession.fullName, usingSupabase, saveLocalMirror, addLog, pushToast]
  );

  // Quick Change Condition
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

  // ===========================================================================
  // 3. ROOMS CRUD & ARCHIVING
  // ===========================================================================

  const createRoom = useCallback(
    async (input: CreateRoomInput): Promise<InventoryRoom> => {
      const room: InventoryRoom = {
        id: makeUuid(),
        school_id: schoolId,
        room_number: input.room_number?.trim() || null,
        name: input.name.trim(),
        room_type: input.room_type || 'classroom',
        building: input.building?.trim() || null,
        floor: input.floor?.trim() || null,
        building_or_floor: input.building_or_floor?.trim() || (input.building && input.floor ? `${input.building}, ${input.floor}` : null),
        responsible_person: input.responsible_person?.trim() || null,
        description: input.description?.trim() || null,
        is_archived: false,
        created_at: new Date().toISOString(),
      };

      const next = [...rooms, room];
      setRooms(next);
      saveLocalMirror({ rooms: next });

      if (usingSupabase) {
        try {
          await supabase.from('inventory_rooms').insert({
            id: room.id,
            school_id: schoolId,
            room_number: room.room_number,
            name: room.name,
            room_type: room.room_type,
            building: room.building,
            floor: room.floor,
            building_or_floor: room.building_or_floor,
            responsible_person: room.responsible_person,
            description: room.description,
            is_archived: false,
          });
        } catch {
          // ignore
        }
      }

      await addLog(`Създадено помещение „${room.name}“`, null, `Номер: ${room.room_number || 'няма'}`);
      pushToast('success', `Кабинетът „${room.name}“ е добавен.`);
      return room;
    },
    [rooms, schoolId, usingSupabase, saveLocalMirror, addLog, pushToast]
  );

  const editRoom = useCallback(
    async (roomId: string, patch: Partial<CreateRoomInput> & { is_archived?: boolean }) => {
      const next = rooms.map((r) => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          ...(patch.room_number !== undefined ? { room_number: patch.room_number?.trim() || null } : {}),
          ...(patch.name ? { name: patch.name.trim() } : {}),
          ...(patch.room_type !== undefined ? { room_type: patch.room_type } : {}),
          ...(patch.building !== undefined ? { building: patch.building?.trim() || null } : {}),
          ...(patch.floor !== undefined ? { floor: patch.floor?.trim() || null } : {}),
          ...(patch.building_or_floor !== undefined ? { building_or_floor: patch.building_or_floor?.trim() || null } : {}),
          ...(patch.responsible_person !== undefined ? { responsible_person: patch.responsible_person?.trim() || null } : {}),
          ...(patch.description !== undefined ? { description: patch.description?.trim() || null } : {}),
          ...(patch.is_archived !== undefined ? { is_archived: patch.is_archived } : {}),
        };
      });

      setRooms(next);
      saveLocalMirror({ rooms: next });

      if (usingSupabase && isValidUuid(roomId)) {
        const updated = next.find((r) => r.id === roomId);
        if (updated) {
          try {
            await supabase
              .from('inventory_rooms')
              .update({
                room_number: updated.room_number,
                name: updated.name,
                room_type: updated.room_type,
                building: updated.building,
                floor: updated.floor,
                building_or_floor: updated.building_or_floor,
                responsible_person: updated.responsible_person,
                description: updated.description,
                is_archived: updated.is_archived,
              })
              .eq('id', roomId)
              .eq('school_id', schoolId);
          } catch {
            // ignore
          }
        }
      }

      pushToast('success', 'Данните за кабинета са обновени.');
    },
    [rooms, usingSupabase, schoolId, saveLocalMirror, pushToast]
  );

  const archiveRoom = useCallback(
    async (roomId: string, isArchived: boolean = true) => {
      await editRoom(roomId, { is_archived: isArchived });
      pushToast('info', isArchived ? 'Помещението е архивирано.' : 'Помещението е възстановено.');
    },
    [editRoom, pushToast]
  );

  const deleteRoom = useCallback(
    async (roomId: string): Promise<boolean> => {
      const linkedItems = items.filter((i) => i.room_id === roomId && !i.is_archived);
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
        try {
          await supabase.from('inventory_rooms').delete().eq('id', roomId).eq('school_id', schoolId);
        } catch {
          // ignore
        }
      }

      pushToast('info', 'Кабинетът е изтрит.');
      return true;
    },
    [rooms, items, usingSupabase, schoolId, saveLocalMirror, pushToast]
  );

  // ===========================================================================
  // 4. REVISIONS / AUDITS MODULE
  // ===========================================================================

  const createAuditSession = useCallback(
    async (input: {
      title: string;
      order_number?: string;
      scope: AuditScope;
      room_ids?: string[];
      target_room_ids?: string[];
      category_ids?: string[];
      target_category_ids?: string[];
      committee?: string[];
      committee_members?: string[];
      summary_notes?: string;
    }): Promise<InventoryAuditSession> => {
      const auditId = makeUuid();
      const now = new Date().toISOString();

      const rIds = input.target_room_ids || input.room_ids || [];
      const cIds = input.target_category_ids || input.category_ids || [];
      const members = (input.committee_members || input.committee || []).filter((m) => m.trim().length > 0);

      const newAudit: InventoryAuditSession = {
        id: auditId,
        school_id: schoolId,
        title: input.title.trim(),
        order_number: input.order_number?.trim() || null,
        scope: input.scope === ('all_school' as any) ? 'all' : input.scope,
        target_room_ids: rIds,
        target_category_ids: cIds,
        committee_members: members,
        status: 'in_progress',
        started_at: now,
        completed_at: null,
        summary_notes: input.summary_notes?.trim() || null,
        created_by_name: userSession.fullName || 'Служител',
        created_at: now,
      };

      // Filter items according to scope
      const effectiveScope = newAudit.scope;
      const itemsInScope = items.filter((it) => {
        if (it.is_archived || it.is_written_off) return false;
        if (effectiveScope === 'all') return true;
        if (effectiveScope === 'rooms' && rIds.length) {
          return it.room_id ? rIds.includes(it.room_id) : false;
        }
        if (effectiveScope === 'categories' && cIds.length) {
          return it.category_id ? cIds.includes(it.category_id) : false;
        }
        return true;
      });

      const newAuditItems: InventoryAuditItem[] = itemsInScope.map((it) => {
        const room = it.room_id ? roomMap.get(it.room_id) : null;
        return {
          id: makeUuid(),
          school_id: schoolId,
          audit_id: auditId,
          item_id: it.id,
          item_name: it.name,
          inventory_code: it.inventory_code,
          expected_room_id: it.room_id,
          expected_room_name: room?.name || 'Неразпределен',
          found_room_id: it.room_id,
          status: 'unverified' as AuditItemStatus,
          notes: null,
          checked_by_name: null,
          checked_at: null,
        };
      });

      const nextAudits = [newAudit, ...audits];
      const nextAuditItems = [...newAuditItems, ...auditItems];

      setAudits(nextAudits);
      setAuditItems(nextAuditItems);
      saveLocalMirror({ audits: nextAudits, auditItems: nextAuditItems });

      if (usingSupabase) {
        try {
          await supabase.from('inventory_audits').insert(newAudit);
          if (newAuditItems.length > 0) {
            await supabase.from('inventory_audit_items').insert(newAuditItems);
          }
        } catch {
          // ignore
        }
      }

      await addLog(
        `Стартирана ревизия: ${newAudit.title}`,
        null,
        `Обхват: ${newAudit.scope}. Заверени за проверка: ${newAuditItems.length} актива.`
      );
      pushToast('success', `Ревизията „${newAudit.title}“ е стартирана с ${newAuditItems.length} актива.`);
      return newAudit;
    },
    [schoolId, items, audits, auditItems, roomMap, userSession.fullName, usingSupabase, saveLocalMirror, addLog, pushToast]
  );

  const checkAuditItem = useCallback(
    async (
      auditId: string,
      itemId: string,
      status: AuditItemStatus,
      foundRoomId?: string,
      notes?: string
    ) => {
      const now = new Date().toISOString();
      const nextAuditItems = auditItems.map((ai) => {
        if (ai.audit_id === auditId && ai.item_id === itemId) {
          return {
            ...ai,
            status,
            found_room_id: foundRoomId !== undefined ? foundRoomId : ai.found_room_id,
            notes: notes !== undefined ? notes : ai.notes,
            checked_by_name: userSession.fullName || 'Проверяващ',
            checked_at: now,
          };
        }
        return ai;
      });

      setAuditItems(nextAuditItems);
      saveLocalMirror({ auditItems: nextAuditItems });

      // Automatically sync condition if marked missing or damaged
      if (status === 'missing') {
        await editItem(itemId, { condition: 'missing' });
      } else if (status === 'damaged') {
        await editItem(itemId, { condition: 'needs_repair' });
      }

      if (usingSupabase) {
        try {
          await supabase
            .from('inventory_audit_items')
            .update({
              status,
              found_room_id: foundRoomId || null,
              notes: notes || null,
              checked_by_name: userSession.fullName || 'Проверяващ',
              checked_at: now,
            })
            .eq('audit_id', auditId)
            .eq('item_id', itemId);
        } catch {
          // ignore
        }
      }
    },
    [auditItems, editItem, userSession.fullName, usingSupabase, saveLocalMirror]
  );

  const completeAuditSession = useCallback(
    async (auditId: string, summaryNotes?: string) => {
      const target = audits.find((a) => a.id === auditId);
      if (!target) return;

      const now = new Date().toISOString();
      const nextAudits = audits.map((a) => {
        if (a.id === auditId) {
          return {
            ...a,
            status: 'completed' as AuditStatus,
            completed_at: now,
            summary_notes: summaryNotes?.trim() || a.summary_notes,
          };
        }
        return a;
      });

      setAudits(nextAudits);
      saveLocalMirror({ audits: nextAudits });

      if (usingSupabase && isValidUuid(auditId)) {
        try {
          await supabase
            .from('inventory_audits')
            .update({
              status: 'completed',
              completed_at: now,
              summary_notes: summaryNotes?.trim() || null,
            })
            .eq('id', auditId)
            .eq('school_id', schoolId);
        } catch {
          // ignore
        }
      }

      await addLog(
        `Приключена ревизия: ${target.title}`,
        null,
        `Заключена на ${new Date(now).toLocaleDateString('bg-BG')}. Резултатите са запазени.`
      );
      pushToast('success', `Ревизията „${target.title}“ е успешно приключена и заключена.`);
    },
    [audits, schoolId, usingSupabase, saveLocalMirror, addLog, pushToast]
  );

  // ===========================================================================
  // 5. CSV EXPORT & BULK IMPORT
  // ===========================================================================

  const exportInventoryCsv = useCallback(
    (filterRoomId?: string, filterCatId?: string) => {
      let list = enrichedItems.filter((i) => !i.is_archived);
      if (filterRoomId && filterRoomId !== 'all') {
        list = list.filter((i) => i.room_id === filterRoomId);
      }
      if (filterCatId && filterCatId !== 'all') {
        list = list.filter((i) => i.category_id === filterCatId);
      }

      const headers = [
        'Инвентарен номер',
        'Наименование',
        'Тип актив',
        'Категория',
        'Помещение',
        'МОЛ',
        'Производител',
        'Модел',
        'Сериен номер',
        'Количество',
        'Състояние',
        'Покупна цена (€)',
        'Обща стойност (€)',
        'Дата на придобиване',
        'Гаранция до',
        'Бележки',
      ];

      const rows = list.map((it) => [
        `"${it.inventory_code}"`,
        `"${(it.name || '').replace(/"/g, '""')}"`,
        it.tracking_type === 'batch' ? 'Количествен' : 'Индивидуален',
        `"${(it.category_name || '').replace(/"/g, '""')}"`,
        `"${(it.room_name || '').replace(/"/g, '""')}"`,
        `"${(it.assigned_to || '').replace(/"/g, '""')}"`,
        `"${(it.manufacturer || '').replace(/"/g, '""')}"`,
        `"${(it.model || it.brand_or_model || '').replace(/"/g, '""')}"`,
        `"${(it.serial_number || '').replace(/"/g, '""')}"`,
        it.quantity || 1,
        it.condition,
        it.purchase_price !== null ? it.purchase_price.toFixed(2) : '',
        it.purchase_price !== null ? (it.purchase_price * (it.quantity || 1)).toFixed(2) : '',
        it.purchase_date || '',
        it.warranty_until || '',
        `"${(it.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      link.download = `inventory-report-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      pushToast('success', `Експортирани са ${list.length} записа в CSV.`);
    },
    [enrichedItems, pushToast]
  );

  const importInventoryCsv = useCallback(
    async (
      csvText: string,
      defaultRoomId?: string,
      defaultCatId?: string
    ): Promise<{ importedCount: number; errors: string[] }> => {
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        pushToast('error', 'CSV файлът е празен или съдържа само заглавен ред.');
        return { importedCount: 0, errors: ['Файлът е празен.'] };
      }

      const errors: string[] = [];
      const newItemsToCreate: InventoryItem[] = [];
      const seenCodesInFile = new Set<string>();
      const now = new Date().toISOString();

      // Skip header
      for (let idx = 1; idx < lines.length; idx++) {
        const line = lines[idx];
        // Split CSV row supporting quotes
        const match = line.match(/(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g);
        if (!match) continue;
        const cols = match.map((c) => {
          let s = c.replace(/^,/, '').trim();
          if (s.startsWith('"') && s.endsWith('"')) {
            s = s.slice(1, -1).replace(/""/g, '"');
          }
          return s;
        });

        const code = cols[0]?.trim();
        const name = cols[1]?.trim();
        if (!name) continue;

        const effectiveCode = code || getNextInventoryCode();
        if (isCodeDuplicate(effectiveCode) || seenCodesInFile.has(effectiveCode.toLowerCase())) {
          errors.push(`Ред ${idx + 1}: Дублиран инвентарен номер „${effectiveCode}“ - пропуснат.`);
          continue;
        }
        seenCodesInFile.add(effectiveCode.toLowerCase());

        const manufacturer = cols[6]?.trim() || null;
        const model = cols[7]?.trim() || null;
        const serial = cols[8]?.trim() || null;
        const qty = parseInt(cols[9], 10) || 1;
        const price = parseFloat(cols[11]) || null;
        const pDate = cols[13]?.trim() || null;
        const wDate = cols[14]?.trim() || null;
        const notes = cols[15]?.trim() || null;

        const item: InventoryItem = {
          id: makeUuid(),
          school_id: schoolId,
          room_id: defaultRoomId || null,
          category_id: defaultCatId || null,
          name,
          inventory_code: effectiveCode,
          tracking_type: qty > 1 ? 'batch' : 'individual',
          manufacturer,
          model,
          brand_or_model: manufacturer && model ? `${manufacturer} ${model}` : model || manufacturer || null,
          serial_number: serial,
          quantity: Math.max(1, qty),
          condition: 'good',
          assigned_to: cols[5]?.trim() || null,
          purchase_date: pDate,
          warranty_until: wDate,
          purchase_price: price,
          notes,
          is_archived: false,
          is_written_off: false,
          created_at: now,
          updated_at: now,
        };

        newItemsToCreate.push(item);
      }

      if (newItemsToCreate.length === 0) {
        pushToast('error', 'Няма валидни редове за импортиране.');
        return { importedCount: 0, errors };
      }

      const nextItems = [...newItemsToCreate, ...items];
      setItems(nextItems);
      saveLocalMirror({ items: nextItems });

      if (usingSupabase) {
        try {
          await supabase.from('inventory_items').insert(newItemsToCreate);
        } catch {
          // ignore
        }
      }

      await addLog('Масов импорт на инвентар', null, `Успешно импортирани ${newItemsToCreate.length} позиции.`);
      pushToast('success', `Успешно бяха импортирани ${newItemsToCreate.length} позиции!`);
      return { importedCount: newItemsToCreate.length, errors };
    },
    [items, getNextInventoryCode, isCodeDuplicate, usingSupabase, schoolId, saveLocalMirror, addLog, pushToast]
  );

  // ===========================================================================
  // 6. NOTIFICATIONS & CROSS-MODULE
  // ===========================================================================

  const nowMs = useMemo(() => Date.now(), []);
  const dayMs = 86400000;

  const notifications = useMemo<InventoryNotification[]>(() => {
    const activeItems = items.filter((i) => !i.is_archived && !i.is_written_off);

    const expiringWarranties = activeItems.filter((it) => {
      if (!it.warranty_until) return false;
      const wMs = new Date(it.warranty_until).getTime();
      const diffDays = Math.ceil((wMs - nowMs) / dayMs);
      return diffDays >= 0 && diffDays <= 60; // Expiring in next 60 days
    });

    const expiredWarranties = activeItems.filter((it) => {
      if (!it.warranty_until) return false;
      const wMs = new Date(it.warranty_until).getTime();
      return wMs < nowMs;
    });

    const needsRepairItems = activeItems.filter((it) => it.condition === 'needs_repair');
    const missingItems = activeItems.filter((it) => it.condition === 'missing');
    const activeAudits = audits.filter((a) => a.status === 'in_progress');

    const list: InventoryNotification[] = [];
    if (activeAudits.length > 0) {
      list.push({
        id: `audit-${activeAudits[0].id}`,
        type: 'audit_in_progress',
        title: 'Текуща ревизия в ход',
        message: `${activeAudits[0].title} — извършва се проверка на активите`,
        severity: 'info',
        audit_id: activeAudits[0].id,
      });
    }
    if (missingItems.length > 0) {
      list.push({
        id: 'missing-items',
        type: 'missing',
        title: 'Установени липсващи активи',
        message: `${missingItems.length} актива са отбелязани като "Липсва"`,
        severity: 'critical',
      });
    }
    if (needsRepairItems.length > 0) {
      list.push({
        id: 'repair-items',
        type: 'needs_repair',
        title: 'Активи за сервиз и ремонт',
        message: `${needsRepairItems.length} актива се нуждаят от ремонт`,
        severity: 'warning',
      });
    }
    if (expiringWarranties.length > 0) {
      list.push({
        id: 'expiring-warranties',
        type: 'warranty_expiring',
        title: 'Изтичащи гаранции',
        message: `${expiringWarranties.length} актива са с изтичаща гаранция в следващите 60 дни`,
        severity: 'warning',
      });
    }
    if (expiredWarranties.length > 0) {
      list.push({
        id: 'expired-warranties',
        type: 'warranty_expired',
        title: 'Изтекли гаранции',
        message: `${expiredWarranties.length} актива са с изтекла гаранция`,
        severity: 'info',
      });
    }

    return list;
  }, [items, audits, nowMs, dayMs]);

  // Cross-Module: create repair ticket
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
      const description = `${details}\n\n• Актив: ${item.name} (${item.model || item.brand_or_model || 'Няма модел'})\n• Инвентарен номер: ${item.inventory_code}\n• Сериен номер: ${item.serial_number || 'Няма'}\n• Помещение: ${roomName}\n• МОЛ: ${item.assigned_to || 'Няма'}`;

      await changeItemCondition(itemId, 'needs_repair', `Подадена сервизна заявка: ${problemTitle}`);

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
        try {
          await supabase.from('inventory_categories').insert({
            id: cat.id,
            school_id: schoolId,
            name: cat.name,
            description: cat.description,
          });
        } catch {
          // ignore
        }
      }

      pushToast('success', `Категорията „${cat.name}“ е добавена.`);
    },
    [categories, schoolId, usingSupabase, saveLocalMirror, pushToast]
  );

  return {
    isLoading,
    usingSupabase,
    userRole,
    categories,
    rooms: enrichedRooms,
    rawRooms: rooms,
    items: enrichedItems,
    rawItems: items,
    movements,
    audits,
    auditItems,
    logs,
    notifications,
    toasts,
    pushToast,
    dismissToast,

    // Items
    createItem,
    editItem,
    deleteItem,
    moveItem,
    archiveItem,
    writeOffItem,
    splitBatchItem,
    changeItemCondition,
    createRepairTicket,
    getNextInventoryCode,
    isCodeDuplicate,

    // Rooms
    createRoom,
    editRoom,
    archiveRoom,
    deleteRoom,

    // Revisions / Audits
    createAuditSession,
    startAudit: createAuditSession,
    checkAuditItem,
    completeAuditSession,
    completeAudit: completeAuditSession,

    // CSV
    exportInventoryCsv,
    exportToCsv: exportInventoryCsv,
    importInventoryCsv,
    importFromCsv: importInventoryCsv,

    // Categories
    createCategory,
  };
}
