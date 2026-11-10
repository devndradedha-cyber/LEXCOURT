/**
 * Text for "Check your representative" and "Report a problem", in English and
 * Spanish.
 *
 * ⚠️ DRAFT — NOT YET REVIEWED BY AN ATTORNEY. All of this text, and the routing
 * rules in report.ts, must be reviewed by a licensed attorney (and the Spanish
 * by a qualified legal translator) before public launch.
 */
import type { Lang } from './i18n';
import { hiSummary, hiTools } from './locales/hi';
import { paSummary, paTools } from './locales/pa';
import { urSummary, urTools } from './locales/ur';
import type { AuthorityId, CourtCase, Issue, ReasonId, SummaryText, Who } from './report';

export const TOOLS_DRAFT = true;

export interface AuthorityText {
  name: string;
  what: string;
  how: string[];
  linkLabel: string;
  /** Second link (for example, the Spanish form or a directory). */
  link2Label?: string;
}

export interface ToolsText {
  nav: { notice: string; check: string; report: string };
  draftBadge: string;
  draftNotice: string;
  infoNotAdvice: string;
  copy: string;
  copied: string;
  copyFailed: string;
  openNewTab: string;

  check: {
    title: string;
    intro: string[];
    nameLabel: string;
    nameHint: string;
    namePrivacy: string;
    roleLabel: string;
    roles: { lawyer: string; accredited: string; notario: string; unsure: string };
    stateLabel: string;
    statePlaceholder: string;
    stepsTitle: (name: string) => string;
    someone: string;
    findTip: string;
    lawyerSteps: {
      askBar: string;
      stateLookup: (state: string) => string;
      stateLookupGeneric: string;
      stateLookupLink: string;
      abaLink: string;
      whatToSee: string;
    };
    accreditedSteps: { askOrg: string; roster: string; rosterLink: string; fullVsPartial: string };
    disciplineSteps: { current: string; currentLink: string; previous: string; previousLink: string };
    notarioExplain: string[];
    notFound: string;
    signsTitle: string;
    signsIntro: string;
    signs: string[];
    signsNone: string;
    signsSome: (n: number) => string;
    signsAction: string;
    goReport: string;
    getHelp: string;
  };

  report: {
    title: string;
    intro: string[];
    neverSubmit: string;
    stepOf: (n: number, total: number) => string;
    next: string;
    back: string;
    startOver: string;
    whoQ: string;
    who: Record<Who, string>;
    issuesQ: string;
    issuesHint: string;
    issues: Record<Issue, string>;
    courtQ: string;
    courtHint: string;
    court: Record<CourtCase, string>;
    stateQ: string;
    stateHint: string;
    statePlaceholder: string;
    detailsQ: string;
    detailsHint: string;
    fields: Record<'name' | 'business' | 'contact' | 'dates' | 'amountPaid' | 'story' | 'documents', string>;
    fieldPlaceholders: Record<'name' | 'business' | 'contact' | 'dates' | 'amountPaid' | 'story' | 'documents', string>;
    seeResults: string;
    resultsTitle: string;
    urgentTitle: string;
    urgent: string[];
    whereTitle: string;
    whereIntro: string;
    primary: string;
    also: string;
    whyShown: string;
    reasons: Record<ReasonId, string>;
    authorities: Record<AuthorityId, AuthorityText>;
    stateAgFor: (state: string) => string;
    summaryTitle: string;
    summaryIntro: string[];
    summaryLang: string;
    summaryEdit: string;
    beforeYouFile: string[];
  };
}

const en: ToolsText = {
  nav: { notice: 'Read a notice', check: 'Check a representative', report: 'Report a problem' },
  draftBadge: 'DRAFT — needs attorney review',
  draftNotice: 'This page is a draft. Its text has not yet been reviewed by an attorney and may change.',
  infoNotAdvice:
    'This is legal information, not legal advice. LexCourt is not a law firm and cannot tell you what to do in your situation. For advice, talk to an attorney or an accredited representative.',
  copy: 'Copy',
  copied: 'Copied',
  copyFailed: 'Could not copy. Select the text and copy it yourself.',
  openNewTab: '(opens in a new tab)',

  check: {
    title: 'Check your lawyer or representative',
    intro: [
      'With very few exceptions, only two kinds of people are allowed to give you legal advice about immigration or represent you in immigration court:',
      '1. A lawyer (attorney) who is licensed by a U.S. state and allowed to practice.',
      '2. An accredited representative: a person approved by the U.S. Department of Justice who works for a recognized nonprofit organization.',
      '“Notarios,” notaries public, “immigration consultants,” and travel agents are not lawyers. They are not allowed to give legal advice or represent you.',
    ],
    nameLabel: 'Their name (optional)',
    nameHint: 'As it appears on their card, contract or receipt.',
    namePrivacy: 'The name stays on this device. LexCourt does not search for you, so nothing is sent anywhere. You will search the official lists yourself.',
    roleLabel: 'What do they say they are?',
    roles: { lawyer: 'A lawyer / attorney', accredited: 'An accredited representative', notario: 'A notario, consultant or other', unsure: 'I’m not sure' },
    stateLabel: 'State where they say they are licensed',
    statePlaceholder: 'Choose a state',
    stepsTitle: (name) => `How to check ${name}`,
    someone: 'this person',
    findTip:
      'Tip: these lists are long. Use “Find on page” to search for the name (on a phone, it is in the browser’s menu or share menu; on a computer, press Ctrl+F or ⌘+F).',
    lawyerSteps: {
      askBar: 'Ask for their bar number and the state that licensed them. A real lawyer will tell you.',
      stateLookup: (state) => `Look them up in ${state}’s official lawyer search. Make sure their status says they are active or eligible to practice.`,
      stateLookupGeneric:
        'Look them up in the official lawyer search of the state that licensed them. Each state runs its own. You can find your state’s lawyer regulator in the American Bar Association’s directory.',
      stateLookupLink: 'Official lawyer search',
      abaLink: 'Directory of state lawyer regulators (American Bar Association)',
      whatToSee: 'Check that the name matches, that they are allowed to practice now, and whether they have any public discipline.',
    },
    accreditedSteps: {
      askOrg: 'Ask which recognized organization they work for. Accredited representatives can only help you through that organization.',
      roster: 'Find their name and the organization on the Department of Justice (EOIR) roster of recognized organizations and accredited representatives.',
      rosterLink: 'EOIR roster of recognized organizations and accredited representatives',
      fullVsPartial:
        'The roster shows “full” or “partial” accreditation. Only representatives with full accreditation can represent you in immigration court. Partial accreditation is for the Department of Homeland Security (for example, USCIS) only.',
    },
    disciplineSteps: {
      current:
        'Check the Department of Justice list of currently disciplined practitioners. People on this list may not be allowed to represent you in immigration court.',
      currentLink: 'EOIR list of currently disciplined practitioners',
      previous: 'You can also check the list of people who were disciplined in the past.',
      previousLink: 'EOIR list of previously disciplined practitioners',
    },
    notarioExplain: [
      'A notario, notary public or immigration consultant is not a lawyer. In the United States, a notary public can only witness signatures. They are not allowed to give you legal advice, choose forms for you, or represent you.',
      'If they did any of these things, or took your money, you can report it. Also check the warning signs below.',
    ],
    notFound:
      'If you cannot find them, it may be a different spelling, or they may not be allowed to practice. Do not pay or sign anything until you can confirm who they are. Free legal help can check with you.',
    signsTitle: 'Warning signs of notario fraud',
    signsIntro: 'Check any that happened to you. Your answers stay on this device.',
    signs: [
      'They call themselves a “notario,” “notario público,” “immigration consultant,” or “immigration specialist.”',
      'They can’t or won’t show a state bar license or proof of Department of Justice accreditation.',
      'They promise you will win, or say they have special contacts at immigration or the court.',
      'They charge you for blank government forms. Immigration forms are free to download from the government.',
      'They ask you to sign blank forms, or forms with information that is not true.',
      'They keep your original documents, like your passport or birth certificate.',
      'They don’t give you a written contract or receipts, or they only take cash.',
      'They don’t give you copies of what they filed for you.',
      'They pressure you to decide quickly, or tell you to keep it secret.',
      'They tell you that you don’t need to go to your hearing.',
      'They file applications for you that you don’t understand, or promise a work permit or green card just for paying.',
      'You can’t find them on any official list of lawyers or accredited representatives.',
    ],
    signsNone: 'If none of these happened, that is a good sign, but still check them on the official lists above.',
    signsSome: (n) =>
      `You checked ${n} warning sign${n === 1 ? '' : 's'}. These are common signs of notario fraud. Do not pay more money or sign anything else until you get advice from a lawyer or accredited representative.`,
    signsAction: 'You can get free legal help, and you can report what happened.',
    goReport: 'Report a problem',
    getHelp: 'Find free legal help',
  },

  report: {
    title: 'Report a problem with a lawyer, representative or notario',
    intro: [
      'Answer a few questions. LexCourt will show which offices usually handle this kind of problem, link to their official complaint forms, and help you write a clear summary.',
    ],
    neverSubmit: 'LexCourt never sends or submits anything. You decide whether to file, and you file it yourself on the official site. Your answers stay on this device and are erased when you close the page.',
    stepOf: (n, total) => `Step ${n} of ${total}`,
    next: 'Next',
    back: 'Back',
    startOver: 'Start over',
    whoQ: 'Who is the problem with?',
    who: {
      lawyer: 'A lawyer / attorney',
      accredited: 'An accredited representative (works for a nonprofit organization)',
      nonlawyer: 'A notario, immigration consultant or someone else who is not a lawyer',
      unsure: 'I’m not sure',
    },
    issuesQ: 'What happened?',
    issuesHint: 'Choose all that apply.',
    issues: {
      fakeLawyer: 'They said they were a lawyer or could represent me, but they are not',
      falseStatements: 'They lied to me, or put false information on my forms or in court',
      freeForms: 'They charged me for forms or services that are free',
      tookMoney: 'They took my money and did not do the work',
      missedDeadline: 'They missed a deadline or a hearing in my case',
      keptDocuments: 'They kept my documents or will not give them back',
      other: 'Something else',
    },
    courtQ: 'Did they work on a case in immigration court for you?',
    courtHint: 'For example, they went to a hearing with you, or filed papers with the immigration court or the Board of Immigration Appeals.',
    court: { yes: 'Yes', no: 'No', unsure: 'I’m not sure' },
    stateQ: 'In which state did this happen?',
    stateHint: 'This helps show the right state offices.',
    statePlaceholder: 'Choose a state',
    detailsQ: 'Details for your summary (optional)',
    detailsHint:
      'Fill in what you know. Leave anything blank. Only write things you know are true. This stays on this device; LexCourt uses it only to write the summary below.',
    fields: {
      name: 'Their name',
      business: 'Business or office name',
      contact: 'Their address, phone or website',
      dates: 'When it happened',
      amountPaid: 'How much you paid, and how',
      story: 'What happened, in your own words',
      documents: 'Papers you have (receipts, contract, messages)',
    },
    fieldPlaceholders: {
      name: 'Example: Juan Pérez',
      business: 'Example: Pérez Immigration Services',
      contact: 'Example: 100 Main St, Houston, TX · (555) 555-0100',
      dates: 'Example: March to June 2026',
      amountPaid: 'Example: $1,500 in cash, no receipt',
      story: 'Example: He said he was a lawyer and would file my asylum case. He did not file it and stopped answering my calls.',
      documents: 'Example: a receipt and text messages',
    },
    seeResults: 'See where to report',
    resultsTitle: 'Where you can report this',
    urgentTitle: 'If you have a hearing or deadline coming up',
    urgent: [
      'Still go to your hearing. Missing it can lead to an order of removal (deportation).',
      'Check your hearing date with the court: acis.eoir.justice.gov or 1-800-898-7180.',
      'Contact free legal help now. Some problems caused by a representative can be fixed, but there are strict time limits.',
    ],
    whereTitle: 'Offices that usually handle this',
    whereIntro:
      'Based on your answers, these offices may be able to look into what happened. Which office is right depends on the facts; an office may send your complaint to another one.',
    primary: 'Start here',
    also: 'You may also report to',
    whyShown: 'Why this is shown:',
    reasons: {
      licensedLawyer: 'Lawyers are licensed and disciplined by the state where they are licensed.',
      beforeImmigrationCourt: 'They worked on your immigration court case, so the immigration court system’s disciplinary counsel can also review it.',
      maybeImmigrationCourt: 'If they worked on a case in immigration court, the immigration court system’s disciplinary counsel can also review it.',
      accreditedByEoir: 'Accredited representatives are approved and disciplined by the Department of Justice (EOIR).',
      nonLawyerScam: 'State attorneys general and the FTC handle scams and fraud, including notario fraud.',
      consumerFraud: 'Problems with money or false statements may also be consumer fraud.',
      freeFormsFraud: 'Charging for free government forms is a common immigration scam.',
      unauthorizedPractice: 'The Department of Justice (EOIR) takes reports about people who practice immigration law without being allowed to.',
      ifLawyer: 'If you find out they are a lawyer, you can also report to the state that licensed them.',
      ifLawyerOrAccredited: 'If you find out they are a lawyer or accredited representative, you can also report to EOIR’s disciplinary counsel.',
    },
    authorities: {
      stateDiscipline: {
        name: 'State lawyer discipline office (grievance committee / disciplinary counsel)',
        what: 'Investigates complaints about lawyers licensed in that state.',
        how: [
          'Find the office for the state where the lawyer is licensed in the American Bar Association’s directory of state disciplinary agencies.',
          'Use that office’s complaint form. Most have an online form or a form to print and mail.',
        ],
        linkLabel: 'Directory of state lawyer discipline offices (American Bar Association)',
      },
      eoirDiscipline: {
        name: 'Department of Justice, EOIR — Disciplinary Counsel',
        what: 'Investigates complaints about lawyers and accredited representatives who practice before the immigration courts and the Board of Immigration Appeals.',
        how: [
          'Use Form EOIR-44 (Immigration Practitioner Complaint Form). It is free and available in English and Spanish.',
          'Send it by email to EOIR.Attorney.Discipline@usdoj.gov, or by mail to the address on the form.',
        ],
        linkLabel: 'Form EOIR-44 (English)',
        link2Label: 'Formulario EOIR-44 (español)',
      },
      eoirFraud: {
        name: 'Department of Justice, EOIR — Fraud and Abuse Prevention Program',
        what: 'Takes reports about immigration scams, notario fraud and people practicing immigration law without being allowed to.',
        how: ['Read how to report on the program’s page.', 'You can email a report to EOIR.Fraud.Program@usdoj.gov.'],
        linkLabel: 'EOIR Fraud and Abuse Prevention Program',
      },
      stateAG: {
        name: 'State attorney general (consumer protection)',
        what: 'Handles consumer fraud and scams in the state. Many states have laws against notario fraud.',
        how: ['Find your state’s attorney general in the national directory, then use their consumer complaint form.'],
        linkLabel: 'Find your state attorney general (NAAG directory)',
      },
      ftc: {
        name: 'Federal Trade Commission (FTC)',
        what: 'Collects reports about scams, including notario and immigration scams, and shares them with law enforcement.',
        how: ['Report online at ReportFraud.ftc.gov (Spanish: ReporteFraude.ftc.gov).', 'You can give as much or as little information as you want.'],
        linkLabel: 'ReportFraud.ftc.gov',
        link2Label: 'ReporteFraude.ftc.gov (español)',
      },
    },
    stateAgFor: (state) => `Look for ${state} in the directory.`,
    summaryTitle: 'Your summary',
    summaryIntro: [
      'Copy this and paste it into the complaint form, where it asks you to describe what happened.',
      'Read it carefully first and change anything that is not exactly right. Only include facts you know are true.',
    ],
    summaryLang: 'Write the summary in:',
    summaryEdit: 'You can edit the summary here before copying it.',
    beforeYouFile: [
      'Complaint forms usually ask for your name and contact information.',
      'If you are worried about how filing a complaint could affect you or your case, talk to a free legal service provider first.',
      'Filing a complaint does not fix your immigration case by itself. Talk to free legal help about your case.',
      'Keep copies of everything you send.',
    ],
  },


};

const es: ToolsText = {
  nav: { notice: 'Leer un aviso', check: 'Revisar un representante', report: 'Reportar un problema' },
  draftBadge: 'BORRADOR — requiere revisión de un abogado',
  draftNotice: 'Esta página es un borrador. Su texto todavía no lo ha revisado un abogado y puede cambiar.',
  infoNotAdvice:
    'Esto es información legal, no asesoría legal. LexCourt no es un bufete de abogados y no puede decirle qué hacer en su situación. Para recibir consejo, hable con un abogado o un representante acreditado.',
  copy: 'Copiar',
  copied: 'Copiado',
  copyFailed: 'No se pudo copiar. Seleccione el texto y cópielo usted.',
  openNewTab: '(se abre en una pestaña nueva)',

  check: {
    title: 'Revise a su abogado o representante',
    intro: [
      'Con muy pocas excepciones, solo dos tipos de personas pueden darle asesoría legal sobre inmigración o representarle en la corte de inmigración:',
      '1. Un abogado con licencia de un estado de EE. UU. y autorizado para ejercer.',
      '2. Un representante acreditado: una persona aprobada por el Departamento de Justicia de EE. UU. que trabaja en una organización sin fines de lucro reconocida.',
      'Los “notarios”, los notarios públicos, los “consultores de inmigración” y los agentes de viajes no son abogados. No pueden darle asesoría legal ni representarle.',
    ],
    nameLabel: 'Su nombre (opcional)',
    nameHint: 'Como aparece en su tarjeta, contrato o recibo.',
    namePrivacy: 'El nombre se queda en este dispositivo. LexCourt no hace la búsqueda por usted, así que no se envía nada. Usted buscará en las listas oficiales.',
    roleLabel: '¿Qué dice que es?',
    roles: { lawyer: 'Abogado', accredited: 'Representante acreditado', notario: 'Notario, consultor u otro', unsure: 'No estoy seguro' },
    stateLabel: 'Estado donde dice tener licencia',
    statePlaceholder: 'Elija un estado',
    stepsTitle: (name) => `Cómo revisar a ${name}`,
    someone: 'esta persona',
    findTip:
      'Consejo: estas listas son largas. Use “Buscar en la página” para encontrar el nombre (en el teléfono, está en el menú del navegador o en el menú de compartir; en la computadora, presione Ctrl+F o ⌘+F).',
    lawyerSteps: {
      askBar: 'Pídale su número de colegiado (“bar number”) y el estado que le dio la licencia. Un abogado de verdad se lo dirá.',
      stateLookup: (state) => `Búsquelo en el buscador oficial de abogados de ${state}. Revise que su estado diga que está activo o autorizado para ejercer.`,
      stateLookupGeneric:
        'Búsquelo en el buscador oficial de abogados del estado que le dio la licencia. Cada estado tiene el suyo. Puede encontrar la oficina que regula a los abogados de su estado en el directorio de la American Bar Association.',
      stateLookupLink: 'Buscador oficial de abogados',
      abaLink: 'Directorio de oficinas estatales que regulan a los abogados (American Bar Association)',
      whatToSee: 'Revise que el nombre coincida, que pueda ejercer ahora y si tiene sanciones disciplinarias públicas.',
    },
    accreditedSteps: {
      askOrg: 'Pregúntele en qué organización reconocida trabaja. Los representantes acreditados solo pueden ayudarle a través de esa organización.',
      roster: 'Busque su nombre y la organización en la lista del Departamento de Justicia (EOIR) de organizaciones reconocidas y representantes acreditados.',
      rosterLink: 'Lista de EOIR de organizaciones reconocidas y representantes acreditados',
      fullVsPartial:
        'La lista indica acreditación “completa” (full) o “parcial” (partial). Solo los representantes con acreditación completa pueden representarle en la corte de inmigración. La acreditación parcial es solo para el Departamento de Seguridad Nacional (por ejemplo, USCIS).',
    },
    disciplineSteps: {
      current:
        'Revise la lista del Departamento de Justicia de profesionales sancionados actualmente. Las personas en esta lista pueden no estar autorizadas para representarle en la corte de inmigración.',
      currentLink: 'Lista de EOIR de profesionales sancionados actualmente',
      previous: 'También puede revisar la lista de personas que fueron sancionadas en el pasado.',
      previousLink: 'Lista de EOIR de profesionales sancionados anteriormente',
    },
    notarioExplain: [
      'Un notario, notario público o consultor de inmigración no es abogado. En Estados Unidos, un notario público solo puede servir de testigo de firmas. No puede darle asesoría legal, escoger formularios por usted ni representarle.',
      'Si hizo alguna de estas cosas, o tomó su dinero, puede reportarlo. Revise también las señales de alerta abajo.',
    ],
    notFound:
      'Si no lo encuentra, puede ser que el nombre esté escrito diferente, o que no esté autorizado para ejercer. No pague ni firme nada hasta confirmar quién es. La ayuda legal gratuita puede revisarlo con usted.',
    signsTitle: 'Señales de alerta de fraude de notarios',
    signsIntro: 'Marque las que le pasaron. Sus respuestas se quedan en este dispositivo.',
    signs: [
      'Dice que es “notario”, “notario público”, “consultor de inmigración” o “especialista en inmigración”.',
      'No puede o no quiere mostrar una licencia de abogado ni prueba de acreditación del Departamento de Justicia.',
      'Le promete que va a ganar, o dice que tiene contactos especiales en inmigración o en la corte.',
      'Le cobra por formularios del gobierno en blanco. Los formularios de inmigración se pueden descargar gratis del gobierno.',
      'Le pide firmar formularios en blanco, o formularios con información que no es cierta.',
      'Se queda con sus documentos originales, como su pasaporte o acta de nacimiento.',
      'No le da un contrato por escrito ni recibos, o solo acepta efectivo.',
      'No le da copias de lo que presentó por usted.',
      'Le presiona para decidir rápido, o le dice que lo mantenga en secreto.',
      'Le dice que no necesita ir a su audiencia.',
      'Presenta solicitudes por usted que usted no entiende, o le promete un permiso de trabajo o una green card solo por pagar.',
      'No lo encuentra en ninguna lista oficial de abogados o representantes acreditados.',
    ],
    signsNone: 'Si no le pasó ninguna, es una buena señal, pero revíselo de todos modos en las listas oficiales de arriba.',
    signsSome: (n) =>
      `Marcó ${n} señal${n === 1 ? '' : 'es'} de alerta. Son señales comunes de fraude de notarios. No pague más dinero ni firme nada más hasta recibir consejo de un abogado o un representante acreditado.`,
    signsAction: 'Puede recibir ayuda legal gratuita y puede reportar lo que pasó.',
    goReport: 'Reportar un problema',
    getHelp: 'Buscar ayuda legal gratuita',
  },

  report: {
    title: 'Reportar un problema con un abogado, representante o notario',
    intro: [
      'Conteste unas preguntas. LexCourt le mostrará qué oficinas normalmente atienden este tipo de problema, le dará enlaces a sus formularios oficiales de queja y le ayudará a escribir un resumen claro.',
    ],
    neverSubmit: 'LexCourt nunca envía ni presenta nada. Usted decide si presenta una queja, y la presenta usted mismo en el sitio oficial. Sus respuestas se quedan en este dispositivo y se borran al cerrar la página.',
    stepOf: (n, total) => `Paso ${n} de ${total}`,
    next: 'Siguiente',
    back: 'Atrás',
    startOver: 'Empezar de nuevo',
    whoQ: '¿Con quién es el problema?',
    who: {
      lawyer: 'Un abogado',
      accredited: 'Un representante acreditado (trabaja en una organización sin fines de lucro)',
      nonlawyer: 'Un notario, consultor de inmigración u otra persona que no es abogado',
      unsure: 'No estoy seguro',
    },
    issuesQ: '¿Qué pasó?',
    issuesHint: 'Elija todas las que apliquen.',
    issues: {
      fakeLawyer: 'Dijo que era abogado o que podía representarme, pero no lo es',
      falseStatements: 'Me mintió, o puso información falsa en mis formularios o en la corte',
      freeForms: 'Me cobró por formularios o servicios que son gratis',
      tookMoney: 'Tomó mi dinero y no hizo el trabajo',
      missedDeadline: 'No cumplió una fecha límite o faltó a una audiencia de mi caso',
      keptDocuments: 'Se quedó con mis documentos o no me los devuelve',
      other: 'Otra cosa',
    },
    courtQ: '¿Trabajó en un caso suyo en la corte de inmigración?',
    courtHint: 'Por ejemplo, fue con usted a una audiencia, o presentó papeles en la corte de inmigración o en la Junta de Apelaciones de Inmigración.',
    court: { yes: 'Sí', no: 'No', unsure: 'No estoy seguro' },
    stateQ: '¿En qué estado pasó esto?',
    stateHint: 'Esto ayuda a mostrar las oficinas estatales correctas.',
    statePlaceholder: 'Elija un estado',
    detailsQ: 'Datos para su resumen (opcional)',
    detailsHint:
      'Llene lo que sepa. Puede dejar cualquier campo en blanco. Escriba solo cosas que sabe que son ciertas. Esto se queda en este dispositivo; LexCourt lo usa solo para escribir el resumen de abajo.',
    fields: {
      name: 'Su nombre',
      business: 'Nombre del negocio u oficina',
      contact: 'Su dirección, teléfono o sitio web',
      dates: 'Cuándo pasó',
      amountPaid: 'Cuánto pagó y cómo',
      story: 'Qué pasó, en sus propias palabras',
      documents: 'Papeles que tiene (recibos, contrato, mensajes)',
    },
    fieldPlaceholders: {
      name: 'Ejemplo: Juan Pérez',
      business: 'Ejemplo: Pérez Immigration Services',
      contact: 'Ejemplo: 100 Main St, Houston, TX · (555) 555-0100',
      dates: 'Ejemplo: de marzo a junio de 2026',
      amountPaid: 'Ejemplo: $1,500 en efectivo, sin recibo',
      story: 'Ejemplo: Dijo que era abogado y que iba a presentar mi caso de asilo. No lo presentó y dejó de contestar mis llamadas.',
      documents: 'Ejemplo: un recibo y mensajes de texto',
    },
    seeResults: 'Ver dónde reportar',
    resultsTitle: 'Dónde puede reportar esto',
    urgentTitle: 'Si tiene una audiencia o una fecha límite pronto',
    urgent: [
      'Vaya de todos modos a su audiencia. Faltar puede resultar en una orden de remoción (deportación).',
      'Revise la fecha de su audiencia con la corte: acis.eoir.justice.gov o 1-800-898-7180.',
      'Busque ayuda legal gratuita ahora. Algunos problemas causados por un representante se pueden corregir, pero hay plazos estrictos.',
    ],
    whereTitle: 'Oficinas que normalmente atienden esto',
    whereIntro:
      'Según sus respuestas, estas oficinas pueden investigar lo que pasó. La oficina correcta depende de los hechos; una oficina puede enviar su queja a otra.',
    primary: 'Empiece aquí',
    also: 'También puede reportar a',
    whyShown: 'Por qué aparece:',
    reasons: {
      licensedLawyer: 'Los abogados reciben su licencia y sus sanciones del estado donde tienen licencia.',
      beforeImmigrationCourt: 'Trabajó en su caso en la corte de inmigración, así que la oficina disciplinaria del sistema de cortes de inmigración también puede revisarlo.',
      maybeImmigrationCourt: 'Si trabajó en un caso en la corte de inmigración, la oficina disciplinaria del sistema de cortes de inmigración también puede revisarlo.',
      accreditedByEoir: 'Los representantes acreditados son aprobados y sancionados por el Departamento de Justicia (EOIR).',
      nonLawyerScam: 'Los fiscales generales estatales y la FTC atienden estafas y fraudes, incluido el fraude de notarios.',
      consumerFraud: 'Los problemas de dinero o de declaraciones falsas también pueden ser fraude al consumidor.',
      freeFormsFraud: 'Cobrar por formularios gratuitos del gobierno es una estafa de inmigración común.',
      unauthorizedPractice: 'El Departamento de Justicia (EOIR) recibe reportes sobre personas que ejercen la ley de inmigración sin estar autorizadas.',
      ifLawyer: 'Si descubre que es abogado, también puede reportarlo al estado que le dio la licencia.',
      ifLawyerOrAccredited: 'Si descubre que es abogado o representante acreditado, también puede reportarlo a la oficina disciplinaria de EOIR.',
    },
    authorities: {
      stateDiscipline: {
        name: 'Oficina estatal de disciplina de abogados (comité de quejas / fiscal disciplinario)',
        what: 'Investiga quejas sobre abogados con licencia en ese estado.',
        how: [
          'Busque la oficina del estado donde el abogado tiene licencia en el directorio de oficinas disciplinarias estatales de la American Bar Association.',
          'Use el formulario de queja de esa oficina. La mayoría tiene un formulario por internet o uno para imprimir y enviar por correo.',
        ],
        linkLabel: 'Directorio de oficinas estatales de disciplina de abogados (American Bar Association)',
      },
      eoirDiscipline: {
        name: 'Departamento de Justicia, EOIR — Oficina Disciplinaria (Disciplinary Counsel)',
        what: 'Investiga quejas sobre abogados y representantes acreditados que ejercen ante las cortes de inmigración y la Junta de Apelaciones de Inmigración.',
        how: [
          'Use el Formulario EOIR-44 (Formulario de queja contra profesionales de inmigración). Es gratis y está en inglés y en español.',
          'Envíelo por correo electrónico a EOIR.Attorney.Discipline@usdoj.gov, o por correo a la dirección que aparece en el formulario.',
        ],
        linkLabel: 'Form EOIR-44 (inglés)',
        link2Label: 'Formulario EOIR-44 (español)',
      },
      eoirFraud: {
        name: 'Departamento de Justicia, EOIR — Programa de Prevención de Fraude y Abuso',
        what: 'Recibe reportes sobre estafas de inmigración, fraude de notarios y personas que ejercen la ley de inmigración sin estar autorizadas.',
        how: ['Lea cómo reportar en la página del programa.', 'Puede enviar un reporte por correo electrónico a EOIR.Fraud.Program@usdoj.gov.'],
        linkLabel: 'Programa de Prevención de Fraude y Abuso de EOIR (en inglés)',
      },
      stateAG: {
        name: 'Fiscal general del estado (protección al consumidor)',
        what: 'Atiende el fraude al consumidor y las estafas en el estado. Muchos estados tienen leyes contra el fraude de notarios.',
        how: ['Busque al fiscal general de su estado en el directorio nacional y use su formulario de queja del consumidor.'],
        linkLabel: 'Buscar al fiscal general de su estado (directorio de NAAG, en inglés)',
      },
      ftc: {
        name: 'Comisión Federal de Comercio (FTC)',
        what: 'Recibe reportes sobre estafas, incluidas las de notarios e inmigración, y los comparte con las autoridades.',
        how: ['Reporte por internet en ReporteFraude.ftc.gov (en inglés: ReportFraud.ftc.gov).', 'Puede dar tanta o tan poca información como quiera.'],
        linkLabel: 'ReportFraud.ftc.gov (inglés)',
        link2Label: 'ReporteFraude.ftc.gov',
      },
    },
    stateAgFor: (state) => `Busque ${state} en el directorio.`,
    summaryTitle: 'Su resumen',
    summaryIntro: [
      'Copie esto y péguelo en el formulario de queja, donde le pide describir lo que pasó.',
      'Léalo con cuidado primero y cambie cualquier cosa que no sea exacta. Incluya solo hechos que sabe que son ciertos.',
    ],
    summaryLang: 'Escribir el resumen en:',
    summaryEdit: 'Puede editar el resumen aquí antes de copiarlo.',
    beforeYouFile: [
      'Los formularios de queja normalmente piden su nombre y sus datos de contacto.',
      'Si le preocupa cómo una queja podría afectarle a usted o a su caso, hable primero con un proveedor de servicios legales gratuitos.',
      'Presentar una queja no arregla su caso de inmigración por sí solo. Hable con ayuda legal gratuita sobre su caso.',
      'Guarde copias de todo lo que envíe.',
    ],
  },

};

export const TOOLS: Record<Lang, ToolsText> = { en, es, hi: hiTools, pa: paTools, ur: urTools };

/** Text of the complaint summary, in each language the user can choose. */
export const SUMMARY: Record<Lang, SummaryText> = {
    en: {
      heading: 'Summary of complaint',
      person: 'Person',
      business: 'Business',
      contact: 'Their address / phone',
      role: { lawyer: 'says they are a lawyer', accredited: 'says they are an accredited representative', nonlawyer: 'notario / immigration consultant, not a lawyer', unsure: 'I am not sure if they are a lawyer' },
      whatHappened: 'What happened',
      issues: {
        fakeLawyer: 'They said they were a lawyer or could represent me, but they are not.',
        falseStatements: 'They lied to me, or put false information on my forms or in court.',
        freeForms: 'They charged me for forms or services that are free.',
        tookMoney: 'They took my money and did not do the work.',
        missedDeadline: 'They missed a deadline or a hearing in my case.',
        keptDocuments: 'They kept my documents and will not give them back.',
        other: '',
      },
      inMyWords: 'In my own words',
      dates: 'When',
      amountPaid: 'Money paid',
      court: 'Immigration court case',
      courtAnswer: { yes: 'Yes, they worked on my immigration court case', no: 'No', unsure: 'Not sure' },
      state: 'State',
      documents: 'Documents I have',
      closing: 'I am asking you to review this person’s conduct. I can provide copies of my documents.',
    },
    es: {
      heading: 'Resumen de la queja',
      person: 'Persona',
      business: 'Negocio',
      contact: 'Su dirección / teléfono',
      role: { lawyer: 'dice que es abogado', accredited: 'dice que es representante acreditado', nonlawyer: 'notario / consultor de inmigración, no es abogado', unsure: 'no estoy seguro si es abogado' },
      whatHappened: 'Qué pasó',
      issues: {
        fakeLawyer: 'Dijo que era abogado o que podía representarme, pero no lo es.',
        falseStatements: 'Me mintió, o puso información falsa en mis formularios o en la corte.',
        freeForms: 'Me cobró por formularios o servicios que son gratis.',
        tookMoney: 'Tomó mi dinero y no hizo el trabajo.',
        missedDeadline: 'No cumplió una fecha límite o faltó a una audiencia de mi caso.',
        keptDocuments: 'Se quedó con mis documentos y no me los devuelve.',
        other: '',
      },
      inMyWords: 'En mis propias palabras',
      dates: 'Cuándo',
      amountPaid: 'Dinero pagado',
      court: 'Caso en la corte de inmigración',
      courtAnswer: { yes: 'Sí, trabajó en mi caso en la corte de inmigración', no: 'No', unsure: 'No estoy seguro' },
      state: 'Estado',
      documents: 'Documentos que tengo',
      closing: 'Les pido que revisen la conducta de esta persona. Puedo enviar copias de mis documentos.',
    },
  hi: hiSummary,
  pa: paSummary,
  ur: urSummary,
};
