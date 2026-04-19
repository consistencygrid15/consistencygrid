import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findFirst();
    if(user) {
        console.log(user.publicToken);
        const res = await fetch('http://localhost:3000/api/wallpaper-data?token=' + user.publicToken, { headers: { 'User-Agent': 'ConsistencyGrid/NativeApp', 'Accept': 'application/json' } });
        console.log(res.status);
        console.log(await res.text());
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
