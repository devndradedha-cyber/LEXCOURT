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

The app is in **English and Spanish**. It picks the language from the browser, and the user can switch it at any time. The Spanish address `/es/` opens the app in Spanish and gives search engines and the home-screen icon a Spanish description (`es/index.html`, `public/es/manifest.webmanifest`).

## Check a representative and Report a problem (draft)

> ⚠️ **DRAFT — needs attorney review.** These pages show a draft banner. Their text is in `src/lib/toolsText.ts` and the complaint routing rules are in `src/lib/report.ts`.

- **Check a representative** (`#/check`): the person types a name (optional) and says what the representative claims to be. The page explains how to verify them, step by step, and links to the official sources:
  - EOIR's roster of recognized organizations and accredited representatives
  - EOIR's lists of currently and previously disciplined practitioners
  - official state lawyer searches (CA, FL, IL, NJ, NY and TX; other states via the ABA directory of state lawyer regulators)

  It also has a checklist of 12 notario-fraud warning signs. LexCourt never looks anyone up itself: the name stays on the device.
- **Report a problem** (`#/report`): a five-step questionnaire (who, what happened, immigration court case, state, optional details). It shows which offices usually handle the problem: the state lawyer discipline office, EOIR Disciplinary Counsel (Form EOIR-44), the EOIR Fraud & Abuse Prevention Program, the state attorney general, or the FTC. It links to their official complaint forms and builds a summary, in English or Spanish, to copy and paste. **Nothing is ever submitted automatically.**
- **Same privacy rules:** answers live only in the page's memory, nothing is stored or sent, and reloading clears everything. The tests check that the only thing in `localStorage` is the terms acceptance.
- Links are in `src/lib/resources.ts` (`OFFICIAL`, `STATE_LAWYER_LOOKUPS`). They were checked against search-engine indexes on 2026-11-10, but the sites themselves couldn't be opened from the build environment.

## Disclaimer, Terms of Use and Privacy Policy (draft)

> ⚠️ **DRAFT — needs attorney review.** The legal text in `src/lib/legal.ts` hasn't been reviewed by a lawyer. The app shows it as a draft on every legal page.

- **Every screen** shows a short disclaimer: LexCourt is not a law firm, doesn't give legal advice, creates no attorney-client relationship, and can make mistakes. Users must check every detail against their official notice and the court's case information, and should get help from an attorney or accredited representative.
- **Before first use,** people must tick a box agreeing to the Terms of Use and Privacy Policy. Until they do, they can still read the legal pages and the free legal help list.
- **Full documents** in English and Spanish: `#/disclaimer`, `#/terms`, `#/privacy` (linked in the footer).
- **Remembering acceptance:** the only thing stored is the accepted `TERMS_VERSION`, in `localStorage`. To make everyone accept again after a change, update `TERMS_VERSION`. If storage is blocked, people are simply asked again.
- **Attorney review document:** `npm run review-doc` writes `review/LexCourt-text-for-attorney-review.docx`, a Word file with every piece of user-facing text in English and Spanish side by side. It's read straight from the source, and each row has an ID and its source key. The `review/` folder isn't committed.
- **Tests:** `src/lib/legal.test.ts` checks that both languages contain every required statement and have the same sections.

## Privacy

- **No backend, no accounts, no analytics, no cookies.** Nothing the user enters is stored or sent to a server, and closing the page removes it. The only thing saved is the accepted terms version, in `localStorage`.
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
- [ ] Fill in `[OPERATOR NAME]` and `[CONTACT EMAIL]` in the Terms (section 15) and the Privacy Policy (`src/lib/legal.ts`).
- [ ] Confirm whether the online EOIR-33/IC form needs an account. The claim was removed because it couldn't be checked.
- [ ] **Have a licensed attorney review and approve the Disclaimer, Terms of Use and Privacy Policy in `src/lib/legal.ts`** and resolve every `[ATTORNEY REVIEW]` note: governing law, operating entity, contact address, warranty and liability wording, and state privacy notices. Then set `IS_DRAFT = false` and give `TERMS_VERSION` a new, non-draft value.
- [ ] Have an attorney review the **Check a representative** and **Report a problem** text and the routing rules (Parts 9–10 of the review document). Then set `TOOLS_DRAFT = false` in `src/lib/toolsText.ts`.
- [ ] Open every link in `OFFICIAL` and `STATE_LAWYER_LOOKUPS` in a browser. Consider adding official lawyer searches for more states.
- [ ] Have a qualified legal translator review the Spanish legal text.
- [ ] Have an immigration attorney or DOJ-accredited representative review all text in `src/lib/i18n.ts`.
- [ ] Have a native Spanish speaker review the Spanish text, ideally with people who will use the app.
- [ ] Test OCR on real (redacted) notices and phone photos, and tune `extract.ts`.
