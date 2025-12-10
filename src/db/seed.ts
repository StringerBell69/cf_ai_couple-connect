import { db } from './db';
import { users } from './schema';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Hash passwords for both users
    const wendyPasswordHash = await bcrypt.hash('wendy123', 10);
    const danielPasswordHash = await bcrypt.hash('daniel123', 10);

    // Create Wendy
    const [wendy] = await db.insert(users).values({
      name: 'Wendy',
      passwordHash: wendyPasswordHash,
    }).returning();
    console.log('Created user: Wendy');

    // Create Daniel
    const [daniel] = await db.insert(users).values({
      name: 'Daniel',
      passwordHash: danielPasswordHash,
    }).returning();
    console.log('Created user: Daniel');

    console.log('\nDatabase seeded successfully!');
    console.log('\nUser credentials:');
    console.log('  Wendy  - username: Wendy,  password: wendy123');
    console.log('  Daniel - username: Daniel, password: daniel123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
