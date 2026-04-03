/**
 * Mailer — thin wrapper around nodemailer.
 * Credentials are loaded from environment variables set in .env
 * (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME).
 *
 * Install:  npm install nodemailer @types/nodemailer
 */

import nodemailer from 'nodemailer';
import { type SmtpConfig } from '@/lib/otp/auth-provider-settings';

function createTransport(cfg?: SmtpConfig) {
  if (cfg && cfg.host) {
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
      pass: process.env.SMTP_PASS ?? '',
    },
  });
}

/** Send a 6-digit OTP to the given address. */
export async function sendOtpEmail(to: string, otp: string, cfg?: SmtpConfig): Promise<void> {
  let fromName    = process.env.SMTP_FROM_NAME ?? 'RamzBook';
  let fromAddress = process.env.SMTP_USER      ?? 'noreply@ramzbook.tj';

  if (cfg && cfg.host) {
    fromName = cfg.fromName || fromName;
    fromAddress = cfg.user || fromAddress;
  }

  const html = `
<!DOCTYPE html>
<html lang="tg">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Коди тасдиқ</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
         background:#F8FAFC;margin:0;padding:32px 16px;}
    .card{max-width:460px;margin:0 auto;background:#fff;border-radius:20px;
          overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.07);}
    .header{background:linear-gradient(135deg,#8B0000 0%,#5A0000 100%);
            padding:28px 32px;text-align:center;}
    .header h1{color:#fff;font-size:22px;font-weight:900;margin:0;}
    .header p{color:rgba(255,255,255,.7);font-size:13px;margin:4px 0 0;}
    .body{padding:32px;text-align:center;}
    .label{font-size:11px;font-weight:700;letter-spacing:1.4px;
           color:#94A3B8;text-transform:uppercase;margin-bottom:10px;}
    .otp-box{display:inline-block;background:#FFF1F1;border:2px dashed #8B0000;
             border-radius:14px;padding:16px 36px;margin-bottom:24px;}
    .otp{font-size:40px;font-weight:900;letter-spacing:8px;color:#8B0000;line-height:1;}
    .note{font-size:13px;color:#64748B;line-height:1.6;margin-bottom:20px;}
    .footer{background:#F8FAFC;border-top:1px solid #F1F5F9;
            padding:18px 32px;text-align:center;font-size:11px;color:#94A3B8;}
    .footer a{color:#8B0000;text-decoration:none;font-weight:600;}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>RamzBook</h1>
      <p>Забонро тез ва кафолатнок омӯзед</p>
    </div>
    <div class="body">
      <p class="note">Барои ворид шудан коди зеринро истифода баред:</p>
      <p class="label">Коди тасдиқӣ</p>
      <div class="otp-box"><div class="otp">${otp}</div></div>
      <p class="note">Ин код <strong>5 дақиқа</strong> эътибор дорад.<br/>
         Агар шумо ин дархостро нафиристодед, нодида гиред.</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} RamzBook &middot;
      <a href="mailto:support@ramzbook.tj">support@ramzbook.tj</a>
    </div>
  </div>
</body>
</html>`;

  const transport = createTransport(cfg);
  await transport.sendMail({
    from:    `"${fromName}" <${fromAddress}>`,
    to,
    subject: 'Коди тасдиқи шумо — RamzBook',
    html,
  });
}
