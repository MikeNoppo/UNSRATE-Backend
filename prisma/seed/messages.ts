import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/id_ID';

/**
 * Generate chat messages between matched users
 */
export async function seedMessages(prisma: PrismaClient) {
  console.log('Creating messages between matches...');
  
  // Get all matches
  const matches = await prisma.match.findMany({
    include: {
      userA: true,
      userB: true
    }
  });
  
  console.log(`Found ${matches.length} matches to create conversations for`);
  
  const messages = [];
  const totalMessages = Math.min(1000, matches.length * 10);
  
  // Create 0-20 messages per match
  for (const match of matches) {
    // Some matches might have no messages yet (25% chance)
    if (Math.random() < 0.25) continue;
    
    const messageCount = faker.number.int({ min: 1, max: 20 });
    
    // Generate timestamps for messages in ascending order
    const baseDate = match.createdAt;
    const endDate = new Date();
    
    // Create messageCount messages between these users
    for (let i = 0; i < messageCount; i++) {
      // Calculate progressive timestamp
      const progressFactor = i / messageCount;
      const timeOffset = (endDate.getTime() - baseDate.getTime()) * progressFactor;
      const messageDate = new Date(baseDate.getTime() + timeOffset);
      
      // Randomly choose sender (60% userA, 40% userB to create unbalanced conversations)
      const sender = Math.random() < 0.6 ? match.userA : match.userB;
      
      // 80% of messages are read, newer messages more likely to be unread
      const isRead = i < messageCount * 0.8;
      
      messages.push({
        matchId: match.id,
        senderId: sender.id,
        content: faker.lorem.sentence(),
        createdAt: messageDate,
        isRead
      });
    }
  }
  
  // Create messages in batches
  const batchSize = 100;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    await prisma.message.createMany({
      data: batch
    });
  }
  
  console.log(`Created ${messages.length} messages between matches`);
  return messages.length;
}