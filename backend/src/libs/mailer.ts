import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail, { Attachment } from "nodemailer/lib/mailer";

export class Mailer {
  private transporter: Transporter;

  constructor(options: SMTPTransport.Options) {
    this.transporter = nodemailer.createTransport(options);
  }

  async sendMail(data: {
    from?: string;
    to: string | Mail.Address[] | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments: Attachment[];
  }) {
    return this.transporter.sendMail({
      from: `"No Reply" <noreply@example.com>`,
      ...data,
    });
  }
}
