/**
 * Text for the "How helpful was this?" feedback prompt, in every supported language.
 *
 * ⚠️ DRAFT — needs attorney review; Hindi, Punjabi and Urdu also need native
 * speaker review. (The admin dashboard is English only.)
 */
import type { Lang } from './i18n';
import type { SensitiveKind } from './feedback/moderation';

export interface FeedbackText {
  title: string;
  aboutLexCourt: string;
  starLabels: [string, string, string, string, string];
  chooseRating: string;
  commentLabel: string;
  doNotInclude: string;
  placeholder: string;
  sensitiveFound: string;
  kinds: Record<SensitiveKind, string>;
  scamTitle: string;
  scamText: string;
  scamButton: string;
  consentLabel: string;
  consentScam: string;
  privacy: string;
  privacyLink: string;
  send: string;
  sending: string;
  thanks: string;
  thanksReview: string;
  error: string;
  unavailable: string;
  notNow: string;
}

/** Urdu helpers: keep English terms left to right inside Urdu text. */
const L = (t: string) => `⁦${t}⁩`;
const E = (t: string) => L(`(${t})`);

export const FEEDBACK: Record<Lang, FeedbackText> = {
  en: {
    title: 'How helpful was this?',
    aboutLexCourt: 'You are rating LexCourt itself — not a lawyer, representative or anyone else.',
    starLabels: ['Not helpful', 'A little helpful', 'Somewhat helpful', 'Helpful', 'Very helpful'],
    chooseRating: 'Choose a rating from 1 to 5 stars.',
    commentLabel: 'Comment (optional)',
    doNotInclude:
      'Do not include your name, A-Number, case or receipt numbers, immigration status, phone number, email, or anyone else’s name.',
    placeholder: 'What was useful? What was confusing?',
    sensitiveFound: 'Please remove these before sending:',
    kinds: {
      aNumber: 'an A-Number or ID number',
      caseNumber: 'a case or receipt number',
      ssn: 'a Social Security number',
      phone: 'a phone number',
      email: 'an email address',
      status: 'your immigration status',
    },
    scamTitle: 'Did someone scam you or treat you unfairly?',
    scamText:
      'Feedback here is only about LexCourt. To report fraud, a scam or misconduct by a lawyer, notario or anyone else, use “Report a problem”. It shows the official offices that handle these complaints.',
    scamButton: 'Report a problem',
    consentLabel: 'You may share my comment publicly after a LexCourt reviewer approves it. Names are removed first.',
    consentScam: 'Comments about fraud or scams cannot be shared publicly.',
    privacy: 'Your rating and comment are stored for LexCourt’s team to review. They stay private unless you tick the box above and a reviewer approves. No account and no name are needed.',
    privacyLink: 'Privacy Policy',
    send: 'Send',
    sending: 'Sending…',
    thanks: 'Thank you! Your feedback helps make LexCourt better.',
    thanksReview: 'A reviewer will check your comment before it could be shared.',
    error: 'Your feedback could not be sent. Please check your connection and try again.',
    unavailable: 'Feedback is not available right now.',
    notNow: 'Not now',
  },
  es: {
    title: '¿Qué tan útil fue esto?',
    aboutLexCourt: 'Está calificando a LexCourt — no a un abogado, representante ni a ninguna otra persona.',
    starLabels: ['Nada útil', 'Un poco útil', 'Algo útil', 'Útil', 'Muy útil'],
    chooseRating: 'Elija una calificación de 1 a 5 estrellas.',
    commentLabel: 'Comentario (opcional)',
    doNotInclude:
      'No incluya su nombre, Número A (A-Number), números de caso o de recibo, su estatus migratorio, teléfono, correo electrónico ni el nombre de otras personas.',
    placeholder: '¿Qué le sirvió? ¿Qué fue confuso?',
    sensitiveFound: 'Por favor quite esto antes de enviar:',
    kinds: {
      aNumber: 'un Número A o número de identificación',
      caseNumber: 'un número de caso o de recibo',
      ssn: 'un número de Seguro Social',
      phone: 'un número de teléfono',
      email: 'un correo electrónico',
      status: 'su estatus migratorio',
    },
    scamTitle: '¿Alguien le estafó o le trató injustamente?',
    scamText:
      'Los comentarios aquí son solo sobre LexCourt. Para reportar fraude, una estafa o mala conducta de un abogado, notario u otra persona, use “Reportar un problema”. Ahí aparecen las oficinas oficiales que atienden estas quejas.',
    scamButton: 'Reportar un problema',
    consentLabel: 'Pueden compartir mi comentario públicamente después de que un revisor de LexCourt lo apruebe. Primero se quitan los nombres.',
    consentScam: 'Los comentarios sobre fraude o estafas no se pueden compartir públicamente.',
    privacy: 'Su calificación y su comentario se guardan para que el equipo de LexCourt los revise. Son privados a menos que marque la casilla de arriba y un revisor lo apruebe. No necesita cuenta ni nombre.',
    privacyLink: 'Política de privacidad',
    send: 'Enviar',
    sending: 'Enviando…',
    thanks: '¡Gracias! Sus comentarios ayudan a mejorar LexCourt.',
    thanksReview: 'Un revisor verá su comentario antes de que se pueda compartir.',
    error: 'No se pudieron enviar sus comentarios. Revise su conexión e intente otra vez.',
    unavailable: 'Los comentarios no están disponibles en este momento.',
    notNow: 'Ahora no',
  },
  hi: {
    title: 'यह कितना मददगार था?',
    aboutLexCourt: 'आप LexCourt को रेटिंग दे रहे हैं — किसी वकील, प्रतिनिधि या किसी और व्यक्ति को नहीं।',
    starLabels: ['मददगार नहीं', 'थोड़ा मददगार', 'कुछ हद तक मददगार', 'मददगार', 'बहुत मददगार'],
    chooseRating: '1 से 5 सितारों में से रेटिंग चुनें।',
    commentLabel: 'टिप्पणी (ज़रूरी नहीं)',
    doNotInclude:
      'अपना नाम, ए-नंबर (A-Number), केस या रसीद नंबर, इमिग्रेशन स्टेटस, फ़ोन नंबर, ईमेल, या किसी और का नाम न लिखें।',
    placeholder: 'क्या काम का था? क्या समझ नहीं आया?',
    sensitiveFound: 'भेजने से पहले कृपया ये हटाएँ:',
    kinds: {
      aNumber: 'ए-नंबर या कोई पहचान नंबर',
      caseNumber: 'केस या रसीद नंबर',
      ssn: 'सोशल सिक्योरिटी नंबर',
      phone: 'फ़ोन नंबर',
      email: 'ईमेल पता',
      status: 'आपका इमिग्रेशन स्टेटस',
    },
    scamTitle: 'क्या किसी ने आपके साथ धोखा किया या गलत बर्ताव किया?',
    scamText:
      'यहाँ की प्रतिक्रिया सिर्फ़ LexCourt के बारे में है। किसी वकील, नोटारियो या किसी और की धोखाधड़ी, ठगी या गलत आचरण की शिकायत के लिए “शिकायत करें” इस्तेमाल करें। वहाँ ऐसी शिकायतें देखने वाले आधिकारिक दफ़्तर दिखाए जाते हैं।',
    scamButton: 'शिकायत करें',
    consentLabel: 'LexCourt के समीक्षक की मंज़ूरी के बाद मेरी टिप्पणी सार्वजनिक रूप से साझा की जा सकती है। पहले नाम हटा दिए जाते हैं।',
    consentScam: 'धोखाधड़ी या ठगी के बारे में टिप्पणियाँ सार्वजनिक रूप से साझा नहीं की जा सकतीं।',
    privacy: 'आपकी रेटिंग और टिप्पणी LexCourt की टीम की समीक्षा के लिए सेव की जाती है। जब तक आप ऊपर वाले बॉक्स पर निशान न लगाएँ और कोई समीक्षक मंज़ूरी न दे, ये निजी रहती हैं। कोई अकाउंट या नाम ज़रूरी नहीं।',
    privacyLink: 'निजता नीति',
    send: 'भेजें',
    sending: 'भेज रहे हैं…',
    thanks: 'धन्यवाद! आपकी प्रतिक्रिया LexCourt को बेहतर बनाने में मदद करती है।',
    thanksReview: 'साझा किए जाने से पहले कोई समीक्षक आपकी टिप्पणी देखेगा।',
    error: 'आपकी प्रतिक्रिया नहीं भेजी जा सकी। अपना इंटरनेट जाँचें और फिर से कोशिश करें।',
    unavailable: 'अभी प्रतिक्रिया देने की सुविधा उपलब्ध नहीं है।',
    notNow: 'अभी नहीं',
  },
  pa: {
    title: 'ਇਹ ਕਿੰਨਾ ਮਦਦਗਾਰ ਸੀ?',
    aboutLexCourt: 'ਤੁਸੀਂ LexCourt ਨੂੰ ਰੇਟਿੰਗ ਦੇ ਰਹੇ ਹੋ — ਕਿਸੇ ਵਕੀਲ, ਪ੍ਰਤੀਨਿਧੀ ਜਾਂ ਕਿਸੇ ਹੋਰ ਵਿਅਕਤੀ ਨੂੰ ਨਹੀਂ।',
    starLabels: ['ਮਦਦਗਾਰ ਨਹੀਂ', 'ਥੋੜ੍ਹਾ ਮਦਦਗਾਰ', 'ਕੁਝ ਹੱਦ ਤੱਕ ਮਦਦਗਾਰ', 'ਮਦਦਗਾਰ', 'ਬਹੁਤ ਮਦਦਗਾਰ'],
    chooseRating: '1 ਤੋਂ 5 ਤਾਰਿਆਂ ਵਿੱਚੋਂ ਰੇਟਿੰਗ ਚੁਣੋ।',
    commentLabel: 'ਟਿੱਪਣੀ (ਲਾਜ਼ਮੀ ਨਹੀਂ)',
    doNotInclude:
      'ਆਪਣਾ ਨਾਂ, ਏ-ਨੰਬਰ (A-Number), ਕੇਸ ਜਾਂ ਰਸੀਦ ਨੰਬਰ, ਇਮੀਗ੍ਰੇਸ਼ਨ ਸਟੇਟਸ, ਫ਼ੋਨ ਨੰਬਰ, ਈਮੇਲ, ਜਾਂ ਕਿਸੇ ਹੋਰ ਦਾ ਨਾਂ ਨਾ ਲਿਖੋ।',
    placeholder: 'ਕੀ ਕੰਮ ਦਾ ਸੀ? ਕੀ ਸਮਝ ਨਹੀਂ ਆਇਆ?',
    sensitiveFound: 'ਭੇਜਣ ਤੋਂ ਪਹਿਲਾਂ ਕਿਰਪਾ ਕਰਕੇ ਇਹ ਹਟਾਓ:',
    kinds: {
      aNumber: 'ਏ-ਨੰਬਰ ਜਾਂ ਕੋਈ ਪਛਾਣ ਨੰਬਰ',
      caseNumber: 'ਕੇਸ ਜਾਂ ਰਸੀਦ ਨੰਬਰ',
      ssn: 'ਸੋਸ਼ਲ ਸਿਕਿਓਰਿਟੀ ਨੰਬਰ',
      phone: 'ਫ਼ੋਨ ਨੰਬਰ',
      email: 'ਈਮੇਲ ਪਤਾ',
      status: 'ਤੁਹਾਡਾ ਇਮੀਗ੍ਰੇਸ਼ਨ ਸਟੇਟਸ',
    },
    scamTitle: 'ਕੀ ਕਿਸੇ ਨੇ ਤੁਹਾਡੇ ਨਾਲ ਧੋਖਾ ਕੀਤਾ ਜਾਂ ਗ਼ਲਤ ਵਤੀਰਾ ਕੀਤਾ?',
    scamText:
      'ਇੱਥੇ ਦਿੱਤੀ ਰਾਇ ਸਿਰਫ਼ LexCourt ਬਾਰੇ ਹੈ। ਕਿਸੇ ਵਕੀਲ, ਨੋਟਾਰੀਓ ਜਾਂ ਕਿਸੇ ਹੋਰ ਦੀ ਧੋਖਾਧੜੀ, ਠੱਗੀ ਜਾਂ ਗ਼ਲਤ ਵਤੀਰੇ ਦੀ ਸ਼ਿਕਾਇਤ ਲਈ “ਸ਼ਿਕਾਇਤ ਕਰੋ” ਵਰਤੋ। ਉੱਥੇ ਅਜਿਹੀਆਂ ਸ਼ਿਕਾਇਤਾਂ ਵੇਖਣ ਵਾਲੇ ਸਰਕਾਰੀ ਦਫ਼ਤਰ ਵਿਖਾਏ ਜਾਂਦੇ ਹਨ।',
    scamButton: 'ਸ਼ਿਕਾਇਤ ਕਰੋ',
    consentLabel: 'LexCourt ਦੇ ਸਮੀਖਿਅਕ ਦੀ ਮਨਜ਼ੂਰੀ ਤੋਂ ਬਾਅਦ ਮੇਰੀ ਟਿੱਪਣੀ ਜਨਤਕ ਤੌਰ ’ਤੇ ਸਾਂਝੀ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ। ਪਹਿਲਾਂ ਨਾਂ ਹਟਾ ਦਿੱਤੇ ਜਾਂਦੇ ਹਨ।',
    consentScam: 'ਧੋਖਾਧੜੀ ਜਾਂ ਠੱਗੀ ਬਾਰੇ ਟਿੱਪਣੀਆਂ ਜਨਤਕ ਤੌਰ ’ਤੇ ਸਾਂਝੀਆਂ ਨਹੀਂ ਕੀਤੀਆਂ ਜਾ ਸਕਦੀਆਂ।',
    privacy: 'ਤੁਹਾਡੀ ਰੇਟਿੰਗ ਅਤੇ ਟਿੱਪਣੀ LexCourt ਦੀ ਟੀਮ ਦੀ ਸਮੀਖਿਆ ਲਈ ਸੇਵ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਉੱਪਰਲੇ ਬਕਸੇ ’ਤੇ ਨਿਸ਼ਾਨ ਨਾ ਲਾਓ ਅਤੇ ਕੋਈ ਸਮੀਖਿਅਕ ਮਨਜ਼ੂਰੀ ਨਾ ਦੇਵੇ, ਇਹ ਨਿੱਜੀ ਰਹਿੰਦੀਆਂ ਹਨ। ਕੋਈ ਖਾਤਾ ਜਾਂ ਨਾਂ ਲੋੜੀਂਦਾ ਨਹੀਂ।',
    privacyLink: 'ਨਿੱਜਤਾ ਨੀਤੀ',
    send: 'ਭੇਜੋ',
    sending: 'ਭੇਜ ਰਹੇ ਹਾਂ…',
    thanks: 'ਧੰਨਵਾਦ! ਤੁਹਾਡੀ ਰਾਇ LexCourt ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦੀ ਹੈ।',
    thanksReview: 'ਸਾਂਝੀ ਕੀਤੇ ਜਾਣ ਤੋਂ ਪਹਿਲਾਂ ਕੋਈ ਸਮੀਖਿਅਕ ਤੁਹਾਡੀ ਟਿੱਪਣੀ ਵੇਖੇਗਾ।',
    error: 'ਤੁਹਾਡੀ ਰਾਇ ਨਹੀਂ ਭੇਜੀ ਜਾ ਸਕੀ। ਆਪਣਾ ਇੰਟਰਨੈੱਟ ਚੈੱਕ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    unavailable: 'ਇਸ ਵੇਲੇ ਰਾਇ ਦੇਣ ਦੀ ਸਹੂਲਤ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
    notNow: 'ਹੁਣ ਨਹੀਂ',
  },
  ur: {
    title: 'یہ کتنا مددگار تھا؟',
    aboutLexCourt: 'آپ LexCourt کو ریٹنگ دے رہے ہیں — کسی وکیل، نمائندے یا کسی اور شخص کو نہیں۔',
    starLabels: ['مددگار نہیں', 'تھوڑا مددگار', 'کسی حد تک مددگار', 'مددگار', 'بہت مددگار'],
    chooseRating: '1 سے 5 ستاروں میں سے ریٹنگ منتخب کریں۔',
    commentLabel: 'تبصرہ (ضروری نہیں)',
    doNotInclude: `اپنا نام، اے نمبر ${E('A-Number')}، کیس یا رسید نمبر، امیگریشن اسٹیٹس، فون نمبر، ای میل، یا کسی اور کا نام نہ لکھیں۔`,
    placeholder: 'کیا کام کا تھا؟ کیا سمجھ نہیں آیا؟',
    sensitiveFound: 'بھیجنے سے پہلے براہ کرم یہ ہٹائیں:',
    kinds: {
      aNumber: 'اے نمبر یا کوئی شناختی نمبر',
      caseNumber: 'کیس یا رسید نمبر',
      ssn: 'سوشل سیکیورٹی نمبر',
      phone: 'فون نمبر',
      email: 'ای میل پتہ',
      status: 'آپ کا امیگریشن اسٹیٹس',
    },
    scamTitle: 'کیا کسی نے آپ کے ساتھ دھوکہ کیا یا غلط سلوک کیا؟',
    scamText:
      'یہاں کی رائے صرف LexCourt کے بارے میں ہے۔ کسی وکیل، نوٹاریو یا کسی اور کی دھوکہ دہی، فراڈ یا غلط طرز عمل کی شکایت کے لیے ”شکایت کریں“ استعمال کریں۔ وہاں ایسی شکایات دیکھنے والے سرکاری دفاتر دکھائے جاتے ہیں۔',
    scamButton: 'شکایت کریں',
    consentLabel: 'LexCourt کے جائزہ کار کی منظوری کے بعد میرا تبصرہ عوامی طور پر شیئر کیا جا سکتا ہے۔ پہلے نام ہٹا دیے جاتے ہیں۔',
    consentScam: 'دھوکہ دہی یا فراڈ کے بارے میں تبصرے عوامی طور پر شیئر نہیں کیے جا سکتے۔',
    privacy: 'آپ کی ریٹنگ اور تبصرہ LexCourt کی ٹیم کے جائزے کے لیے محفوظ کیا جاتا ہے۔ جب تک آپ اوپر والے خانے پر نشان نہ لگائیں اور کوئی جائزہ کار منظوری نہ دے، یہ نجی رہتے ہیں۔ کوئی اکاؤنٹ یا نام ضروری نہیں۔',
    privacyLink: 'رازداری کی پالیسی',
    send: 'بھیجیں',
    sending: 'بھیج رہے ہیں…',
    thanks: 'شکریہ! آپ کی رائے LexCourt کو بہتر بنانے میں مدد دیتی ہے۔',
    thanksReview: 'شیئر کیے جانے سے پہلے کوئی جائزہ کار آپ کا تبصرہ دیکھے گا۔',
    error: 'آپ کی رائے نہیں بھیجی جا سکی۔ اپنا انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔',
    unavailable: 'اس وقت رائے دینے کی سہولت دستیاب نہیں ہے۔',
    notNow: 'ابھی نہیں',
  },
};
