// Makes two small test images for Hindi and Punjabi photo reading:
// a fictional note in each script, drawn with the app's own Noto fonts.
// Run: node scripts/make-indic-ocr-fixtures.cjs
const { chromium } = require('playwright');
const { join } = require('path');
const root = join(__dirname, '..');
const font = (pkg, file) => `file://${join(root, 'node_modules', '@fontsource', pkg, 'files', file)}`;
const NOTES = {
  'note-hindi.png': ['Noto Sans Devanagari', font('noto-sans-devanagari', 'noto-sans-devanagari-devanagari-400-normal.woff2'),
    ['इमिग्रेशन कोर्ट में सुनवाई', 'तारीख़: 15 जनवरी 2027', 'समय: सुबह 8:30 बजे', 'पता: 26 Federal Plaza, New York', 'अपना नोटिस और पहचान पत्र साथ लाएँ।']],
  'note-punjabi.png': ['Noto Sans Gurmukhi', font('noto-sans-gurmukhi', 'noto-sans-gurmukhi-gurmukhi-400-normal.woff2'),
    ['ਇਮੀਗ੍ਰੇਸ਼ਨ ਅਦਾਲਤ ਵਿੱਚ ਸੁਣਵਾਈ', 'ਤਾਰੀਖ਼: 15 ਜਨਵਰੀ 2027', 'ਸਮਾਂ: ਸਵੇਰੇ 8:30 ਵਜੇ', 'ਪਤਾ: 26 Federal Plaza, New York', 'ਆਪਣਾ ਨੋਟਿਸ ਅਤੇ ਪਛਾਣ ਪੱਤਰ ਨਾਲ ਲਿਆਓ।']],
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 420 } });
  for (const [file, [family, url, lines]] of Object.entries(NOTES)) {
    await p.setContent(`<style>@font-face{font-family:'${family}';src:url('${url}')}
      body{margin:0;background:#fff}div{padding:30px 40px;font:34px/1.6 '${family}',Arial,sans-serif;color:#111}</style>
      <div>${lines.map((l) => `<p style="margin:0">${l}</p>`).join('')}</div>`);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: join(root, 'src', 'lib', '__fixtures__', file) });
  }
  await b.close();
})();
