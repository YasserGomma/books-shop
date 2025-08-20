import { db } from '../config/database';
import { books, categories } from './schema';
import { eq } from 'drizzle-orm';

async function seedMultilingualData() {
  try {
    console.log('🌱 Seeding multilingual sample data...');

    // First, let's get an existing user to use as author
    const existingUser = await db.query.users.findFirst();
    
    if (!existingUser) {
      console.log('❌ No users found. Please seed users first.');
      return;
    }

    // Update existing categories with Arabic translations
    const existingCategories = await db.query.categories.findMany();
    
    const categoryTranslations = {
      'Technology': { en: 'Technology', ar: 'التكنولوجيا' },
      'Science': { en: 'Science', ar: 'العلوم' },
      'History': { en: 'History', ar: 'التاريخ' },
      'Fantasy': { en: 'Fantasy', ar: 'الخيال' },
      'Biography': { en: 'Biography', ar: 'السيرة الذاتية' },
      'Fiction': { en: 'Fiction', ar: 'الخيال' },
      'Non-Fiction': { en: 'Non-Fiction', ar: 'غير الخيالي' },
    };

    for (const category of existingCategories) {
      const translation = categoryTranslations[category.name as keyof typeof categoryTranslations];
      if (translation) {
        await db.update(categories)
          .set({
            nameTranslations: translation,
            descriptionTranslations: {
              en: `Books in the ${category.name} category`,
              ar: `كتب في فئة ${translation.ar}`
            }
          })
          .where(eq(categories.id, category.id));
        
        console.log(`✅ Updated category: ${category.name} with Arabic translation`);
      }
    }

    // Add sample multilingual books
    const sampleBooks = [
      {
        title: 'Introduction to Artificial Intelligence',
        titleTranslations: {
          en: 'Introduction to Artificial Intelligence',
          ar: 'مقدمة في الذكاء الاصطناعي'
        },
        description: 'A comprehensive guide to AI concepts and applications',
        descriptionTranslations: {
          en: 'A comprehensive guide to AI concepts and applications in modern technology',
          ar: 'دليل شامل لمفاهيم الذكاء الاصطناعي وتطبيقاته في التكنولوجيا الحديثة'
        },
        price: '49.99',
        thumbnail: 'https://picsum.photos/400/600?random=1',
      },
      {
        title: 'The History of the Arab World',
        titleTranslations: {
          en: 'The History of the Arab World',
          ar: 'تاريخ العالم العربي'
        },
        description: 'Exploring the rich heritage and culture of Arab civilizations',
        descriptionTranslations: {
          en: 'Exploring the rich heritage and culture of Arab civilizations throughout history',
          ar: 'استكشاف التراث الغني والثقافة للحضارات العربية عبر التاريخ'
        },
        price: '34.99',
        thumbnail: 'https://picsum.photos/400/600?random=2',
      },
      {
        title: 'Modern Web Development',
        titleTranslations: {
          en: 'Modern Web Development',
          ar: 'تطوير المواقع الحديثة'
        },
        description: 'Learn React, Node.js, and modern web technologies',
        descriptionTranslations: {
          en: 'Learn React, Node.js, and modern web technologies for building scalable applications',
          ar: 'تعلم React و Node.js وتقنيات الويب الحديثة لبناء تطبيقات قابلة للتوسع'
        },
        price: '59.99',
        thumbnail: 'https://picsum.photos/400/600?random=3',
      },
      {
        title: 'The Science of Climate Change',
        titleTranslations: {
          en: 'The Science of Climate Change',
          ar: 'علم تغير المناخ'
        },
        description: 'Understanding global warming and environmental impact',
        descriptionTranslations: {
          en: 'Understanding global warming and environmental impact on our planet',
          ar: 'فهم الاحتباس الحراري والتأثير البيئي على كوكبنا'
        },
        price: '42.99',
        thumbnail: 'https://picsum.photos/400/600?random=4',
      },
      {
        title: 'Fantasy Realms and Magic',
        titleTranslations: {
          en: 'Fantasy Realms and Magic',
          ar: 'عوالم الخيال والسحر'
        },
        description: 'An epic journey through mystical lands and adventures',
        descriptionTranslations: {
          en: 'An epic journey through mystical lands and magical adventures',
          ar: 'رحلة ملحمية عبر الأراضي الصوفية والمغامرات السحرية'
        },
        price: '29.99',
        thumbnail: 'https://picsum.photos/400/600?random=5',
      }
    ];

    // Get category IDs for assignment
    const techCategory = existingCategories.find(c => c.name === 'Technology');
    const historyCategory = existingCategories.find(c => c.name === 'History');
    const scienceCategory = existingCategories.find(c => c.name === 'Science');
    const fantasyCategory = existingCategories.find(c => c.name === 'Fantasy');

    // Insert multilingual books
    for (let i = 0; i < sampleBooks.length; i++) {
      const book = sampleBooks[i];
      let categoryId = techCategory?.id; // default
      
      // Assign appropriate categories
      if (i === 1) categoryId = historyCategory?.id;
      else if (i === 3) categoryId = scienceCategory?.id;
      else if (i === 4) categoryId = fantasyCategory?.id;

      if (categoryId) {
        await db.insert(books).values({
          ...book,
          authorId: existingUser.id,
          categoryId: categoryId,
        });
        
        console.log(`✅ Added multilingual book: ${book.title}`);
      }
    }

    console.log('🎉 Multilingual sample data seeded successfully!');
    console.log('');
    console.log('📚 You can now test the multilingual API endpoints:');
    console.log('   - GET /api/books/localized?lang=ar');
    console.log('   - GET /api/books/localized?lang=en');
    console.log('   - GET /api/books/localized/:id?lang=ar');
    console.log('');

  } catch (error) {
    console.error('❌ Failed to seed multilingual data:', error);
    throw error;
  }
}

// Run the seed function
if (require.main === module) {
  seedMultilingualData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedMultilingualData };