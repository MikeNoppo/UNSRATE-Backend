import { PrismaClient, SwipeAction } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/id_ID';
import { selectRandomUserPair } from './helpers';

/**
 * Create swipes between users and generate matches for mutual likes
 */
export async function seedSwipes(prisma: PrismaClient, users: any[]) {
  console.log('Creating swipes and potential matches...');
  
  const swipes = [];
  const potentialMatches = new Map<string, { userAId: string, userBId: string }>();
  
  // Create a reasonable number of swipes based on user count
  const swipeCount = Math.min(500, users.length * 10);
  
  // Set to track pairs that have already swiped to prevent duplicates
  const existingPairs = new Set<string>();

  for (let i = 0; i < swipeCount; i++) {
    // Select random users that haven't swiped on each other yet
    const [swiper, swiped] = selectRandomUserPair(users, existingPairs);
    
    // Create a unique key for this pair
    const pairKey = `${swiper.id}_${swiped.id}`;
    existingPairs.add(pairKey);
    
    // 70% chance of LIKE, 30% chance of DISLIKE
    const action = Math.random() < 0.7 ? SwipeAction.LIKE : SwipeAction.DISLIKE;
    
    swipes.push({
      swiperUserId: swiper.id,
      swipedUserId: swiped.id,
      action
    });
    
    // If A likes B, ~50% chance B also likes A (creates potential match)
    if (action === SwipeAction.LIKE && Math.random() < 0.5) {
      const reversePairKey = `${swiped.id}_${swiper.id}`;
      existingPairs.add(reversePairKey);
      
      swipes.push({
        swiperUserId: swiped.id,
        swipedUserId: swiper.id,
        action: SwipeAction.LIKE
      });
      
      // Track the potential match (ensure consistent userA/userB ordering)
      const [userAId, userBId] = [swiper.id, swiped.id].sort();
      const matchKey = `${userAId}_${userBId}`;
      
      if (!potentialMatches.has(matchKey)) {
        potentialMatches.set(matchKey, { userAId, userBId });
      }
    }
  }
  
  // Create swipes in batches
  const swipeBatchSize = 100;
  for (let i = 0; i < swipes.length; i += swipeBatchSize) {
    const batch = swipes.slice(i, i + swipeBatchSize);
    await prisma.swipe.createMany({
      data: batch,
      skipDuplicates: true
    });
  }
  console.log(`Created ${swipes.length} swipes`);
  
  // Create matches based on mutual likes
  const matches = Array.from(potentialMatches.values());
  if (matches.length > 0) {
    await prisma.match.createMany({
      data: matches,
      skipDuplicates: true
    });
    console.log(`Created ${matches.length} matches from mutual likes`);
  }
  
  return {
    swipeCount: swipes.length,
    matchCount: matches.length
  };
}