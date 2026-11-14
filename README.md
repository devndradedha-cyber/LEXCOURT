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

The app is in **English, Spanish, Hindi (Devanagari), Punjabi (Gurmukhi) and Urdu (Nastaliq, right to left)**. It picks the language from the browser, and the user can switch it at any time from the language menu. The Spanish address `/es/` opens the app in Spanish and gives search engines and the home-screen icon a Spanish description (`es/index.html`, `public/es/manifest.webmanifest`).

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

## Case status, read aloud, glossary and legal aid summary (draft)

> ⚠️ **DRAFT — needs attorney review** (and native speaker review for Hindi, Punjabi and Urdu). The text is in `src/lib/featuresText.ts` and `src/lib/locales/*.features.ts`.

- **Case status** (`#/status`): step-by-step help for checking the court's Automated Case Information, online or by phone (1-800-898-7180, TDD 1-800-828-1120).
  - The A-Number is filled in from the notice, and a button copies the 9 digits (8-digit numbers get a leading 0).
  - An optional monthly calendar reminder repeats 12 times. The A-Number is only included if the person ticks a box, because calendars often sync online.
  - **LexCourt never connects to the court**: nothing is fetched or sent.
- **Read aloud:** a 🔊 button on each explanation, the case status page, the legal pages, and the representative and report pages.
  - It reads in the selected language with `speechSynthesis`.
  - On-device voices (`localService`) are used first. If the only voice for the language is online (for example Chrome's “Google हिन्दी” on a computer), LexCourt asks before using it and removes long numbers like the A-Number first. Phones that list no voices are asked to speak the language directly (`hi-IN`, `pa-IN`).
  - Punjabi with no Punjabi voice (iPhones, computers) is read with the Hindi voice after a letter-by-letter Gurmukhi→Devanagari conversion, with a note saying so.
  - In Hindi, Punjabi and Urdu, English glosses in brackets such as “(Notice to Appear)” or “(A-Number)” are skipped, because the term was just read in the person's own language and the voice would mispronounce the English.
  - If there's no voice at all for the language, it shows a note in that language.
  - Text is spoken one sentence at a time (`src/lib/readAloud.ts`).
- **Voice input** tries the exact tag first and then the plain one (`pa-Guru-IN` → `pa-IN`); if the browser can't recognise the language it says so in that language and typing keeps working.
- **Glossary:** 10 terms (removal, relief, asylum, in absentia, Notice to Appear, master calendar hearing, individual hearing, A-Number, accredited representative, appeal).
  - Terms are underlined in explanations; tapping one shows its meaning, and a "Words to know" list shows all ten.
  - Matching works in all five scripts (`src/lib/glossary.ts`).
- **Legal aid summary:** a one-page summary on the results screen showing the notice type, hearing date and time, court address, A-Number (optional) and the person's questions, with lines for notes.
  - **Print or save as PDF**: a print stylesheet prints only the summary.
  - **Download**: a self-contained HTML page with no scripts and no outside resources.
  - **Share**: the share sheet, with text.
  - Nothing is sent automatically. The summary can be made in English, Spanish or the person's language.

## Feedback (draft)

After the Notice Reader explanation and the Check a representative page, a small card asks **“How helpful was this?”**: 1–5 stars and an optional comment, in all five languages. The rules:

1. **LexCourt only.** People rate LexCourt, never a lawyer or firm; the card says so.
2. **Private by default.** Comments are stored for reviewers only. A comment can be published only if the person ticks the consent box **and** a reviewer approves it. Approved comments are kept but **not shown anywhere yet**.
3. **Names removed.** Before anything can be approved, `src/lib/feedback/moderation.ts` removes names of lawyers, law firms and people (title + name, role + name, firm patterns, capitalised names; Hindi/Punjabi/Urdu honorific patterns) and flags the item. Detection is heuristic, so the reviewer always sees the original and edits the public text; the server re-checks the edited text on approval.
4. **No accusations.** If a comment mentions fraud or a scam (in any supported language), the card points to **Report a problem**, the consent box is disabled, and the server never queues it for publishing.
5. **No sensitive details.** The form asks for nothing but stars and a comment, warns people not to include personal details, and won’t send a comment containing an A-Number, case number, SSN, phone, email or immigration-status words. The server removes any that get through. No name, IP address or user agent is stored.
6. **Admin dashboard** at `#/admin` (English only): average rating, ratings per feature, the moderation queue, private comments and approved items.

**Setup (Supabase + Vercel):**

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor. Row Level Security is on with no policies, so only the service-role key can read or write.
2. In Vercel → Project → Settings → Environment Variables, set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-side only — never put it in a `VITE_` variable) and `ADMIN_PASSWORD` (at least 12 characters). Redeploy.
3. Without these, the card says feedback isn’t available and the admin page explains what is missing.

The serverless functions are in `api/` and call `server/feedbackApi.ts`. In `npm run dev` and `npm run preview`, the same handlers run in memory (nothing saved) and the admin password is `local-dev-password` unless `ADMIN_PASSWORD` is set.

## Design (draft 7)

Warm and calm, built for small phones first.

- **Palette:** deep navy `#1E2A5A` (text, headings), warm teal `#14B8A6` (buttons, highlights), soft cream `#FAF7F2` (background), coral `#F97362` only for warnings and deadlines. People who use dark mode get a navy version.
- **Contrast (WCAG AA):** white text on teal or coral is too faint (2.5:1 and 2.7:1), so teal buttons use navy text (5.5:1), and teal or coral *text* uses darker shades of the same colours (`#0F766E`, `#A63A2A`). Checked automatically with axe-core in the browser tests.
- **Type:** Nunito (self-hosted, rounded and readable) for English and Spanish, Noto for Hindi, Punjabi and Urdu; nothing on screen is smaller than 16px.
- **Icons and art:** Lucide line icons (bundled, no CDN). The welcome illustration shows four people of different backgrounds with speech bubbles in the app's five scripts. On purpose there are no seals, eagles, flags or anything that looks like a government site.
- **Motion:** buttons lift slightly, results slide in gently, and a slow scanning page is shown while a document is read. All of it is switched off for people who ask their phone for less motion.
- **Results:** three main cards — *What this means*, *Your next date or deadline* (with *Want a reminder?*), and *Where to get free help*.

## Deadline reminders (draft)

After the Notice Reader finds a date (or the person types one), *Want a reminder?* offers two free options:

1. **Add to my calendar** — an `.ics` file made on the phone (Google, Apple, Outlook). Nothing is sent.
2. **Email reminders** — 7 days, 2 days and 1 day before the date, in the person's language. The app sends only the email address, the date, one of three fixed labels (*Court hearing*, *Deadline*, *Appointment*) and the language; there is no free-text field, so an A-Number, case number, immigration status or the document can't be stored with it (the server also refuses any other field).
   - A confirmation email is sent first (double opt-in), so nobody can sign up someone else. Unconfirmed addresses are deleted after 48 hours.
   - Every email has a one-click stop link (`#/reminder/stop/…`, plus RFC 8058 `List-Unsubscribe` headers). Links are signed (HMAC), so no token is stored.
   - A daily job (`/api/cron/reminders`, Vercel Cron at 15:00 UTC) sends what is due and deletes reminders whose date has passed.
   - More than 3 reminders for one address are ignored silently, so the form can't be used to find out whether someone has a court date.
   - Only counts are kept for the admin dashboard: reminder emails sent, people who confirmed, reminders waiting.
   - No SMS.

The note *“Always double-check the date on your official notice. Reminders may fail. LexCourt is not responsible for missed dates.”* is shown next to both options and in every email, and Terms section 18 says the same.

**Setup:** run the reminders part of `supabase/schema.sql`, create a free [Resend](https://resend.com) account and verify a sending domain, then set in Vercel: `RESEND_API_KEY`, `REMINDER_FROM` (for example `LexCourt <reminders@your-domain.org>`), `REMINDER_SECRET` (random, 32+ characters), `CRON_SECRET` (random, 16+ characters) and optionally `APP_URL`. Without them the email option says it is unavailable and the calendar option still works. Locally (`npm run dev` / `npm run preview`) emails go to an in-memory outbox at `/api/dev/outbox`, and the daily job can be run with `curl -H "Authorization: Bearer local-cron-secret" localhost:5173/api/cron/reminders`.

## Hindi, Punjabi and Urdu (draft translations)

> ⚠️ **DRAFT, needs native speaker review.** Every Hindi, Punjabi and Urdu screen shows a notice saying the translation is a draft.

- **Where the text lives:** `src/lib/locales/hi.ts`, `pa.ts` and `ur.ts` hold each language's app text, legal text, representative and report text, and complaint summary.
- **Immigration terms:** terms like "Notice to Appear", "master calendar hearing", "A-Number" and "EOIR-33/IC" are kept **in English in brackets** after the translation, so people can match them to their paper notice. `src/lib/languages.test.ts` checks this.
- **Urdu (right to left):** the whole page switches to `dir="rtl"`, and CSS uses logical properties (start/end instead of left/right), so the layout mirrors. English terms, phone numbers and links inside Urdu text are wrapped in Unicode left-to-right isolates so they keep their order. The date/time on the results screen is isolated too, and calendar reminders in Urdu start with a right-to-left mark.
- **Fonts:** Noto Sans Devanagari, Noto Sans Gurmukhi and Noto Nastaliq Urdu are self-hosted from `@fontsource`, script subsets only. A phone downloads a font only when that script appears on screen (about 11–160 KB each). Urdu gets a larger size and line height for Nastaliq.
- **Voice input:** the app uses `hi-IN`, `pa-Guru-IN` or `ur-PK` where the browser supports it. If the browser doesn't support that language, it shows a message suggesting typing instead. The notice reader understands Hindi, Punjabi and Urdu month names, each script's digits, "o'clock" (बजे / ਵਜੇ / بجے), and morning/evening words that come before the time.
- **Links:** court and legal-aid sites have no Hindi, Punjabi or Urdu versions, so these languages link to the English pages, and the link labels say so.
- **Spanish only:** the `/es/` address with a Spanish search description exists for Spanish only.

## Disclaimer, Terms of Use and Privacy Policy (draft)

> ⚠️ **DRAFT — needs attorney review.** The legal text in `src/lib/legal.ts` hasn't been reviewed by a lawyer. The app shows it as a draft on every legal page.

- **Every screen** shows a short disclaimer: LexCourt is not a law firm, doesn't give legal advice, creates no attorney-client relationship, and can make mistakes. Users must check every detail against their official notice and the court's case information, and should get help from an attorney or accredited representative.
- **Before first use,** people must tick a box agreeing to the Terms of Use and Privacy Policy. Until they do, they can still read the legal pages and the free legal help list.
- **Full documents** in English and Spanish: `#/disclaimer`, `#/terms`, `#/privacy` (linked in the footer).
- **Language clause:** Terms section 16 and the last Privacy Policy section say the English version controls if a translation differs. The acceptance screen repeats the Terms sentence in small print under the checkbox. It's a draft for attorney review, in all five languages.
- **Remembering acceptance:** the only thing stored is the accepted `TERMS_VERSION`, in `localStorage`. To make everyone accept again after a change, update `TERMS_VERSION`. If storage is blocked, people are simply asked again.
- **Attorney review document:** `npm run review-doc` writes `review/LexCourt-text-for-attorney-review.docx`, a Word file with every piece of user-facing text in English and Spanish side by side. It's read straight from the source, and each row has an ID and its source key. The `review/` folder isn't committed.
- **Tests:** `src/lib/legal.test.ts` checks that both languages contain every required statement and have the same sections.

## Privacy

- **No accounts, no analytics, no cookies.** Nothing the user enters is stored or sent to a server, and closing the page removes it. The only thing saved on the device is the accepted terms version, in `localStorage`.
- **The exceptions are what the person chooses to send:** email reminders (below) and **feedback** (stars, optional comment, feature, language, date), stored in Supabase through LexCourt’s own `/api` (see Feedback above). Personal details are blocked in the app and removed again on the server.
- Photos and PDFs are processed in the browser using `pdf.js` and `tesseract.js` OCR. The file is never uploaded.
- **No CDN.** The OCR engine (worker + WebAssembly core) and the English and Spanish models (~5 MB, downloaded once when someone first reads a photo), plus the Hindi (`hin`) or Punjabi (`pan`, Gurmukhi) model (~1.4 MB each) only when the app is in that language, are served by LexCourt itself from `/tesseract/`. `scripts/copy-ocr-assets.mjs` copies them from `node_modules` before every `dev` and `build`. The browser caches the models (not any user data) in IndexedDB so later reads are faster.
- The production build sets a **Content-Security-Policy** that only allows scripts and data requests to LexCourt's own origin, so the browser itself blocks anything from being sent elsewhere. Links the user taps still open normally.
- **Voice** uses the browser's Web Speech API. Some browsers, including Chrome, send the audio to the browser maker's servers. The app tells the user this next to the microphone button and lets them type instead.
- Calendar reminders go into the user's own calendar. The Google Calendar link sends the event details to Google only if the user taps it.
- **Email reminders** (only if asked for) store the email address, date, a fixed label and the language until the date passes — see Deadline reminders above.

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
- [ ] Fill in `[OPERATOR NAME]` and `[CONTACT EMAIL]` in the Terms (section 15) and the Privacy Policy, including the feedback deletion contact, (`src/lib/legal.ts`).
- [ ] Confirm whether the online EOIR-33/IC form needs an account. The claim was removed because it couldn't be checked.
- [ ] **Have a licensed attorney review and approve the Disclaimer, Terms of Use and Privacy Policy in `src/lib/legal.ts`** and resolve every `[ATTORNEY REVIEW]` note: governing law, operating entity, contact address, warranty and liability wording, and state privacy notices. Then set `IS_DRAFT = false` and give `TERMS_VERSION` a new, non-draft value.
- [ ] Have an attorney review the **Check a representative** and **Report a problem** text and the routing rules (Parts 9–10 of the review document). Then set `TOOLS_DRAFT = false` in `src/lib/toolsText.ts`.
- [ ] Open every link in `OFFICIAL` and `STATE_LAWYER_LOOKUPS` in a browser. Consider adding official lawyer searches for more states.
- [ ] Have a qualified legal translator review the Spanish legal text.
- [ ] Have native speakers review the Hindi, Punjabi and Urdu translations (especially Urdu, which needs a fluent Urdu reader), then set `draftTranslation: false` for each in `src/lib/i18n.ts` and remove `translationDraft`.
- [ ] Decide with the attorney whether the Terms should say which language version controls.
- [ ] Have an immigration attorney or DOJ-accredited representative review all text in `src/lib/i18n.ts`.
- [ ] Have a native Spanish speaker review the Spanish text, ideally with people who will use the app.
- [ ] Have the attorney review the feedback rules, Terms section 17 and the Privacy Policy feedback section (review document, Feedback part), including how long feedback is kept.
- [ ] Verify a sending domain in Resend, send yourself a reminder, and check it lands in the inbox (not spam) in each language.
- [ ] Have the attorney review the reminder wording, Terms section 18 and the Privacy Policy reminders section (CAN-SPAM, mailing address in emails).
- [ ] Add rate limiting for `/api/feedback` and `/api/reminders` (for example Vercel Firewall rules); today only a hidden honeypot field filters bots.
- [ ] Test OCR on real (redacted) notices and phone photos, and tune `extract.ts`.
