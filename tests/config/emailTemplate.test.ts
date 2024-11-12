import { defaultTemplate } from '../../src/config/emailTemplate';

describe('Email Template', () => {
  // Test Case 1: Replace the {firstName} placeholder with the actual first name
  it('should replace {firstName} with the actual name', () => {
    const firstName = 'John'; // Input data: the first name to insert into the template
    const templateOutput = defaultTemplate(firstName); // Call the function that processes the template with the first name

    // Assertion: We expect that the resulting template contains the correct greeting with the first name
    expect(templateOutput).toContain(`<h1>Hi ${firstName},</h1>`);
  });

  // Test Case 2: Ensure the template includes the welcome message
  it('should contain the welcome message', () => {
    const templateOutput = defaultTemplate('Jane'); // Call the template function with another test name

    // Assertion: We expect the template to contain the predefined "Welcome to our email SaaS" message
    expect(templateOutput).toContain('Welcome to our email SaaS');
  });
});
