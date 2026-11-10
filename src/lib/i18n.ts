import type { HearingType, NoticeType } from './extract';

export type Lang = 'en' | 'es';

export interface Explanation {
  title: string;
  body: string[];
}

interface Strings {
  appTagline: string;
  langToggle: string;
  disclaimerTitle: string;
  disclaimer: string;
  privacyTitle: string;
  privacy: string[];
  startTitle: string;
  startHint: string;
  uploadPhoto: string;
  uploadPdf: string;
  orDescribe: string;
  speak: string;
  stopSpeaking: string;
  listening: string;
  voicePrivacy: string;
  voiceUnsupported: string;
  typePlaceholder: string;
  readThis: string;
  progressPdf: string;
  progressOcrLoading: string;
  progressOcr: string;
  errorUnsupported: string;
  errorRead: string;
  errorNoText: string;
  startOver: string;
  resultTitle: string;
  checkWarning: string;
  fieldDate: string;
  fieldTime: string;
  fieldCourt: string;
  fieldANumber: string;
  notFound: string;
  dateToBeSet: string;
  remoteNote: string;
  remindersTitle: string;
  remindersHint: string;
  downloadIcs: string;
  googleCal: string;
  needDate: string;
  reminderTitle: string;
  reminderDescription: (aNumberShown: boolean) => string;
  whatIsThis: string;
  mustKnowTitle: string;
  mustKnow: string[];
  helpTitle: string;
  helpIntro: string;
  helpProBono: string;
  helpDirectory: string;
  helpCourtGuide: string;
  helpCaseStatus: (phone: string) => string;
  helpForms: string;
  notarioWarning: string;
  showText: string;
  footer: string;
  notice: Record<NoticeType, Explanation>;
  hearing: Record<Exclude<HearingType, 'unknown'>, Explanation>;
}

const en: Strings = {
  appTagline: 'Understand your immigration court notice',
  langToggle: 'Español',
  disclaimerTitle: 'Legal information, not legal advice',
  disclaimer:
    'LexCourt explains documents in plain language. It is not a lawyer and cannot tell you what to do in your case. For advice about your case, talk to a lawyer or an accredited representative. Free help is listed below.',
  privacyTitle: 'Your privacy',
  privacy: [
    'Your notice is read on this phone or computer. We do not upload it, and we do not keep it.',
    'We have no accounts and no tracking. When you close this page, what you entered is gone.',
    'Reminders go into your own calendar. We never see them.',
  ],
  startTitle: 'Read my court notice',
  startHint: 'Take a clear photo of the whole page in good light, or choose a PDF.',
  uploadPhoto: 'Take or choose a photo',
  uploadPdf: 'Choose a PDF',
  orDescribe: 'Or tell us what your notice says',
  speak: 'Speak',
  stopSpeaking: 'Stop',
  listening: 'Listening…',
  voicePrivacy:
    'Voice uses your browser’s speech service. Some browsers (like Chrome) send the audio to their company to turn it into text. If you prefer, type instead.',
  voiceUnsupported: 'Voice is not available in this browser. You can type instead.',
  typePlaceholder: 'Example: “Notice of hearing. Master hearing on March 3, 2027 at 8:30 AM at 26 Federal Plaza, New York, NY 10278.”',
  readThis: 'Explain this',
  progressPdf: 'Reading the PDF…',
  progressOcrLoading: 'Getting the text reader ready (first time can take a minute)…',
  progressOcr: 'Reading the text in your photo…',
  errorUnsupported: 'Please choose a photo (JPG, PNG) or a PDF.',
  errorRead: 'We could not read that file. Try a clearer photo, or type what the notice says.',
  errorNoText: 'We could not find any text. Try a clearer, flat photo in good light, or type what it says.',
  startOver: 'Start over',
  resultTitle: 'What we found',
  checkWarning:
    'Check every detail against your paper notice. Text readers make mistakes. You can fix anything below. The official source is the court: check your case online or by phone (see below).',
  fieldDate: 'Hearing date',
  fieldTime: 'Time',
  fieldCourt: 'Court address',
  fieldANumber: 'A-Number',
  notFound: 'Not found. Type it from your notice.',
  dateToBeSet:
    'Your notice says the date or time is “to be set.” The court should mail you a Notice of Hearing with the date. You can also check your case online or by phone.',
  remoteNote:
    'Your notice mentions an internet or video hearing (for example, Webex). Read the instructions on your notice carefully, and test your phone or computer before the hearing day.',
  remindersTitle: 'Set reminders',
  remindersHint: 'Adds the hearing to your phone’s calendar with reminders 1 week before, 1 day before, and on the morning of the hearing.',
  downloadIcs: 'Add to my calendar',
  googleCal: 'Add to Google Calendar',
  needDate: 'Enter the hearing date first.',
  reminderTitle: 'Immigration court hearing',
  reminderDescription: (a) =>
    `Bring: this notice, photo ID, and any documents for your case.${a ? ' Have your A-Number ready.' : ''} Arrive early. Check your hearing date: ${'acis.eoir.justice.gov'} or 1-800-898-7180. (Reminder made with LexCourt — legal information, not legal advice.)`,
  whatIsThis: 'What this document is',
  mustKnowTitle: 'Important things to know',
  mustKnow: [
    'Go to every hearing. If you miss a hearing, the judge can order you deported (“removed”) without you being there. This is called an order “in absentia.”',
    'Hearing dates can change. Check your case often online at the court’s Automated Case Information site or by phone at 1-800-898-7180. You will need your A-Number.',
    'If you move, tell the immigration court in writing within 5 days, using Form EOIR-33/IC. If the court has an old address, you could miss a notice. Telling ICE or USCIS is separate and does not update the court.',
    'You have the right to a lawyer, but the government does not pay for one. You can ask the judge for time to find a lawyer. Free and low-cost help is listed below.',
    'The court provides an interpreter at your hearing for free. Tell the court what language you speak best.',
    'Bring this notice, a photo ID, and any documents about your case. Arrive early: there is a security check.',
  ],
  helpTitle: 'Free legal help',
  helpIntro: 'These organizations may be able to help you for free or at low cost.',
  helpProBono: 'Free legal service providers near your court (U.S. Department of Justice list)',
  helpDirectory: 'Nonprofit immigration legal services directory',
  helpCourtGuide: 'Immigration Court Online Resource — official guides in plain language',
  helpCaseStatus: (phone) => `Check your hearing date and case status (online, or call ${phone})`,
  helpForms: 'Court forms, including EOIR-33/IC change of address',
  notarioWarning:
    'Be careful of “notarios,” “immigration consultants,” or anyone who is not a lawyer or a DOJ-accredited representative. They are not allowed to give legal advice, and some take money and hurt people’s cases.',
  showText: 'Show the text we read',
  footer: 'LexCourt is free. It gives legal information, not legal advice. It is not part of the government or the court.',
  notice: {
    notice_of_hearing: {
      title: 'Notice of Hearing',
      body: [
        'This looks like a Notice of Hearing from the immigration court. The immigration court is part of the U.S. Department of Justice (called EOIR).',
        'It tells you when and where you must go to see an immigration judge.',
      ],
    },
    notice_to_appear: {
      title: 'Notice to Appear (Form I-862)',
      body: [
        'This looks like a Notice to Appear. It comes from the Department of Homeland Security (DHS). It starts a case in immigration court to decide if you can stay in the United States.',
        'It lists facts DHS says about you (“allegations”) and the legal reasons DHS says you can be removed (“charges”). You will have a chance to tell the judge if they are true.',
        'If it has no date, or says the date is “to be set,” the court will mail you a Notice of Hearing with the date.',
      ],
    },
    judge_order: {
      title: 'Order from an immigration judge',
      body: [
        'This looks like an order or decision from an immigration judge.',
        'Orders can have strict deadlines, for example to appeal or to file papers. Missing a deadline can hurt your case. Contact free legal help as soon as possible.',
      ],
    },
    unknown: {
      title: 'We are not sure what this is',
      body: [
        'We could not tell what kind of document this is. If it came from the immigration court or from DHS/ICE, it may have deadlines.',
        'Please look for a date, a time and an address on it, and contact free legal help if you are not sure.',
      ],
    },
  },
  hearing: {
    master: {
      title: 'Master calendar hearing',
      body: [
        'This is usually a short hearing. Many people may have hearings at the same time.',
        'The judge may check your name, address and language, explain your rights, ask if you have a lawyer, and talk about next steps and deadlines. The judge may ask if the facts in the Notice to Appear are true and what you plan to apply for.',
      ],
    },
    individual: {
      title: 'Individual (merits) hearing',
      body: [
        'This is the main hearing where the judge looks at your case in detail. You may testify, and you or your witnesses may present evidence.',
        'Documents usually must be sent to the court before this hearing, by a deadline the judge set. The judge often decides the case at the end of this hearing.',
      ],
    },
  },
};

const es: Strings = {
  appTagline: 'Entienda su aviso de la corte de inmigración',
  langToggle: 'English',
  disclaimerTitle: 'Información legal, no asesoría legal',
  disclaimer:
    'LexCourt explica documentos en palabras sencillas. No es un abogado y no puede decirle qué hacer en su caso. Para recibir consejo sobre su caso, hable con un abogado o un representante acreditado. Abajo hay ayuda gratuita.',
  privacyTitle: 'Su privacidad',
  privacy: [
    'Su aviso se lee en este teléfono o computadora. No lo subimos a internet y no lo guardamos.',
    'No hay cuentas ni rastreo. Cuando cierre esta página, lo que escribió se borra.',
    'Los recordatorios van a su propio calendario. Nosotros nunca los vemos.',
  ],
  startTitle: 'Leer mi aviso de la corte',
  startHint: 'Tome una foto clara de toda la página con buena luz, o elija un PDF.',
  uploadPhoto: 'Tomar o elegir una foto',
  uploadPdf: 'Elegir un PDF',
  orDescribe: 'O díganos qué dice su aviso',
  speak: 'Hablar',
  stopSpeaking: 'Parar',
  listening: 'Escuchando…',
  voicePrivacy:
    'La voz usa el servicio de voz de su navegador. Algunos navegadores (como Chrome) envían el audio a su compañía para convertirlo en texto. Si prefiere, escriba.',
  voiceUnsupported: 'La voz no funciona en este navegador. Puede escribir.',
  typePlaceholder: 'Ejemplo: “Aviso de audiencia. Audiencia master el 3 de marzo de 2027 a las 8:30 AM en 26 Federal Plaza, New York, NY 10278.”',
  readThis: 'Explicar',
  progressPdf: 'Leyendo el PDF…',
  progressOcrLoading: 'Preparando el lector de texto (la primera vez puede tardar un minuto)…',
  progressOcr: 'Leyendo el texto de su foto…',
  errorUnsupported: 'Elija una foto (JPG, PNG) o un PDF.',
  errorRead: 'No pudimos leer ese archivo. Pruebe con una foto más clara, o escriba lo que dice el aviso.',
  errorNoText: 'No encontramos texto. Pruebe con una foto más clara, plana y con buena luz, o escriba lo que dice.',
  startOver: 'Empezar de nuevo',
  resultTitle: 'Lo que encontramos',
  checkWarning:
    'Compare cada dato con su aviso en papel. Los lectores de texto cometen errores. Puede corregir todo abajo. La fuente oficial es la corte: revise su caso por internet o por teléfono (vea abajo).',
  fieldDate: 'Fecha de la audiencia',
  fieldTime: 'Hora',
  fieldCourt: 'Dirección de la corte',
  fieldANumber: 'Número A',
  notFound: 'No se encontró. Escríbalo de su aviso.',
  dateToBeSet:
    'Su aviso dice que la fecha o la hora está “por determinar” (“to be set”). La corte le debe enviar por correo un Aviso de Audiencia con la fecha. También puede revisar su caso por internet o por teléfono.',
  remoteNote:
    'Su aviso menciona una audiencia por internet o video (por ejemplo, Webex). Lea con cuidado las instrucciones de su aviso y pruebe su teléfono o computadora antes del día de la audiencia.',
  remindersTitle: 'Poner recordatorios',
  remindersHint: 'Agrega la audiencia al calendario de su teléfono con recordatorios 1 semana antes, 1 día antes y la mañana de la audiencia.',
  downloadIcs: 'Agregar a mi calendario',
  googleCal: 'Agregar a Google Calendar',
  needDate: 'Primero escriba la fecha de la audiencia.',
  reminderTitle: 'Audiencia en la corte de inmigración',
  reminderDescription: (a) =>
    `Lleve: este aviso, una identificación con foto y los documentos de su caso.${a ? ' Tenga a mano su Número A.' : ''} Llegue temprano. Revise la fecha de su audiencia: acis.eoir.justice.gov o 1-800-898-7180. (Recordatorio hecho con LexCourt — información legal, no asesoría legal.)`,
  whatIsThis: 'Qué es este documento',
  mustKnowTitle: 'Cosas importantes que debe saber',
  mustKnow: [
    'Vaya a todas sus audiencias. Si falta a una audiencia, el juez puede ordenar su deportación (“remoción”) aunque usted no esté presente. Esto se llama una orden “in absentia”.',
    'Las fechas de audiencia pueden cambiar. Revise su caso seguido en el sitio de Información Automatizada de Casos de la corte o por teléfono al 1-800-898-7180. Necesitará su Número A.',
    'Si se muda, avise a la corte de inmigración por escrito dentro de 5 días con el Formulario EOIR-33/IC. Si la corte tiene una dirección vieja, podría no recibir un aviso. Avisar a ICE o USCIS es aparte y no cambia su dirección en la corte.',
    'Usted tiene derecho a un abogado, pero el gobierno no lo paga. Puede pedirle al juez tiempo para buscar un abogado. Abajo hay ayuda gratuita o de bajo costo.',
    'La corte le da un intérprete gratis en su audiencia. Dígale a la corte qué idioma habla mejor.',
    'Lleve este aviso, una identificación con foto y los documentos de su caso. Llegue temprano: hay un control de seguridad.',
  ],
  helpTitle: 'Ayuda legal gratuita',
  helpIntro: 'Estas organizaciones pueden ayudarle gratis o a bajo costo.',
  helpProBono: 'Proveedores de servicios legales gratuitos cerca de su corte (lista del Departamento de Justicia)',
  helpDirectory: 'Directorio de servicios legales de inmigración sin fines de lucro',
  helpCourtGuide: 'Recurso en línea de la corte de inmigración (ICOR) — guías oficiales en palabras sencillas',
  helpCaseStatus: (phone) => `Revise la fecha de su audiencia y el estado de su caso (por internet o llamando al ${phone})`,
  helpForms: 'Formularios de la corte, incluido el EOIR-33/IC de cambio de dirección',
  notarioWarning:
    'Cuidado con los “notarios”, “consultores de inmigración” o cualquier persona que no sea abogado ni representante acreditado por el Departamento de Justicia. No pueden dar asesoría legal, y algunos cobran dinero y dañan los casos de las personas.',
  showText: 'Ver el texto que leímos',
  footer: 'LexCourt es gratis. Da información legal, no asesoría legal. No es parte del gobierno ni de la corte.',
  notice: {
    notice_of_hearing: {
      title: 'Aviso de Audiencia (Notice of Hearing)',
      body: [
        'Parece un Aviso de Audiencia de la corte de inmigración. La corte de inmigración es parte del Departamento de Justicia de EE. UU. (se llama EOIR).',
        'Le dice cuándo y dónde debe presentarse ante un juez de inmigración.',
      ],
    },
    notice_to_appear: {
      title: 'Notificación de Comparecencia (Notice to Appear, Formulario I-862)',
      body: [
        'Parece una Notificación de Comparecencia. Viene del Departamento de Seguridad Nacional (DHS). Empieza un caso en la corte de inmigración para decidir si usted puede quedarse en Estados Unidos.',
        'Incluye hechos que DHS dice sobre usted (“alegaciones”) y las razones legales por las que DHS dice que le pueden remover (“cargos”). Usted tendrá la oportunidad de decirle al juez si son ciertos.',
        'Si no tiene fecha, o dice que la fecha está “por determinar” (“to be set”), la corte le enviará por correo un Aviso de Audiencia con la fecha.',
      ],
    },
    judge_order: {
      title: 'Orden de un juez de inmigración',
      body: [
        'Parece una orden o decisión de un juez de inmigración.',
        'Las órdenes pueden tener fechas límite estrictas, por ejemplo para apelar o para entregar papeles. No cumplir una fecha límite puede dañar su caso. Busque ayuda legal gratuita lo antes posible.',
      ],
    },
    unknown: {
      title: 'No estamos seguros de qué es',
      body: [
        'No pudimos saber qué tipo de documento es. Si viene de la corte de inmigración o de DHS/ICE, puede tener fechas límite.',
        'Busque en el documento una fecha, una hora y una dirección, y contacte ayuda legal gratuita si no está seguro.',
      ],
    },
  },
  hearing: {
    master: {
      title: 'Audiencia preliminar (master calendar hearing)',
      body: [
        'Normalmente es una audiencia corta. Muchas personas pueden tener audiencia a la misma hora.',
        'El juez puede confirmar su nombre, dirección e idioma, explicarle sus derechos, preguntarle si tiene abogado, y hablar de los próximos pasos y fechas límite. El juez puede preguntarle si los hechos de la Notificación de Comparecencia son ciertos y qué piensa solicitar.',
      ],
    },
    individual: {
      title: 'Audiencia individual (de méritos)',
      body: [
        'Es la audiencia principal, donde el juez estudia su caso en detalle. Usted puede declarar, y usted o sus testigos pueden presentar pruebas.',
        'Normalmente los documentos deben enviarse a la corte antes de esta audiencia, en una fecha límite que fija el juez. Muchas veces el juez decide el caso al final de esta audiencia.',
      ],
    },
  },
};

export const STRINGS: Record<Lang, Strings> = { en, es };

export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}
