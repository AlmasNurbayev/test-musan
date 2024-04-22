import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { Logger } from '../shared/logger';
import * as bcrypt from 'bcrypt';

async function seedUser() {
  const prisma = new PrismaClient();

  let user;
  user = await prisma.users.findFirst({ where: { email: config.testUser.email } });
  if (!user) {
    const hash = await bcrypt.hash(config.testUser.password, 10);
    user = await prisma.users.create({
      data: {
        email: config.testUser.email,
        password: hash,
        name: config.testUser.name,
      },
    });
  }
  if (!user) {
    Logger.error('user not found and not created');
  } else {
    Logger.info('seed user found or created ' + user.email);
  }
}

export async function Seeds() {
  await seedUser();
}
