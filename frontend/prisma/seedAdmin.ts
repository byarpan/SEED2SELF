import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Assign adminId to all existing ADMIN users if null
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' }
  });

  let index = 1;
  for (const admin of adminUsers) {
    if (!admin.adminId) {
      const generatedId = `S2S-ADM-${String(index).padStart(6, '0')}`;
      try {
        await prisma.user.update({
          where: { id: admin.id },
          data: { adminId: generatedId }
        });
        console.log(`Assigned ${generatedId} to Admin: ${admin.email}`);
      } catch (err) {
        // ID might be taken, continue
      }
    }
    index++;
  }

  // 2. Ensure default admin@seed2shelf.com exists
  const adminEmail = 'admin@seed2shelf.com';
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    const newAdmin = await prisma.user.create({
      data: {
        name: 'Platform Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        adminId: `S2S-ADM-${String(index).padStart(6, '0')}`,
        regDate: new Date(),
      }
    });
    console.log(`Created default Admin user: ${newAdmin.email} (${newAdmin.adminId})`);
  } else {
    console.log(`Default admin ${adminEmail} is active.`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
