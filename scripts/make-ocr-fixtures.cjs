// Renders realistic, FICTIONAL immigration court notices to images used by
// src/lib/ocr.test.ts. Each one contains both the court's address and the
// person's own mailing address (123 EXAMPLE STREET, QUEENS), plus a printed
// "Date:" that is not the hearing date, so the tests can check they're never
// confused.
//
// Needs Playwright (not a project dependency):
//   node scripts/make-ocr-fixtures.cjs src/lib/__fixtures__
const { chromium } = require('playwright');
const out = process.argv[2] || 'src/lib/__fixtures__';
const css = `body{margin:0;padding:36px 44px;width:900px;font:19px/1.35 'DejaVu Serif',serif;background:#fbfaf6;color:#151515}
.c{text-align:center}.b{font-weight:bold}table{width:100%;border-collapse:collapse;margin:14px 0}td{vertical-align:top;padding:2px 6px;width:50%}`;
const header = `<p class="c">UNITED STATES DEPARTMENT OF JUSTICE<br>EXECUTIVE OFFICE FOR IMMIGRATION REVIEW<br>IMMIGRATION COURT<br>26 FEDERAL PLAZA, 12TH FLOOR, ROOM 1237<br>NEW YORK, NY 10278</p>`;
const notices = {
  // Two-column EOIR layout: respondent's mailing block on the left, printed date on the right.
  // The hearing sentence puts the court address on ONE line.
  'notice-two-column': `${header}
<table><tr><td>Respondent Name:<br>DOE, JANE</td><td>A-Number:<br>123-456-789</td></tr>
<tr><td>To:<br>DOE, JANE<br>123 EXAMPLE STREET<br>QUEENS, NY 11375</td><td>Riders:<br>In removal proceedings<br>Date: Nov 2, 2026</td></tr></table>
<p class="c b">NOTICE OF IN-PERSON HEARING IN REMOVAL PROCEEDINGS</p>
<p>Your case has been scheduled for a MASTER hearing before the Immigration Judge on Jan 15, 2027 at 08:30 AM at 26 FEDERAL PLAZA, 12TH FLOOR, ROOM 1237, NEW YORK, NY 10278.</p>
<p>You may be represented in these proceedings, at no expense to the Government, by an attorney or other individual authorized to practice before the Immigration Court.</p>`,
  // No court header block at all: only the respondent address and the hearing sentence.
  // The printed date comes first; the hearing date is on its own line.
  'notice-no-header': `<p class="c">U.S. DEPARTMENT OF JUSTICE<br>IMMIGRATION COURT</p>
<p>Date: 11/02/2026</p>
<p>To: DOE, JANE<br>123 EXAMPLE STREET<br>QUEENS, NY 11375</p>
<p class="c b">NOTICE OF HEARING IN REMOVAL PROCEEDINGS</p>
<p>Your INDIVIDUAL hearing has been scheduled for:<br>01/15/2027 at 1:00 PM<br>Location:<br>26 FEDERAL PLAZA, ROOM 1237<br>NEW YORK, NY 10278</p>`,
  // The riskiest layout, as a phone photo: no court letterhead, so the only full
  // address block is the person's own; the court address is inside the hearing
  // sentence and wraps across lines. Rendered tilted, blurred and shadowed (JPEG).
  'notice-phone-photo': `<p class="c">U.S. DEPARTMENT OF JUSTICE<br>EXECUTIVE OFFICE FOR IMMIGRATION REVIEW</p>
<table><tr><td>To:<br>DOE, JANE<br>123 EXAMPLE STREET<br>QUEENS, NY 11375</td><td>A-Number: 123-456-789<br><br>Date: Nov 2, 2026</td></tr></table>
<p class="c b">NOTICE OF IN-PERSON HEARING IN REMOVAL PROCEEDINGS</p>
<p>Your case has been scheduled for a MASTER hearing before the Immigration Judge on Jan 15, 2027 at 08:30 AM at 26 FEDERAL PLAZA, 12TH FLOOR, ROOM 1237, NEW YORK, NY 10278.</p>
<p>Failure to appear at your hearing except for exceptional circumstances may result in one or more of the following actions: your hearing may be held in your absence.</p>`,
};
const PHOTO = new Set(['notice-phone-photo']);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 990, height: 400 }, deviceScaleFactor: 1 });
  for (const [name, body] of Object.entries(notices)) {
    if (PHOTO.has(name)) {
      await p.setContent(`<style>${css} html{background:#6b6257}
        body{transform:rotate(-1.4deg);transform-origin:center;filter:blur(0.6px) contrast(0.9);margin:30px;
        background:linear-gradient(115deg,#f4f1e8 0%,#e9e4d6 55%,#cfc8b6 100%);box-shadow:0 6px 20px #0006}</style>${body}`);
      await p.screenshot({ path: `${out}/${name}.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
    } else {
      await p.setContent(`<style>${css}</style>${body}`);
      await p.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    }
  }
  await b.close();
})();
