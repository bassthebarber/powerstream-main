// /studio/utils/mailer.js
import nodemailer from "nodemailer";

export function makeTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendDownloadEmail({ to, subject, text, html, attachments = [] }) {
  const transporter = makeTransport();
  const info = await transporter.sendMail({
    from: `"${process.env.FROM_NAME || "PowerStream Studio"}" <${process.env.FROM_EMAIL}>`,
    to, subject, text, html, attachments
  });
  return info;
}
