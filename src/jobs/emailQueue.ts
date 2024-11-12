import Queue from 'bull';
import { sendEmail } from '../services/emailService';

const emailQueue = new Queue('email', {
  redis: { host: '127.0.0.1', port: 6379 },
});

emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  await sendEmail(to, subject, html);
});

export const addEmailJob = (to: string, subject: string, html: string) => {
  emailQueue.add({ to, subject, html });
};

export default emailQueue;
