const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findFirst();
        console.log('User found:', !!user);
        if (user) {
            console.log('Columns in User:', Object.keys(user));
        }
    } catch (e) {
        console.error('Error fetching user:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
