import type { Lang } from './i18n';

/**
 * Official and nonprofit resources. Keep every outside link in this one file so
 * they're easy to review and update.
 *
 * Last checked: 2026-11-10, against search-engine indexes of the official sites.
 * The sites themselves were not reachable from the build environment, so open
 * each link once in a browser after changing anything here.
 */

export interface Links {
  /** EOIR Automated Case Information (ACIS): hearing date and case status by A-Number. */
  caseStatus: string;
  /** EOIR case information hotline (English and Spanish). */
  caseStatusPhone: string;
  /** EOIR List of Pro Bono Legal Service Providers, by state and court. */
  proBonoList: string;
  /** Immigration Advocates Network: National Immigration Legal Services Directory (nonprofits). */
  legalDirectory: string;
  /** EOIR Immigration Court Online Resource (ICOR): official plain-language guides. */
  courtGuide: string;
  /** EOIR Respondent Access: file Form EOIR-33/IC (change of address) online. Whether an account is needed is unconfirmed. */
  changeOfAddress: string;
}

const COMMON = {
  caseStatusPhone: '1-800-898-7180',
  proBonoList: 'https://www.justice.gov/eoir/list-pro-bono-legal-service-providers',
  legalDirectory: 'https://www.immigrationadvocates.org/legaldirectory/',
};

export const LINKS: Record<Lang, Links> = {
  en: {
    ...COMMON,
    caseStatus: 'https://acis.eoir.justice.gov/en/',
    courtGuide: 'https://icor.eoir.justice.gov/en/',
    changeOfAddress: 'https://respondentaccess.eoir.justice.gov/en/forms/eoir33ic',
  },
  es: {
    ...COMMON,
    caseStatus: 'https://acis.eoir.justice.gov/es/',
    courtGuide: 'https://icor.eoir.justice.gov/es/',
    changeOfAddress: 'https://respondentaccess.eoir.justice.gov/es/forms/eoir33ic',
  },
  // The court sites are in English and Spanish only, so Hindi, Punjabi and
  // Urdu link to the English pages (the link labels say "in English").
  hi: { ...COMMON, caseStatus: 'https://acis.eoir.justice.gov/en/', courtGuide: 'https://icor.eoir.justice.gov/en/', changeOfAddress: 'https://respondentaccess.eoir.justice.gov/en/forms/eoir33ic' },
  pa: { ...COMMON, caseStatus: 'https://acis.eoir.justice.gov/en/', courtGuide: 'https://icor.eoir.justice.gov/en/', changeOfAddress: 'https://respondentaccess.eoir.justice.gov/en/forms/eoir33ic' },
  ur: { ...COMMON, caseStatus: 'https://acis.eoir.justice.gov/en/', courtGuide: 'https://icor.eoir.justice.gov/en/', changeOfAddress: 'https://respondentaccess.eoir.justice.gov/en/forms/eoir33ic' },
};

/**
 * Links for "Check your representative" and "Report a problem".
 * Last checked: 2026-11-10, against search-engine indexes of the official sites
 * (the sites were not reachable from the build environment). Open each once.
 */
export const OFFICIAL = {
  /** EOIR roster of recognized organizations and accredited representatives. */
  accreditedRoster: 'https://www.justice.gov/eoir/recognition-accreditation-roster-reports',
  /** EOIR List of Currently Disciplined Practitioners. */
  disciplinedList: 'https://www.justice.gov/eoir/discipline.htm',
  /** EOIR List of Previously Disciplined Practitioners. */
  previouslyDisciplinedList: 'https://www.justice.gov/eoir/list-of-previously-disciplined-practitioners',
  /** EOIR Attorney Discipline Program (complaints about lawyers and accredited representatives). */
  eoirDisciplineProgram: 'https://www.justice.gov/eoir/attorney-discipline-program',
  /** Form EOIR-44, Immigration Practitioner Complaint Form. */
  eoir44: { en: 'https://www.justice.gov/eoir/file/eoir44/dl', es: 'https://www.justice.gov/eoir/file/eoir44spanish/download' },
  eoirDisciplineEmail: 'EOIR.Attorney.Discipline@usdoj.gov',
  /** EOIR Fraud and Abuse Prevention Program (scams, notarios, unauthorized practice). */
  eoirFraudProgram: 'https://www.justice.gov/eoir/fraud-and-abuse-prevention-program',
  eoirFraudEmail: 'EOIR.Fraud.Program@usdoj.gov',
  /** FTC fraud reporting (Spanish site available). */
  ftcReport: { en: 'https://reportfraud.ftc.gov/', es: 'https://reportefraude.ftc.gov/' },
  /** NAAG directory of state attorneys general. */
  naagFindAg: 'https://www.naag.org/find-my-ag/',
  /** ABA page linking the Directory of State Disciplinary Agencies (lawyer regulators). */
  abaDisciplineDirectory: 'https://www.americanbar.org/groups/professional_responsibility/resources/lawyer_ethics_regulation.html',
} as const;

export interface StateLookup {
  name: string;
  url: string;
}

/**
 * Official lawyer lookups for the states with the most immigration court cases.
 * Other states: use the ABA directory to find the state's lawyer regulator.
 */
export const STATE_LAWYER_LOOKUPS: Record<string, StateLookup> = {
  CA: { name: 'State Bar of California — Attorney Search', url: 'https://apps.calbar.ca.gov/attorney/LicenseeSearch/QuickSearch' },
  FL: { name: 'The Florida Bar — Find a Lawyer', url: 'https://www.floridabar.org/directories/find-mbr/' },
  IL: { name: 'Illinois ARDC — Lawyer Search', url: 'https://www.iardc.org/' },
  NJ: { name: 'New Jersey State Library — Attorney Search (links to the Judiciary’s Attorney Index)', url: 'https://www.njstatelib.org/research_library/legal_resources/nj_legal_resources/attorney-search' },
  NY: { name: 'New York Courts — Attorney Online Services (Attorney Search)', url: 'https://www.nycourts.gov/attorney-registration/attorney-online-services' },
  TX: { name: 'State Bar of Texas — Find a Lawyer', url: 'https://www.texasbar.com/' },
};

export const US_STATES: [string, string][] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'],
  ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'],
  ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'],
  ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'],
  ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
  ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['PR', 'Puerto Rico'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];
