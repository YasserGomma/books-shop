import { db } from '../config/database';
import { users, categories, books, tags, bookTags } from './schema';
import { hashPassword } from '../shared/utils/password';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log('📋 Database already seeded, skipping...');
      console.log('\n👤 Test credentials:');
      console.log('Email: john@example.com | Password: password123');
      console.log('Email: jane@example.com | Password: password123');
      console.log('Email: author@example.com | Password: password123');
      return;
    }

    // Create sample users
    console.log('Creating sample users...');
    const hashedPassword = await hashPassword('password123');
    
    const sampleUsers = await db.insert(users).values([
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
      },
      {
        username: 'janedoe',
        email: 'jane@example.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Doe',
      },
      {
        username: 'bookauthor',
        email: 'author@example.com',
        password: hashedPassword,
        firstName: 'Book',
        lastName: 'Author',
      },
    ]).returning();

    // Create sample categories
    console.log('Creating sample categories...');
    const sampleCategories = await db.insert(categories).values([
      {
        name: 'Fiction',
        description: 'Fictional stories and novels',
      },
      {
        name: 'Non-Fiction',
        description: 'Educational and factual books',
      },
      {
        name: 'Science Fiction',
        description: 'Science fiction and fantasy novels',
      },
      {
        name: 'Biography',
        description: 'Life stories of notable people',
      },
      {
        name: 'Technology',
        description: 'Books about technology and programming',
      },
    ]).returning();

    // Create sample tags
    console.log('Creating sample tags...');
    const sampleTags = await db.insert(tags).values([
      { name: 'bestseller' },
      { name: 'award-winning' },
      { name: 'new-release' },
      { name: 'classic' },
      { name: 'educational' },
      { name: 'programming' },
      { name: 'javascript' },
      { name: 'typescript' },
    ]).returning();

    // Create sample books
    console.log('Creating sample books...');
    const sampleBooks = await db.insert(books).values([
      {
        title: 'The Great Adventure',
        description: 'An epic tale of courage and discovery in a fantasy world.',
        price: '19.99',
        thumbnail: 'https://via.placeholder.com/300x400/1f2937/ffffff?text=The+Great+Adventure',
        authorId: sampleUsers[0].id,
        categoryId: sampleCategories[0].id, // Fiction
      },
      {
        title: 'JavaScript Mastery',
        description: 'Complete guide to modern JavaScript development.',
        price: '39.99',
        thumbnail: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=JavaScript+Mastery',
        authorId: sampleUsers[1].id,
        categoryId: sampleCategories[4].id, // Technology
      },
      {
        title: 'Space Odyssey 2024',
        description: 'A thrilling journey through space and time.',
        price: '24.99',
        thumbnail: 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=Space+Odyssey+2024',
        authorId: sampleUsers[2].id,
        categoryId: sampleCategories[2].id, // Science Fiction
      },
      {
        title: 'Learning TypeScript',
        description: 'Master TypeScript for modern web development.',
        price: '34.99',
        thumbnail: 'https://via.placeholder.com/300x400/10b981/ffffff?text=Learning+TypeScript',
        authorId: sampleUsers[0].id,
        categoryId: sampleCategories[4].id, // Technology
      },
      {
        title: 'The Art of Programming',
        description: 'Principles and practices for clean, maintainable code.',
        price: '45.99',
        thumbnail: 'https://via.placeholder.com/300x400/f59e0b/ffffff?text=Art+of+Programming',
        authorId: sampleUsers[1].id,
        categoryId: sampleCategories[4].id, // Technology
      },
      {
        title: 'Mystery of the Old House',
        description: 'A suspenseful mystery that will keep you guessing.',
        price: '16.99',
        thumbnail: 'https://via.placeholder.com/300x400/dc2626/ffffff?text=Mystery+Old+House',
        authorId: sampleUsers[2].id,
        categoryId: sampleCategories[0].id, // Fiction
      },
    ]).returning();

    // Create book-tag relationships
    console.log('Creating book-tag relationships...');
    await db.insert(bookTags).values([
      // The Great Adventure
      { bookId: sampleBooks[0].id, tagId: sampleTags[0].id }, // bestseller
      { bookId: sampleBooks[0].id, tagId: sampleTags[2].id }, // new-release
      
      // JavaScript Mastery
      { bookId: sampleBooks[1].id, tagId: sampleTags[4].id }, // educational
      { bookId: sampleBooks[1].id, tagId: sampleTags[5].id }, // programming
      { bookId: sampleBooks[1].id, tagId: sampleTags[6].id }, // javascript
      
      // Space Odyssey 2024
      { bookId: sampleBooks[2].id, tagId: sampleTags[1].id }, // award-winning
      { bookId: sampleBooks[2].id, tagId: sampleTags[2].id }, // new-release
      
      // Learning TypeScript
      { bookId: sampleBooks[3].id, tagId: sampleTags[4].id }, // educational
      { bookId: sampleBooks[3].id, tagId: sampleTags[5].id }, // programming
      { bookId: sampleBooks[3].id, tagId: sampleTags[7].id }, // typescript
      
      // The Art of Programming
      { bookId: sampleBooks[4].id, tagId: sampleTags[1].id }, // award-winning
      { bookId: sampleBooks[4].id, tagId: sampleTags[4].id }, // educational
      { bookId: sampleBooks[4].id, tagId: sampleTags[5].id }, // programming
      
      // Mystery of the Old House
      { bookId: sampleBooks[5].id, tagId: sampleTags[0].id }, // bestseller
      { bookId: sampleBooks[5].id, tagId: sampleTags[3].id }, // classic
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Sample data created:');
    console.log(`- ${sampleUsers.length} users`);
    console.log(`- ${sampleCategories.length} categories`);
    console.log(`- ${sampleTags.length} tags`);
    console.log(`- ${sampleBooks.length} books`);
    console.log('\n👤 Test credentials:');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: jane@example.com | Password: password123');
    console.log('Email: author@example.com | Password: password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();