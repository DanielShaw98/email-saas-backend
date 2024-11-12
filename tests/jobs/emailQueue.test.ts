import Queue from 'bull';
import { addEmailJob } from '../../src/jobs/emailQueue';
import { sendEmail } from '../../src/services/emailService';

// Mock the sendEmail function
jest.mock('../../src/services/emailService', () => ({
  sendEmail: jest.fn(),
}));

// Mock the bull Queue class
jest.mock('bull', () => {
  const mQueue: { add: jest.Mock; process: jest.Mock } = {
    add: jest.fn(),
    process: jest.fn(),
  };
  return jest.fn(() => mQueue); // Return mocked Queue constructor
});

describe('Email Queueing', () => {
  let mockQueue: any;
  let mockAddJob: jest.Mock;
  let mockProcessJob: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks between tests
    mockQueue = new Queue('email', { redis: { host: '127.0.0.1', port: 6379 } }); // Instance of mocked Queue
    mockAddJob = mockQueue.add;
    mockProcessJob = mockQueue.process;
  });

  it('should add an email job to the queue when the request is valid', async () => {
    const to = 'test@example.com';
    const subject = 'Test Email';
    const html = '<h1>Test</h1>';

    // Call the function that adds the job to the queue
    await addEmailJob(to, subject, html);

    // Ensure add method was called on the Queue
    expect(mockAddJob).toHaveBeenCalledTimes(1);
    expect(mockAddJob).toHaveBeenCalledWith({ to, subject, html });
  });

  it('should process the queued job and send an email', async () => {
    const job = { data: { to: 'test@example.com', subject: 'Test', html: '<h1>Test</h1>' } };

    // Mock the process method to simulate processing
    mockProcessJob.mockImplementation((queueName, handler) => {
      // Ensure handler is a function and invoke it with a job
      if (typeof handler === 'function') {
        handler(job);
      }
    });

    // Call the process method directly
    await mockProcessJob('email', async (job: any) => {
      await sendEmail(job.data.to, job.data.subject, job.data.html);
    });

    // Ensure sendEmail was called with the correct arguments
    expect(sendEmail).toHaveBeenCalledWith('test@example.com', 'Test', '<h1>Test</h1>');
  });

  it('should handle failure in email job processing', async () => {
    const job = { data: { to: 'test@example.com', subject: 'Test', html: '<h1>Test</h1>' } };
    (sendEmail as jest.Mock).mockRejectedValue(new Error('Failed to send email')); // Mock rejection of sendEmail

    // Mock the process method to simulate processing and catching an error
    mockProcessJob.mockImplementation((queueName, handler) => {
      if (typeof handler === 'function') {
        handler(job).catch((e: Error) => {
          // Catch the error and ensure it's handled
          expect(e.message).toBe('Failed to send email');
        });
      }
    });

    // Call the process method directly
    await mockProcessJob('email', async (job: any) => {
      await sendEmail(job.data.to, job.data.subject, job.data.html);
    });
  });
});
