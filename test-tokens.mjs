import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkTokens() {
  const tokens = await prisma.deviceToken.findMany({
    select: { userId: true, token: true, deviceType: true, updatedAt: true }
  });
  console.log(JSON.stringify(tokens, null, 2));
}

checkTokens().then(() => prisma.$disconnect()).catch(console.error);
