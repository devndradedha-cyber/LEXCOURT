# LexCourt

A free, mobile-first web app for people in U.S. immigration court who don't have a lawyer.

**LexCourt gives legal information, not legal advice.** It explains documents in plain language and links people to free legal help.

## Notice Reader (first feature)

1. The user takes a photo of their court notice, chooses a PDF, or speaks or types what it says.
2. LexCourt reads the text on the device and finds:
   - what kind of notice it is (Notice of Hearing, Notice to Appear, judge's order)
   - the hearing type (master calendar or individual/merits)
   - the hearing date and time, or that the date is "to be set"
   - the court address
   - whether the hearing is by internet or video (Webex)
   - the A-Number
3. It shows these as editable fields and asks the user to check them against the paper notice.
4. It explains the notice in plain language and lists important things to know: missing a hearing can lead to an in-absentia order, how to check case status, the 5-day EOIR-33 change-of-address rule, the right to a lawyer, free interpreters, and notario fraud.
5. **Reminders:** it creates a calendar file (`.ics`) with alerts 1 week before, 1 day before, and 2 hours before the hearing. It also offers a pre-filled Google Calendar link.
6. It links to free legal aid and court resources: the EOIR pro bono list, the ImmigrationAdvocates.net directory, EOIR case status (ACIS and 1-800-898-7180), ICOR guides, and the online EOIR-33/IC change-of-address form. Court links open in the user's language.

The app is in **English and Spanish**. It picks the language from the browser, and the user can switch it at any time.

## Privacy

- **No backend, no accounts, no analytics, no cookies, no storage.** Nothing goes into `localStorage` or a server. Closing the page removes everything.
- Photos and PDFs are processed in the browser using `pdf.js` and `tesseract.js` OCR. The file is never uploaded.
- **No CDN.** The OCR engine (worker + WebAssembly core) and the English and Spanish models (~5 MB, downloaded once when someone first reads a photo) are served by LexCourt itself from `/tesseract/`. `scripts/copy-ocr-assets.mjs` copies them from `node_modules` before every `dev` and `build`. The browser caches the models (not any user data) in IndexedDB so later reads are faster.
- The production build sets a **Content-Security-Policy** that only allows scripts and data requests to LexCourt's own origin, so the browser itself blocks anything from being sent elsewhere. Links the user taps still open normally.
- **Voice** uses the browser's Web Speech API. Some browsers, including Chrome, send the audio to the browser maker's servers. The app tells the user this next to the microphone button and lets them type instead.
- Reminders go into the user's own calendar. The Google Calendar link sends the event details to Google only if the user taps it.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests + real OCR on sample notice photos (src/lib/__fixtures__)
npm run build      # type-check + production build into dist/
```

It's a static site, so `dist/` can be hosted anywhere (GitHub Pages, Netlify, Cloudflare Pages, etc.).

### Deploying to Vercel

`vercel.json` holds the whole setup: build command, output folder, and security headers (the Content-Security-Policy as a real header, plus `frame-ancestors 'none'`, `no-referrer`, and camera/microphone limited to this site). Nothing needs to be set in the Vercel dashboard.

1. On vercel.com, choose **Add New → Project** and import `devndradedha-cyber/LEXCOURT`.
2. Keep the detected settings (Vite) and click **Deploy**.
3. Under **Settings → Environments → Production**, pick the branch that should go live (for example `main`).

Every push then deploys automatically. Other branches get their own preview URLs.

### Code map

| File | Purpose |
| --- | --- |
| `src/lib/extract.ts` | Rule-based extraction of dates, times, address, notice and hearing type, A-Number (English & Spanish, written or spoken) |
| `src/lib/readFile.ts` | PDF text extraction and OCR for photos and scanned PDFs |
| `src/lib/speech.ts` | Voice input (Web Speech API) |
| `src/lib/reminders.ts` | `.ics` file and Google Calendar link |
| `src/lib/i18n.ts` | All user-facing text, in English and Spanish |
| `src/lib/resources.ts` | All outside links (legal aid, EOIR) in one place, per language |
| `scripts/copy-ocr-assets.mjs` | Copies the OCR engine and models into `public/tesseract/` |
| `src/lib/ocr.test.ts` | Runs the real OCR on fictional notice photos and checks the person's own address and the printed date are never used as the court address or hearing date |
| `scripts/make-ocr-fixtures.cjs` | Regenerates those photos (needs Playwright) |
| `src/App.tsx` | The UI |

## Before launch

- [ ] Open every link in `src/lib/resources.ts` in a browser. On 2026-11-10 they were checked against search-engine indexes of the official sites, but the sites themselves couldn't be opened from the build environment. Confirm the Spanish (`/es/`) versions especially.
- [ ] Have an immigration attorney or DOJ-accredited representative review all text in `src/lib/i18n.ts`.
- [ ] Have a native Spanish speaker review the Spanish text, ideally with people who will use the app.
- [ ] Test OCR on real (redacted) notices and phone photos, and tune `extract.ts`.
