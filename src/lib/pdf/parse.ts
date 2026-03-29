/**
 * Client-side PDF text extraction using pdfjs-dist v5.
 * Falls back to OCR via Tesseract.js v7 for image-based/scanned PDFs.
 */

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

// Minimum character count to consider text extraction successful.
// Below this threshold we assume the PDF is image-based.
const MIN_TEXT_LENGTH = 50;

export interface PdfExtractionResult {
  text: string;
  isImageBased: boolean;
  pageCount: number;
}

/**
 * Extracts all text content from a PDF File, one page at a time.
 * Returns the extracted text and whether the PDF appears to be image-based.
 */
export async function extractTextFromPdf(file: File): Promise<PdfExtractionResult> {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .filter((item) => 'str' in item)
      .map((item) => (item as { str: string }).str)
      .join(' ');

    pages.push(pageText);
  }

  const fullText = pages.join('\n\n').trim();
  const isImageBased = fullText.length < MIN_TEXT_LENGTH;

  return {
    text: fullText,
    isImageBased,
    pageCount: pdf.numPages,
  };
}

/**
 * OCR extraction for image-based PDFs using Tesseract.js.
 * Renders each page to a canvas at high DPI, then runs OCR in Portuguese.
 * 100% client-side: no data leaves the browser.
 */
export async function extractTextWithOcr(
  file: File,
  onProgress?: (page: number, total: number) => void,
): Promise<string> {
  const [pdfjsLib, { createWorker }] = await Promise.all([
    getPdfjs(),
    import('tesseract.js'),
  ]);

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const worker = await createWorker('por');

  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);

    const page = await pdf.getPage(i);
    // Render at 3x scale (~216 DPI) for good accuracy/speed balance
    const viewport = page.getViewport({ scale: 3.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Falha ao criar canvas para OCR.');
    }

    await page.render({ canvasContext: ctx, canvas, viewport }).promise;

    // Preprocess: convert to grayscale + binarize for better OCR accuracy
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
    pages.push(ocrData.text);

    canvas.remove();
  }

  await worker.terminate();

  return pages.join('\n\n').trim();
}
