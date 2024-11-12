import request from 'supertest';
import express from 'express';
import emailRoutes from '../../src/routes/emailRoutes';
import { sendDefaultEmail } from '../../src/controllers/emailController';
import jwt from 'jsonwebtoken';

// Mocking the sendDefaultEmail function to prevent sending actual emails during tests
jest.mock('../../src/controllers/emailController', () => ({
  sendDefaultEmail: jest.fn(),
}));

// Mocking jwt.verify to avoid real token verification logic
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Setting up a mock Express app for testing the routes
const app = express();
app.use(express.json()); // Middleware to parse JSON in request bodies
app.use('/email', emailRoutes); // Register the email routes to the app

describe('Email Routes', () => {
  // Grouping tests for the POST /send-default-email route
  describe('POST /send-default-email', () => {

    // Test Case 1: Test that requests without a token are blocked
    it('should block unauthorized requests (no token)', async () => {
      // Sending a request without Authorization header
      const response = await request(app)
        .post('/email/send-default-email')
        .send({
          subject: 'Test Subject',
          body: 'Test body',
          recipients: [{ email: 'test@example.com', firstName: 'John' }],
        });

      // Assertions:
      // Status should be 401 (Unauthorized)
      expect(response.status).toBe(401);
      // The error message should indicate that no token was provided
      expect(response.body.message).toBe('No token, authorization denied');
    });

    // Test Case 2: Test that requests with an invalid token are blocked
    it('should block requests with invalid token', async () => {
      // Mock jwt.verify to throw an error when an invalid token is used
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/email/send-default-email')
        .set('Authorization', 'Bearer invalid_token') // Pass an invalid token
        .send({
          subject: 'Test Subject',
          body: 'Test body',
          recipients: [{ email: 'test@example.com', firstName: 'John' }],
        });

      // Assertions:
      expect(response.status).toBe(401); // Unauthorized status
      expect(response.body.message).toBe('Token is not valid'); // Error message
    });

    // Test Case 3: Test that requests with a valid token are allowed
    it('should allow authorized requests (valid token)', async () => {
      // Mock jwt.verify to return a valid payload (i.e., token is verified)
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({ id: '123' }));

      const response = await request(app)
        .post('/email/send-default-email')
        .set('Authorization', 'Bearer valid_token') // Pass a valid token
        .send({
          subject: 'Test Subject',
          body: 'Test body',
          recipients: [{ email: 'test@example.com', firstName: 'John' }],
        });

      // Assertions:
      expect(response.status).toBe(200); // Status OK
      expect(response.body.message).toBe('Emails sent successfully'); // Success message
    });

    // Test Case 4: Test missing required fields (subject, recipients)
    it('should handle missing required fields (subject, recipients)', async () => {
      const response = await request(app)
        .post('/email/send-default-email')
        .set('Authorization', 'Bearer valid_token')
        .send({
          subject: '', // Missing subject
          body: 'Test body',
          recipients: [], // Missing recipients
        });

      // Assertions:
      expect(response.status).toBe(400); // Bad Request status
      expect(response.body.message).toBe('Missing required fields'); // Error message
    });

    // Test Case 5: Test that sendDefaultEmail is called with correct data
    it('should call sendDefaultEmail service with correct data (mocked)', async () => {
      const mockSendDefaultEmail = sendDefaultEmail as jest.Mock;
      mockSendDefaultEmail.mockResolvedValueOnce({ messageId: '1' });

      // Mock jwt.verify to return a decoded payload (token verification success)
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({ id: '123' }));

      const response = await request(app)
        .post('/email/send-default-email')
        .set('Authorization', 'Bearer valid_token')
        .send({
          subject: 'Test Subject',
          body: 'Test body {{firstName}}', // Template string with placeholder
          recipients: [{ email: 'test@example.com', firstName: 'John' }],
        });

      // Assertions:
      // Ensure sendDefaultEmail was called with the correct parameters:
      // - recipient email
      // - subject
      // - personalized body with the 'firstName' value replaced in the body
      expect(response.status).toBe(200); // OK status
      expect(mockSendDefaultEmail).toHaveBeenCalledWith(
        'test@example.com', // recipient's email
        'Test Subject', // subject
        'Test body John', // personalized body
        'John' // firstName (extracted from the recipient data)
      );
    });

    // Test Case 6: Test error handling when sendDefaultEmail fails
    it('should handle errors when sendDefaultEmail fails', async () => {
      const mockSendDefaultEmail = sendDefaultEmail as jest.Mock;
      mockSendDefaultEmail.mockRejectedValueOnce(new Error('Send failure'));

      // Mock jwt.verify to return a decoded payload (token verification success)
      (jwt.verify as jest.Mock).mockImplementationOnce(() => ({ id: '123' }));

      const response = await request(app)
        .post('/email/send-default-email')
        .set('Authorization', 'Bearer valid_token')
        .send({
          subject: 'Test Subject',
          body: 'Test body',
          recipients: [{ email: 'test@example.com', firstName: 'John' }],
        });

      // Assertions:
      expect(response.status).toBe(500); // Internal Server Error status
      expect(response.body.message).toBe('Error sending emails'); // Error message
    });
  });
});
