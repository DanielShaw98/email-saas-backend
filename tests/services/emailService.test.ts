import { sendEmail } from '../../src/services/emailService';
import nodemailer from 'nodemailer';

// Mock the 'nodemailer' module, specifically the 'createTransport' function.
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),  // We are mocking createTransport to return a mocked version of the transport
}));

describe('Email Service', () => {
  // Test Case 1: Verify that sendEmail correctly sends an email with the provided details
  it('should send an email with the correct details', async () => {
    // Step 1: Create a mock for the sendMail method that resolves with a mocked response
    const sendMailMock = jest.fn().mockResolvedValueOnce({ messageId: '1' });

    // Step 2: Mock 'createTransport' to return an object with our sendMailMock
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    // Step 3: Set the environment variable for the sender's email address
    process.env.EMAIL_USER = 'sender@example.com';

    // Step 4: Define the email details
    const email = 'test@example.com';
    const subject = 'Test Subject';
    const html = '<p>Hello World</p>';

    // Step 5: Call the sendEmail function with the mock email details
    await sendEmail(email, subject, html);

    // Step 6: Assertion - Verify that the sendMailMock was called with the correct email details
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'sender@example.com',  // From the environment variable
      to: email,                   // Recipient email
      subject,                     // Subject of the email
      html,                        // HTML content of the email
    });
  });

  // Test Case 2: Verify that sendEmail throws an error if email sending fails
  it('should throw an error if email sending fails', async () => {
    // Step 1: Create a mock for the sendMail method that rejects with an error
    const sendMailMock = jest.fn().mockRejectedValueOnce(new Error('Send failure'));

    // Step 2: Mock 'createTransport' to return an object with our sendMailMock
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    // Step 3: Assertion - Call sendEmail and expect it to throw an error
    await expect(sendEmail('test@example.com', 'Subject', '<p>Body</p>'))
      .rejects
      .toThrow('Send failure');  // Ensure the correct error message is thrown
  });
});
