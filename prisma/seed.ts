import { PrismaClient, RewardType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding rewards...');

  await prisma.reward.createMany({
    data: [
      {
        name: '10% Off at Nomad Restaurant',
        description: 'Enjoy a 10% discount on your total bill at the trendy Nomad restaurant in the Medina.',
        pointsRequired: 100,
        type: RewardType.DISCOUNT,
        partnerName: 'Nomad Restaurant',
      },
      {
        name: 'Free Mint Tea at Café des Épices',
        description: 'Get a complimentary traditional mint tea with any purchase.',
        pointsRequired: 50,
        type: RewardType.FREE_UPGRADE,
        partnerName: 'Café des Épices',
      },
      {
        name: 'Priority Booking for a Hammam',
        description: 'Skip the line and get priority booking at a luxury Hammam spa.',
        pointsRequired: 250,
        type: RewardType.EXCLUSIVE_OFFER,
        partnerName: 'Les Bains de Marrakech',
      },
    ],
    skipDuplicates: true, // Don't create duplicates if you run the seed again
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });