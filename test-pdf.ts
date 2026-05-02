import { generateBookPdfBuffer } from './lib/pdf-generator';

const dummyBook = {
  id: 'test_book',
  title: 'Test Book',
  author: 'Test Author',
  modules: [],
  bookChapters: [],
};

async function run() {
  try {
    console.log('Generating pdf buffer...');
    const buffer = await generateBookPdfBuffer(dummyBook as any, false);
    console.log('Success! Buffer length:', buffer.length);
  } catch (error) {
    console.error('Error generating buffer:', error);
  }
}

run();
