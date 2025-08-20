import { SupportedLocale, getLocalizedContent, DEFAULT_LOCALE } from '../middleware/locale';

export interface MultilingualText {
  en: string;
  ar: string;
}

export interface LocalizedBook {
  id: string;
  title: string;
  description: string | null;
  price: string;
  thumbnail: string | null;
  authorId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  // Include original translations for admin/editing purposes
  titleTranslations?: MultilingualText | null;
  descriptionTranslations?: MultilingualText | null;
}

export interface LocalizedCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  // Include original translations for admin/editing purposes
  nameTranslations?: MultilingualText | null;
  descriptionTranslations?: MultilingualText | null;
}

export interface LocalizedTag {
  id: string;
  name: string;
  // Include original translations for admin/editing purposes
  nameTranslations?: MultilingualText | null;
}

/**
 * Service for handling multilingual data operations
 */
export class I18nService {
  /**
   * Localize book data based on the requested locale
   */
  static localizeBook(book: any, locale: SupportedLocale): LocalizedBook {
    return {
      id: book.id,
      title: getLocalizedContent(book.titleTranslations, locale, book.title),
      description: getLocalizedContent(book.descriptionTranslations, locale, book.description),
      price: book.price,
      thumbnail: book.thumbnail,
      authorId: book.authorId,
      categoryId: book.categoryId,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      // Include translations for admin interfaces
      titleTranslations: book.titleTranslations,
      descriptionTranslations: book.descriptionTranslations,
    };
  }

  /**
   * Localize category data based on the requested locale
   */
  static localizeCategory(category: any, locale: SupportedLocale): LocalizedCategory {
    return {
      id: category.id,
      name: getLocalizedContent(category.nameTranslations, locale, category.name),
      description: getLocalizedContent(category.descriptionTranslations, locale, category.description),
      createdAt: category.createdAt,
      // Include translations for admin interfaces
      nameTranslations: category.nameTranslations,
      descriptionTranslations: category.descriptionTranslations,
    };
  }

  /**
   * Localize tag data based on the requested locale
   */
  static localizeTag(tag: any, locale: SupportedLocale): LocalizedTag {
    return {
      id: tag.id,
      name: getLocalizedContent(tag.nameTranslations, locale, tag.name),
      // Include translations for admin interfaces
      nameTranslations: tag.nameTranslations,
    };
  }

  /**
   * Prepare multilingual input for database storage
   */
  static prepareMultilingualInput(input: {
    title?: string;
    titleEn?: string;
    titleAr?: string;
    description?: string;
    descriptionEn?: string;
    descriptionAr?: string;
  }) {
    const result: any = {};

    // Handle title
    if (input.titleEn || input.titleAr) {
      result.titleTranslations = {
        en: input.titleEn || input.title || '',
        ar: input.titleAr || input.title || '',
      };
    }
    if (input.title) {
      result.title = input.title;
    }

    // Handle description
    if (input.descriptionEn || input.descriptionAr) {
      result.descriptionTranslations = {
        en: input.descriptionEn || input.description || '',
        ar: input.descriptionAr || input.description || '',
      };
    }
    if (input.description) {
      result.description = input.description;
    }

    return result;
  }

  /**
   * Prepare multilingual category input
   */
  static prepareMultilingualCategoryInput(input: {
    name?: string;
    nameEn?: string;
    nameAr?: string;
    description?: string;
    descriptionEn?: string;
    descriptionAr?: string;
  }) {
    const result: any = {};

    // Handle name
    if (input.nameEn || input.nameAr) {
      result.nameTranslations = {
        en: input.nameEn || input.name || '',
        ar: input.nameAr || input.name || '',
      };
    }
    if (input.name) {
      result.name = input.name;
    }

    // Handle description
    if (input.descriptionEn || input.descriptionAr) {
      result.descriptionTranslations = {
        en: input.descriptionEn || input.description || '',
        ar: input.descriptionAr || input.description || '',
      };
    }
    if (input.description) {
      result.description = input.description;
    }

    return result;
  }

  /**
   * Prepare multilingual tag input
   */
  static prepareMultilingualTagInput(input: {
    name?: string;
    nameEn?: string;
    nameAr?: string;
  }) {
    const result: any = {};

    // Handle name
    if (input.nameEn || input.nameAr) {
      result.nameTranslations = {
        en: input.nameEn || input.name || '',
        ar: input.nameAr || input.name || '',
      };
    }
    if (input.name) {
      result.name = input.name;
    }

    return result;
  }
}