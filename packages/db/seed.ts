import { prismaClient } from "./index";

const USER_ID = "4";

async function seed() {
  // Create a demo user
  const user = await prismaClient.user.create({
    data: {
        id:USER_ID,
        email: "varun94477@gmail.com"
    },
  });

  // Create a demo validator (needed for ticks)
  const validator = await prismaClient.validator.create({
    data: {
      publicKey: "validator-demo-seed",
      location: "Delhi",
      ip: "127.0.0.1",
    },
  });

  // Create a website for that user
  const website = await prismaClient.websites.create({
    data: {
      url: "https://google.com",
      userId: USER_ID,
    },
  });

  // Seed 10 ticks over the last 30 minutes
  const now = Date.now();
  const windowMs = 3 * 60 * 1000;
  const checks = 10;

  await prismaClient.websiteTick.createMany({
    data: Array.from({ length: checks }, (_, index) => {
      const offsetFromNow = (checks - 1 - index) * windowMs;
      const createdAt = new Date(now - offsetFromNow);

      return {
        websiteId: website.id,
        validatorId: validator.id,
        createdAt,
        status: "Good",
        latency: 150,
      };
    }),
  });

  await prismaClient.websiteTick.createMany({
    data: Array.from({ length: checks }, (_, index) => {
      const offsetFromNow = (checks - 1 - index) * windowMs;
      const createdAt = new Date(now - offsetFromNow);

      return {
        websiteId: website.id,
        validatorId: validator.id,
        createdAt,
        status: "Bad",
        latency: 150,
      };
    }),
  });
}

seed().finally(() => prismaClient.$disconnect());