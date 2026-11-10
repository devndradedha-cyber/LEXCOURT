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
6. It links to free legal aid: the EOIR pro bono list, the ImmigrationAdvocates.net directory, EOIR case status (ACIS and 1-800-898-7180), ICOR and EOIR forms.

The app is in **English and Spanish**. It picks the language from the browser, and the user can switch it at any time.

## Privacy

- **No backend, no accounts, no analytics, no cookies, no storage.** Nothing goes into `localStorage` or a server. Closing the page removes everything.
- Photos and PDFs are processed in the browser using `pdf.js` and `tesseract.js` OCR. The file is never uploaded.
- The OCR engine and its English and Spanish models download from the jsDelivr CDN the first time they're used. No user data is sent with that download. To avoid the CDN, self-host the models and set `langPath`, `workerPath` and `corePath` in `src/lib/readFile.ts`.
- **Voice** uses the browser's Web Speech API. Some browsers, including Chrome, send the audio to the browser maker's servers. The app tells the user this next to the microphone button and lets them type instead.
- Reminders go into the user's own calendar. The Google Calendar link sends the event details to Google only if the user taps it.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests (parser + calendar file)
npm run build      # type-check + production build into dist/
```

It's a static site, so `dist/` can be hosted anywhere (GitHub Pages, Netlify, Cloudflare Pages, etc.).

### Code map

| File | Purpose |
| --- | --- |
| `src/lib/extract.ts` | Rule-based extraction of dates, times, address, notice and hearing type, A-Number (English & Spanish, written or spoken) |
| `src/lib/readFile.ts` | PDF text extraction and OCR for photos and scanned PDFs |
| `src/lib/speech.ts` | Voice input (Web Speech API) |
| `src/lib/reminders.ts` | `.ics` file and Google Calendar link |
| `src/lib/i18n.ts` | All user-facing text, in English and Spanish |
| `src/lib/resources.ts` | All outside links (legal aid, EOIR) in one place |
| `src/App.tsx` | The UI |

## Before launch

- [ ] Check every link in `src/lib/resources.ts`. They were written without network access.
- [ ] Have an immigration attorney or DOJ-accredited representative review all text in `src/lib/i18n.ts`.
- [ ] Have a native Spanish speaker review the Spanish text, ideally with people who will use the app.
- [ ] Test OCR on real (redacted) notices and phone photos, and tune `extract.ts`.
- [ ] Consider self-hosting the OCR models (see Privacy).
