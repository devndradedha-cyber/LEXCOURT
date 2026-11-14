/**
 * Text added with the redesign: the welcome (hero) section, the reading
 * screen and the three result cards, in every supported language.
 *
 * ⚠️ DRAFT — needs attorney review; Hindi, Punjabi and Urdu also need native
 * speaker review.
 */
import type { Lang } from './i18n';

export interface DesignText {
  heroTitle: string;
  heroText: string;
  scanButton: string;
  /** Three short trust points under the button. */
  badges: [string, string, string];
  readingTitle: string;
  readingCalm: string;
  cardMeaning: string;
  cardDate: string;
  cardHelp: string;
  noDate: string;
  editDetails: string;
}


export const DESIGN: Record<Lang, DesignText> = {
  en: {
    heroTitle: 'Understand your legal papers in your language',
    heroText: 'Take a photo of your court notice. We explain it in plain words, find your next date, and show you where to get free help.',
    scanButton: 'Scan a document',
    badges: ['Free', 'Your notice stays on your phone', 'Five languages'],
    readingTitle: 'Reading your document…',
    readingCalm: 'Your document stays on your phone. This can take a minute.',
    cardMeaning: 'What this means',
    cardDate: 'Your next date or deadline',
    cardHelp: 'Where to get free help',
    noDate: 'We could not find a date. If your notice has one, enter it below.',
    editDetails: 'Check and fix the details',
  },
  es: {
    heroTitle: 'Entienda sus papeles legales en su idioma',
    heroText: 'Tome una foto de su aviso de la corte. Se lo explicamos en palabras sencillas, buscamos su próxima fecha y le mostramos dónde conseguir ayuda gratis.',
    scanButton: 'Escanear un documento',
    badges: ['Gratis', 'Su aviso se queda en su teléfono', 'Cinco idiomas'],
    readingTitle: 'Leyendo su documento…',
    readingCalm: 'Su documento se queda en su teléfono. Esto puede tardar un minuto.',
    cardMeaning: 'Qué significa',
    cardDate: 'Su próxima fecha o fecha límite',
    cardHelp: 'Dónde conseguir ayuda gratis',
    noDate: 'No encontramos una fecha. Si su aviso tiene una, escríbala abajo.',
    editDetails: 'Revise y corrija los datos',
  },
  hi: {
    heroTitle: 'अपने क़ानूनी काग़ज़ अपनी भाषा में समझें',
    heroText: 'अपने कोर्ट नोटिस की फ़ोटो लें। हम उसे आसान शब्दों में समझाते हैं, आपकी अगली तारीख़ ढूँढते हैं, और बताते हैं कि मुफ़्त मदद कहाँ मिलेगी।',
    scanButton: 'दस्तावेज़ स्कैन करें',
    badges: ['मुफ़्त', 'आपका नोटिस आपके फ़ोन पर ही रहता है', 'पाँच भाषाएँ'],
    readingTitle: 'आपका दस्तावेज़ पढ़ा जा रहा है…',
    readingCalm: 'आपका दस्तावेज़ आपके फ़ोन पर ही रहता है। इसमें एक मिनट लग सकता है।',
    cardMeaning: 'इसका क्या मतलब है',
    cardDate: 'आपकी अगली तारीख़ या डेडलाइन',
    cardHelp: 'मुफ़्त मदद कहाँ मिलेगी',
    noDate: 'हमें कोई तारीख़ नहीं मिली। अगर आपके नोटिस पर तारीख़ है, तो उसे नीचे लिखें।',
    editDetails: 'जानकारी जाँचें और ठीक करें',
  },
  pa: {
    heroTitle: 'ਆਪਣੇ ਕਾਨੂੰਨੀ ਕਾਗ਼ਜ਼ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝੋ',
    heroText: 'ਆਪਣੇ ਅਦਾਲਤੀ ਨੋਟਿਸ ਦੀ ਫ਼ੋਟੋ ਲਓ। ਅਸੀਂ ਉਸਨੂੰ ਸੌਖੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਸਮਝਾਉਂਦੇ ਹਾਂ, ਤੁਹਾਡੀ ਅਗਲੀ ਤਾਰੀਖ਼ ਲੱਭਦੇ ਹਾਂ, ਅਤੇ ਦੱਸਦੇ ਹਾਂ ਕਿ ਮੁਫ਼ਤ ਮਦਦ ਕਿੱਥੋਂ ਮਿਲੇਗੀ।',
    scanButton: 'ਦਸਤਾਵੇਜ਼ ਸਕੈਨ ਕਰੋ',
    badges: ['ਮੁਫ਼ਤ', 'ਤੁਹਾਡਾ ਨੋਟਿਸ ਤੁਹਾਡੇ ਫ਼ੋਨ ’ਤੇ ਹੀ ਰਹਿੰਦਾ ਹੈ', 'ਪੰਜ ਭਾਸ਼ਾਵਾਂ'],
    readingTitle: 'ਤੁਹਾਡਾ ਦਸਤਾਵੇਜ਼ ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ…',
    readingCalm: 'ਤੁਹਾਡਾ ਦਸਤਾਵੇਜ਼ ਤੁਹਾਡੇ ਫ਼ੋਨ ’ਤੇ ਹੀ ਰਹਿੰਦਾ ਹੈ। ਇਸ ਵਿੱਚ ਇੱਕ ਮਿੰਟ ਲੱਗ ਸਕਦਾ ਹੈ।',
    cardMeaning: 'ਇਸਦਾ ਕੀ ਮਤਲਬ ਹੈ',
    cardDate: 'ਤੁਹਾਡੀ ਅਗਲੀ ਤਾਰੀਖ਼ ਜਾਂ ਡੈੱਡਲਾਈਨ',
    cardHelp: 'ਮੁਫ਼ਤ ਮਦਦ ਕਿੱਥੋਂ ਮਿਲੇਗੀ',
    noDate: 'ਸਾਨੂੰ ਕੋਈ ਤਾਰੀਖ਼ ਨਹੀਂ ਮਿਲੀ। ਜੇ ਤੁਹਾਡੇ ਨੋਟਿਸ ’ਤੇ ਤਾਰੀਖ਼ ਹੈ, ਤਾਂ ਉਸਨੂੰ ਹੇਠਾਂ ਲਿਖੋ।',
    editDetails: 'ਜਾਣਕਾਰੀ ਜਾਂਚੋ ਅਤੇ ਠੀਕ ਕਰੋ',
  },
  ur: {
    heroTitle: 'اپنے قانونی کاغذات اپنی زبان میں سمجھیں',
    heroText: 'اپنے عدالتی نوٹس کی تصویر لیں۔ ہم اسے آسان الفاظ میں سمجھاتے ہیں، آپ کی اگلی تاریخ ڈھونڈتے ہیں، اور بتاتے ہیں کہ مفت مدد کہاں ملے گی۔',
    scanButton: 'دستاویز اسکین کریں',
    badges: ['مفت', 'آپ کا نوٹس آپ کے فون پر ہی رہتا ہے', 'پانچ زبانیں'],
    readingTitle: 'آپ کی دستاویز پڑھی جا رہی ہے…',
    readingCalm: 'آپ کی دستاویز آپ کے فون پر ہی رہتی ہے۔ اس میں ایک منٹ لگ سکتا ہے۔',
    cardMeaning: 'اس کا کیا مطلب ہے',
    cardDate: 'آپ کی اگلی تاریخ یا آخری تاریخ',
    cardHelp: 'مفت مدد کہاں ملے گی',
    noDate: 'ہمیں کوئی تاریخ نہیں ملی۔ اگر آپ کے نوٹس پر تاریخ ہے تو اسے نیچے لکھیں۔',
    editDetails: 'تفصیلات چیک کریں اور درست کریں',
  },
};
