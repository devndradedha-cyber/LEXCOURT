/**
 * Photo reading in Hindi and Punjabi with the real Tesseract models the app
 * ships in public/tesseract/lang (hin, pan). Fixtures: scripts/make-indic-ocr-fixtures.cjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createWorker } from 'tesseract.js';
import { extractNoticeFacts } from './extract';
import { ocrLanguages } from './readFile';

const here = dirname(fileURLToPath(import.meta.url));
const langPath = join(here, '..', '..', 'public', 'tesseract', 'lang');

async function read(langs: string[], file: string): Promise<string> {
  const worker = await createWorker(langs, 1, { langPath, gzip: true, cacheMethod: 'none' });
  try {
    return (await worker.recognize(readFileSync(join(here, '__fixtures__', file)))).data.text;
  } finally {
    await worker.terminate();
  }
}

describe('OCR languages', () => {
  it('adds Hindi or Punjabi only when the app is in that language', () => {
    expect(ocrLanguages('en')).toEqual(['eng', 'spa']);
    expect(ocrLanguages('es')).toEqual(['eng', 'spa']);
    expect(ocrLanguages('ur')).toEqual(['eng', 'spa']);
    expect(ocrLanguages('hi')).toEqual(['eng', 'spa', 'hin']);
    expect(ocrLanguages('pa')).toEqual(['eng', 'spa', 'pan']);
  });

  it('the Hindi and Punjabi models are self-hosted with the app', () => {
    for (const m of ['eng', 'spa', 'hin', 'pan']) expect(existsSync(join(langPath, `${m}.traineddata.gz`)), m).toBe(true);
  });
});

describe('photo reading in Hindi and Punjabi (real OCR)', () => {
  it('reads a Hindi note with the hin model', async () => {
    const text = await read(ocrLanguages('hi'), 'note-hindi.png');
    expect(text).toMatch(/सुनवाई/);
    expect(text).toMatch(/जनवरी/);
    expect(text).toMatch(/26 Federal Plaza/);
  }, 90_000);

  it('reads a Punjabi (Gurmukhi) note with the pan model', async () => {
    const text = await read(ocrLanguages('pa'), 'note-punjabi.png');
    expect(text).toMatch(/ਸੁਣਵਾਈ/);
    expect(text).toMatch(/ਜਨਵਰੀ/);
    expect(text).toMatch(/26 Federal Plaza/);
  }, 90_000);

  it('without the Hindi model the same note is not readable (so the model is what helps)', async () => {
    const text = await read(['eng', 'spa'], 'note-hindi.png');
    expect(text).not.toMatch(/सुनवाई/);
  }, 90_000);

  it('an English notice is still read correctly with the Hindi or Punjabi model added', async () => {
    for (const lang of ['hi', 'pa']) {
      const f = extractNoticeFacts(await read(ocrLanguages(lang), 'notice-phone-photo.jpg'), new Date(2026, 10, 10));
      expect(f.date, lang).toBe('2027-01-15');
      expect(f.time, lang).toBe('08:30');
      expect(f.aNumber, lang).toBe('123-456-789');
      expect(f.courtAddress, lang).toBe('26 FEDERAL PLAZA, 12TH FLOOR, ROOM 1237\nNEW YORK, NY 10278');
    }
  }, 180_000);
});
