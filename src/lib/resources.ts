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
  /** EOIR Respondent Access: file Form EOIR-33/IC (change of address) online, no account needed. */
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
};
