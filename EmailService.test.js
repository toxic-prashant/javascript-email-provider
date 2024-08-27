const { EmailService, EmailProvider } = require('./EmailService');

describe('EmailService', () => {
const providerA = new EmailProvider('ProviderA');
const providerB = new EmailProvider('ProviderB');
let emailService;

beforeEach(() => {
    emailService = new EmailService(providerA, providerB, 2, 1000, 5);
});

test('sends an email successfully with the first provider', async () => {
    await emailService.sendEmail('email1', { to: 'test@example.com', subject: 'Hello', body: 'Hello World!' });
    expect(emailService.getStatus('email1')).toBe('sent');
});

test('retries and then sends with the second provider', async () => { 
    providerA.name = 'FailingProvider';
    await emailService.sendEmail('email2', { to: 'test2@example.com', subject: 'Hello Again', body: 'Hello Again World!!' });
    expect(emailService.getStatus('email2')).toBe('sent');
 });

 test('does not send the same email twice', async () => { 
    await emailService.sendEmail('email3', { to: 'test3@example.com', subject: 'Hello Once More', body: 'Hello Once More!!!' });
    await emailService.sendEmail('email3', { to: 'test3@example.com', subject: 'Hello Once More', body: 'Hello Once More!!!' });
    expect(emailService.getStatus('email3')).toBe('sent');
  });

  test('throws an error when rate limit is exceeded', async () => { 
    for (let i = 0; i <= 5; i++) {
       await emailService.sendEmail(`email${i}`, { to: `test${i}@example.com`, subject: `Hello ${i}`, body: `Hello ${i}` });    
    }
    await expect(emailService.sendEmail('email6', { to: 'test6@example.com', subject: 'Hello 6', body: 'Hello 6' })).rejects.toThrow('Rate limit exceeded!');
   });
});