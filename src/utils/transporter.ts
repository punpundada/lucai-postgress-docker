import nodemailer, { type TransportOptions } from "nodemailer";

const obj = {
  host: process.env.SMTP_HOST!,
  port: process.env.SMTP_PORT!,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER!, // generated brevo user
    pass: process.env.SMTP_PASS!, // generated brevo password
  },
};

export const transporter = nodemailer.createTransport(obj as any);
