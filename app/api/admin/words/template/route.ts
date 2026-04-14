import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/words/template?format=csv  (default)
 *      /api/admin/words/template?format=xlsx
 *
 * Returns a downloadable template file so admins know exactly which column
 * headers the bulk-import endpoint expects.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const format = (searchParams.get('format') ?? 'csv').toLowerCase();

  const headers = [
    'emoji',
    'word',
    'translation',
    'trans_TJ',
    'trans_EN',
    'transcriptionEn',
    'transcriptionTj',
    'exampleEn',
    'exampleTj',
    'example',
    'exampleTranslation',
  ];

  const exampleRow = [
    '📖',                    // emoji
    'Hello',                 // word
    'Салом',                 // translation
    'Салом (TJ)',            // trans_TJ
    'Hello (EN)',            // trans_EN
    '[ həˈloʊ ]',           // transcriptionEn
    '[ ҳелоу ]',            // transcriptionTj
    'Hello, how are you?',  // exampleEn
    'Салом, чӣ ҳол?',       // exampleTj
    'Hello, how are you?',  // example
    'Салом, чӣ ҳол?',       // exampleTranslation
  ];

  if (format === 'xlsx') {
    // Dynamically import xlsx to keep the bundle lean during SSR
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);

    // Auto-width columns
    ws['!cols'] = headers.map(() => ({ wch: 22 }));

    XLSX.utils.book_append_sheet(wb, ws, 'Words');
    // type:'array' → plain number[], safe to pass to Buffer.from()
    const arr: number[] = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const nodeBuffer = Buffer.from(arr);

    return new NextResponse(nodeBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="ramz_vocab_template.xlsx"',
      },
    });
  }

  // ── CSV (default) ──────────────────────────────────────────────────────────
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(','),
    exampleRow.map(escape).join(','),
  ].join('\r\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ramz_vocab_template.csv"',
    },
  });
}
