/**
 * Layout-aware reading order for PDF pages.
 *
 * pdfjs-dist extracts text items with x/y coordinates but preserves them in
 * PDF render order, which can scramble multi-column resumes. This module
 * detects the column count of a page (1, 2 or 3) using a histogram of item
 * x-positions and reorders items into a natural reading order.
 *
 * Security posture:
 * - Pure function, no side effects
 * - Rejects non-finite coordinates (protects against malformed PDFs)
 * - Hard limits on item count per page (anti-DoS)
 * - Conservative heuristics: falls back to linear order when unsure,
 *   never worsens the output for single-column documents
 */

/** Maximum number of text items we will process per page. */
export const MAX_ITEMS_PER_PAGE = 10_000;

/** Maximum pages we will process per document. */
export const MAX_PAGES = 20;

/** A text item as returned by pdfjs-dist after we normalize it. */
export interface PdfTextItem {
  /** Plain text of the item. */
  str: string;
  /** X coordinate (left edge) in PDF units. */
  x: number;
  /** Y coordinate (top edge, PDF-style: origin at bottom). */
  y: number;
  /** Width of the item in PDF units. */
  width: number;
  /** Height of the item. */
  height: number;
  /** True when pdfjs signaled this item ends a line. */
  hasEOL: boolean;
}

/**
 * Transforms a raw pdfjs-dist `TextItem` (with a 6-element transform matrix)
 * into a normalized PdfTextItem. Returns null for items that cannot be
 * safely processed (non-finite coordinates).
 */
export function normalizeTextItem(raw: {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
  hasEOL?: boolean;
}): PdfTextItem | null {
  if (typeof raw.str !== 'string') return null;

  const transform = raw.transform;
  if (!Array.isArray(transform) || transform.length < 6) return null;

  const x = transform[4];
  const y = transform[5];
  const width = typeof raw.width === 'number' ? raw.width : 0;
  const height = typeof raw.height === 'number' ? raw.height : 0;

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

  return {
    str: raw.str,
    x,
    y,
    width,
    height,
    hasEOL: Boolean(raw.hasEOL),
  };
}

// ─── Column detection ─────────────────────────────────────────────────────────

/**
 * Detects whether the page uses 1, 2 or 3 columns based on the distribution
 * of item x-positions. Conservative: only returns 2 or 3 when the evidence
 * is clear, otherwise defaults to 1 so the caller falls back to linear order.
 */
export function detectColumnCount(
  items: PdfTextItem[],
  pageWidth: number,
): 1 | 2 | 3 {
  // Need a reasonable amount of content to make a decision. Avoids false
  // positives on tiny pages, cover pages, or nearly-empty documents.
  if (items.length < 20) return 1;
  if (!Number.isFinite(pageWidth) || pageWidth <= 0) return 1;

  // Filter to items with non-empty text to avoid whitespace-only noise
  // distorting the histogram.
  const meaningful = items.filter((i) => i.str.trim().length > 0);
  if (meaningful.length < 20) return 1;

  // Build a histogram of x-positions by 10% page-width buckets.
  const bucketCount = 10;
  const bucketSize = pageWidth / bucketCount;
  const buckets = new Array<number>(bucketCount).fill(0);

  for (const item of meaningful) {
    if (item.x < 0 || item.x >= pageWidth) continue;
    const idx = Math.min(bucketCount - 1, Math.floor(item.x / bucketSize));
    buckets[idx]++;
  }

  const total = meaningful.length;

  // Count buckets with significant density (more than 10% of items each).
  // These represent column-starting positions.
  const threshold = total * 0.1;
  const densePeakIndexes: number[] = [];
  for (let i = 0; i < bucketCount; i++) {
    if (buckets[i] > threshold) densePeakIndexes.push(i);
  }

  // Cluster adjacent dense buckets into peaks (within 1 bucket distance
  // means they belong to the same column).
  const peaks: number[] = [];
  for (const idx of densePeakIndexes) {
    if (peaks.length === 0 || idx - peaks[peaks.length - 1] > 1) {
      peaks.push(idx);
    }
  }

  if (peaks.length >= 3) {
    // At least 3 distinct x-position clusters: 3-column layout likely.
    // Extra safety: confirm the peaks are well-separated.
    const spread = peaks[peaks.length - 1] - peaks[0];
    return spread >= 5 ? 3 : 1;
  }

  if (peaks.length === 2) {
    // 2-column layout candidate. Confirm by checking both columns carry
    // substantial vertical content (not just a header row).
    const firstPeakX = peaks[0] * bucketSize;
    const secondPeakX = peaks[1] * bucketSize;
    const midpoint = (firstPeakX + secondPeakX) / 2;

    const leftItems = meaningful.filter((i) => i.x < midpoint);
    const rightItems = meaningful.filter((i) => i.x >= midpoint);

    // Both sides must have at least 30% of the items.
    const leftShare = leftItems.length / total;
    const rightShare = rightItems.length / total;
    if (leftShare < 0.3 || rightShare < 0.3) return 1;

    // Both sides must cover at least 40% of the page height (Y range).
    const yRange = (items: PdfTextItem[]) => {
      const ys = items.map((i) => i.y);
      return Math.max(...ys) - Math.min(...ys);
    };
    const leftYRange = yRange(leftItems);
    const rightYRange = yRange(rightItems);
    const maxYRange = Math.max(leftYRange, rightYRange);
    if (maxYRange <= 0) return 1;
    if (leftYRange / maxYRange < 0.4) return 1;
    if (rightYRange / maxYRange < 0.4) return 1;

    return 2;
  }

  return 1;
}

// ─── Item ordering ────────────────────────────────────────────────────────────

/** Y-threshold in PDF units: items within this Y distance are on the same line. */
const LINE_Y_TOLERANCE = 3;

/**
 * Sorts items by a top-to-bottom, left-to-right reading order within a single
 * column. PDF coordinates have origin at the bottom, so higher Y = higher on
 * the page.
 */
function sortSingleColumn(items: PdfTextItem[]): PdfTextItem[] {
  return [...items].sort((a, b) => {
    // First by Y descending (top first), grouping near-identical Y values
    // as the same line.
    if (Math.abs(a.y - b.y) > LINE_Y_TOLERANCE) {
      return b.y - a.y;
    }
    // Same line: sort by X ascending (left to right).
    return a.x - b.x;
  });
}

/**
 * Reorders items for a multi-column page: reads each column top-to-bottom
 * in order (left, middle if present, right).
 */
export function sortItemsByReadingOrder(
  items: PdfTextItem[],
  columnCount: 1 | 2 | 3,
  pageWidth: number,
): PdfTextItem[] {
  if (columnCount === 1 || items.length === 0) {
    return sortSingleColumn(items);
  }

  const columnWidth = pageWidth / columnCount;
  const columns: PdfTextItem[][] = Array.from({ length: columnCount }, () => []);

  for (const item of items) {
    let colIdx = Math.floor(item.x / columnWidth);
    if (colIdx < 0) colIdx = 0;
    if (colIdx >= columnCount) colIdx = columnCount - 1;
    columns[colIdx].push(item);
  }

  // Sort each column internally and concatenate left-to-right.
  return columns.flatMap((col) => sortSingleColumn(col));
}

// ─── Text assembly ────────────────────────────────────────────────────────────

/**
 * Concatenates already-ordered items into a text string, inserting a newline
 * when items cross a line boundary or when pdfjs signaled end-of-line.
 */
export function itemsToText(items: PdfTextItem[]): string {
  const parts: string[] = [];
  let prevY: number | null = null;

  for (const item of items) {
    if (prevY !== null && Math.abs(item.y - prevY) > LINE_Y_TOLERANCE) {
      parts.push('\n');
    }
    parts.push(item.str);
    if (item.hasEOL) parts.push('\n');
    prevY = item.y;
  }

  return parts.join(' ').replace(/ +\n/g, '\n').replace(/\n +/g, '\n');
}
