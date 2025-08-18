import axios from 'axios';
import { emailNotifications } from './utils/emailService.js';

// Test notification system
async function testNotifications() {
    try {
        console.log('🧪 Testing Notification System...\n');

        // Test 1: Test notification endpoint
        console.log('1. Testing notification endpoint...');
        const testResponse = await axios.post('http://localhost:5050/api/test-notification', {
            userId: 'test-user-123',
            message: 'This is a test notification from the server!'
        });
        console.log('✅ Test notification sent successfully:', testResponse.data);

        // Test 2: Test email service (if configured)
        console.log('\n2. Testing email service...');
        
        const emailResult = await emailNotifications.reportSubmitted(
            'test@example.com',
            'Test User',
            'Test Report'
        );
        
        if (emailResult.success) {
            console.log('✅ Email notification sent successfully');
        } else {
            console.log('⚠️ Email notification failed (expected in development):', emailResult.error);
        }

        console.log('\n🎉 Notification system test completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Start the client application (cd ../client && npm run dev)');
        console.log('2. Login to the application');
        console.log('3. Submit a report to see real-time notifications');
        console.log('4. Check the notification bell in the header');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testNotifications();
