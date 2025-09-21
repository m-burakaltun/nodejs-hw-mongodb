import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;

export const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465, // 465 -> SSL, 587 -> STARTTLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export async function sendMail({ to, subject, text, html }) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new Error('SMTP env vars are missing');
  }

  try {
    const info = await mailer.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ SMTP SEND ERROR ->', {
      message: err?.message,
      code: err?.code,
      command: err?.command,
      response: err?.response,
      responseCode: err?.responseCode,
    });
    throw err;
  }
}
