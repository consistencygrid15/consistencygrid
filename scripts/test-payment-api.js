/**
 * Test Payment API
 * Run this to debug payment API errors
 */

async function testPaymentAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/payment/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'next-auth.session-token=test',
            },
            body: JSON.stringify({
                planId: 'pro_monthly',
                useLaunchPrice: true,
            }),
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testPaymentAPI();
