/**
 * Text for "Want a reminder?" (calendar file and email reminders) and for the
 * reminder emails, in every supported language.
 *
 * ⚠️ DRAFT — needs attorney review; Hindi, Punjabi and Urdu also need native
 * speaker review.
 */
import type { FeedbackLang as Lang } from './feedback/moderation.js';
import type { ReminderLabel } from './reminderShared.js';

export interface ReminderEmailText {
  confirmSubject: string;
  confirmIntro: (label: string, date: string) => string;
  confirmButton: string;
  confirmSchedule: string;
  confirmIgnore: string;
  /** "tomorrow" or "in N days". */
  when: (days: number) => string;
  reminderSubject: (label: string, when: string, date: string) => string;
  reminderLine: (label: string, when: string, date: string) => string;
  openApp: string;
  notAdvice: string;
  stopLink: string;
  deletedAfter: string;
  why: string;
}

export interface ReminderText {
  title: string;
  forDate: (date: string) => string;
  enterDate: string;
  dateLabel: string;
  whatLabel: string;
  labels: Record<ReminderLabel, string>;
  calendarTitle: string;
  calendarText: string;
  calendarButton: string;
  googleButton: string;
  emailTitle: string;
  emailText: string;
  emailLabel: string;
  emailButton: string;
  sending: string;
  storeNote: string;
  sent: string;
  sentHint: string;
  invalidEmail: string;
  dateTooSoon: string;
  dateTooFar: string;
  error: string;
  unavailable: string;
  /** Shown next to both options and in every email. */
  disclaimer: string;
  pageConfirming: string;
  pageConfirmed: (label: string, date: string) => string;
  pageStopping: string;
  pageStopped: string;
  pageFailed: string;
  pageHome: string;
  email: ReminderEmailText;
}

/** Urdu helper: keep English words left to right inside Urdu text. */
const L = (t: string) => `⁦${t}⁩`;

export const REMINDER_TEXT: Record<Lang, ReminderText> = {
  en: {
    title: 'Want a reminder?',
    forDate: (d) => `For ${d}`,
    enterDate: 'Enter the date from your notice to get a reminder.',
    dateLabel: 'Date',
    whatLabel: 'What is it?',
    labels: { hearing: 'Court hearing', deadline: 'Deadline', appointment: 'Appointment' },
    calendarTitle: 'Add to my calendar',
    calendarText: 'Download a calendar file for Google, Apple or Outlook. No account needed. It reminds you 1 week before, 1 day before and on the day.',
    calendarButton: 'Add to my calendar',
    googleButton: 'Open in Google Calendar',
    emailTitle: 'Email reminders',
    emailText: 'We’ll email you 7 days, 2 days and 1 day before the date.',
    emailLabel: 'Your email',
    emailButton: 'Email me reminders',
    sending: 'Sending…',
    storeNote:
      'We keep only your email, the date, the label (like “Court hearing”) and your language, and delete them after the date passes. Every email has a link to stop reminders.',
    sent: 'Almost done! Check your email and tap the link to turn on your reminders.',
    sentHint: 'Can’t find it? Look in your spam folder.',
    invalidEmail: 'Please enter a valid email address.',
    dateTooSoon: 'Enter a date that is tomorrow or later.',
    dateTooFar: 'That date is too far away. Check the year.',
    error: 'Could not send. Please try again.',
    unavailable: 'Email reminders are not available right now. Use “Add to my calendar” instead.',
    disclaimer: 'Always double-check the date on your official notice. Reminders may fail. LexCourt is not responsible for missed dates.',
    pageConfirming: 'Turning on your reminders…',
    pageConfirmed: (l, d) => `Your reminders are on. We’ll email you before: ${l}, ${d}.`,
    pageStopping: 'Stopping your reminders…',
    pageStopped: 'Your reminders are stopped and your email address is deleted.',
    pageFailed: 'This link no longer works. It may have expired or already been used.',
    pageHome: 'Go to LexCourt',
    email: {
      confirmSubject: 'Confirm your LexCourt reminders',
      confirmIntro: (l, d) => `You asked LexCourt to email you reminders for: ${l}, ${d}.`,
      confirmButton: 'Turn on my reminders',
      confirmSchedule: 'We will email you 7 days, 2 days and 1 day before the date.',
      confirmIgnore: 'If you did not ask for this, ignore this email. Nothing will be sent, and your email address will be deleted within 2 days.',
      when: (n) => (n === 1 ? 'tomorrow' : `in ${n} days`),
      reminderSubject: (l, w, d) => `Reminder: ${l} ${w} (${d})`,
      reminderLine: (l, w, d) => `${l}: ${d} — ${w}.`,
      openApp: 'Open LexCourt for free legal help and to check your notice',
      notAdvice: 'LexCourt gives legal information, not legal advice.',
      stopLink: 'Stop these reminders',
      deletedAfter: 'Your email address is deleted after the date passes.',
      why: 'You get this email because you asked for reminders on LexCourt.',
    },
  },

  es: {
    title: '¿Quiere un recordatorio?',
    forDate: (d) => `Para el ${d}`,
    enterDate: 'Escriba la fecha de su aviso para recibir un recordatorio.',
    dateLabel: 'Fecha',
    whatLabel: '¿Qué es?',
    labels: { hearing: 'Audiencia en la corte', deadline: 'Fecha límite', appointment: 'Cita' },
    calendarTitle: 'Agregar a mi calendario',
    calendarText: 'Descargue un archivo de calendario para Google, Apple u Outlook. No necesita cuenta. Le recuerda 1 semana antes, 1 día antes y el mismo día.',
    calendarButton: 'Agregar a mi calendario',
    googleButton: 'Abrir en Google Calendar',
    emailTitle: 'Recordatorios por correo electrónico',
    emailText: 'Le enviaremos un correo 7 días, 2 días y 1 día antes de la fecha.',
    emailLabel: 'Su correo electrónico',
    emailButton: 'Enviarme recordatorios',
    sending: 'Enviando…',
    storeNote:
      'Solo guardamos su correo, la fecha, la etiqueta (por ejemplo, “Audiencia en la corte”) y su idioma, y los borramos cuando pasa la fecha. Cada correo tiene un enlace para dejar de recibir recordatorios.',
    sent: '¡Casi listo! Revise su correo y toque el enlace para activar sus recordatorios.',
    sentHint: '¿No lo encuentra? Revise la carpeta de correo no deseado (spam).',
    invalidEmail: 'Escriba un correo electrónico válido.',
    dateTooSoon: 'Escriba una fecha que sea mañana o después.',
    dateTooFar: 'Esa fecha está demasiado lejos. Revise el año.',
    error: 'No se pudo enviar. Inténtelo de nuevo.',
    unavailable: 'Los recordatorios por correo no están disponibles ahora. Use “Agregar a mi calendario”.',
    disclaimer: 'Siempre verifique la fecha en su aviso oficial. Los recordatorios pueden fallar. LexCourt no se hace responsable de fechas perdidas.',
    pageConfirming: 'Activando sus recordatorios…',
    pageConfirmed: (l, d) => `Sus recordatorios están activados. Le escribiremos antes de: ${l}, ${d}.`,
    pageStopping: 'Cancelando sus recordatorios…',
    pageStopped: 'Sus recordatorios se cancelaron y su correo electrónico se borró.',
    pageFailed: 'Este enlace ya no funciona. Puede que haya vencido o que ya se haya usado.',
    pageHome: 'Ir a LexCourt',
    email: {
      confirmSubject: 'Confirme sus recordatorios de LexCourt',
      confirmIntro: (l, d) => `Usted pidió a LexCourt recordatorios por correo para: ${l}, ${d}.`,
      confirmButton: 'Activar mis recordatorios',
      confirmSchedule: 'Le escribiremos 7 días, 2 días y 1 día antes de la fecha.',
      confirmIgnore: 'Si usted no pidió esto, ignore este correo. No se enviará nada y su correo se borrará en un plazo de 2 días.',
      when: (n) => (n === 1 ? 'mañana' : `en ${n} días`),
      reminderSubject: (l, w, d) => `Recordatorio: ${l} ${w} (${d})`,
      reminderLine: (l, w, d) => `${l}: ${d} — ${w}.`,
      openApp: 'Abra LexCourt para encontrar ayuda legal gratuita y revisar su aviso',
      notAdvice: 'LexCourt da información legal, no asesoría legal.',
      stopLink: 'Dejar de recibir estos recordatorios',
      deletedAfter: 'Su correo electrónico se borra cuando pasa la fecha.',
      why: 'Recibe este correo porque pidió recordatorios en LexCourt.',
    },
  },

  hi: {
    title: 'क्या आप रिमाइंडर चाहते हैं?',
    forDate: (d) => `तारीख़: ${d}`,
    enterDate: 'रिमाइंडर पाने के लिए अपने नोटिस से तारीख़ लिखें।',
    dateLabel: 'तारीख़',
    whatLabel: 'यह किस बारे में है?',
    labels: { hearing: 'कोर्ट की सुनवाई', deadline: 'आख़िरी तारीख़ (डेडलाइन)', appointment: 'अपॉइंटमेंट' },
    calendarTitle: 'मेरे कैलेंडर में जोड़ें',
    calendarText: 'Google, Apple या Outlook के लिए कैलेंडर फ़ाइल डाउनलोड करें। कोई अकाउंट ज़रूरी नहीं। यह 1 हफ़्ता पहले, 1 दिन पहले और उसी दिन याद दिलाती है।',
    calendarButton: 'मेरे कैलेंडर में जोड़ें',
    googleButton: 'Google Calendar में खोलें',
    emailTitle: 'ईमेल रिमाइंडर',
    emailText: 'हम तारीख़ से 7 दिन, 2 दिन और 1 दिन पहले आपको ईमेल भेजेंगे।',
    emailLabel: 'आपका ईमेल',
    emailButton: 'मुझे रिमाइंडर ईमेल करें',
    sending: 'भेजा जा रहा है…',
    storeNote:
      'हम सिर्फ़ आपका ईमेल, तारीख़, लेबल (जैसे “कोर्ट की सुनवाई”) और आपकी भाषा रखते हैं, और तारीख़ निकल जाने के बाद इन्हें मिटा देते हैं। हर ईमेल में रिमाइंडर बंद करने का लिंक होता है।',
    sent: 'लगभग हो गया! अपना ईमेल देखें और रिमाइंडर चालू करने के लिए लिंक पर टैप करें।',
    sentHint: 'ईमेल नहीं मिला? स्पैम फ़ोल्डर देखें।',
    invalidEmail: 'कृपया सही ईमेल पता लिखें।',
    dateTooSoon: 'कल की या उसके बाद की तारीख़ लिखें।',
    dateTooFar: 'यह तारीख़ बहुत दूर है। साल दोबारा देखें।',
    error: 'भेजा नहीं जा सका। फिर से कोशिश करें।',
    unavailable: 'ईमेल रिमाइंडर अभी उपलब्ध नहीं हैं। इसके बजाय “मेरे कैलेंडर में जोड़ें” इस्तेमाल करें।',
    disclaimer: 'अपने आधिकारिक नोटिस पर तारीख़ हमेशा दोबारा जाँचें। रिमाइंडर कभी-कभी नहीं पहुँचते। कोई तारीख़ छूट जाने के लिए LexCourt ज़िम्मेदार नहीं है।',
    pageConfirming: 'आपके रिमाइंडर चालू किए जा रहे हैं…',
    pageConfirmed: (l, d) => `आपके रिमाइंडर चालू हो गए हैं। हम आपको इससे पहले ईमेल करेंगे: ${l}, ${d}।`,
    pageStopping: 'आपके रिमाइंडर बंद किए जा रहे हैं…',
    pageStopped: 'आपके रिमाइंडर बंद हो गए हैं और आपका ईमेल पता मिटा दिया गया है।',
    pageFailed: 'यह लिंक अब काम नहीं करता। शायद इसकी समय-सीमा ख़त्म हो गई है या यह पहले ही इस्तेमाल हो चुका है।',
    pageHome: 'LexCourt पर जाएँ',
    email: {
      confirmSubject: 'अपने LexCourt रिमाइंडर की पुष्टि करें',
      confirmIntro: (l, d) => `आपने LexCourt से इसके लिए ईमेल रिमाइंडर माँगे हैं: ${l}, ${d}।`,
      confirmButton: 'मेरे रिमाइंडर चालू करें',
      confirmSchedule: 'हम तारीख़ से 7 दिन, 2 दिन और 1 दिन पहले आपको ईमेल करेंगे।',
      confirmIgnore: 'अगर आपने यह नहीं माँगा था, तो इस ईमेल को अनदेखा करें। कुछ नहीं भेजा जाएगा, और आपका ईमेल पता 2 दिन के अंदर मिटा दिया जाएगा।',
      when: (n) => (n === 1 ? 'कल' : `${n} दिन में`),
      reminderSubject: (l, w, d) => `रिमाइंडर: ${l} ${w} (${d})`,
      reminderLine: (l, w, d) => `${l}: ${d} — ${w}।`,
      openApp: 'मुफ़्त क़ानूनी मदद पाने और अपना नोटिस जाँचने के लिए LexCourt खोलें',
      notAdvice: 'LexCourt क़ानूनी जानकारी देता है, क़ानूनी सलाह नहीं।',
      stopLink: 'ये रिमाइंडर बंद करें',
      deletedAfter: 'तारीख़ निकल जाने के बाद आपका ईमेल पता मिटा दिया जाता है।',
      why: 'आपको यह ईमेल इसलिए मिला क्योंकि आपने LexCourt पर रिमाइंडर माँगे थे।',
    },
  },

  pa: {
    title: 'ਕੀ ਤੁਸੀਂ ਰਿਮਾਈਂਡਰ ਚਾਹੁੰਦੇ ਹੋ?',
    forDate: (d) => `ਤਾਰੀਖ਼: ${d}`,
    enterDate: 'ਰਿਮਾਈਂਡਰ ਲੈਣ ਲਈ ਆਪਣੇ ਨੋਟਿਸ ਤੋਂ ਤਾਰੀਖ਼ ਲਿਖੋ।',
    dateLabel: 'ਤਾਰੀਖ਼',
    whatLabel: 'ਇਹ ਕਿਸ ਬਾਰੇ ਹੈ?',
    labels: { hearing: 'ਅਦਾਲਤ ਦੀ ਸੁਣਵਾਈ', deadline: 'ਆਖ਼ਰੀ ਤਾਰੀਖ਼ (ਡੈੱਡਲਾਈਨ)', appointment: 'ਅਪੌਇੰਟਮੈਂਟ' },
    calendarTitle: 'ਮੇਰੇ ਕੈਲੰਡਰ ਵਿੱਚ ਜੋੜੋ',
    calendarText: 'Google, Apple ਜਾਂ Outlook ਲਈ ਕੈਲੰਡਰ ਫ਼ਾਈਲ ਡਾਊਨਲੋਡ ਕਰੋ। ਕੋਈ ਖਾਤਾ ਲੋੜੀਂਦਾ ਨਹੀਂ। ਇਹ 1 ਹਫ਼ਤਾ ਪਹਿਲਾਂ, 1 ਦਿਨ ਪਹਿਲਾਂ ਅਤੇ ਉਸੇ ਦਿਨ ਯਾਦ ਦਿਵਾਉਂਦੀ ਹੈ।',
    calendarButton: 'ਮੇਰੇ ਕੈਲੰਡਰ ਵਿੱਚ ਜੋੜੋ',
    googleButton: 'Google Calendar ਵਿੱਚ ਖੋਲ੍ਹੋ',
    emailTitle: 'ਈਮੇਲ ਰਿਮਾਈਂਡਰ',
    emailText: 'ਅਸੀਂ ਤਾਰੀਖ਼ ਤੋਂ 7 ਦਿਨ, 2 ਦਿਨ ਅਤੇ 1 ਦਿਨ ਪਹਿਲਾਂ ਤੁਹਾਨੂੰ ਈਮੇਲ ਭੇਜਾਂਗੇ।',
    emailLabel: 'ਤੁਹਾਡੀ ਈਮੇਲ',
    emailButton: 'ਮੈਨੂੰ ਰਿਮਾਈਂਡਰ ਈਮੇਲ ਕਰੋ',
    sending: 'ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…',
    storeNote:
      'ਅਸੀਂ ਸਿਰਫ਼ ਤੁਹਾਡੀ ਈਮੇਲ, ਤਾਰੀਖ਼, ਲੇਬਲ (ਜਿਵੇਂ “ਅਦਾਲਤ ਦੀ ਸੁਣਵਾਈ”) ਅਤੇ ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਰੱਖਦੇ ਹਾਂ, ਅਤੇ ਤਾਰੀਖ਼ ਲੰਘ ਜਾਣ ਤੋਂ ਬਾਅਦ ਇਹਨਾਂ ਨੂੰ ਮਿਟਾ ਦਿੰਦੇ ਹਾਂ। ਹਰ ਈਮੇਲ ਵਿੱਚ ਰਿਮਾਈਂਡਰ ਬੰਦ ਕਰਨ ਦਾ ਲਿੰਕ ਹੁੰਦਾ ਹੈ।',
    sent: 'ਲਗਭਗ ਹੋ ਗਿਆ! ਆਪਣੀ ਈਮੇਲ ਵੇਖੋ ਅਤੇ ਰਿਮਾਈਂਡਰ ਚਾਲੂ ਕਰਨ ਲਈ ਲਿੰਕ ’ਤੇ ਟੈਪ ਕਰੋ।',
    sentHint: 'ਈਮੇਲ ਨਹੀਂ ਮਿਲੀ? ਸਪੈਮ ਫ਼ੋਲਡਰ ਵੇਖੋ।',
    invalidEmail: 'ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਈਮੇਲ ਪਤਾ ਲਿਖੋ।',
    dateTooSoon: 'ਕੱਲ੍ਹ ਦੀ ਜਾਂ ਉਸ ਤੋਂ ਬਾਅਦ ਦੀ ਤਾਰੀਖ਼ ਲਿਖੋ।',
    dateTooFar: 'ਇਹ ਤਾਰੀਖ਼ ਬਹੁਤ ਦੂਰ ਹੈ। ਸਾਲ ਦੁਬਾਰਾ ਵੇਖੋ।',
    error: 'ਭੇਜਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    unavailable: 'ਈਮੇਲ ਰਿਮਾਈਂਡਰ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ ਹਨ। ਇਸਦੀ ਥਾਂ “ਮੇਰੇ ਕੈਲੰਡਰ ਵਿੱਚ ਜੋੜੋ” ਵਰਤੋ।',
    disclaimer: 'ਆਪਣੇ ਅਧਿਕਾਰਤ ਨੋਟਿਸ ’ਤੇ ਤਾਰੀਖ਼ ਹਮੇਸ਼ਾ ਦੁਬਾਰਾ ਜਾਂਚੋ। ਰਿਮਾਈਂਡਰ ਕਦੇ-ਕਦੇ ਨਹੀਂ ਪਹੁੰਚਦੇ। ਕੋਈ ਤਾਰੀਖ਼ ਖੁੰਝ ਜਾਣ ਲਈ LexCourt ਜ਼ਿੰਮੇਵਾਰ ਨਹੀਂ ਹੈ।',
    pageConfirming: 'ਤੁਹਾਡੇ ਰਿਮਾਈਂਡਰ ਚਾਲੂ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ…',
    pageConfirmed: (l, d) => `ਤੁਹਾਡੇ ਰਿਮਾਈਂਡਰ ਚਾਲੂ ਹੋ ਗਏ ਹਨ। ਅਸੀਂ ਤੁਹਾਨੂੰ ਇਸ ਤੋਂ ਪਹਿਲਾਂ ਈਮੇਲ ਕਰਾਂਗੇ: ${l}, ${d}।`,
    pageStopping: 'ਤੁਹਾਡੇ ਰਿਮਾਈਂਡਰ ਬੰਦ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ…',
    pageStopped: 'ਤੁਹਾਡੇ ਰਿਮਾਈਂਡਰ ਬੰਦ ਹੋ ਗਏ ਹਨ ਅਤੇ ਤੁਹਾਡਾ ਈਮੇਲ ਪਤਾ ਮਿਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ।',
    pageFailed: 'ਇਹ ਲਿੰਕ ਹੁਣ ਕੰਮ ਨਹੀਂ ਕਰਦਾ। ਸ਼ਾਇਦ ਇਸਦੀ ਮਿਆਦ ਖ਼ਤਮ ਹੋ ਗਈ ਹੈ ਜਾਂ ਇਹ ਪਹਿਲਾਂ ਹੀ ਵਰਤਿਆ ਜਾ ਚੁੱਕਾ ਹੈ।',
    pageHome: 'LexCourt ’ਤੇ ਜਾਓ',
    email: {
      confirmSubject: 'ਆਪਣੇ LexCourt ਰਿਮਾਈਂਡਰ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
      confirmIntro: (l, d) => `ਤੁਸੀਂ LexCourt ਤੋਂ ਇਸ ਲਈ ਈਮੇਲ ਰਿਮਾਈਂਡਰ ਮੰਗੇ ਹਨ: ${l}, ${d}।`,
      confirmButton: 'ਮੇਰੇ ਰਿਮਾਈਂਡਰ ਚਾਲੂ ਕਰੋ',
      confirmSchedule: 'ਅਸੀਂ ਤਾਰੀਖ਼ ਤੋਂ 7 ਦਿਨ, 2 ਦਿਨ ਅਤੇ 1 ਦਿਨ ਪਹਿਲਾਂ ਤੁਹਾਨੂੰ ਈਮੇਲ ਕਰਾਂਗੇ।',
      confirmIgnore: 'ਜੇ ਤੁਸੀਂ ਇਹ ਨਹੀਂ ਮੰਗਿਆ ਸੀ, ਤਾਂ ਇਸ ਈਮੇਲ ਨੂੰ ਅਣਡਿੱਠਾ ਕਰੋ। ਕੁਝ ਨਹੀਂ ਭੇਜਿਆ ਜਾਵੇਗਾ, ਅਤੇ ਤੁਹਾਡਾ ਈਮੇਲ ਪਤਾ 2 ਦਿਨਾਂ ਦੇ ਅੰਦਰ ਮਿਟਾ ਦਿੱਤਾ ਜਾਵੇਗਾ।',
      when: (n) => (n === 1 ? 'ਕੱਲ੍ਹ' : `${n} ਦਿਨਾਂ ਵਿੱਚ`),
      reminderSubject: (l, w, d) => `ਰਿਮਾਈਂਡਰ: ${l} ${w} (${d})`,
      reminderLine: (l, w, d) => `${l}: ${d} — ${w}।`,
      openApp: 'ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਮਦਦ ਲੈਣ ਅਤੇ ਆਪਣਾ ਨੋਟਿਸ ਜਾਂਚਣ ਲਈ LexCourt ਖੋਲ੍ਹੋ',
      notAdvice: 'LexCourt ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ ਦਿੰਦਾ ਹੈ, ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ।',
      stopLink: 'ਇਹ ਰਿਮਾਈਂਡਰ ਬੰਦ ਕਰੋ',
      deletedAfter: 'ਤਾਰੀਖ਼ ਲੰਘ ਜਾਣ ਤੋਂ ਬਾਅਦ ਤੁਹਾਡਾ ਈਮੇਲ ਪਤਾ ਮਿਟਾ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ।',
      why: 'ਤੁਹਾਨੂੰ ਇਹ ਈਮੇਲ ਇਸ ਲਈ ਮਿਲੀ ਕਿਉਂਕਿ ਤੁਸੀਂ LexCourt ’ਤੇ ਰਿਮਾਈਂਡਰ ਮੰਗੇ ਸਨ।',
    },
  },

  ur: {
    title: 'کیا آپ یاد دہانی چاہتے ہیں؟',
    forDate: (d) => `تاریخ: ${d}`,
    enterDate: 'یاد دہانی کے لیے اپنے نوٹس سے تاریخ لکھیں۔',
    dateLabel: 'تاریخ',
    whatLabel: 'یہ کس بارے میں ہے؟',
    labels: { hearing: 'عدالت کی سماعت', deadline: 'آخری تاریخ', appointment: 'اپائنٹمنٹ' },
    calendarTitle: 'میرے کیلنڈر میں شامل کریں',
    calendarText: `${L('Google')}، ${L('Apple')} یا ${L('Outlook')} کے لیے کیلنڈر فائل ڈاؤن لوڈ کریں۔ کسی اکاؤنٹ کی ضرورت نہیں۔ یہ 1 ہفتہ پہلے، 1 دن پہلے اور اسی دن یاد دلاتی ہے۔`,
    calendarButton: 'میرے کیلنڈر میں شامل کریں',
    googleButton: `${L('Google Calendar')} میں کھولیں`,
    emailTitle: 'ای میل یاد دہانیاں',
    emailText: 'ہم تاریخ سے 7 دن، 2 دن اور 1 دن پہلے آپ کو ای میل بھیجیں گے۔',
    emailLabel: 'آپ کا ای میل',
    emailButton: 'مجھے یاد دہانیاں ای میل کریں',
    sending: 'بھیجا جا رہا ہے…',
    storeNote:
      'ہم صرف آپ کا ای میل، تاریخ، لیبل (جیسے ”عدالت کی سماعت“) اور آپ کی زبان رکھتے ہیں، اور تاریخ گزر جانے کے بعد انہیں مٹا دیتے ہیں۔ ہر ای میل میں یاد دہانیاں بند کرنے کا لنک ہوتا ہے۔',
    sent: 'تقریباً ہو گیا! اپنا ای میل دیکھیں اور یاد دہانیاں شروع کرنے کے لیے لنک پر ٹیپ کریں۔',
    sentHint: 'ای میل نہیں ملا؟ اسپیم فولڈر دیکھیں۔',
    invalidEmail: 'براہ کرم درست ای میل پتہ لکھیں۔',
    dateTooSoon: 'کل کی یا اس کے بعد کی تاریخ لکھیں۔',
    dateTooFar: 'یہ تاریخ بہت دور ہے۔ سال دوبارہ دیکھیں۔',
    error: 'بھیجا نہیں جا سکا۔ دوبارہ کوشش کریں۔',
    unavailable: 'ای میل یاد دہانیاں ابھی دستیاب نہیں ہیں۔ اس کے بجائے ”میرے کیلنڈر میں شامل کریں“ استعمال کریں۔',
    disclaimer: 'اپنے سرکاری نوٹس پر تاریخ ہمیشہ دوبارہ چیک کریں۔ یاد دہانیاں کبھی کبھی نہیں پہنچتیں۔ کوئی تاریخ چھوٹ جانے کی ذمہ داری LexCourt پر نہیں ہے۔',
    pageConfirming: 'آپ کی یاد دہانیاں شروع کی جا رہی ہیں…',
    pageConfirmed: (l, d) => `آپ کی یاد دہانیاں شروع ہو گئی ہیں۔ ہم آپ کو اس سے پہلے ای میل کریں گے: ${l}، ${d}۔`,
    pageStopping: 'آپ کی یاد دہانیاں بند کی جا رہی ہیں…',
    pageStopped: 'آپ کی یاد دہانیاں بند ہو گئی ہیں اور آپ کا ای میل پتہ مٹا دیا گیا ہے۔',
    pageFailed: 'یہ لنک اب کام نہیں کرتا۔ شاید اس کی مدت ختم ہو گئی ہے یا یہ پہلے ہی استعمال ہو چکا ہے۔',
    pageHome: 'LexCourt پر جائیں',
    email: {
      confirmSubject: 'اپنی LexCourt یاد دہانیوں کی تصدیق کریں',
      confirmIntro: (l, d) => `آپ نے LexCourt سے اس کے لیے ای میل یاد دہانیاں مانگی ہیں: ${l}، ${d}۔`,
      confirmButton: 'میری یاد دہانیاں شروع کریں',
      confirmSchedule: 'ہم تاریخ سے 7 دن، 2 دن اور 1 دن پہلے آپ کو ای میل کریں گے۔',
      confirmIgnore: 'اگر آپ نے یہ نہیں مانگا تھا تو اس ای میل کو نظر انداز کریں۔ کچھ نہیں بھیجا جائے گا، اور آپ کا ای میل پتہ 2 دن کے اندر مٹا دیا جائے گا۔',
      when: (n) => (n === 1 ? 'کل' : `${n} دن میں`),
      reminderSubject: (l, w, d) => `یاد دہانی: ${l} ${w} (${d})`,
      reminderLine: (l, w, d) => `${l}: ${d} — ${w}۔`,
      openApp: 'مفت قانونی مدد اور اپنا نوٹس چیک کرنے کے لیے LexCourt کھولیں',
      notAdvice: 'LexCourt قانونی معلومات دیتا ہے، قانونی مشورہ نہیں۔',
      stopLink: 'یہ یاد دہانیاں بند کریں',
      deletedAfter: 'تاریخ گزر جانے کے بعد آپ کا ای میل پتہ مٹا دیا جاتا ہے۔',
      why: 'آپ کو یہ ای میل اس لیے ملا کیونکہ آپ نے LexCourt پر یاد دہانیاں مانگی تھیں۔',
    },
  },
};

/** Locale for formatting dates in emails and on the page. */
export const REMINDER_LOCALE: Record<Lang, string> = { en: 'en-US', es: 'es-US', hi: 'hi-IN', pa: 'pa-Guru-IN', ur: 'ur-PK' };

/** "Wednesday, March 3, 2027" in the given language. Date-only, so no time-zone shift. */
export function formatReminderDate(date: string, lang: Lang): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(REMINDER_LOCALE[lang], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}
