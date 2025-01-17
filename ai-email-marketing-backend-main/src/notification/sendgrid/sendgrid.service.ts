import { Injectable } from '@nestjs/common';
import * as sgMail from "@sendgrid/mail";

@Injectable()
export class SendGridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set your SendGrid API key here or in environment variables
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL, // Your verified SendGrid sender email
      subject,
      text,
      html,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      if (error.response) {
        console.error('SendGrid Response Error:', error.response.body);
      }
      throw new Error('Failed to send email');
    }
  }
}
