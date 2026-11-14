/**
 * Text for the case status helper, read aloud, glossary and legal aid summary,
 * in every supported language.
 *
 * ⚠️ DRAFT — NOT YET REVIEWED BY AN ATTORNEY. The Hindi, Punjabi and Urdu
 * versions (src/lib/locales/*.features.ts) also need native speaker review.
 */
import type { Lang } from './i18n';
import { hiFeatures } from './locales/hi.features';
import { paFeatures } from './locales/pa.features';
import { urFeatures } from './locales/ur.features';

export type TermId =
  | 'removal'
  | 'relief'
  | 'asylum'
  | 'inAbsentia'
  | 'noticeToAppear'
  | 'masterHearing'
  | 'individualHearing'
  | 'aNumber'
  | 'accreditedRep'
  | 'appeal';

export const TERM_IDS: TermId[] = [
  'removal', 'relief', 'asylum', 'inAbsentia', 'noticeToAppear',
  'masterHearing', 'individualHearing', 'aNumber', 'accreditedRep', 'appeal',
];

export interface FeaturesText {
  status: {
    nav: string;
    title: string;
    intro: string[];
    noFetch: string;
    aNumberLabel: string;
    aNumberHint: string;
    aNumberFromNotice: string;
    aNumberPrivacy: string;
    copyDigits: string;
    eightDigits: string;
    onlineTitle: string;
    onlineSteps: string[];
    onlineLink: string;
    phoneTitle: string;
    phoneSteps: string[];
    callButton: string;
    tddNote: string;
    whatYouSeeTitle: string;
    whatYouSee: string[];
    differentDate: string;
    reminderTitle: string;
    reminderHint: string;
    reminderIncludeA: string;
    reminderIncludeAHint: string;
    reminderButton: string;
    reminderEventTitle: string;
    /** Calendar event description; the A-Number is only included if the user chose it. */
    reminderEventDescription: (aNumber: string | null) => string;
  };
  listen: {
    listen: string;
    stop: string;
    /** No on-device voice for this language. */
    noVoice: (language: string) => string;
    unsupported: string;
    privacy: string;
    /** Only an online voice exists for this language; ask before using it. */
    onlineOffer: (language: string) => string;
    useOnline: string;
    /** Punjabi only: shown while a Hindi voice reads the Punjabi text. */
    viaHindi?: string;
  };
  glossary: {
    title: string;
    hint: string;
    tapHint: string;
    close: string;
    terms: Record<TermId, { term: string; definition: string }>;
  };
  aid: {
    title: string;
    intro: string;
    open: string;
    questionsLabel: string;
    questionsHint: string;
    questionsPlaceholder: string;
    includeA: string;
    summaryLang: string;
    preview: string;
    print: string;
    download: string;
    share: string;
    shareUnsupported: string;
    nothingSent: string;
    doc: {
      heading: string;
      made: (date: string) => string;
      noticeType: string;
      hearingDate: string;
      hearingTime: string;
      court: string;
      aNumber: string;
      remote: string;
      remoteYes: string;
      notFound: string;
      notIncluded: string;
      questions: string;
      notes: string;
      footer: string;
    };
  };
}

const en: FeaturesText = {
  status: {
    nav: 'Case status',
    title: 'Check your case status',
    intro: [
      'The immigration court has an official free service that shows your next hearing date and other case information. You can use it online or by phone, any time.',
      'Check it often. Hearing dates can change, and the court’s information is newer than a paper notice.',
    ],
    noFetch: 'LexCourt does not check your case for you and does not connect to the court. You check it yourself on the official site or by phone.',
    aNumberLabel: 'Your A-Number',
    aNumberHint: 'It starts with A and has 8 or 9 digits. It is on your notice and other immigration papers.',
    aNumberFromNotice: 'Filled in from your notice. Check that it matches.',
    aNumberPrivacy: 'Your A-Number stays on this device. It is only used to show it in the steps below.',
    copyDigits: 'Copy the 9 digits',
    eightDigits: 'If your A-Number has only 8 digits, add a 0 at the start to make 9 digits (the copy button does this).',
    onlineTitle: 'Online (Automated Case Information)',
    onlineSteps: [
      'Open the court’s Automated Case Information site (link below). It is free and in English and Spanish.',
      'Agree to the terms on the site, if it asks.',
      'Enter your A-Number: {aNumber}. Type only the 9 digits, without the A or dashes.',
      'Follow the instructions on the screen to see your case. Write down your next hearing date, time and court address.',
    ],
    onlineLink: 'Open Automated Case Information (official court site)',
    phoneTitle: 'By phone',
    phoneSteps: [
      'Call 1-800-898-7180. The call is free.',
      'Choose your language when asked (English or Spanish).',
      'Enter your A-Number with the phone keypad: {aNumber}.',
      'Listen to the information about your case. Have paper ready to write down the date, time and address.',
    ],
    callButton: 'Call 1-800-898-7180',
    tddNote: 'For people who are deaf or hard of hearing (TDD): 1-800-828-1120.',
    whatYouSeeTitle: 'What you may find',
    whatYouSee: [
      'Your next hearing: date, time, and court address or a note that it is by video.',
      'Whether the judge made a decision, and what kind.',
      'If an appeal was filed, information about it.',
    ],
    differentDate:
      'If the court’s information is different from your paper notice, or you see a decision you do not understand, contact the immigration court or free legal help right away. The service does not show every case or every detail.',
    reminderTitle: 'Monthly reminder to check',
    reminderHint: 'Adds a reminder to your phone’s calendar on this day each month for the next 12 months. It only reminds you; it does not check anything.',
    reminderIncludeA: 'Include my A-Number in the reminder',
    reminderIncludeAHint: 'Off by default: calendars are often saved to an online account.',
    reminderButton: 'Add monthly reminder to my calendar',
    reminderEventTitle: 'Check immigration case status',
    reminderEventDescription: (a) =>
      `Check your immigration court case: acis.eoir.justice.gov or call 1-800-898-7180.${a ? ` A-Number: ${a}.` : ' Have your A-Number ready.'} Hearing dates can change. (Reminder made with LexCourt — legal information, not legal advice.)`,
  },
  listen: {
    listen: 'Listen',
    stop: 'Stop',
    noVoice: (l) => `Read aloud is not available in ${l} on this device. You can install a ${l} voice in your phone’s settings (text-to-speech), or read the text.`,
    unsupported: 'Read aloud is not available in this browser.',
    privacy: 'Read aloud uses voices installed on this device, so the text is not sent anywhere.',
    onlineOffer: (l) => `This device has no built-in ${l} voice. Your browser has an online ${l} voice, but it sends the text to the browser company (for example Google) to be spoken. Long numbers like your A-Number are left out. Or install a ${l} voice in your phone’s text-to-speech settings.`,
    useOnline: 'Use the online voice',
  },
  glossary: {
    title: 'Words to know',
    hint: 'Plain-language meanings of common legal words. These are general explanations, not legal advice.',
    tapHint: 'Tap an underlined word to see what it means.',
    close: 'Close',
    terms: {
      removal: {
        term: 'Removal',
        definition: 'Being ordered to leave the United States. Many people call it deportation. An immigration judge decides whether a person will be removed.',
      },
      relief: {
        term: 'Relief',
        definition: 'A legal way to stay in the United States, or to get more time, that a judge can grant. Asylum is one example. Who qualifies depends on each person’s situation.',
      },
      asylum: {
        term: 'Asylum',
        definition: 'Protection for people who fear serious harm in their home country because of their race, religion, nationality, political opinion, or membership in a particular social group. There are strict rules, including a deadline to apply that is usually one year after arriving, with some exceptions.',
      },
      inAbsentia: {
        term: 'In absentia',
        definition: 'Latin for “in absence.” An order the judge makes when the person does not come to their hearing. It can be an order of removal.',
      },
      noticeToAppear: {
        term: 'Notice to Appear',
        definition: 'The document from the Department of Homeland Security (DHS) that starts a case in immigration court. It lists the reasons DHS says a person can be removed.',
      },
      masterHearing: {
        term: 'Master calendar hearing',
        definition: 'A short hearing, often with many people, where the judge goes over the case and sets the next steps and deadlines.',
      },
      individualHearing: {
        term: 'Individual hearing',
        definition: 'The main hearing, also called a merits hearing, where the judge looks at the case in detail, hears testimony and evidence, and often decides the case.',
      },
      aNumber: {
        term: 'A-Number',
        definition: 'An 8- or 9-digit number that starts with A (Alien Registration Number). It is on immigration papers. You need it to check your case.',
      },
      accreditedRep: {
        term: 'Accredited representative',
        definition: 'A person who is not a lawyer but is approved by the U.S. Department of Justice to give immigration legal help through a recognized nonprofit organization.',
      },
      appeal: {
        term: 'Appeal',
        definition: 'Asking a higher authority to review a decision. An appeal of an immigration judge’s decision usually goes to the Board of Immigration Appeals and has a strict deadline, usually 30 days.',
      },
    },
  },
  aid: {
    title: 'Get ready for legal help',
    intro: 'Make a one-page summary of your notice to take or send to a lawyer or legal aid organization. You can add your questions.',
    open: 'Make a summary for legal help',
    questionsLabel: 'Your questions (optional)',
    questionsHint: 'One question per line. Blank lines are left on the page so you can write by hand.',
    questionsPlaceholder: 'Example: Do I need to bring documents to my first hearing?',
    includeA: 'Include my A-Number',
    summaryLang: 'Summary language:',
    preview: 'Preview',
    print: 'Print or save as PDF',
    download: 'Download',
    share: 'Share…',
    shareUnsupported: 'Sharing is not available in this browser. Use Download or Print instead.',
    nothingSent: 'Nothing is sent automatically. You choose whether to print, download or share the summary, and who to share it with.',
    doc: {
      heading: 'Summary for legal help',
      made: (d) => `Made with LexCourt on ${d}`,
      noticeType: 'Type of notice',
      hearingDate: 'Hearing date',
      hearingTime: 'Time',
      court: 'Court address',
      aNumber: 'A-Number',
      remote: 'Internet or video hearing',
      remoteYes: 'The notice mentions an internet or video hearing',
      notFound: 'Not found — check the notice',
      notIncluded: 'Not included',
      questions: 'My questions',
      notes: 'Notes',
      footer:
        'This summary was made automatically from a notice and may contain mistakes. Check every detail against the original notice and the court’s case information. LexCourt gives legal information, not legal advice.',
    },
  },
};

const es: FeaturesText = {
  status: {
    nav: 'Estado del caso',
    title: 'Revise el estado de su caso',
    intro: [
      'La corte de inmigración tiene un servicio oficial gratuito que muestra la fecha de su próxima audiencia y otra información de su caso. Puede usarlo por internet o por teléfono, a cualquier hora.',
      'Revíselo con frecuencia. Las fechas de audiencia pueden cambiar, y la información de la corte es más reciente que un aviso en papel.',
    ],
    noFetch: 'LexCourt no revisa su caso por usted y no se conecta con la corte. Usted lo revisa en el sitio oficial o por teléfono.',
    aNumberLabel: 'Su Número A (A-Number)',
    aNumberHint: 'Empieza con A y tiene 8 o 9 dígitos. Está en su aviso y en otros papeles de inmigración.',
    aNumberFromNotice: 'Tomado de su aviso. Revise que sea correcto.',
    aNumberPrivacy: 'Su Número A se queda en este dispositivo. Solo se usa para mostrarlo en los pasos de abajo.',
    copyDigits: 'Copiar los 9 dígitos',
    eightDigits: 'Si su Número A tiene solo 8 dígitos, agregue un 0 al principio para tener 9 dígitos (el botón de copiar lo hace).',
    onlineTitle: 'Por internet (Información Automatizada de Casos)',
    onlineSteps: [
      'Abra el sitio de Información Automatizada de Casos de la corte (enlace abajo). Es gratis y está en inglés y en español.',
      'Acepte los términos del sitio, si se lo pide.',
      'Escriba su Número A: {aNumber}. Escriba solo los 9 dígitos, sin la A ni guiones.',
      'Siga las instrucciones de la pantalla para ver su caso. Anote la fecha, la hora y la dirección de la corte de su próxima audiencia.',
    ],
    onlineLink: 'Abrir Información Automatizada de Casos (sitio oficial de la corte)',
    phoneTitle: 'Por teléfono',
    phoneSteps: [
      'Llame al 1-800-898-7180. La llamada es gratis.',
      'Elija su idioma cuando se lo pidan (inglés o español).',
      'Marque su Número A con el teclado del teléfono: {aNumber}.',
      'Escuche la información de su caso. Tenga papel a mano para anotar la fecha, la hora y la dirección.',
    ],
    callButton: 'Llamar al 1-800-898-7180',
    tddNote: 'Para personas sordas o con dificultad para oír (TDD): 1-800-828-1120.',
    whatYouSeeTitle: 'Lo que puede encontrar',
    whatYouSee: [
      'Su próxima audiencia: fecha, hora y dirección de la corte, o una nota de que es por video.',
      'Si el juez tomó una decisión, y de qué tipo.',
      'Si se presentó una apelación, información sobre ella.',
    ],
    differentDate:
      'Si la información de la corte es diferente de su aviso en papel, o ve una decisión que no entiende, comuníquese de inmediato con la corte de inmigración o con ayuda legal gratuita. El servicio no muestra todos los casos ni todos los detalles.',
    reminderTitle: 'Recordatorio mensual para revisar',
    reminderHint: 'Agrega un recordatorio al calendario de su teléfono este mismo día de cada mes durante los próximos 12 meses. Solo le recuerda; no revisa nada.',
    reminderIncludeA: 'Incluir mi Número A en el recordatorio',
    reminderIncludeAHint: 'Desactivado al inicio: los calendarios muchas veces se guardan en una cuenta en internet.',
    reminderButton: 'Agregar recordatorio mensual a mi calendario',
    reminderEventTitle: 'Revisar el estado del caso de inmigración',
    reminderEventDescription: (a) =>
      `Revise su caso en la corte de inmigración: acis.eoir.justice.gov o llame al 1-800-898-7180.${a ? ` Número A: ${a}.` : ' Tenga a mano su Número A.'} Las fechas de audiencia pueden cambiar. (Recordatorio hecho con LexCourt — información legal, no asesoría legal.)`,
  },
  listen: {
    listen: 'Escuchar',
    stop: 'Parar',
    noVoice: (l) => `La lectura en voz alta no está disponible en ${l} en este dispositivo. Puede instalar una voz en ${l} en la configuración de su teléfono (texto a voz), o leer el texto.`,
    unsupported: 'La lectura en voz alta no está disponible en este navegador.',
    privacy: 'La lectura en voz alta usa las voces instaladas en este dispositivo, así que el texto no se envía a ningún lugar.',
    onlineOffer: (l) => `Este dispositivo no tiene una voz en ${l} instalada. Su navegador tiene una voz en ${l} en línea, pero envía el texto a la empresa del navegador (por ejemplo, Google). Los números largos, como su A-Number, no se envían. También puede instalar una voz en ${l} en la configuración de texto a voz de su teléfono.`,
    useOnline: 'Usar la voz en línea',
  },
  glossary: {
    title: 'Palabras que debe conocer',
    hint: 'Significados en palabras sencillas de palabras legales comunes. Son explicaciones generales, no asesoría legal.',
    tapHint: 'Toque una palabra subrayada para ver qué significa.',
    close: 'Cerrar',
    terms: {
      removal: {
        term: 'Remoción (removal)',
        definition: 'Una orden de salir de Estados Unidos. Mucha gente la llama deportación. Un juez de inmigración decide si una persona será removida.',
      },
      relief: {
        term: 'Alivio (relief)',
        definition: 'Una forma legal de quedarse en Estados Unidos, o de obtener más tiempo, que un juez puede conceder. El asilo es un ejemplo. Quién califica depende de la situación de cada persona.',
      },
      asylum: {
        term: 'Asilo (asylum)',
        definition: 'Protección para personas que temen un daño grave en su país por su raza, religión, nacionalidad, opinión política o pertenencia a un grupo social determinado. Hay reglas estrictas, incluida una fecha límite para solicitarlo que normalmente es un año después de llegar, con algunas excepciones.',
      },
      inAbsentia: {
        term: 'In absentia',
        definition: 'Palabras en latín que significan “en ausencia”. Una orden que da el juez cuando la persona no se presenta a su audiencia. Puede ser una orden de remoción.',
      },
      noticeToAppear: {
        term: 'Notificación de Comparecencia (Notice to Appear)',
        definition: 'El documento del Departamento de Seguridad Nacional (DHS) que empieza un caso en la corte de inmigración. Dice las razones por las que DHS dice que una persona puede ser removida.',
      },
      masterHearing: {
        term: 'Audiencia de calendario principal (master calendar hearing)',
        definition: 'Una audiencia corta, muchas veces con muchas personas, donde el juez revisa el caso y fija los próximos pasos y fechas límite.',
      },
      individualHearing: {
        term: 'Audiencia individual (individual hearing)',
        definition: 'La audiencia principal, también llamada audiencia de méritos, donde el juez estudia el caso en detalle, escucha testimonios y pruebas, y muchas veces lo decide.',
      },
      aNumber: {
        term: 'Número A (A-Number)',
        definition: 'Un número de 8 o 9 dígitos que empieza con A (Número de Registro de Extranjero). Está en los papeles de inmigración. Lo necesita para revisar su caso.',
      },
      accreditedRep: {
        term: 'Representante acreditado (accredited representative)',
        definition: 'Una persona que no es abogado pero que está aprobada por el Departamento de Justicia de EE. UU. para dar ayuda legal de inmigración a través de una organización sin fines de lucro reconocida.',
      },
      appeal: {
        term: 'Apelación (appeal)',
        definition: 'Pedir a una autoridad superior que revise una decisión. La apelación de una decisión de un juez de inmigración normalmente va a la Junta de Apelaciones de Inmigración y tiene una fecha límite estricta, normalmente 30 días.',
      },
    },
  },
  aid: {
    title: 'Prepárese para la ayuda legal',
    intro: 'Haga un resumen de una página de su aviso para llevar o enviar a un abogado o a una organización de ayuda legal. Puede agregar sus preguntas.',
    open: 'Hacer un resumen para la ayuda legal',
    questionsLabel: 'Sus preguntas (opcional)',
    questionsHint: 'Una pregunta por línea. Se dejan líneas en blanco en la página para que pueda escribir a mano.',
    questionsPlaceholder: 'Ejemplo: ¿Tengo que llevar documentos a mi primera audiencia?',
    includeA: 'Incluir mi Número A',
    summaryLang: 'Idioma del resumen:',
    preview: 'Vista previa',
    print: 'Imprimir o guardar como PDF',
    download: 'Descargar',
    share: 'Compartir…',
    shareUnsupported: 'Este navegador no permite compartir. Use Descargar o Imprimir.',
    nothingSent: 'No se envía nada automáticamente. Usted decide si imprime, descarga o comparte el resumen, y con quién lo comparte.',
    doc: {
      heading: 'Resumen para la ayuda legal',
      made: (d) => `Hecho con LexCourt el ${d}`,
      noticeType: 'Tipo de aviso',
      hearingDate: 'Fecha de la audiencia',
      hearingTime: 'Hora',
      court: 'Dirección de la corte',
      aNumber: 'Número A (A-Number)',
      remote: 'Audiencia por internet o video',
      remoteYes: 'El aviso menciona una audiencia por internet o video',
      notFound: 'No se encontró — revise el aviso',
      notIncluded: 'No incluido',
      questions: 'Mis preguntas',
      notes: 'Notas',
      footer:
        'Este resumen se hizo automáticamente a partir de un aviso y puede tener errores. Compare cada dato con el aviso original y con la información de su caso en la corte. LexCourt da información legal, no asesoría legal.',
    },
  },
};

export const FEATURES: Record<Lang, FeaturesText> = { en, es, hi: hiFeatures, pa: paFeatures, ur: urFeatures };
