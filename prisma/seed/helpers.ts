import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/id_ID';

/**
 * Assign interests to users
 */
export async function assignInterests(
  prisma: PrismaClient, 
  users: any[], 
  interests: any[]
) {
  console.log('Assigning interests to users...');
  
  const userInterests = [];
  for (const user of users) {
    // Each user gets 2-6 random interests
    const userInterestCount = faker.number.int({ min: 2, max: 6 });
    const selectedInterests = faker.helpers.arrayElements(interests, userInterestCount);
    
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

/**
 * Select a random pair of users that haven't swiped on each other
 */
export function selectRandomUserPair(users: any[], existingPairs: Set<string>) {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const userA = faker.helpers.arrayElement(users);
    const userB = faker.helpers.arrayElement(users);
    
    // Skip if same user or if pair already exists
    if (userA.id === userB.id) {
      attempts++;
      continue;
    }
    
    const pairKey = `${userA.id}_${userB.id}`;
    if (!existingPairs.has(pairKey)) {
      return [userA, userB];
    }
    
    attempts++;
  }
  
  // If we couldn't find a new pair after many attempts, just return any two distinct users
  const userA = users[0];
  const userB = users[1];
  return [userA, userB];
}