const email = process.argv[2];
const plan = process.argv[3] || 'lifetime';

if (!email) {
    console.error('Usage: node grant-access.js <email> [plan]');
    process.exit(1);
}

// Ensure you have ADMIN_SECRET in your .env.local or set here for testing
// We fetch it from process.env if running with dotenv, but simpler to just hardcode for this script or use a default
const ADMIN_SECRET = 'admin_secret_key_123'; // Matches the suggested secret

async function grantAccess() {
    try {
        console.log(`Granting ${plan} access to ${email}...`);

        const response = await fetch('http://localhost:3000/api/admin/grant-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                plan,
                secret: ADMIN_SECRET
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success:', data.message);
        } else {
            console.error('❌ Error:', data.error);
        }

    } catch (error) {
        console.error('❌ Request failed:', error.message);
        console.log('Make sure the server is running on http://localhost:3000');
    }
}

grantAccess();
