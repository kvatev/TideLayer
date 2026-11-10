/**
 * Lightweight, zero-dependency QR Code generator for TideLayer School Inventory System.
 * Generates standards-compliant QR Code Model 2 matrices (Versions 1-6, Byte mode, ECC Level M).
 * Works offline in any browser environment without external CDNs or packages.
 */

// Galois Field GF(256) tables with primitive polynomial 0x11D
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  EXP_TABLE[255] = EXP_TABLE[0];
})();

function gfMultiply(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255];
}

// Generator polynomials for Reed-Solomon Error Correction
function getRsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMultiply(poly[j], factor);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

// Version table for ECC Level M: [version, totalCodewords, dataCodewords, ecCodewordsPerBlock, numBlocks]
interface VersionConfig {
  version: number;
  size: number;
  totalCodewords: number;
  dataCodewords: number;
  ecCodewordsPerBlock: number;
  blocks: { count: number; dataCount: number }[];
  alignmentPositions: number[];
}

const VERSION_CONFIGS: VersionConfig[] = [
  {
    version: 1,
    size: 21,
    totalCodewords: 26,
    dataCodewords: 16,
    ecCodewordsPerBlock: 10,
    blocks: [{ count: 1, dataCount: 16 }],
    alignmentPositions: [],
  },
  {
    version: 2,
    size: 25,
    totalCodewords: 44,
    dataCodewords: 28,
    ecCodewordsPerBlock: 16,
    blocks: [{ count: 1, dataCount: 28 }],
    alignmentPositions: [6, 18],
  },
  {
    version: 3,
    size: 29,
    totalCodewords: 70,
    dataCodewords: 44,
    ecCodewordsPerBlock: 26,
    blocks: [{ count: 1, dataCount: 44 }],
    alignmentPositions: [6, 22],
  },
  {
    version: 4,
    size: 33,
    totalCodewords: 100,
    dataCodewords: 64,
    ecCodewordsPerBlock: 18,
    blocks: [{ count: 2, dataCount: 32 }],
    alignmentPositions: [6, 26],
  },
  {
    version: 5,
    size: 37,
    totalCodewords: 134,
    dataCodewords: 86,
    ecCodewordsPerBlock: 24,
    blocks: [{ count: 2, dataCount: 43 }],
    alignmentPositions: [6, 30],
  },
  {
    version: 6,
    size: 41,
    totalCodewords: 172,
    dataCodewords: 108,
    ecCodewordsPerBlock: 16,
    blocks: [{ count: 4, dataCount: 27 }],
    alignmentPositions: [6, 34],
  },
];

function selectVersion(dataLen: number): VersionConfig {
  for (const cfg of VERSION_CONFIGS) {
    // 4 bits mode indicator + 8 bits length indicator + dataLen*8 <= dataCodewords*8
    const requiredCodewords = dataLen + 2;
    if (requiredCodewords <= cfg.dataCodewords) {
      return cfg;
    }
  }
  return VERSION_CONFIGS[VERSION_CONFIGS.length - 1];
}

function calculateReedSolomon(data: Uint8Array, ecCount: number): Uint8Array {
  const gen = getRsGeneratorPoly(ecCount);
  const res = new Uint8Array(ecCount);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    for (let j = 0; j < ecCount - 1; j++) {
      res[j] = res[j + 1] ^ gfMultiply(gen[gen.length - 2 - j], factor);
    }
    res[ecCount - 1] = gfMultiply(gen[0], factor);
  }

  return res;
}

export function generateQrMatrix(text: string): boolean[][] {
  const enc = new TextEncoder();
  const rawBytes = enc.encode(text);
  const cfg = selectVersion(rawBytes.length);
  const size = cfg.size;

  // 1. Bit Buffer: Mode (0100 for Byte mode) + Length (8 bits for V1-9) + data
  const bitArray: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bitArray.push((val >>> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode
  pushBits(rawBytes.length, 8); // Character count
  for (const byte of rawBytes) {
    pushBits(byte, 8);
  }

  // Terminator
  const maxBits = cfg.dataCodewords * 8;
  const terminatorLen = Math.min(4, maxBits - bitArray.length);
  pushBits(0, terminatorLen);

  // Align to byte boundary
  while (bitArray.length % 8 !== 0) {
    bitArray.push(0);
  }

  // Pad bytes: 0xEC (11101100), 0x11 (00010001)
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitArray.length < maxBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to data codewords
  const dataCodewords = new Uint8Array(cfg.dataCodewords);
  for (let i = 0; i < cfg.dataCodewords; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitArray[i * 8 + b];
    }
    dataCodewords[i] = byteVal;
  }

  // 2. Block division and Reed-Solomon generation
  const blockData: Uint8Array[] = [];
  const blockEc: Uint8Array[] = [];
  let offset = 0;

  for (const bCfg of cfg.blocks) {
    for (let i = 0; i < bCfg.count; i++) {
      const bData = dataCodewords.slice(offset, offset + bCfg.dataCount);
      offset += bCfg.dataCount;
      const bEc = calculateReedSolomon(bData, cfg.ecCodewordsPerBlock);
      blockData.push(bData);
      blockEc.push(bEc);
    }
  }

  // Interleave data codewords
  const finalCodewords: number[] = [];
  const maxDataPerBlock = Math.max(...cfg.blocks.map((b) => b.dataCount));

  for (let i = 0; i < maxDataPerBlock; i++) {
    for (let b = 0; b < blockData.length; b++) {
      if (i < blockData[b].length) {
        finalCodewords.push(blockData[b][i]);
      }
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < cfg.ecCodewordsPerBlock; i++) {
    for (let b = 0; b < blockEc.length; b++) {
      finalCodewords.push(blockEc[b][i]);
    }
  }

  // 3. Construct Matrix
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  function setFinderPattern(startR: number, startC: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startR + r][startC + c] = isBorder || isCenter;
      }
    }
    // Separator lines
    for (let i = 0; i < 8; i++) {
      if (startR + 7 < size && startC + i < size) matrix[startR + 7][startC + i] = false;
      if (startR + i < size && startC + 7 < size) matrix[startR + i][startC + 7] = false;
      if (startR - 1 >= 0 && startC + i < size) matrix[startR - 1][startC + i] = false;
      if (startR + i < size && startC - 1 >= 0) matrix[startR + i][startC - 1] = false;
    }
  }

  // Top-left, Top-right, Bottom-left Finders
  setFinderPattern(0, 0);
  setFinderPattern(0, size - 7);
  setFinderPattern(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // Alignment patterns
  if (cfg.alignmentPositions.length >= 2) {
    for (const r of cfg.alignmentPositions) {
      for (const c of cfg.alignmentPositions) {
        // Skip finders
        if (
          (r === 6 && c === 6) ||
          (r === 6 && c === cfg.alignmentPositions[cfg.alignmentPositions.length - 1]) ||
          (r === cfg.alignmentPositions[cfg.alignmentPositions.length - 1] && c === 6)
        ) {
          continue;
        }

        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            matrix[r + dr][c + dc] = isBorder || isCenter;
          }
        }
      }
    }
  }

  // Dark module (always at row 4 * version + 9, col 8)
  matrix[4 * cfg.version + 9][8] = true;

  // Reserve Format Information areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = 0; i < 8; i++) {
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false;
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false;
  }

  // 4. Fill Data Codewords into Matrix (Zigzag upwards and downwards)
  let bitIdx = 0;
  const allFinalBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let b = 7; b >= 0; b--) {
      allFinalBits.push((cw >>> b) & 1);
    }
  }

  let upward = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing pattern column

    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (let c = right; c >= right - 1; c--) {
        if (matrix[r][c] === null) {
          const bit = bitIdx < allFinalBits.length ? allFinalBits[bitIdx++] === 1 : false;
          // Apply standard Mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = bit !== mask;
        }
      }
    }
    upward = !upward;
  }

  // 5. Place Format Information (ECC Level M = 00, Mask 0 = 000 -> 00000 ^ 101010000010010)
  // Standard format bits for (M, Mask 0) after BCH encoding and XOR 0x5412: 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  // Top-left format placement
  const tlCoords: [number, number][] = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = tlCoords[i];
    matrix[r][c] = formatBits[i] === 1;
  }

  // Split format placement across top-right and bottom-left
  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = formatBits[i] === 1;
  }
  for (let i = 0; i < 8; i++) {
    matrix[8][size - 8 + i] = formatBits[7 + i] === 1;
  }

  return matrix.map((row) => row.map((cell) => cell === true));
}

/**
 * Returns an SVG path string or full SVG element string representing the QR Code.
 */
export function getQrSvgString(
  text: string,
  options: { size?: number; margin?: number; color?: string; bgColor?: string } = {}
): string {
  const { size = 180, margin = 4, color = '#0f172a', bgColor = '#ffffff' } = options;
  const matrix = generateQrMatrix(text);
  const matrixSize = matrix.length;
  const totalCells = matrixSize + margin * 2;
  const cellSize = size / totalCells;

  let pathData = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;
        pathData += `M${x.toFixed(2)},${y.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}z `;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect width="100%" height="100%" fill="${bgColor}" />
      <path d="${pathData}" fill="${color}" />
    </svg>
  `.trim();
}
