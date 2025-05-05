import { PrismaClient } from '@prisma/client';
import { interests } from './interests';
import { seedUsers } from './users';
import { assignInterests } from './helpers';
import { seedSwipes } from './swipes';
import { seedMessages } from './messages';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Starting database seeding process...');
    
    // Clear existing data (in reverse order of dependencies)
    console.log('Cleaning up existing data...');
    await prisma.message.deleteMany();
    await prisma.match.deleteMany();
    await prisma.swipe.deleteMany();
    await prisma.userInterest.deleteMany();
    await prisma.interest.deleteMany();
    await prisma.token.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('Database cleaned successfully');
    
    // Create interests
    console.log('Creating interests...');
    await prisma.interest.createMany({
      data: interests.map(name => ({ name }))
    });
    const dbInterests = await prisma.interest.findMany();
    console.log(`Created ${dbInterests.length} interests`);
    
    // Create users
    const users = await seedUsers(prisma, 50);
    
    // Assign interests to users
    await assignInterests(prisma, users, dbInterests);
    
    // Create swipes and matches
    const swipeStats = await seedSwipes(prisma, users);
    
    // Generate messages between matches
    const messageCount = await seedMessages(prisma);
    
    console.log('\n===== Seeding Summary =====');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${dbInterests.length} interests`);
    console.log(`Created ${swipeStats.swipeCount} swipes`);
    console.log(`Created ${swipeStats.matchCount} matches`);
    console.log(`Created ${messageCount} messages`);
    console.log('===========================\n');
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding process
main()
  .then(() => console.log('Seeding process finished'))
  .catch((e) => {
    console.error('Seeding process failed:', e);
    process.exit(1);
  });