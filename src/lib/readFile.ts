/**
 * Turn an uploaded photo or PDF into text, on the device.
 *
 * - PDFs with real text are read directly with pdf.js.
 * - Scanned PDFs and photos are read with Tesseract OCR (English + Spanish).
 *
 * The file itself never leaves the browser. The OCR engine and its English and
 * Spanish models are served by LexCourt itself from /tesseract/ (copied there by
 * scripts/copy-ocr-assets.mjs); nothing is loaded from a CDN.
 */

export type Progress = (stage: 'pdf' | 'ocr-loading' | 'ocr', fraction: number) => void;

const MAX_PDF_PAGES = 4;

export async function fileToText(file: File, onProgress: Progress = () => {}): Promise<string> {
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (isPdf) return pdfToText(file, onProgress);
  if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file.name)) {
    return ocr([file], onProgress);
  }
  throw new Error('unsupported-file');
}

async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

async function pdfToText(file: File, onProgress: Progress): Promise<string> {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = Math.min(doc.numPages, MAX_PDF_PAGES);
  let text = '';
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if ('str' in item) text += item.str + (item.hasEOL ? '\n' : ' ');
    }
    text += '\n';
    onProgress('pdf', i / pages);
  }
  if (text.replace(/\s/g, '').length > 40) {
    await doc.destroy();
    return text;
  }

  // Scanned PDF: render pages to images and OCR them.
  const images: Blob[] = [];
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (blob) images.push(blob);
  }
  await doc.destroy();
  return ocr(images, onProgress);
}

async function ocr(images: Blob[], onProgress: Progress): Promise<string> {
  onProgress('ocr-loading', 0);
  const { createWorker } = await import('tesseract.js');
  let pageIndex = 0;
  const base = `${import.meta.env.BASE_URL}tesseract`;
  const worker = await createWorker(['eng', 'spa'], 1, {
    workerPath: `${base}/worker.min.js`,
    corePath: `${base}/core`,
    langPath: `${base}/lang`,
    gzip: true,
    // Load the worker as a normal same-origin script, not a blob: URL.
    workerBlobURL: false,
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') {
        onProgress('ocr', (pageIndex + m.progress) / images.length);
      } else {
        onProgress('ocr-loading', m.progress);
      }
    },
  });
  try {
    let text = '';
    for (const img of images) {
      const { data } = await worker.recognize(img);
      text += data.text + '\n';
      pageIndex++;
    }
    return text;
  } finally {
    await worker.terminate();
  }
}
