import PDFDocument from 'pdfkit';
import path from 'path';

// Define complex product type based on Prisma models included in the generation
export type PdfProductData = {
  title: string;
  author: string;
  coverUrl?: string | null;
  preface?: string | null;
  alphabet?: string | null; // JSON string
  guide?: string | null;
  modules: {
    title: string;
    isFreePreview: boolean;
    pages: {
      pageType: string;
      content: string; // JSON string
    }[];
  }[];
  bookChapters: {
    title: string;
    type: string;
    vocabularyItems: {
      originalWord: string;
      translationTajik: string;
      transcription?: string | null;
    }[];
  }[];
};

/**
 * Generates a PDF buffer for a book.
 * @param book The book data including modules/chapters
 * @param isPreview If true, only generates preview content and appends a "Buy to unlock" page.
 * @returns Buffer containing the PDF data
 */
export async function generateBookPdfBuffer(book: PdfProductData, isPreview: boolean = false, origin: string = 'https://admin.ramz.tj'): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Register fonts
      try {
        // Try local file system first (works locally)
        const fs = require('fs');
        const fontRegular = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
        const fontBold = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf');
        if (fs.existsSync(fontRegular) && fs.existsSync(fontBold)) {
          doc.registerFont('Regular', fontRegular);
          doc.registerFont('Bold', fontBold);
        } else {
          throw new Error('Local fonts not found');
        }
      } catch (e) {
        // Fallback to fetching from URL (for Vercel serverless functions)
        console.log(`Fetching fonts from URL: ${origin}`);
        const regUrl = `${origin}/fonts/Roboto-Regular.ttf`;
        const boldUrl = `${origin}/fonts/Roboto-Bold.ttf`;
        
        const [regRes, boldRes] = await Promise.all([
          fetch(regUrl),
          fetch(boldUrl)
        ]);
        
        if (!regRes.ok) throw new Error(`Failed to fetch Regular font from ${regUrl}: ${regRes.status}`);
        if (!boldRes.ok) throw new Error(`Failed to fetch Bold font from ${boldUrl}: ${boldRes.status}`);
        
        doc.registerFont('Regular', Buffer.from(await regRes.arrayBuffer()));
        doc.registerFont('Bold', Buffer.from(await boldRes.arrayBuffer()));
      }

      // Colors
      const primaryColor = '#2D8C94';
      const secondaryColor = '#ECA336';
      const textColor = '#333333';

      // --- COVER PAGE ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(primaryColor);
      
      doc.fillColor('#ffffff')
         .font('Bold')
         .fontSize(36)
         .text(book.title, 50, doc.page.height / 2 - 50, { align: 'center' });
         
      doc.fontSize(20)
         .font('Regular')
         .text(book.author || 'Ramz Ebook', { align: 'center' });

      if (isPreview) {
        doc.moveDown(2);
        doc.fillColor(secondaryColor)
           .fontSize(16)
           .font('Bold')
           .text('PREVIEW VERSION', { align: 'center' });
      }

      doc.addPage();
      doc.fillColor(textColor);

      // --- PREFACE ---
      if (book.preface) {
        doc.font('Bold').fontSize(24).fillColor(primaryColor).text('Сарсухан', { align: 'center' });
        doc.moveDown();
        doc.font('Regular').fontSize(12).fillColor(textColor).text(book.preface, { align: 'justify' });
        doc.addPage();
      }

      // --- MODULES / CONTENT ---
      for (const module of book.modules) {
        // If preview mode, stop after the first non-free module
        if (isPreview && !module.isFreePreview) {
          break;
        }

        doc.font('Bold').fontSize(20).fillColor(secondaryColor).text(module.title, { align: 'left' });
        doc.moveDown();

        for (const page of module.pages) {
          if (page.pageType === 'VOCAB') {
            doc.font('Bold').fontSize(16).fillColor(primaryColor).text('Луғат');
            doc.moveDown(0.5);
            try {
              const content = JSON.parse(page.content);
              if (content.words && Array.isArray(content.words)) {
                for (const word of content.words) {
                  doc.font('Bold').fontSize(12).fillColor(textColor).text(`${word.en || word.original} `);
                  if (word.tr) {
                    doc.font('Regular').fillColor('#666666').text(`[${word.tr}] `, { continued: true });
                  }
                  doc.font('Regular').fillColor(primaryColor).text(`— ${word.tj || word.translation}`);
                  doc.moveDown(0.5);
                }
              }
            } catch (e) {}
            doc.moveDown();
          } else if (page.pageType === 'QUIZ') {
             // Basic quiz rendering
             doc.font('Bold').fontSize(16).fillColor(primaryColor).text('Тест');
             doc.moveDown(0.5);
             doc.font('Regular').fontSize(12).fillColor(textColor).text('Дар аппликатсияи мобилӣ гузаред.', { align: 'left' });
             doc.moveDown();
          }
        }
        
        doc.addPage();
      }

      // --- PREVIEW CTA PAGE ---
      if (isPreview) {
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F8FAFC');
        doc.fillColor(primaryColor)
           .font('Bold')
           .fontSize(28)
           .text('Барои давом додан китобро харидорӣ кунед', 50, doc.page.height / 2 - 50, { align: 'center' });
        doc.moveDown();
        doc.fillColor(textColor)
           .font('Regular')
           .fontSize(14)
           .text('Шумо нусхаи ройгонро мутолиа кардед. Барои дастрасӣ ба ҳамаи дарсҳо, луғатҳо ва аудио-талаффузҳо китобро харидорӣ намоед.', { align: 'center' });
      }

      // --- WATERMARK ---
      // Add watermark to all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.save();
        doc.opacity(0.05);
        doc.font('Bold').fontSize(50).fillColor(primaryColor);
        doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
        doc.text('RAMZ EBOOK', doc.page.width / 2 - 150, doc.page.height / 2 - 25, { align: 'center' });
        doc.restore();
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
