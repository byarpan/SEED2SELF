import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(`\n==========================================`);
  console.log(`SQLITE PRISMA USERS CHECK (dev.db)`);
  console.log(`==========================================`);
  console.log(`Total Users in SQLite: ${users.length}`);

  users.forEach((u, i) => {
    console.log(`\nUser #${i + 1}:`);
    console.log(`  • ID: ${u.id}`);
    console.log(`  • Name: ${u.name}`);
    console.log(`  • Email: ${u.email}`);
    console.log(`  • Role: ${u.role}`);
    console.log(`  • Farmer ID: ${u.farmerId || 'N/A'}`);
    console.log(`  • Processor ID: ${u.processorId || 'N/A'}`);
    console.log(`  • KYC Status: ${u.kycStatus || 'Not Submitted'}`);
    console.log(`  • Aadhaar Number: ${u.aadhaarNumber || 'Not Provided'}`);
    console.log(`  • Aadhaar Front Doc: ${u.aadhaarFront || 'None'}`);
    console.log(`  • Aadhaar Back Doc: ${u.aadhaarBack || 'None'}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
