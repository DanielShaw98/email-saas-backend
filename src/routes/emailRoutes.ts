import express, { Request, Response } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { sendDefaultEmail } from '../controllers/emailController';

const router = express.Router();

router.post('/send-default-email', authMiddleware, async (req: Request, res: Response) => {
  const { subject, body, recipients } = req.body;

  if (!subject || !recipients || recipients.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    for (const recipient of recipients) {
      const personalisedBody = body ? body.replace('{{firstName}}', recipient.firstName) : undefined;
      await sendDefaultEmail(recipient.email, subject, personalisedBody, recipient.firstName);
    }
    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending emails' });
  }
});

export default router;
