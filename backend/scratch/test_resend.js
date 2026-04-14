const emailService = require('../src/common/service/email.service');
const logger = require('../src/common/utils/logger');


async function testEmail() {
    try {
        console.log('Testing Email Service with Resend...');
        // We use a dummy email to test the API call. 
        // Note: This will likely fail if the domain isn't verified, 
        // but we want to see the error message from Resend to confirm it's working.
        await emailService.sendEmail(
            'test@example.com', 
            'Test Resend Integration', 
            '<h1>It works!</h1><p>Resend integration is active.</p>'
        );
        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Test failed as expected or with unexpected error:');
        console.error(error.message);
    }
}

testEmail();
