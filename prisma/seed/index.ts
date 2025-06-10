import { PrismaClient, Gender, SwipeAction } from '@prisma/client'; // ADDED Gender and SwipeAction
import { faker } from '@faker-js/faker/locale/id_ID'; // ADDED faker
// import { interests } from './interests'; // REMOVED
import { seedUsers } from './users';
// import { assignInterests } from './helpers'; // REMOVED
import { seedSwipes } from './swipes';
import { seedMessages } from './messages'; // ADDED

// Define interests directly in this file
const interests = [
  "Coding", "Gaming", "Movies", "Music", "Travel", "Sports", "Reading", 
  "Cooking", "Art", "Photography", "Dancing", "Writing", "Yoga", "Hiking",
  "Volunteering", "Fashion", "Technology", "Science", "History", "Languages"
];

/**
 * Assign interests to users (moved from helpers.ts)
 */
export async function assignInterests(
  prisma: PrismaClient, 
  users: any[], 
  dbInterests: any[] // MODIFIED: Use dbInterests directly
) {
  console.log('Assigning interests to users...');
  
  const userInterests = [];
  for (const user of users) {
    // Each user gets 2-6 random interests
    const userInterestCount = faker.number.int({ min: 2, max: 6 });
    const selectedInterests = faker.helpers.arrayElements(dbInterests, userInterestCount);
    
    for (const interest of selectedInterests) {
      userInterests.push({
        userId: user.id,
        interestId: interest.id
      });
    }
  }
  
  // Create user interests in batches
  const batchSize = 100;
  for (let i = 0; i < userInterests.length; i += batchSize) {
    const batch = userInterests.slice(i, i + batchSize);
    await prisma.userInterest.createMany({
      data: batch,
      skipDuplicates: true
    });
  }
  
  console.log(`Assigned ${userInterests.length} interests to users`);
}


async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Starting database seeding process...');
    
    // Clear existing data (in reverse order of dependencies)
    console.log('Cleaning up existing data...');
    await prisma.message.deleteMany(); // This will do nothing if seedMessages is removed and no messages are created otherwise
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
    const users = await seedUsers(prisma, 10); 
    
    // Assign interests to users
    await assignInterests(prisma, users, dbInterests);
    
    // Create swipes and matches
    const swipeStats = await seedSwipes(prisma, users);
    
    // Generate messages between matches - REMOVED
    const messageCount = await seedMessages(prisma); // ADDED
    
    console.log('\\n===== Seeding Summary =====');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${dbInterests.length} interests`);
    console.log(`Created ${swipeStats.swipeCount} swipes`);
    console.log(`Created ${swipeStats.matchCount} matches`);
    console.log(`Created ${messageCount} messages`); // ADDED
    console.log('===========================\\n');
    
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