import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useSchoolPortal } from '../../../components/layout/schoolPortalContext';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';

interface InventoryItem {
  id: string;
  name: string;
  inventory_code: string;
  serial_number: string;
  quantity: number;
  condition: 'new' | 'good' | 'needs_repair' | 'written_off';
  assigned_to: string;
}

const CONDITION_LABELS: Record<InventoryItem['condition'], { label: string; cls: string }> = {
  new: { label: 'Нов', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  good: { label: 'Изправен', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
  needs_repair: { label: 'За сервиз', cls: 'bg-amber-50 text-amber-800 border border-amber-200' },
  written_off: { label: 'Бракуван', cls: 'bg-red-50 text-red-700 border border-red-200' },
};

export function InventoryModulePage() {
  const { bundle } = useSchoolPortal();
  const schoolId = bundle.school.id;
  const storageKey = `tl_inventory_module_${schoolId}`;

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [invCode, setInvCode] = useState('');
  const [serial, setSerial] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState<InventoryItem['condition']>('good');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    const loadInventory = async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setItems(data as InventoryItem[]);
        return;
      }

      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          setItems(JSON.parse(raw));
          return;
        } catch {
          // ignore
        }
      }

      const seed: InventoryItem[] = [
        {
          id: 'inv-1',
          name: 'Интерактивен дисплей 75" 4K',
          inventory_code: 'INV-2026-001',
          serial_number: 'SN-8849201',
          quantity: 1,
          condition: 'new',
          assigned_to: 'STEM Кабинет 301',
        },
        {
          id: 'inv-2',
          name: 'Преносими компютри за компютърен кабинет',
          inventory_code: 'INV-2026-014',
          serial_number: 'BATCH-LNV-25',
          quantity: 26,
          condition: 'good',
          assigned_to: 'Компютърен кабинет 202',
        },
      ];
      setItems(seed);
      localStorage.setItem(storageKey, JSON.stringify(seed));
    };

    void loadInventory();
  }, [schoolId, storageKey]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: name.trim(),
      inventory_code: invCode.trim() || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      serial_number: serial.trim() || '—',
      quantity: Math.max(1, Number(quantity) || 1),
      condition,
      assigned_to: assignedTo.trim() || 'Общ склад',
    };

    const next = [item, ...items];
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));

    await supabase.from('inventory_items').insert({
      school_id: schoolId,
      name: item.name,
      inventory_code: item.inventory_code,
      serial_number: item.serial_number,
      quantity: item.quantity,
      condition: item.condition,
      assigned_to: item.assigned_to,
    });

    setName('');
    setInvCode('');
    setSerial('');
    setQuantity('1');
    setAssignedTo('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Link to={`/school/${bundle.school.slug}`} className="hover:underline">
              Табло на училището
            </Link>
            <span>/</span>
            <span>Инвентарна система</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-navy-900 mb-1">
            Училищен инвентар — {bundle.school.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-0">
            Регистър на компютърна техника, оборудване, кабинети и материално отговорни лица
          </p>
        </div>

        <Button size="sm" onClick={() => setShowAdd((prev) => !prev)}>
          <Icon name="Plus" size={16} className="mr-1.5" />
          {showAdd ? 'Затвори формата' : 'Добави актив'}
        </Button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddItem}
          className="bg-white rounded-2xl border border-blue-200 p-5 sm:p-6 space-y-4 shadow-sm"
        >
          <h2 className="text-base sm:text-lg font-heading font-bold text-navy-900">
            Нов инвентарен актив
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Наименование на актива *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="напр. Лаптоп Lenovo ThinkPad E16"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Инвентарен код
              </label>
              <input
                type="text"
                value={invCode}
                onChange={(e) => setInvCode(e.target.value)}
                placeholder="INV-2026-045"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Сериен номер
              </label>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="SN-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Количество
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Състояние
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as InventoryItem['condition'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="new">Нов</option>
                <option value="good">Изправен</option>
                <option value="needs_repair">За сервиз</option>
                <option value="written_off">Бракуван</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Кабинет / МОЛ
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Кабинет 204"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)}>
              Отказ
            </Button>
            <Button type="submit" size="sm">
              Запиши актива
            </Button>
          </div>
        </form>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-navy-900 text-white text-xs sm:text-sm">
                <th className="py-3.5 px-4 font-heading font-semibold">Актив / Оборудване</th>
                <th className="py-3.5 px-4 font-heading font-semibold">Инв. код</th>
                <th className="py-3.5 px-4 font-heading font-semibold">Сериен №</th>
                <th className="py-3.5 px-4 font-heading font-semibold">К-во</th>
                <th className="py-3.5 px-4 font-heading font-semibold">Състояние</th>
                <th className="py-3.5 px-4 font-heading font-semibold">Кабинет / МОЛ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-semibold text-navy-900">{item.name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{item.inventory_code}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{item.serial_number}</td>
                  <td className="py-3.5 px-4 font-bold text-navy-900">{item.quantity} бр.</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${CONDITION_LABELS[item.condition].cls}`}>
                      {CONDITION_LABELS[item.condition].label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{item.assigned_to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
