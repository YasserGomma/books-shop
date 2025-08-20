import { db } from '../config/database';
import { books, categories, tags, users } from './schema';
import { hashPassword } from '../shared/utils/password';

async function seedProductionData() {
  try {
    console.log('🌱 Starting production database seeding...');

    // Create admin user
    console.log('👤 Creating admin user...');
    const [adminUser] = await db.insert(users).values({
      username: 'admin',
      email: 'admin@books.com',
      password: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
    }).returning();

    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create categories with Arabic translations
    console.log('📂 Creating categories...');
    const categoryData = [
      {
        name: 'Technology',
        description: 'Books about technology and programming',
        nameTranslations: { en: 'Technology', ar: 'التكنولوجيا' },
        descriptionTranslations: {
          en: 'Books about technology and programming',
          ar: 'كتب حول التكنولوجيا والبرمجة'
        }
      },
      {
        name: 'Science',
        description: 'Scientific books and research',
        nameTranslations: { en: 'Science', ar: 'العلوم' },
        descriptionTranslations: {
          en: 'Scientific books and research',
          ar: 'الكتب العلمية والبحوث'
        }
      },
      {
        name: 'History',
        description: 'Historical books and biographies',
        nameTranslations: { en: 'History', ar: 'التاريخ' },
        descriptionTranslations: {
          en: 'Historical books and biographies',
          ar: 'الكتب التاريخية والسير الذاتية'
        }
      },
      {
        name: 'Fantasy',
        description: 'Fantasy and fiction novels',
        nameTranslations: { en: 'Fantasy', ar: 'الخيال' },
        descriptionTranslations: {
          en: 'Fantasy and fiction novels',
          ar: 'روايات الخيال والأدب'
        }
      },
      {
        name: 'Biography',
        description: 'Biographies and memoirs',
        nameTranslations: { en: 'Biography', ar: 'السيرة الذاتية' },
        descriptionTranslations: {
          en: 'Biographies and memoirs',
          ar: 'السير الذاتية والمذكرات'
        }
      }
    ];

    const createdCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create tags with Arabic translations
    console.log('🏷️ Creating tags...');
    const tagData = [
      {
        name: 'Programming',
        nameTranslations: { en: 'Programming', ar: 'البرمجة' }
      },
      {
        name: 'Fiction',
        nameTranslations: { en: 'Fiction', ar: 'خيال' }
      },
      {
        name: 'Non-Fiction',
        nameTranslations: { en: 'Non-Fiction', ar: 'غير خيالي' }
      },
      {
        name: 'Bestseller',
        nameTranslations: { en: 'Bestseller', ar: 'الأكثر مبيعاً' }
      }
    ];

    const createdTags = await db.insert(tags).values(tagData).returning();
    console.log(`✅ Created ${createdTags.length} tags`);

    // Find category IDs
    const techCategory = createdCategories.find(c => c.name === 'Technology');
    const scienceCategory = createdCategories.find(c => c.name === 'Science');
    const historyCategory = createdCategories.find(c => c.name === 'History');
    const fantasyCategory = createdCategories.find(c => c.name === 'Fantasy');
    const biographyCategory = createdCategories.find(c => c.name === 'Biography');

    // Create multilingual books
    console.log('📚 Creating multilingual books...');
    const bookData = [
      {
        title: 'Clean Code',
        description: 'A Handbook of Agile Software Craftsmanship',
        titleTranslations: {
          en: 'Clean Code',
          ar: 'الكود النظيف'
        },
        descriptionTranslations: {
          en: 'A Handbook of Agile Software Craftsmanship',
          ar: 'دليل للحرفية في تطوير البرمجيات الرشيقة'
        },
        price: '42.99',
        thumbnail: 'https://picsum.photos/400/600?random=1',
        authorId: adminUser.id,
        categoryId: techCategory?.id || createdCategories[0].id,
      },
      {
        title: 'The Pragmatic Programmer',
        description: 'Your Journey to Mastery',
        titleTranslations: {
          en: 'The Pragmatic Programmer',
          ar: 'المبرمج العملي'
        },
        descriptionTranslations: {
          en: 'Your Journey to Mastery',
          ar: 'رحلتك إلى الإتقان'
        },
        price: '39.99',
        thumbnail: 'https://picsum.photos/400/600?random=2',
        authorId: adminUser.id,
        categoryId: techCategory?.id || createdCategories[0].id,
      },
      {
        title: 'Sapiens',
        description: 'A Brief History of Humankind',
        titleTranslations: {
          en: 'Sapiens',
          ar: 'العاقل'
        },
        descriptionTranslations: {
          en: 'A Brief History of Humankind',
          ar: 'تاريخ موجز للجنس البشري'
        },
        price: '24.99',
        thumbnail: 'https://picsum.photos/400/600?random=3',
        authorId: adminUser.id,
        categoryId: historyCategory?.id || createdCategories[0].id,
      },
      {
        title: 'The Lord of the Rings',
        description: 'The epic fantasy trilogy',
        titleTranslations: {
          en: 'The Lord of the Rings',
          ar: 'سيد الخواتم'
        },
        descriptionTranslations: {
          en: 'The epic fantasy trilogy',
          ar: 'ثلاثية الفانتازيا الملحمية'
        },
        price: '35.99',
        thumbnail: 'https://picsum.photos/400/600?random=4',
        authorId: adminUser.id,
        categoryId: fantasyCategory?.id || createdCategories[0].id,
      },
      {
        title: 'Steve Jobs',
        description: 'The Exclusive Biography',
        titleTranslations: {
          en: 'Steve Jobs',
          ar: 'ستيف جوبز'
        },
        descriptionTranslations: {
          en: 'The Exclusive Biography',
          ar: 'السيرة الذاتية الحصرية'
        },
        price: '29.99',
        thumbnail: 'https://picsum.photos/400/600?random=5',
        authorId: adminUser.id,
        categoryId: biographyCategory?.id || createdCategories[0].id,
      },
      {
        title: 'A Brief History of Time',
        description: 'From the Big Bang to Black Holes',
        titleTranslations: {
          en: 'A Brief History of Time',
          ar: 'تاريخ موجز للزمن'
        },
        descriptionTranslations: {
          en: 'From the Big Bang to Black Holes',
          ar: 'من الانفجار الكبير إلى الثقوب السوداء'
        },
        price: '18.99',
        thumbnail: 'https://picsum.photos/400/600?random=6',
        authorId: adminUser.id,
        categoryId: scienceCategory?.id || createdCategories[0].id,
      },
      {
        title: 'Design Patterns',
        description: 'Elements of Reusable Object-Oriented Software',
        titleTranslations: {
          en: 'Design Patterns',
          ar: 'أنماط التصميم'
        },
        descriptionTranslations: {
          en: 'Elements of Reusable Object-Oriented Software',
          ar: 'عناصر البرمجيات القابلة لإعادة الاستخدام'
        },
        price: '54.99',
        thumbnail: 'https://picsum.photos/400/600?random=7',
        authorId: adminUser.id,
        categoryId: techCategory?.id || createdCategories[0].id,
      },
      {
        title: 'The Hobbit',
        description: 'The prelude to The Lord of the Rings',
        titleTranslations: {
          en: 'The Hobbit',
          ar: 'الهوبيت'
        },
        descriptionTranslations: {
          en: 'The prelude to The Lord of the Rings',
          ar: 'مقدمة لسيد الخواتم'
        },
        price: '19.99',
        thumbnail: 'https://picsum.photos/400/600?random=8',
        authorId: adminUser.id,
        categoryId: fantasyCategory?.id || createdCategories[0].id,
      },
      {
        title: 'Cosmos',
        description: 'A Personal Voyage',
        titleTranslations: {
          en: 'Cosmos',
          ar: 'الكون'
        },
        descriptionTranslations: {
          en: 'A Personal Voyage',
          ar: 'رحلة شخصية'
        },
        price: '22.99',
        thumbnail: 'https://picsum.photos/400/600?random=9',
        authorId: adminUser.id,
        categoryId: scienceCategory?.id || createdCategories[0].id,
      },
      {
        title: 'The Wright Brothers',
        description: 'The Story of Aviation Pioneers',
        titleTranslations: {
          en: 'The Wright Brothers',
          ar: 'الأخوان رايت'
        },
        descriptionTranslations: {
          en: 'The Story of Aviation Pioneers',
          ar: 'قصة رواد الطيران'
        },
        price: '27.99',
        thumbnail: 'https://picsum.photos/400/600?random=10',
        authorId: adminUser.id,
        categoryId: biographyCategory?.id || createdCategories[0].id,
      },
      {
        title: 'JavaScript: The Good Parts',
        description: 'Unearthing the Excellence in JavaScript',
        titleTranslations: {
          en: 'JavaScript: The Good Parts',
          ar: 'جافا سكريبت: الأجزاء الجيدة'
        },
        descriptionTranslations: {
          en: 'Unearthing the Excellence in JavaScript',
          ar: 'اكتشاف التميز في جافا سكريبت'
        },
        price: '29.99',
        thumbnail: 'https://picsum.photos/400/600?random=11',
        authorId: adminUser.id,
        categoryId: techCategory?.id || createdCategories[0].id,
      },
      {
        title: 'The Roman Empire',
        description: 'A History',
        titleTranslations: {
          en: 'The Roman Empire',
          ar: 'الإمبراطورية الرومانية'
        },
        descriptionTranslations: {
          en: 'A History',
          ar: 'تاريخ'
        },
        price: '31.99',
        thumbnail: 'https://picsum.photos/400/600?random=12',
        authorId: adminUser.id,
        categoryId: historyCategory?.id || createdCategories[0].id,
      }
    ];

    const createdBooks = await db.insert(books).values(bookData).returning();
    console.log(`✅ Created ${createdBooks.length} multilingual books`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📚 Sample data summary:');
    console.log(`   - Admin user: admin@books.com / admin123`);
    console.log(`   - Categories: ${createdCategories.length} (with Arabic translations)`);
    console.log(`   - Books: ${createdBooks.length} (with Arabic translations)`);
    console.log(`   - Tags: ${createdTags.length} (with Arabic translations)`);
    console.log('');
    console.log('🌍 You can now test the multilingual API:');
    console.log('   - GET /api/books/localized?lang=ar');
    console.log('   - GET /api/books/localized?lang=en');
    console.log('');

  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}

// Run the seed function
if (require.main === module) {
  seedProductionData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedProductionData };