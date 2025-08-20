import { Book } from '@/types'

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Clean Code',
    description: 'A Handbook of Agile Software Craftsmanship',
    price: 42.99,
    thumbnail: 'https://picsum.photos/400/600?random=1',
    author: 'Robert C. Martin',
    authorId: 'author1',
    category: 'Technology',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'The Pragmatic Programmer',
    description: 'Your Journey to Mastery',
    price: 39.99,
    thumbnail: 'https://picsum.photos/400/600?random=2',
    author: 'David Thomas',
    authorId: 'author2',
    category: 'Technology',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Sapiens',
    description: 'A Brief History of Humankind',
    price: 24.99,
    thumbnail: 'https://picsum.photos/400/600?random=3',
    author: 'Yuval Noah Harari',
    authorId: 'author3',
    category: 'History',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    title: 'The Lord of the Rings',
    description: 'The epic fantasy trilogy',
    price: 35.99,
    thumbnail: 'https://picsum.photos/400/600?random=4',
    author: 'J.R.R. Tolkien',
    authorId: 'author4',
    category: 'Fantasy',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    title: 'Steve Jobs',
    description: 'The Exclusive Biography',
    price: 29.99,
    thumbnail: 'https://picsum.photos/400/600?random=5',
    author: 'Walter Isaacson',
    authorId: 'author5',
    category: 'Biography',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
  {
    id: '6',
    title: 'A Brief History of Time',
    description: 'From the Big Bang to Black Holes',
    price: 18.99,
    thumbnail: 'https://picsum.photos/400/600?random=6',
    author: 'Stephen Hawking',
    authorId: 'author6',
    category: 'Science',
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z',
  },
  {
    id: '7',
    title: 'Design Patterns',
    description: 'Elements of Reusable Object-Oriented Software',
    price: 54.99,
    thumbnail: 'https://picsum.photos/400/600?random=7',
    author: 'Gang of Four',
    authorId: 'author7',
    category: 'Technology',
    createdAt: '2024-01-07T00:00:00Z',
    updatedAt: '2024-01-07T00:00:00Z',
  },
  {
    id: '8',
    title: 'The Hobbit',
    description: 'The prelude to The Lord of the Rings',
    price: 19.99,
    thumbnail: 'https://picsum.photos/400/600?random=8',
    author: 'J.R.R. Tolkien',
    authorId: 'author4',
    category: 'Fantasy',
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z',
  },
  {
    id: '9',
    title: 'Cosmos',
    description: 'A Personal Voyage',
    price: 22.99,
    thumbnail: 'https://picsum.photos/400/600?random=9',
    author: 'Carl Sagan',
    authorId: 'author8',
    category: 'Science',
    createdAt: '2024-01-09T00:00:00Z',
    updatedAt: '2024-01-09T00:00:00Z',
  },
  {
    id: '10',
    title: 'The Wright Brothers',
    description: 'The Story of Aviation Pioneers',
    price: 27.99,
    thumbnail: 'https://picsum.photos/400/600?random=10',
    author: 'David McCullough',
    authorId: 'author9',
    category: 'Biography',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: '11',
    title: 'The Roman Empire',
    description: 'A History',
    price: 31.99,
    thumbnail: 'https://picsum.photos/400/600?random=11',
    author: 'Peter Heather',
    authorId: 'author10',
    category: 'History',
    createdAt: '2024-01-11T00:00:00Z',
    updatedAt: '2024-01-11T00:00:00Z',
  },
  {
    id: '12',
    title: 'JavaScript: The Good Parts',
    description: 'Unearthing the Excellence in JavaScript',
    price: 29.99,
    thumbnail: 'https://picsum.photos/400/600?random=12',
    author: 'Douglas Crockford',
    authorId: 'author11',
    category: 'Technology',
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
]

// User's books (initially empty, will be populated when user creates books)
export const userBooks: Book[] = []

export const addUserBook = (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newBook: Book = {
    ...book,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  userBooks.push(newBook)
  return newBook
}

export const updateUserBook = (id: string, updates: Partial<Book>) => {
  const index = userBooks.findIndex(book => book.id === id)
  if (index !== -1) {
    userBooks[index] = {
      ...userBooks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return userBooks[index]
  }
  return null
}

export const deleteUserBook = (id: string) => {
  const index = userBooks.findIndex(book => book.id === id)
  if (index !== -1) {
    userBooks.splice(index, 1)
    return true
  }
  return false
}