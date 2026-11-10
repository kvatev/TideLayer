import { useState, useMemo } from 'react';
import { generateQrMatrix, getQrSvgString } from '../qrGenerator';
import { Download, Copy, Check, Printer, FileText } from 'lucide-react';

interface QrCodeDisplayProps {
  text?: string;
  inventoryCode?: string;
  assetName?: string;
  roomName?: string;
  schoolName?: string;
  serialNumber?: string | null;
  size?: number;
  margin?: number;
  color?: string;
  bgColor?: string;
  className?: string;
  showActions?: boolean;
  showLabelSheetButton?: boolean;
  onOpenLabelSheet?: () => void;
  downloadFileName?: string;
}

export function QrCodeDisplay({
  text,
  inventoryCode,
  assetName,
  roomName,
  schoolName,
  serialNumber,
  size = 140,
  margin = 3,
  color = '#0f172a',
  bgColor = '#ffffff',
  className = '',
  showActions = true,
  showLabelSheetButton = false,
  onOpenLabelSheet,
  downloadFileName,
}: QrCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Payload text encoded into QR code
  const qrPayload = useMemo(() => {
    if (text) return text;
    if (inventoryCode) {
      // Direct asset lookup code or URL
      return `TL-INV:${inventoryCode}`;
    }
    return 'TL-INV';
  }, [text, inventoryCode]);

  const effectiveFileName = downloadFileName || (inventoryCode ? `qr-${inventoryCode}` : 'asset-qr-code');

  const matrix = useMemo(() => {
    try {
      return generateQrMatrix(qrPayload);
    } catch {
      return [];
    }
  }, [qrPayload]);

  const matrixSize = matrix.length;
  const totalCells = matrixSize + margin * 2;
  const cellSize = size / (totalCells || 1);

  const pathData = useMemo(() => {
    if (!matrix.length) return '';
    let p = '';
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c]) {
          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;
          p += `M${x.toFixed(2)},${y.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}z `;
        }
      }
    }
    return p;
  }, [matrix, matrixSize, margin, cellSize]);

  const handleDownload = () => {
    const svgStr = getQrSvgString(qrPayload, { size: 400, margin: 4, color, bgColor });
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${effectiveFileName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inventoryCode || qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePrintSingle = () => {
    window.print();
  };

  if (!matrix.length) {
    return (
      <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] text-slate-400">
        QR Грешка
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center gap-2.5 ${className}`}>
      {/* Label Card Representation */}
      <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col items-center gap-2 shrink-0">
        {schoolName && (
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center max-w-[200px] truncate">
            {schoolName}
          </div>
        )}

        <div className="p-1.5 rounded-lg border border-slate-100 bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            shapeRendering="crispEdges"
            className="block"
          >
            <rect width="100%" height="100%" fill={bgColor} />
            <path d={pathData} fill={color} />
          </svg>
        </div>

        {inventoryCode && (
          <div className="text-center">
            <code className="text-xs font-mono font-bold text-navy-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              {inventoryCode}
            </code>
            {assetName && (
              <div className="text-[11px] font-bold text-navy-900 mt-1 max-w-[220px] truncate">
                {assetName}
              </div>
            )}
            {serialNumber && (
              <div className="text-[9px] font-mono text-slate-400 truncate">
                S/N: {serialNumber}
              </div>
            )}
            {roomName && (
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                📍 {roomName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            title="Свали висококачествен вектор (SVG)"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>SVG</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            title="Копирай код на актива"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Копирано</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Код</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrintSingle}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer"
            title="Печат на етикета"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Печат</span>
          </button>

          {showLabelSheetButton && onOpenLabelSheet && (
            <button
              type="button"
              onClick={onOpenLabelSheet}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold transition-colors cursor-pointer"
              title="Печат на цял А4 лист с етикети"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Лист А4</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
