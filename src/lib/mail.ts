import nodemailer from 'nodemailer';

const globalForTransporter = global as unknown as {
  transporter: nodemailer.Transporter | undefined;
};

function createTransporter(): nodemailer.Transporter | undefined {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return undefined;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const transporter: nodemailer.Transporter | undefined =
  globalForTransporter.transporter ?? createTransporter();

if (process.env.NODE_ENV !== 'production' && transporter) {
  globalForTransporter.transporter = transporter;
}