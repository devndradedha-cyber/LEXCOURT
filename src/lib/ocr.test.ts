/**
 * End-to-end photo reading: runs the real OCR engine (the same one and the same
 * English/Spanish models the app ships in public/tesseract/) on images of
 * fictional notices, then checks what the Notice Reader extracts.
 *
 * Every fixture has two addresses — the court's, and the person's own mailing
 * address (123 EXAMPLE STREET, QUEENS, NY 11375) — plus a printed "Date:" that
 * is not the hearing date. The person's address and the printed date must never
 * be shown as the court address or the hearing date.
 *
 * Regenerate the images with: node scripts/make-ocr-fixtures.cjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createWorker, type Worker } from 'tesseract.js';
import { extractNoticeFacts, type NoticeFacts } from './extract';

const here = dirname(fileURLToPath(import.meta.url));
const TODAY = new Date(2026, 10, 10);
const HEARING_DATE = '2027-01-15';
const PRINTED_DATES = ['2026-11-02'];

let worker: Worker;
const texts: Record<string, string> = {};

async function read(name: string): Promise<NoticeFacts> {
  if (!texts[name]) {
    const { data } = await worker.recognize(readFileSync(join(here, '__fixtures__', name)));
    texts[name] = data.text;
  }
  return extractNoticeFacts(texts[name], TODAY);
}

function expectNeverTheirAddressOrPrintedDate(f: NoticeFacts) {
  expect(f.courtAddress ?? '').not.toMatch(/EXAMPLE|QUEENS|11375/i);
  expect(f.courtAddress ?? '').not.toMatch(/\bDate\b/i);
  expect(PRINTED_DATES).not.toContain(f.date);
}

beforeAll(async () => {
  worker = await createWorker(['eng', 'spa'], 1, {
    langPath: join(here, '..', '..', 'public', 'tesseract', 'lang'),
    gzip: true,
    cacheMethod: 'none',
  });
}, 60_000);

afterAll(async () => {
  await worker?.terminate();
});

describe('photo reading (real OCR)', () => {
  it('phone photo, no court letterhead: uses the court address from the hearing sentence, not the person’s address', async () => {
    const f = await read('notice-phone-photo.jpg');
    expectNeverTheirAddressOrPrintedDate(f);
    expect(f.courtAddress).toBe('26 FEDERAL PLAZA, 12TH FLOOR, ROOM 1237\nNEW YORK, NY 10278');
    expect(f.date).toBe(HEARING_DATE);
    expect(f.time).toBe('08:30');
    expect(f.hearingType).toBe('master');
    expect(f.aNumber).toBe('123-456-789');
  }, 60_000);

  it('two-column notice: ignores the person’s mailing block and the printed date beside it', async () => {
    const f = await read('notice-two-column.png');
    expectNeverTheirAddressOrPrintedDate(f);
    expect(f.courtAddress).toBe('26 FEDERAL PLAZA, 12TH FLOOR, ROOM 1237\nNEW YORK, NY 10278');
    expect(f.date).toBe(HEARING_DATE);
    expect(f.time).toBe('08:30');
    // "an attorney or other individual authorized..." must not make it an individual hearing
    expect(f.hearingType).toBe('master');
    expect(f.aNumber).toBe('123-456-789');
  }, 60_000);

  it('printed date at the top, hearing date on its own line', async () => {
    const f = await read('notice-no-header.png');
    expectNeverTheirAddressOrPrintedDate(f);
    expect(f.courtAddress).toBe('26 FEDERAL PLAZA, ROOM 1237\nNEW YORK, NY 10278');
    expect(f.date).toBe(HEARING_DATE);
    expect(f.time).toBe('13:00');
    expect(f.hearingType).toBe('individual');
  }, 60_000);

  it('when the hearing details are unreadable, leaves them blank instead of using the person’s address or the printed date', async () => {
    await read('notice-phone-photo.jpg');
    // Simulate a smudged hearing sentence on the same OCR text.
    const smudged = texts['notice-phone-photo.jpg']
      .replace(/Jan\s*15, 2027/, 'J~n 1S, 2O27')
      .replace(/26 FEDERAL PLAZA[\s\S]*?10278/, '2~ FED#RAL PL@ZA ~~~');
    const f = extractNoticeFacts(smudged, TODAY);
    expect(f.courtAddress).toBeNull();
    expect(f.date).toBeNull();
  }, 60_000);
});
