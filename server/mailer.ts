/**
 * Sending email. Production uses Resend's HTTP API (free tier); development
 * and tests keep messages in memory.
 */
export interface Email {
  to: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
}

export interface Mailer {
  send(email: Email): Promise<void>;
}

export class MemoryMailer implements Mailer {
  outbox: Email[] = [];
  fail = false;
  async send(email: Email) {
    if (this.fail) throw new Error('send_failed');
    this.outbox.push(email);
  }
}

export class ResendMailer implements Mailer {
  constructor(
    private apiKey: string,
    private from: string,
    private fetchFn: typeof fetch = fetch,
  ) {}

  async send(email: Email) {
    const res = await this.fetchFn('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to: [email.to], subject: email.subject, text: email.text, html: email.html, headers: email.headers }),
    });
    if (!res.ok) throw new Error(`send_failed_${res.status}`);
  }
}
