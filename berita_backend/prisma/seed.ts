import { PrismaClient, Role } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the environment.');
}

const url = new URL(connectionString);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port, 10) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.replace('/', '')),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@veritas.com';
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('AdminVeritas123!', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin Veritas',
        role: Role.ADMIN,
      },
    });
    console.log('Seeder: Admin account created successfully!', admin);
  } else {
    console.log('Seeder: Admin account already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
