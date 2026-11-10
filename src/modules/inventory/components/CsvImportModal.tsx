import { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Upload,
} from 'lucide-react';
import type {
  CreateItemInput,
  InventoryCategory,
  InventoryItem,
  InventoryRoom,
} from '../types';
import { ModuleModal } from '../../shared/ModulePrimitives';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingItems: InventoryItem[];
  rooms: InventoryRoom[];
  categories: InventoryCategory[];
  onImport: (items: CreateItemInput[]) => Promise<number>;
}

interface ParsedRow {
  index: number;
  inventory_code: string;
  name: string;
  category_name?: string;
  room_name?: string;
  brand_or_model?: string;
  serial_number?: string;
  purchase_price?: number;
  quantity?: number;
  assigned_to?: string;
  condition?: string;
  errors: string[];
  warnings: string[];
}

export function CsvImportModal({
  isOpen,
  onClose,
  existingItems,
  rooms,
  categories,
  onImport,
}: CsvImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || '');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<number | null>(null);

  // Existing codes lookup
  const existingCodesSet = useMemo(() => {
    return new Set(existingItems.map((i) => i.inventory_code.trim().toUpperCase()));
  }, [existingItems]);

  // Parse CSV
  const parsedData = useMemo(() => {
    if (!rawText.trim()) return [];

    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return [];

    // Detect separator: comma or semicolon or tab
    const firstLine = lines[0];
    const separator = firstLine.includes(';')
      ? ';'
      : firstLine.includes('\t')
      ? '\t'
      : ',';

    const headerParts = lines[0].split(separator).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

    const isHeaderLine =
      headerParts.some((h) =>
        ['код', 'инв', 'name', 'име', 'наименование', 'цена', 'сериен'].some((kw) =>
          h.includes(kw)
        )
      );

    const rows = isHeaderLine ? lines.slice(1) : lines;
    const seenCodesInBatch = new Set<string>();

    return rows.map((line, idx): ParsedRow => {
      // Split by separator respecting simple quotes
      const parts = line.split(separator).map((p) => p.replace(/^["']|["']$/g, '').trim());

      let code = '';
      let name = '';
      let cat = '';
      let room = '';
      let brand = '';
      let serial = '';
      let price: number | undefined;
      let qty = 1;
      let mol = '';

      if (isHeaderLine) {
        headerParts.forEach((header, colIdx) => {
          const val = parts[colIdx] || '';
          if (header.includes('код') || header.includes('инв') || header.includes('code')) {
            code = val;
          } else if (
            header.includes('име') ||
            header.includes('наименование') ||
            header.includes('name') ||
            header.includes('модел')
          ) {
            name = val;
          } else if (header.includes('категор') || header.includes('category')) {
            cat = val;
          } else if (header.includes('зал') || header.includes('кабинет') || header.includes('помещение') || header.includes('room')) {
            room = val;
          } else if (header.includes('марка') || header.includes('производител') || header.includes('brand')) {
            brand = val;
          } else if (header.includes('сериен') || header.includes('serial')) {
            serial = val;
          } else if (header.includes('цена') || header.includes('стойност') || header.includes('price')) {
            const num = parseFloat(val.replace(',', '.'));
            if (!isNaN(num) && num >= 0) price = num;
          } else if (header.includes('кол') || header.includes('qty') || header.includes('quantity')) {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num > 0) qty = num;
          } else if (header.includes('мол') || header.includes('отговорник')) {
            mol = val;
          }
        });
      } else {
        // Fallback positional: code, name, category, room, price, serial, qty
        code = parts[0] || '';
        name = parts[1] || '';
        cat = parts[2] || '';
        room = parts[3] || '';
        price = parts[4] ? parseFloat(parts[4].replace(',', '.')) : undefined;
        serial = parts[5] || '';
        qty = parts[6] ? parseInt(parts[6], 10) || 1 : 1;
      }

      const errors: string[] = [];
      const warnings: string[] = [];

      if (!name) {
        errors.push('Липсва наименование на актива');
      }

      if (!code) {
        errors.push('Липсва инвентарен номер');
      } else {
        const upperCode = code.toUpperCase();
        if (existingCodesSet.has(upperCode)) {
          errors.push(`Кодът „${code}“ вече съществува в системата`);
        }
        if (seenCodesInBatch.has(upperCode)) {
          errors.push(`Дублиран код „${code}“ в рамките на импортирания файл`);
        } else {
          seenCodesInBatch.add(upperCode);
        }
      }

      return {
        index: idx + 1,
        inventory_code: code,
        name,
        category_name: cat,
        room_name: room,
        brand_or_model: brand,
        serial_number: serial,
        purchase_price: price,
        quantity: qty,
        assigned_to: mol,
        errors,
        warnings,
      };
    });
  }, [rawText, existingCodesSet]);

  const validRows = useMemo(() => {
    return parsedData.filter((r) => r.errors.length === 0);
  }, [parsedData]);

  const errorRowsCount = parsedData.length - validRows.length;

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || '';
      setRawText(text);
    };
    reader.readAsText(file, 'utf-8');
  };

  // Perform bulk import
  const handleConfirmImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);

    const itemsToCreate: CreateItemInput[] = validRows.map((r) => {
      // Find matching room or default
      const matchedRoom = rooms.find(
        (rm) =>
          rm.name.toLowerCase() === r.room_name?.toLowerCase() ||
          rm.room_number?.toLowerCase() === r.room_name?.toLowerCase()
      );
      const finalRoomId = matchedRoom?.id || selectedRoomId;

      // Find matching category or default
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === r.category_name?.toLowerCase()
      );
      const finalCatId = matchedCat?.id || selectedCatId;

      return {
        inventory_code: r.inventory_code,
        name: r.name,
        room_id: finalRoomId,
        category_id: finalCatId,
        brand_or_model: r.brand_or_model,
        serial_number: r.serial_number,
        purchase_price: r.purchase_price,
        quantity: r.quantity || 1,
        assigned_to: r.assigned_to || matchedRoom?.responsible_person,
        condition: 'good',
        tracking_type: (r.quantity || 1) > 1 ? 'batch' : 'individual',
      };
    });

    try {
      const count = await onImport(itemsToCreate);
      setImportResult(count);
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setImporting(false);
    }
  };

  const sampleCsvExample = `Инв. Номер;Наименование;Категория;Помещение;Цена;Сериен Номер;Количество
INV-2026-901;Интерактивен дисплей 75";Интерактивни дисплеи;Кабинет по ИТ 1;1850;SN-75-9821;1
INV-2026-902;Ученически лаптоп Lenovo;Компютърна техника;Кабинет по ИТ 1;650;PF3K29A;1
INV-2026-903;Ученически столове ергономични;Мебели и обзавеждане;Кабинет по ИТ 1;45;;25`;

  return (
    <ModuleModal
      isOpen={isOpen}
      title="Импорт на активи от Excel / CSV"
      onClose={onClose}
      size="xl"
    >
      <div className="space-y-5">
        {/* Intro instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs sm:text-sm text-blue-900 leading-relaxed">
          <p className="font-semibold mb-1">
            Лесен групов импорт на активи от училищни таблици (Excel / LibreOffice / CSV)
          </p>
          <p className="text-xs text-blue-800 mb-0">
            Системата автоматично проверява за дублирани инвентарни номера, валидира полетата и
            предоставя предварителен преглед преди запис в базата.
          </p>
        </div>

        {/* Input Methods: File Upload & Paste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Качване на .csv файл</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-3">
                Експортирайте таблицата си като CSV файл (с разделител запетая или точка и запетая)
              </p>
            </div>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Или поставете данни (Copy & Paste)</span>
              </label>
              <button
                type="button"
                onClick={() => setRawText(sampleCsvExample)}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Примерен шаблон
              </button>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Поставете CSV текст тук или копирайте редове от Excel..."
              className="w-full font-mono text-[11px] p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Default Fallback Room and Category if not matched */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div>
            <label className="block font-bold text-navy-900 mb-1">
              Помещение по подразбиране (ако липсва в реда):
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.room_number ? `(№ ${r.room_number})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-navy-900 mb-1">
              Категория по подразбиране:
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview Section */}
        {parsedData.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-heading font-bold text-navy-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Предварителен преглед ({parsedData.length} разпознати реда)</span>
              </h4>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {validRows.length} валидни
                </span>
                {errorRowsCount > 0 && (
                  <span className="text-rose-700 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errorRowsCount} с грешки / дубликати
                  </span>
                )}
              </div>
            </div>

            {/* Table preview */}
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-8 text-center">№</th>
                    <th className="p-2">Инв. код</th>
                    <th className="p-2">Наименование</th>
                    <th className="p-2">Кол.</th>
                    <th className="p-2 text-right">Цена</th>
                    <th className="p-2">Сериен №</th>
                    <th className="p-2">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.map((row) => {
                    const hasErrors = row.errors.length > 0;
                    return (
                      <tr
                        key={row.index}
                        className={hasErrors ? 'bg-rose-50/60' : 'hover:bg-slate-50'}
                      >
                        <td className="p-2 text-center text-slate-400 font-medium">
                          {row.index}
                        </td>
                        <td className="p-2 font-mono font-bold text-navy-900">
                          {row.inventory_code || '—'}
                        </td>
                        <td className="p-2 font-semibold text-navy-900">
                          {row.name || '—'}
                        </td>
                        <td className="p-2 text-center font-bold">
                          {row.quantity || 1}
                        </td>
                        <td className="p-2 text-right font-medium">
                          {row.purchase_price ? `${row.purchase_price} €` : '—'}
                        </td>
                        <td className="p-2 font-mono text-slate-500 text-[11px]">
                          {row.serial_number || '—'}
                        </td>
                        <td className="p-2 text-xs">
                          {hasErrors ? (
                            <span
                              className="text-rose-700 font-semibold"
                              title={row.errors.join(', ')}
                            >
                              ⚠️ {row.errors[0]}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              ✓ Готов
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {importResult !== null && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Успешно импортирани {importResult} актива в инвентарната система!</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Отказ
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={importing || validRows.length === 0}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>
              {importing
                ? 'Импортиране...'
                : `Импортирай ${validRows.length} валидни актива`}
            </span>
          </button>
        </div>
      </div>
    </ModuleModal>
  );
}
