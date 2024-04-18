import nodemailer from 'nodemailer';
import { emailData } from './email_data.type';
import 'dotenv/config';
import { Logger } from '../shared/logger';

export class MailerService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  async sendMail(data: emailData) {
    try {
      const info = await this.transporter.sendMail({
        from: 'info@cipo.kz',
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
      });
      return { data: info };
    } catch (error) {
      Logger.error(error);
      return { error: error };
    }
  }
}
