import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanSqlite() {
  console.log("==========================================");
  console.log("CLEANING SQLITE DEV.DB USERS");
  console.log("==========================================");

  const deleted = await prisma.user.deleteMany({
    where: {
      email: {
        not: "admin@seed2shelf.com"
      }
    }
  });

  console.log(` ✅ Deleted ${deleted.count} demo user(s) from SQLite dev.db.`);

  const remaining = await prisma.user.findMany();
  console.log(`📊 Remaining Users in SQLite dev.db (${remaining.length}):`);
  remaining.forEach(u => {
    console.log(`   • ${u.name} (${u.email}) - Role: ${u.role} - ID: ${u.adminId || u.id}`);
  });

  await prisma.$disconnect();
}

cleanSqlite().catch(console.error);
