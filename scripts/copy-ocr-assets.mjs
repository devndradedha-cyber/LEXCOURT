// Copies the OCR engine (tesseract.js worker + WebAssembly core) and the
// English and Spanish language models into public/tesseract/, so the app
// serves them itself instead of downloading them from a CDN.
// Runs automatically before `npm run dev` and `npm run build`.
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'tesseract');
const pkgDir = (name) => dirname(require.resolve(`${name}/package.json`));

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'core'), { recursive: true });
mkdirSync(join(out, 'lang'), { recursive: true });

copyFileSync(join(pkgDir('tesseract.js'), 'dist', 'worker.min.js'), join(out, 'worker.min.js'));

// LexCourt uses the LSTM engine only (OEM 1). The worker loads the .wasm.js
// build (WebAssembly embedded), with or without SIMD depending on the device.
const coreDir = pkgDir('tesseract.js-core');
for (const f of readdirSync(coreDir)) {
  if (/^tesseract-core(-simd)?-lstm\.wasm\.js$/.test(f)) copyFileSync(join(coreDir, f), join(out, 'core', f));
}

// "best_int" models: the same ones tesseract.js uses by default for OEM 1.
for (const lang of ['eng', 'spa']) {
  copyFileSync(
    join(pkgDir(`@tesseract.js-data/${lang}`), '4.0.0_best_int', `${lang}.traineddata.gz`),
    join(out, 'lang', `${lang}.traineddata.gz`),
  );
}
console.log('OCR assets copied to public/tesseract/');
