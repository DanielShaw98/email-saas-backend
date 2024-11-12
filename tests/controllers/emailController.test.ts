import { sendDefaultEmail } from '../../src/controllers/emailController';
import { mockRequest, mockResponse } from 'jest-mock-req-res';
import { sendEmail } from '../../src/services/emailService';

// Mock the sendEmail function to avoid actually sending emails during testing
jest.mock('../../src/services/emailService');

describe('Email Controller - sendDefaultEmail', () => {
  // Test Case: Verify that the email is sent with the correct parameters
  it('should send an email with the provided parameters', async () => {
    // Step 1: Mock the incoming request with the necessary body data (email, subject, and firstName)
    const req = mockRequest({
      body: {
        email: 'test@example.com',  // Email to send to
        subject: 'Welcome!',        // Subject of the email
        firstName: 'John'           // First name to personalize the email
      }
    });

    // Step 2: Mock the response object, which will track what gets sent back to the client
    const res = mockResponse();

    // Step 3: Call the sendDefaultEmail function with the mock data
    await sendDefaultEmail(
      req.body.email,      // Passing the email from the request body
      req.body.subject,    // Passing the subject from the request body
      undefined,            // The body will be undefined, implying the default template will be used
      req.body.firstName   // The first name to personalize the email
    );

    // Step 4: Assertion - Verify that the sendEmail function was called with the correct parameters
    // We expect sendEmail to be called with:
    // 1. The recipient email ('test@example.com')
    // 2. The email subject ('Welcome!')
    // 3. The body of the email should contain a personalized greeting (`<h1>Hi John,</h1>`)
    expect(sendEmail).toHaveBeenCalledWith(
      'test@example.com',       // Expected recipient email
      'Welcome!',               // Expected subject
      expect.stringContaining('<h1>Hi John,</h1>')  // Verify the personalized part of the body
    );
  });
});
