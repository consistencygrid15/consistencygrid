import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: '.env' }); // Wait, Vercel pulls it natively?
const prisma = new PrismaClient();

async function checkToken() {
  const user = await prisma.user.findFirst({
    select: { email: true, publicToken: true, settings: true, plan: true }
  });
  console.log(JSON.stringify(user, null, 2));
}

checkToken().then(() => prisma.$disconnect()).catch(console.error);
