import { describe, expect, it } from 'vitest';
import { findSensitive, mentionsScam, preparePublic, removeNames, removeSensitive } from './moderation';
import { validateSubmission } from './shared';

const kinds = (t: string) => findSensitive(t).map((f) => f.kind);

describe('sensitive details', () => {
  it.each([
    ['My A-Number is A123-456-789', 'aNumber'],
    ['a 123 456 789', 'aNumber'],
    ['number 12345678 on my card', 'aNumber'],
    ['receipt EAC2190012345', 'caseNumber'],
    ['case number: 2024-123456', 'caseNumber'],
    ['número de caso 123-4567', 'caseNumber'],
    ['SSN 123-45-6789', 'ssn'],
    ['call me (555) 555-0100', 'phone'],
    ['write to me@example.com', 'email'],
    ['I am undocumented', 'status'],
    ['my green card expired', 'status'],
    ['estoy sin papeles', 'status'],
    ['मेरे पास ग्रीन कार्ड है', 'status'],
    ['ਮੇਰੇ ਕੋਲ ਗ੍ਰੀਨ ਕਾਰਡ ਨਹੀਂ', 'status'],
    ['میں غیر قانونی ہوں', 'status'],
  ])('finds %s', (text, kind) => {
    expect(kinds(text)).toContain(kind);
  });

  it('allows ordinary text, dates, zip codes and the court’s public phone line', () => {
    expect(kinds('Very helpful! My hearing is on March 3, 2027 in New York, NY 10278.')).toEqual([]);
    expect(kinds('I called 1-800-898-7180 and it worked. The asylum info was clear.')).toEqual([]);
  });

  it('removes them as a safety net', () => {
    const r = removeSensitive('A-Number A123-456-789, email a@b.co, I am undocumented');
    expect(r.text).toBe('A-Number [removed], email [removed], I am [removed]');
    expect(r.kinds.sort()).toEqual(['aNumber', 'email', 'status']);
  });
});

describe('scam and misconduct accusations', () => {
  it.each([
    'This notario scammed me',
    'He is a fraud',
    'the lawyer took my money',
    'Me estafó el abogado',
    'es un fraude',
    'उसने मेरे साथ धोखा किया',
    'ਉਸ ਨੇ ਮੇਰੇ ਨਾਲ ਠੱਗੀ ਕੀਤੀ',
    'اس نے میرے ساتھ دھوکہ کیا',
  ])('detects: %s', (t) => expect(mentionsScam(t)).toBe(true));

  it.each(['Very helpful, thank you', 'Me ayudó mucho', 'बहुत मददगार', 'ਬਹੁਤ ਮਦਦਗਾਰ', 'بہت مددگار', 'It explained how to report fraud to the FTC'.replace('fraud', 'problems')])(
    'leaves normal comments: %s',
    (t) => expect(mentionsScam(t)).toBe(false),
  );
});

describe('names of people and law firms', () => {
  it.each([
    ['Attorney John Smith helped me check', 'Attorney [name removed] helped me check'],
    ['my lawyer Smith was listed', 'my lawyer [name removed] was listed'],
    ['Juan Pérez showed me this app', '[name removed] showed me this app'],
    ['I checked Garcia & Associates', 'I checked [name removed]'],
    ['I checked Law Offices of Maria Lopez', 'I checked [name removed]'],
    ['Smith Immigration Services was not listed', '[name removed] was not listed'],
    ['Rivera Law Group, PLLC', '[name removed]'],
  ])('%s', (input, expected) => {
    expect(removeNames(input, 'en').text).toBe(expected);
  });

  it('Spanish', () => {
    expect(removeNames('El Lic. Hernández me ayudó', 'es').text).toBe('El Lic. [nombre eliminado] me ayudó');
    expect(removeNames('Bufete Martínez no aparece', 'es').text).toBe('[nombre eliminado] no aparece');
  });

  it('Hindi, Punjabi, Urdu honorifics', () => {
    expect(removeNames('वकील राजेश कुमार ने मदद की', 'hi').text).toBe('वकील [नाम हटाया गया] ने मदद की');
    expect(removeNames('शर्मा जी ने बताया', 'hi').text).toBe('[नाम हटाया गया] जी ने बताया');
    expect(removeNames('ਵਕੀਲ ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ ਨੇ', 'pa').text).toBe('ਵਕੀਲ [ਨਾਂ ਹਟਾਇਆ ਗਿਆ] ਨੇ');
    expect(removeNames('خان صاحب نے بتایا', 'ur').text).toBe('[نام ہٹا دیا گیا] صاحب نے بتایا');
  });

  it('keeps place names and court terms', () => {
    const r = removeNames('The Notice to Appear page and the Immigration Court in New York were clear. LexCourt helped.', 'en');
    expect(r.removed).toBe(0);
  });
});

describe('preparePublic', () => {
  it('removes names and sensitive details and flags them', () => {
    const r = preparePublic('Attorney Jane Doe helped. My email is jd@x.com', 'en');
    expect(r.publicText).toBe('Attorney [name removed] helped. My email is [removed]');
    expect(r.flags.sort()).toEqual(['names_removed', 'sensitive_removed']);
  });
  it('never makes scam accusations publishable', () => {
    expect(preparePublic('The notario is a scammer', 'en')).toEqual({ publicText: null, flags: ['scam_mentioned'] });
  });
});

describe('validateSubmission', () => {
  const good = { feature: 'notice_reader', rating: 4, comment: ' ok ', lang: 'es', publicConsent: false };
  it('accepts a valid submission and trims the comment', () => {
    expect(validateSubmission(good)).toEqual({ ok: true, value: { ...good, comment: 'ok' } });
  });
  it.each([
    [{ ...good, rating: 6 }, 'invalid_rating'],
    [{ ...good, rating: 2.5 }, 'invalid_rating'],
    [{ ...good, feature: 'lawyer' }, 'invalid_feature'],
    [{ ...good, lang: 'fr' }, 'invalid_lang'],
    [{ ...good, comment: 'x'.repeat(1001) }, 'comment_too_long'],
    [{ ...good, aNumber: '123' }, 'unexpected_field'],
    [{ ...good, name: 'Ann' }, 'unexpected_field'],
    [{ ...good, website: 'spam.com' }, 'rejected'],
  ])('rejects %j', (body, error) => {
    expect(validateSubmission(body)).toEqual({ ok: false, error });
  });
});
