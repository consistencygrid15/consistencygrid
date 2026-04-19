const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.deviceToken.findMany();
  console.log('Total tokens:', tokens.length);
  console.log(tokens.slice(0, 5));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
