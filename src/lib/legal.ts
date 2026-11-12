/**
 * Disclaimer, Terms of Use and Privacy Policy, in English and Spanish.
 *
 * ⚠️ DRAFT — NOT YET REVIEWED BY AN ATTORNEY.
 * This text was drafted without legal review. Before LexCourt is offered to
 * the public, a licensed attorney must review and approve it (and the Spanish
 * version must be checked by a qualified legal translator). Items marked
 * [ATTORNEY REVIEW] need a decision from counsel.
 *
 * When the Terms or Privacy Policy change in a way users must agree to again,
 * change TERMS_VERSION: everyone will be asked to accept the new version.
 */
import type { Lang } from './i18n';
import { hiLegal } from './locales/hi';
import { paLegal } from './locales/pa';
import { urLegal } from './locales/ur';

export const TERMS_VERSION = '2026-11-12-draft-6';
export const IS_DRAFT = true;

export interface Section {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  sections: Section[];
}

export interface LegalText {
  draftBadge: string;
  draftNotice: string;
  /** Short disclaimer shown on every screen. */
  short: string;
  shortLinks: { disclaimer: string; terms: string; privacy: string };
  acceptTitle: string;
  acceptIntro: string[];
  acceptCheckbox: string;
  acceptButton: string;
  acceptStorageNote: string;
  /** Small print on the acceptance screen: the English version controls. */
  acceptLanguageNote: string;
  back: string;
  disclaimer: LegalDoc;
  terms: LegalDoc;
  privacy: LegalDoc;
}

const en: LegalText = {
  draftBadge: 'DRAFT — needs attorney review',
  draftNotice:
    'This is a draft. It has not yet been reviewed by an attorney and may change before LexCourt is offered to the public.',
  short:
    'LexCourt is not a law firm and does not give legal advice. Using it does not create an attorney-client relationship. It can make mistakes: check every detail against your official notice and the court’s case information, and get help from an attorney or accredited representative.',
  shortLinks: { disclaimer: 'Disclaimer', terms: 'Terms of Use', privacy: 'Privacy Policy' },
  acceptTitle: 'Before you start',
  acceptIntro: [
    'LexCourt explains immigration court notices in plain language. It is free.',
    'LexCourt is not a law firm and is not a lawyer. It gives general legal information, not legal advice about your case. Using LexCourt does not create an attorney-client relationship.',
    'LexCourt can make mistakes, especially when reading photos. You must check every detail against your official notice and the court’s case information (online at acis.eoir.justice.gov or by phone at 1-800-898-7180).',
    'For advice about your case, talk to an attorney or a DOJ-accredited representative. Free legal help is listed in the app.',
    'If you are under 18, please use LexCourt with a parent, guardian, trusted adult, or a legal service provider.',
  ],
  acceptCheckbox:
    'I have read and agree to the Terms of Use and the Privacy Policy. I understand that LexCourt is not a law firm, does not give legal advice, can make mistakes, and that I must check every detail myself.',
  acceptButton: 'Continue',
  acceptStorageNote: 'This device will remember that you agreed, so you won’t be asked again. Nothing else is saved.',
  acceptLanguageNote: 'These Terms are written in English and translated for convenience. If a translation differs from the English version, the English version controls.',
  back: '← Back',
  disclaimer: {
    title: 'Disclaimer',
    updated: 'Draft of November 10, 2026',
    sections: [
      {
        heading: 'Not a law firm. Not legal advice.',
        paragraphs: [
          'LexCourt is not a law firm and is not a lawyer. LexCourt provides general legal information to help people understand documents from U.S. immigration court. It does not provide legal advice, and it cannot tell you what to do in your case.',
          'Using LexCourt does not create an attorney-client relationship between you and LexCourt or anyone involved in making it. Nothing you enter into LexCourt is confidential attorney-client communication.',
        ],
      },
      {
        heading: 'LexCourt can make mistakes',
        paragraphs: [
          'LexCourt reads documents automatically. It can misread text, pick the wrong date, time or address, or misunderstand what kind of document you have. Its explanations are general and may not fit your situation. Immigration law and court procedures change, and the information in LexCourt may be out of date.',
        ],
      },
      {
        heading: 'You must check every detail',
        bullets: [
          'Compare every date, time, address and number LexCourt shows you with your official notice.',
          'Check your hearing date and case status with the immigration court: online at acis.eoir.justice.gov or by phone at 1-800-898-7180. Hearing dates can change.',
          'If anything in LexCourt is different from your notice or from the court’s information, follow the notice and the court, not LexCourt.',
        ],
      },
      {
        heading: 'Get legal help',
        paragraphs: [
          'For advice about your case, talk to an attorney or an accredited representative (a representative accredited by the U.S. Department of Justice who works for a recognized organization). Many offer free or low-cost help; LexCourt lists places to find them. Be careful of “notarios” and “immigration consultants,” who are not allowed to give legal advice.',
        ],
      },
      {
        heading: 'Not the government',
        paragraphs: [
          'LexCourt is independent. It is not part of, and is not endorsed by, the immigration court, the Executive Office for Immigration Review (EOIR), the Department of Justice, the Department of Homeland Security, or any other government agency.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    updated: 'Draft 6 of November 12, 2026',
    sections: [
      {
        heading: '1. Agreement',
        paragraphs: [
          'These Terms of Use apply when you use LexCourt (the “Service”). By checking the box and using the Service, you agree to these Terms and to the Privacy Policy. If you do not agree, do not use the Service.',
        ],
      },
      {
        heading: '2. What LexCourt is',
        paragraphs: [
          'LexCourt is a free tool that helps people read and understand notices from U.S. immigration court. It can read a photo or PDF of a notice, find details such as a hearing date, time and court address, explain the notice in plain language, help you add reminders to your calendar, and point you to free legal help.',
        ],
      },
      {
        heading: '3. Not a law firm; no legal advice; no attorney-client relationship',
        paragraphs: [
          'LexCourt is not a law firm and does not provide legal advice or legal representation. The Service gives general legal information only. It is not a substitute for advice from an attorney or a DOJ-accredited representative about your specific situation.',
          'Your use of the Service does not create an attorney-client relationship, or any other confidential or fiduciary relationship, between you and LexCourt or any person involved with it.',
        ],
      },
      {
        heading: '4. Accuracy; your responsibility to check',
        paragraphs: [
          'The Service may contain errors. Automatic reading of photos and documents is not perfect, and general explanations may not apply to you. Laws, court rules and procedures change.',
          'You are responsible for checking every detail the Service shows you against your official notice and the court’s case information (acis.eoir.justice.gov or 1-800-898-7180), and for meeting every deadline and attending every hearing in your case. If the Service differs from your notice or the court’s information, rely on the notice and the court.',
        ],
      },
      {
        heading: '5. Getting legal help',
        paragraphs: [
          'You should get legal help from an attorney or a DOJ-accredited representative. The Service links to lists of free and low-cost legal service providers. LexCourt does not endorse, and is not responsible for, any provider on those lists.',
        ],
      },
      {
        heading: '6. Users under 18',
        paragraphs: ['If you are under 18, please use LexCourt with a parent, guardian, trusted adult, or a legal service provider.'],
      },
      {
        heading: '7. Reminders',
        paragraphs: [
          'Calendar reminders are a convenience only. They depend on your device and calendar app, and may not work. They do not replace checking your notice and the court’s case information.',
        ],
      },
      {
        heading: '8. Other websites and services',
        paragraphs: [
          'The Service links to websites run by others, including government agencies and nonprofit organizations. If you choose to use voice input, your browser’s speech service may process your voice. If you choose “Add to Google Calendar,” Google receives the event details. These services have their own terms and privacy policies, and LexCourt is not responsible for them.',
        ],
      },
      {
        heading: '9. Acceptable use',
        paragraphs: [
          'Use the Service only for lawful purposes. Do not try to disrupt, overload or break the Service, or use it to mislead other people about their legal situation.',
        ],
      },
      {
        heading: '10. No warranty',
        paragraphs: [
          'The Service is provided “as is” and “as available,” without warranties of any kind, express or implied, including warranties of accuracy, completeness, fitness for a particular purpose and non-infringement, to the fullest extent allowed by law. [ATTORNEY REVIEW: confirm wording and enforceability.]',
        ],
      },
      {
        heading: '11. Limitation of liability',
        paragraphs: [
          'To the fullest extent allowed by law, LexCourt and the people involved with it are not liable for any loss or harm arising from your use of, or reliance on, the Service, including missed hearings, missed deadlines or decisions in your case. [ATTORNEY REVIEW: confirm scope, consumer-protection limits and state-law requirements.]',
        ],
      },
      {
        heading: '12. Changes',
        paragraphs: [
          'We may update these Terms. When an update requires your agreement, the Service will ask you to accept the new version before you continue.',
        ],
      },
      {
        heading: '13. Severability',
        paragraphs: ['If any part of these Terms is found unenforceable, the rest stays in effect.'],
      },
      {
        heading: '14. Entire agreement',
        paragraphs: ['These Terms and the Privacy Policy are the full agreement about using LexCourt.'],
      },
      {
        heading: '15. Governing law and contact',
        paragraphs: [
          'These Terms are governed by the laws of the Commonwealth of Pennsylvania. LexCourt is operated by [OPERATOR NAME]. Contact: [CONTACT EMAIL].',
        ],
      },
      {
        heading: '16. Language',
        paragraphs: [
          'These Terms are written in English and translated for convenience. If a translation differs from the English version, the English version controls.',
        ],
      },
      {
        heading: '17. Feedback',
        paragraphs: [
          'You can rate LexCourt and leave a comment. Ratings are about LexCourt only, not about any lawyer, representative or other person. If you allow your comment to be shared, you give LexCourt permission to publish it after removing names and personal details; LexCourt may edit it for that purpose or choose not to publish it. Do not use feedback to accuse anyone of fraud or misconduct; use Report a problem to reach the offices that handle complaints.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Draft 6 of November 12, 2026',
    sections: [
      {
        heading: 'In short',
        bullets: [
          'Your notice is read on your own phone or computer. LexCourt does not upload it, does not store it, and never receives it.',
          'No accounts, no names, no cookies, no analytics, no advertising, no tracking.',
          'LexCourt keeps only two things: a note on your device that you accepted the terms and — only if you choose to send it — your feedback about LexCourt (a star rating and an optional comment).',
        ],
      },
      {
        heading: 'Information you enter',
        paragraphs: [
          'Photos, PDFs, text you type or speak, and the details LexCourt finds (such as your hearing date, court address and A-Number) are processed only inside your browser. They are not sent to LexCourt and are erased when you close or reload the page.',
          'LexCourt never receives your notice or the details from it, so it has none of that information to share with anyone, including government agencies. Our hosting provider’s technical records are described below.',
        ],
      },
      {
        heading: 'Information saved on your device',
        bullets: [
          'Terms acceptance: the version of the Terms you accepted, so you are not asked again. You can erase it by clearing this site’s data in your browser.',
          'Text-reading files: the files LexCourt uses to read photos (not your photos) may be kept by your browser so they load faster next time.',
        ],
      },
      {
        heading: 'Information our hosting provider may collect',
        paragraphs: [
          'LexCourt is a website, so your browser must connect to a server to load it. Our hosting provider (currently Vercel) may automatically record technical information such as your IP address, browser type and the time of the request, for security and to run the service. LexCourt does not add tracking to these records or use them to identify you. [ATTORNEY REVIEW: confirm against the hosting provider’s data-retention terms.]',
        ],
      },
      {
        heading: 'Services you choose to use',
        bullets: [
          'Voice input: when you tap “Speak,” your browser’s speech service turns your voice into text. Some browsers, such as Chrome, send the audio to their company (for example, Google) to do this. You can type instead.',
          '“Add to my calendar” creates a file on your device; LexCourt does not see it.',
          '“Add to Google Calendar” opens Google’s website with your hearing details filled in. Google’s privacy policy applies.',
          'Links to legal-aid and court websites take you to sites with their own privacy policies.',
          'Read aloud: LexCourt only uses voices installed on your device, so the text is not sent anywhere. If your device has no voice for your language, read aloud is not available.',
          'Legal aid summary and monthly reminder: these are made on your device. You choose whether to print, download or share them, and who to share them with. LexCourt never sends them.',
        ],
      },
      {
        heading: 'Feedback you choose to send',
        paragraphs: [
          'If you rate LexCourt, we store your star rating, which feature you rated, the language you used, the date, and your comment if you write one. We do not ask for your name or contact details, and we do not store your IP address or device details with your feedback.',
          'Do not include your name, A-Number, case numbers, immigration status or other personal details in a comment. LexCourt removes these automatically when it finds them.',
          'Feedback is stored with our database provider (currently Supabase), and only LexCourt’s reviewers can read it. Comments are private. A comment can be shared publicly only if you tick the box allowing it and a reviewer approves it; names of people and law firms are removed first. Comments about fraud or scams are never shared — use Report a problem instead.',
          'To ask us to delete your feedback, contact [CONTACT EMAIL] and tell us roughly when you sent it and what it said. [ATTORNEY REVIEW: how long feedback is kept, how deletion requests are handled, and any notices required for storing it.]',
        ],
      },
      {
        heading: 'Security',
        paragraphs: [
          'LexCourt is served only over a secure (HTTPS) connection, and the site tells your browser not to send data anywhere except LexCourt itself. Your device’s own security, such as a screen lock, also protects what is on your screen.',
        ],
      },
      {
        heading: 'Changes and contact',
        paragraphs: [
          'If this policy changes, we will update it here and, if needed, ask you to accept it again. LexCourt is operated by [OPERATOR NAME]. Contact: [CONTACT EMAIL]. [ATTORNEY REVIEW: confirm any state privacy-law notices required.]',
        ],
      },
      {
        heading: 'Language',
        paragraphs: [
          'This Privacy Policy is written in English and translated for convenience. If a translation differs from the English version, the English version controls.',
        ],
      },
    ],
  },
};

const es: LegalText = {
  draftBadge: 'BORRADOR — requiere revisión de un abogado',
  draftNotice:
    'Este es un borrador. Todavía no lo ha revisado un abogado y puede cambiar antes de que LexCourt se ofrezca al público.',
  short:
    'LexCourt no es un bufete de abogados y no da asesoría legal. Usarlo no crea una relación abogado-cliente. Puede cometer errores: compare cada dato con su aviso oficial y con la información de su caso en la corte, y busque ayuda de un abogado o un representante acreditado.',
  shortLinks: { disclaimer: 'Aviso legal', terms: 'Términos de uso', privacy: 'Política de privacidad' },
  acceptTitle: 'Antes de empezar',
  acceptIntro: [
    'LexCourt explica avisos de la corte de inmigración en palabras sencillas. Es gratis.',
    'LexCourt no es un bufete de abogados ni un abogado. Da información legal general, no asesoría legal sobre su caso. Usar LexCourt no crea una relación abogado-cliente.',
    'LexCourt puede cometer errores, sobre todo al leer fotos. Usted debe comparar cada dato con su aviso oficial y con la información de su caso en la corte (por internet en acis.eoir.justice.gov o por teléfono al 1-800-898-7180).',
    'Para recibir consejo sobre su caso, hable con un abogado o un representante acreditado por el Departamento de Justicia. En la aplicación hay una lista de ayuda legal gratuita.',
    'Si tiene menos de 18 años, use LexCourt con su madre, padre, tutor, un adulto de confianza o un proveedor de servicios legales.',
  ],
  acceptCheckbox:
    'Leí y acepto los Términos de uso y la Política de privacidad. Entiendo que LexCourt no es un bufete de abogados, no da asesoría legal, puede cometer errores, y que yo debo revisar cada dato.',
  acceptButton: 'Continuar',
  acceptStorageNote: 'Este dispositivo recordará que usted aceptó, para no preguntarle otra vez. No se guarda nada más.',
  acceptLanguageNote: 'Estos Términos están escritos en inglés y se traducen para su comodidad. Si una traducción es diferente de la versión en inglés, prevalece la versión en inglés.',
  back: '← Volver',
  disclaimer: {
    title: 'Aviso legal',
    updated: 'Borrador del 10 de noviembre de 2026',
    sections: [
      {
        heading: 'No es un bufete de abogados. No es asesoría legal.',
        paragraphs: [
          'LexCourt no es un bufete de abogados ni un abogado. LexCourt da información legal general para ayudar a las personas a entender documentos de la corte de inmigración de EE. UU. No da asesoría legal y no puede decirle qué hacer en su caso.',
          'Usar LexCourt no crea una relación abogado-cliente entre usted y LexCourt ni con ninguna persona que participe en LexCourt. Lo que usted escribe en LexCourt no es una comunicación confidencial entre abogado y cliente.',
        ],
      },
      {
        heading: 'LexCourt puede cometer errores',
        paragraphs: [
          'LexCourt lee documentos de forma automática. Puede leer mal el texto, escoger una fecha, hora o dirección equivocada, o no entender qué tipo de documento tiene usted. Sus explicaciones son generales y pueden no aplicarse a su situación. Las leyes de inmigración y los procedimientos de la corte cambian, y la información de LexCourt puede no estar al día.',
        ],
      },
      {
        heading: 'Usted debe revisar cada dato',
        bullets: [
          'Compare cada fecha, hora, dirección y número que le muestra LexCourt con su aviso oficial.',
          'Revise la fecha de su audiencia y el estado de su caso con la corte de inmigración: por internet en acis.eoir.justice.gov o por teléfono al 1-800-898-7180. Las fechas pueden cambiar.',
          'Si algo en LexCourt es diferente de su aviso o de la información de la corte, siga el aviso y la corte, no LexCourt.',
        ],
      },
      {
        heading: 'Busque ayuda legal',
        paragraphs: [
          'Para recibir consejo sobre su caso, hable con un abogado o un representante acreditado (un representante acreditado por el Departamento de Justicia de EE. UU. que trabaja en una organización reconocida). Muchos ofrecen ayuda gratuita o de bajo costo; LexCourt indica dónde encontrarlos. Cuidado con los “notarios” y “consultores de inmigración”: no pueden dar asesoría legal.',
        ],
      },
      {
        heading: 'No es el gobierno',
        paragraphs: [
          'LexCourt es independiente. No forma parte de la corte de inmigración, de la Oficina Ejecutiva de Revisión de Casos de Inmigración (EOIR), del Departamento de Justicia, del Departamento de Seguridad Nacional ni de ninguna otra agencia del gobierno, y ninguna de ellas lo respalda.',
        ],
      },
    ],
  },
  terms: {
    title: 'Términos de uso',
    updated: 'Borrador 6 del 12 de noviembre de 2026',
    sections: [
      {
        heading: '1. Acuerdo',
        paragraphs: [
          'Estos Términos de uso se aplican cuando usted usa LexCourt (el “Servicio”). Al marcar la casilla y usar el Servicio, usted acepta estos Términos y la Política de privacidad. Si no está de acuerdo, no use el Servicio.',
        ],
      },
      {
        heading: '2. Qué es LexCourt',
        paragraphs: [
          'LexCourt es una herramienta gratuita que ayuda a las personas a leer y entender avisos de la corte de inmigración de EE. UU. Puede leer una foto o un PDF de un aviso, encontrar datos como la fecha, la hora y la dirección de la audiencia, explicar el aviso en palabras sencillas, ayudarle a poner recordatorios en su calendario e indicarle dónde encontrar ayuda legal gratuita.',
        ],
      },
      {
        heading: '3. No es un bufete de abogados; no da asesoría legal; no hay relación abogado-cliente',
        paragraphs: [
          'LexCourt no es un bufete de abogados y no da asesoría ni representación legal. El Servicio solo da información legal general. No reemplaza el consejo de un abogado o de un representante acreditado por el Departamento de Justicia sobre su situación.',
          'Usar el Servicio no crea una relación abogado-cliente, ni ninguna otra relación confidencial o fiduciaria, entre usted y LexCourt o cualquier persona relacionada con LexCourt.',
        ],
      },
      {
        heading: '4. Exactitud; su responsabilidad de revisar',
        paragraphs: [
          'El Servicio puede contener errores. La lectura automática de fotos y documentos no es perfecta, y las explicaciones generales pueden no aplicarse a usted. Las leyes, las reglas de la corte y los procedimientos cambian.',
          'Usted es responsable de comparar cada dato que le muestra el Servicio con su aviso oficial y con la información de su caso en la corte (acis.eoir.justice.gov o 1-800-898-7180), y de cumplir cada fecha límite y asistir a cada audiencia de su caso. Si el Servicio no coincide con su aviso o con la información de la corte, guíese por el aviso y la corte.',
        ],
      },
      {
        heading: '5. Ayuda legal',
        paragraphs: [
          'Usted debe buscar ayuda legal de un abogado o de un representante acreditado por el Departamento de Justicia. El Servicio incluye enlaces a listas de proveedores de servicios legales gratuitos o de bajo costo. LexCourt no respalda a ningún proveedor de esas listas ni es responsable por ellos.',
        ],
      },
      {
        heading: '6. Usuarios menores de 18 años',
        paragraphs: ['Si tiene menos de 18 años, use LexCourt con su madre, padre, tutor, un adulto de confianza o un proveedor de servicios legales.'],
      },
      {
        heading: '7. Recordatorios',
        paragraphs: [
          'Los recordatorios de calendario son solo una ayuda. Dependen de su dispositivo y de su aplicación de calendario, y pueden no funcionar. No reemplazan revisar su aviso y la información de su caso en la corte.',
        ],
      },
      {
        heading: '8. Otros sitios y servicios',
        paragraphs: [
          'El Servicio tiene enlaces a sitios de otros, incluidas agencias del gobierno y organizaciones sin fines de lucro. Si usa la entrada por voz, el servicio de voz de su navegador puede procesar su voz. Si elige “Agregar a Google Calendar”, Google recibe los datos del evento. Estos servicios tienen sus propios términos y políticas de privacidad, y LexCourt no es responsable por ellos.',
        ],
      },
      {
        heading: '9. Uso aceptable',
        paragraphs: [
          'Use el Servicio solo para fines legales. No intente interrumpir, sobrecargar ni dañar el Servicio, ni usarlo para engañar a otras personas sobre su situación legal.',
        ],
      },
      {
        heading: '10. Sin garantía',
        paragraphs: [
          'El Servicio se ofrece “tal como está” y “según disponibilidad”, sin garantías de ningún tipo, expresas o implícitas, incluidas las de exactitud, integridad, idoneidad para un fin determinado y no infracción, en la medida máxima que permita la ley. [REVISIÓN DE ABOGADO: confirmar redacción y validez.]',
        ],
      },
      {
        heading: '11. Limitación de responsabilidad',
        paragraphs: [
          'En la medida máxima que permita la ley, LexCourt y las personas relacionadas con LexCourt no son responsables por ninguna pérdida o daño que resulte de usar el Servicio o de confiar en él, incluidas audiencias o fechas límite perdidas o decisiones en su caso. [REVISIÓN DE ABOGADO: confirmar alcance, límites de protección al consumidor y requisitos de leyes estatales.]',
        ],
      },
      {
        heading: '12. Cambios',
        paragraphs: [
          'Podemos actualizar estos Términos. Cuando un cambio requiera su aceptación, el Servicio le pedirá aceptar la nueva versión antes de continuar.',
        ],
      },
      {
        heading: '13. Divisibilidad',
        paragraphs: ['Si alguna parte de estos Términos se considera inaplicable, el resto sigue vigente.'],
      },
      {
        heading: '14. Acuerdo completo',
        paragraphs: ['Estos Términos y la Política de privacidad son el acuerdo completo sobre el uso de LexCourt.'],
      },
      {
        heading: '15. Ley aplicable y contacto',
        paragraphs: [
          'Estos Términos se rigen por las leyes de la Mancomunidad de Pensilvania (Commonwealth of Pennsylvania). LexCourt es operado por [OPERATOR NAME]. Contacto: [CONTACT EMAIL].',
        ],
      },
      {
        heading: '16. Idioma',
        paragraphs: [
          'Estos Términos están escritos en inglés y se traducen para su comodidad. Si una traducción es diferente de la versión en inglés, prevalece la versión en inglés.',
        ],
      },
      {
        heading: '17. Comentarios',
        paragraphs: [
          'Usted puede calificar LexCourt y dejar un comentario. Las calificaciones son solo sobre LexCourt, no sobre ningún abogado, representante u otra persona. Si permite que su comentario se comparta, le da permiso a LexCourt para publicarlo después de quitar nombres y datos personales; LexCourt puede editarlo con ese fin o decidir no publicarlo. No use los comentarios para acusar a nadie de fraude o mala conducta; use Reportar un problema para llegar a las oficinas que atienden quejas.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    updated: 'Borrador 6 del 12 de noviembre de 2026',
    sections: [
      {
        heading: 'En resumen',
        bullets: [
          'Su aviso se lee en su propio teléfono o computadora. LexCourt no lo sube a internet, no lo guarda y nunca lo recibe.',
          'No hay cuentas, nombres, cookies, analítica, publicidad ni rastreo.',
          'LexCourt guarda solo dos cosas: una nota en su dispositivo de que usted aceptó los términos y — solo si usted decide enviarlos — sus comentarios sobre LexCourt (una calificación con estrellas y un comentario opcional).',
        ],
      },
      {
        heading: 'Información que usted escribe',
        paragraphs: [
          'Las fotos, los PDF, el texto que usted escribe o dice, y los datos que LexCourt encuentra (como la fecha de su audiencia, la dirección de la corte y su Número A) se procesan solo dentro de su navegador. No se envían a LexCourt y se borran al cerrar o recargar la página.',
          'LexCourt nunca recibe su aviso ni los datos que contiene, así que no tiene nada de esa información para compartir con nadie, incluidas las agencias del gobierno. Los registros técnicos de nuestro proveedor de alojamiento se describen abajo.',
        ],
      },
      {
        heading: 'Información guardada en su dispositivo',
        bullets: [
          'Aceptación de los términos: la versión de los Términos que usted aceptó, para no preguntarle otra vez. Puede borrarla eliminando los datos de este sitio en su navegador.',
          'Archivos de lectura de texto: los archivos que LexCourt usa para leer fotos (no sus fotos) pueden quedar guardados en su navegador para que carguen más rápido la próxima vez.',
        ],
      },
      {
        heading: 'Información que puede recopilar nuestro proveedor de alojamiento',
        paragraphs: [
          'LexCourt es un sitio web, así que su navegador debe conectarse a un servidor para abrirlo. Nuestro proveedor de alojamiento (actualmente Vercel) puede registrar automáticamente información técnica como su dirección IP, el tipo de navegador y la hora de la conexión, por seguridad y para operar el servicio. LexCourt no agrega rastreo a estos registros ni los usa para identificarle. [REVISIÓN DE ABOGADO: confirmar con los términos de retención de datos del proveedor.]',
        ],
      },
      {
        heading: 'Servicios que usted elige usar',
        bullets: [
          'Entrada por voz: cuando toca “Hablar”, el servicio de voz de su navegador convierte su voz en texto. Algunos navegadores, como Chrome, envían el audio a su compañía (por ejemplo, Google) para hacerlo. Puede escribir en su lugar.',
          '“Agregar a mi calendario” crea un archivo en su dispositivo; LexCourt no lo ve.',
          '“Agregar a Google Calendar” abre el sitio de Google con los datos de su audiencia. Se aplica la política de privacidad de Google.',
          'Los enlaces a sitios de ayuda legal y de la corte le llevan a sitios con sus propias políticas de privacidad.',
          'Lectura en voz alta: LexCourt solo usa las voces instaladas en su dispositivo, así que el texto no se envía a ningún lugar. Si su dispositivo no tiene una voz para su idioma, la lectura en voz alta no está disponible.',
          'Resumen para la ayuda legal y recordatorio mensual: se hacen en su dispositivo. Usted decide si los imprime, descarga o comparte, y con quién. LexCourt nunca los envía.',
        ],
      },
      {
        heading: 'Comentarios que usted decide enviar',
        paragraphs: [
          'Si califica LexCourt, guardamos su calificación con estrellas, qué función calificó, el idioma que usó, la fecha y su comentario si escribe uno. No pedimos su nombre ni sus datos de contacto, y no guardamos su dirección IP ni datos de su dispositivo con sus comentarios.',
          'No incluya su nombre, Número A, números de caso, estatus migratorio ni otros datos personales en un comentario. LexCourt los quita automáticamente cuando los encuentra.',
          'Los comentarios se guardan con nuestro proveedor de base de datos (actualmente Supabase) y solo los revisores de LexCourt pueden leerlos. Los comentarios son privados. Un comentario solo se puede compartir públicamente si usted marca la casilla que lo permite y un revisor lo aprueba; primero se quitan los nombres de personas y bufetes. Los comentarios sobre fraude o estafas nunca se comparten — use Reportar un problema.',
          'Para pedirnos que borremos sus comentarios, escriba a [CONTACT EMAIL] y díganos más o menos cuándo los envió y qué decían. [REVISIÓN DE ABOGADO: cuánto tiempo se guardan los comentarios, cómo se atienden las solicitudes de borrado y avisos requeridos por guardarlos.]',
        ],
      },
      {
        heading: 'Seguridad',
        paragraphs: [
          'LexCourt se ofrece solo por una conexión segura (HTTPS), y el sitio le indica a su navegador que no envíe datos a ningún lugar excepto a LexCourt. La seguridad de su propio dispositivo, como el bloqueo de pantalla, también protege lo que aparece en su pantalla.',
        ],
      },
      {
        heading: 'Cambios y contacto',
        paragraphs: [
          'Si esta política cambia, la actualizaremos aquí y, si es necesario, le pediremos aceptarla otra vez. LexCourt es operado por [OPERATOR NAME]. Contacto: [CONTACT EMAIL]. [REVISIÓN DE ABOGADO: confirmar avisos requeridos por leyes estatales de privacidad.]',
        ],
      },
      {
        heading: 'Idioma',
        paragraphs: [
          'Esta Política de privacidad está escrita en inglés y se traduce para su comodidad. Si una traducción es diferente de la versión en inglés, prevalece la versión en inglés.',
        ],
      },
    ],
  },
};

export const LEGAL: Record<Lang, LegalText> = { en, es, hi: hiLegal, pa: paLegal, ur: urLegal };

// --- Remembering acceptance ------------------------------------------------
// Only the accepted TERMS_VERSION is stored, on this device. Storage can be
// unavailable (private mode, blocked site data); then the user is simply asked
// again next time.

const KEY = 'lexcourt.termsAccepted';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function storage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function hasAcceptedTerms(store: StorageLike | null = storage()): boolean {
  try {
    return store?.getItem(KEY) === TERMS_VERSION;
  } catch {
    return false;
  }
}

export function recordTermsAccepted(store: StorageLike | null = storage()): void {
  try {
    store?.setItem(KEY, TERMS_VERSION);
  } catch {
    // Not saved: the user will be asked again next visit.
  }
}
