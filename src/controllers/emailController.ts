import { sendEmail } from '../services/emailService';
import { defaultTemplate } from '../config/emailTemplate';

export const sendDefaultEmail = async (email: string, subject: string, body?: string, firstName?: string) => {
  try {
    const html = body || defaultTemplate(firstName || 'there');
    await sendEmail(email, subject, html);
  } catch (error) {
    throw new Error('Error sending email');
  }
};
