/**
 * Mailer — thin wrapper around nodemailer.
 * Credentials are loaded from environment variables set in .env
 * (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME).
 *
 * Install:  npm install nodemailer @types/nodemailer
 */

import nodemailer from 'nodemailer';
import { type SmtpConfig } from '@/lib/otp/auth-provider-settings';
import { winbackDay3Email, type WinbackLang } from '@/lib/emailTemplates/winbackDay3';

function normalizeSmtpPass(host: string | undefined, pass: string): string {
  return host?.includes('gmail') ? pass.replace(/\s+/g, '') : pass;
}

/** Vercel env (SMTP_HOST + SMTP_USER + SMTP_PASS) is the source of truth; it wins over the admin-saved DB config. */
function envSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport(cfg?: SmtpConfig) {
  if (!envSmtpConfigured() && cfg && cfg.host) {
    return nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
    });
  }
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   ?? 'smtp.hostinger.com',
    port:   Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER ?? '',
      // Google shows app passwords as 4 groups of 4 letters; the real value has no spaces.
      pass: normalizeSmtpPass(process.env.SMTP_HOST, process.env.SMTP_PASS ?? ''),
    },
  });
}

/** Send a 4-digit OTP to the given address. */
export async function sendOtpEmail(to: string, otp: string, cfg?: SmtpConfig): Promise<void> {
  let fromName    = process.env.SMTP_FROM_NAME ?? 'RamzGo';
  let fromAddress = process.env.SMTP_USER      ?? 'help@ramz.tj';

  if (!envSmtpConfigured() && cfg && cfg.host) {
    fromName = cfg.fromName || fromName;
    fromAddress = cfg.user || fromAddress;
  }

  const year = new Date().getFullYear();
  const digits = otp.split('');
  const codeCells = digits
    .map(
      (d) =>
        `<td style="padding:0 5px;"><div style="width:56px;height:68px;line-height:68px;text-align:center;font-size:34px;font-weight:800;color:#1A1A2E;background:#FFFFFF;border:2px solid #C89B3C;border-radius:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${d}</div></td>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="tg">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>Коди тасдиқи RamzGo</title>
</head>
<body style="margin:0;padding:0;background:#F3F1EA;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Коди тасдиқи шумо: ${otp}. Муҳлати амал 5 дақиқа.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F1EA;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:100%;max-width:480px;background:#FFFFFF;border-radius:24px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <tr>
        <td align="center" style="background:#1A1A2E;padding:34px 24px 30px;">
          <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:16px;background:#C89B3C;color:#1A1A2E;font-size:28px;font-weight:900;text-align:center;">R</div>
          <div style="margin-top:14px;color:#FFFFFF;font-size:26px;font-weight:800;letter-spacing:0.5px;">RamzGo</div>
          <div style="margin-top:6px;color:#E7C578;font-size:13px;letter-spacing:0.4px;">Забонро тез ва кафолатнок омӯзед</div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:36px 28px 8px;">
          <div style="color:#0F1533;font-size:20px;font-weight:700;margin-bottom:8px;">Коди тасдиқи шумо</div>
          <div style="color:#5A628A;font-size:14px;line-height:1.6;">Барои ворид шудан ба RamzGo ин кодро дар барнома ворид кунед:</div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:22px 16px 10px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>${codeCells}</tr></table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:14px 28px 4px;">
          <div style="display:inline-block;background:#FBF5E6;color:#7A5A12;font-size:13px;font-weight:600;padding:8px 16px;border-radius:999px;">Муҳлати амал: 5 дақиқа</div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:22px 32px 34px;">
          <div style="color:#9AA1C0;font-size:12.5px;line-height:1.7;">Ин кодро ба ҳеҷ кас нагӯед.<br/>Агар шумо ин дархостро нафиристода бошед, ин паёмро нодида гиред.</div>
        </td>
      </tr>
      <tr>
        <td align="center" style="background:#FAFAFC;border-top:1px solid #EDEDF2;padding:18px 24px;color:#9AA1C0;font-size:12px;">© ${year} RamzGo</td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const transport = createTransport(cfg);
  await transport.sendMail({
    from:    `"${fromName}" <${fromAddress}>`,
    to,
    subject: 'Коди тасдиқи шумо — RamzGo',
    html,
  });
}

/** Send the "3 days away" win-back email (see lib/emailTemplates/winbackDay3.ts). */
export async function sendWinbackDay3Email(
  to: string,
  params: { name: string; lang?: WinbackLang; unsubscribeUrl?: string },
  cfg?: SmtpConfig,
): Promise<void> {
  let fromName    = process.env.SMTP_FROM_NAME ?? 'RamzGo';
  let fromAddress = process.env.SMTP_USER      ?? 'help@ramz.tj';
  if (!envSmtpConfigured() && cfg && cfg.host) {
    fromName = cfg.fromName || fromName;
    fromAddress = cfg.user || fromAddress;
  }
  const { subject, html } = winbackDay3Email(params);
  const transport = createTransport(cfg);
  await transport.sendMail({ from: `"${fromName}" <${fromAddress}>`, to, subject, html });
}
