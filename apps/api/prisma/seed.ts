import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL ?? 'super@tasdeeq.com';
  const password = process.env.SUPER_ADMIN_PASSWORD ?? 'SuperAdmin123!';
  const name = 'Super Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      emailVerified: true,
      role: 'super_admin',
      isSuperAdmin: true,
    },
  });

  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: user.id,
      providerId: 'credential',
      userId: user.id,
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('');
  console.log('✓ Super admin created');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log('  IMPORTANT: change the password after first login!');
  console.log('');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
