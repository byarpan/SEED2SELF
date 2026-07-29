import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'ADMIN' },
        { NOT: { adminId: null } }
      ]
    }
  });
  console.log('ADMIN USERS FOUND:', users);
}

main().finally(() => prisma.$disconnect());
