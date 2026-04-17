/**
 * Client-side PDF text extraction using pdfjs-dist v5.
 * Falls back to OCR via Tesseract.js v7 for image-based/scanned PDFs.
 *
 * Pipeline:
 *   PDF file → pdfjs (digital text) or Tesseract (OCR)
 *            → layout-aware reordering (single/multi-column detection)
 *            → text normalization (bullets, hyphenation, control chars)
 *            → ready for NLP and AI
 */

import {
  detectColumnCount,
  itemsToText,
  MAX_ITEMS_PER_PAGE,
  MAX_PAGES,
  normalizeTextItem,
  sortItemsByReadingOrder,
  type PdfTextItem,
} from './layout';
import { normalizeExtractedText } from './normalize';

let pdfjsInitialized = false;

async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist');

  if (!pdfjsInitialized && typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
    pdfjsInitialized = true;
  }

  return pdfjsLib;
}

/** Minimum char count to consider digital extraction successful. Below this, OCR is offered. */
const MIN_TEXT_LENGTH = 50;

export interface PdfExtractionResult {
  /** Normalized text ready for NLP and AI. */
  text: string;
  /** True when the digital extraction returned too little text (scanned PDF suspected). */
  isImageBased: boolean;
  /** Total number of pages processed. */
  pageCount: number;
}

export interface PdfOcrResult {
  /** Normalized OCR text ready for NLP and AI. */
  text: string;
  /** Average word-level confidence across all pages (0-100). */
  averageConfidence: number;
  /** Total number of pages processed by OCR. */
  pageCount: number;
}

/**
 * Extracts text from a PDF using layout-aware ordering.
 *
 * For each page we:
 *   1. Read text items with their x/y coordinates
 *   2. Detect whether the page uses 1, 2 or 3 columns
 *   3. Reorder items into natural reading order
 *   4. Concatenate pages and normalize the final text
 *
 * Safety limits:
 *   - Processes at most MAX_PAGES pages per document
 *   - Processes at most MAX_ITEMS_PER_PAGE items per page
 *   - Rejects items with non-finite coordinates
 */
export async function extractTextFromPdf(file: File): Promise<PdfExtractionResult> {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pagesToProcess = Math.min(pdf.numPages, MAX_PAGES);
  const pageTexts: string[] = [];

  for (let i = 1; i <= pagesToProcess; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const pageWidth = viewport.width;

    const textContent = await page.getTextContent();
    const rawItems = textContent.items.slice(0, MAX_ITEMS_PER_PAGE);

    const items: PdfTextItem[] = [];
    for (const raw of rawItems) {
      const normalized = normalizeTextItem(raw as Parameters<typeof normalizeTextItem>[0]);
      if (normalized !== null) items.push(normalized);
    }

    const columnCount = detectColumnCount(items, pageWidth);
    const ordered = sortItemsByReadingOrder(items, columnCount, pageWidth);
    pageTexts.push(itemsToText(ordered));
  }

  const joined = pageTexts.join('\n\n');
  const text = normalizeExtractedText(joined);
  const isImageBased = text.length < MIN_TEXT_LENGTH;

  return {
    text,
    isImageBased,
    pageCount: pdf.numPages,
  };
}

/**
 * OCR extraction for image-based PDFs using Tesseract.js.
 * Renders each page to a canvas at high DPI, runs OCR in Portuguese,
 * normalizes the result and reports average confidence.
 *
 * 100% client-side: no data leaves the browser.
 */
export async function extractTextWithOcr(
  file: File,
  onProgress?: (page: number, total: number) => void,
): Promise<PdfOcrResult> {
  const [pdfjsLib, { createWorker }] = await Promise.all([
    getPdfjs(),
    import('tesseract.js'),
  ]);

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const worker = await createWorker('por');

  const pagesToProcess = Math.min(pdf.numPages, MAX_PAGES);
  const pageTexts: string[] = [];
  const confidences: number[] = [];

  try {
    for (let i = 1; i <= pagesToProcess; i++) {
      onProgress?.(i, pagesToProcess);

      const page = await pdf.getPage(i);
      // Render at 3x scale (~216 DPI) for a good accuracy/speed balance.
      const viewport = page.getViewport({ scale: 3.0 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Falha ao criar canvas para OCR.');

      await page.render({ canvasContext: ctx, canvas, viewport }).promise;

      // Preprocess: grayscale + threshold binarization for better OCR accuracy.
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let j = 0; j < data.length; j += 4) {
        const gray = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
        const bw = gray > 140 ? 255 : 0;
        data[j] = bw;
        data[j + 1] = bw;
        data[j + 2] = bw;
      }
      ctx.putImageData(imageData, 0, 0);

      const { data: ocrData } = await worker.recognize(canvas);
      pageTexts.push(ocrData.text);
      if (typeof ocrData.confidence === 'number' && Number.isFinite(ocrData.confidence)) {
        confidences.push(ocrData.confidence);
      }

      canvas.remove();
    }
  } finally {
    // Always terminate the worker to free memory, even on error.
    await worker.terminate();
  }

  const joined = pageTexts.join('\n\n');
  const text = normalizeExtractedText(joined);
  const averageConfidence =
    confidences.length > 0
      ? Math.round(confidences.reduce((s, c) => s + c, 0) / confidences.length)
      : 0;

  return {
    text,
    averageConfidence,
    pageCount: pdf.numPages,
  };
}
