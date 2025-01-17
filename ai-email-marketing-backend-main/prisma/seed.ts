import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash('securepassword123', 10);

  // Create a user
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      firstName: 'Admin',
      LastName: 'User',
      hashedPassword: hashedPassword,
      phoneNumber: '1234567890',
      Address: '123 Admin Street',
    },
  });

  console.log('User created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
