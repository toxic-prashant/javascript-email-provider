class EmailProvider {
  constructor(name) {
    this.name = name;
  }
}

class EmailService {
  constructor(
    providerA,
    providerB,
    maxRetries = 3,
    retryDelay = 1000,
    rateLimit = 10
  ) {
    this.providerA = providerA;
    this.providerB = providerB;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.attemptStatus = new Map();
    this.sentEmails = new Set();
    this.rateLimit = rateLimit;
    this.rateCounter = 0;
  }

  async sendEmail(emailId, emailData) {
    if (this.rateCounter >= this.rateLimit) {
        throw new Error('Rate limit exceeded');
    }

    if (this.sentEmails.has(emailId)) {
        console.log(`Email ${emailId} already sent, skipping. `);
        return;
    }

    let attempt = 0;
    let success = false;

    while (attempt < this.maxRetries && !success) {
        attempt++;

        try {
            await this.trySend(emailData, this.providerA);
            success = true;
        } catch (errorA) {
            console.error(`Attempt ${attempt} with providerA failed: ${errorA.message}`);
            if (attempt === this.maxRetries) {
                try {
                    await this.trySend(emailData, this.providerB);
                    success = true;
                } catch (errorB) {
                    console.error(`Attempt ${attempt} with providerB failed: ${errorB.message}`);
                }
            }
        }

        if (!success) {
            await this.delay(this.retryDelay * attempt);
        }
    }

    if (success) {
        this.sentEmails.add(emailId);
        this.rateCounter++;
        this.attemptStatus.set(emailId, 'sent');
        console.log(`Email ${emailId} sent successfully.`);
    } else {
        this.attemptStatus.set(emailId, 'failed');
        console.log(`Email ${emailId} failed to sent after ${this.maxRetries} attempts.`);
    }
  }

  async trySend(emailData, provider) {
    if (Math.random() < 0.7) {
        throw new Error('Simulated send failure');
    }
    console.log(`Email sent with ${provider.name}`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus(emailId) {
    return this.attemptStatus.get(emailId);
  }
}


module.exports = {EmailService, EmailProvider};