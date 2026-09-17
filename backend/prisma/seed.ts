import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const transportModes = [
    {
      code: 'WALK',
      name: 'Walking',
      co2GramsPerKm: 0,
      avgCostPerKm: 0,
      avgSpeedKmh: 5,
    },
    {
      code: 'BUS',
      name: 'Bus',
      co2GramsPerKm: 89,
      avgCostPerKm: 2.5,
      avgSpeedKmh: 25,
    },
    {
      code: 'METRO',
      name: 'Metro',
      co2GramsPerKm: 41,
      avgCostPerKm: 3,
      avgSpeedKmh: 40,
    },
    {
      code: 'TRAIN',
      name: 'Train',
      co2GramsPerKm: 35,
      avgCostPerKm: 4,
      avgSpeedKmh: 60,
    },
    {
      code: 'CAR',
      name: 'Private Car',
      co2GramsPerKm: 192,
      avgCostPerKm: 8,
      avgSpeedKmh: 35,
    },
    {
      code: 'CARPOOL',
      name: 'Carpool',
      co2GramsPerKm: 96,
      avgCostPerKm: 4,
      avgSpeedKmh: 35,
    },
    {
      code: 'BIKE',
      name: 'Bicycle',
      co2GramsPerKm: 0,
      avgCostPerKm: 0,
      avgSpeedKmh: 15,
    },
    {
      code: 'AUTO',
      name: 'Auto Rickshaw',
      co2GramsPerKm: 120,
      avgCostPerKm: 12,
      avgSpeedKmh: 25,
    },
  ];

  for (const mode of transportModes) {
    await prisma.transportMode.upsert({
      where: { code: mode.code },
      update: mode,
      create: mode,
    });
  }

  console.log('Seed completed: transport modes initialized');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
