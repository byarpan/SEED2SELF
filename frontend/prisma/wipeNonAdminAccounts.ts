import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Wiping non-admin data & users from SQLite database...');
  
  // Disable Foreign Keys during cleanup in SQLite
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF;`);

  try { await prisma.$executeRawUnsafe(`DELETE FROM "Transaction";`); } catch (e) {}
  try { await prisma.$executeRawUnsafe(`DELETE FROM "BatchHistory";`); } catch (e) {}
  try { await prisma.$executeRawUnsafe(`DELETE FROM "Request";`); } catch (e) {}
  try { await prisma.$executeRawUnsafe(`DELETE FROM "Crop";`); } catch (e) {}
  try { await prisma.$executeRawUnsafe(`DELETE FROM "Message";`); } catch (e) {}
  try { await prisma.$executeRawUnsafe(`DELETE FROM "Rating";`); } catch (e) {}
  
  // Delete all non-admin users
  await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE role != 'ADMIN';`);

  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON;`);

  console.log(`Successfully wiped all non-admin accounts and related data from SQLite!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
