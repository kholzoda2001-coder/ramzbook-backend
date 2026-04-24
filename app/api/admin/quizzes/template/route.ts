import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/quizzes/template?format=csv  (default)
 *      /api/admin/quizzes/template?format=xlsx
 *
 * Returns a downloadable template file so admins know exactly which column
 * headers the bulk-import endpoint expects for Quizzes.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const format = (searchParams.get('format') ?? 'csv').toLowerCase();

  const headers = [
    'Question',
    'Option 1',
    'Option 2',
    'Option 3',
    'Option 4',
    'Correct Option Index',
  ];

  const exampleRow = [
    'What is the capital of Tajikistan?',  // Question
    'Khujand',                            // Option 1
    'Dushanbe',                           // Option 2
    'Bokhtar',                            // Option 3
    'Kulob',                              // Option 4
    '2',                                  // Correct Option Index (1-based, meaning Option 2 is correct)
  ];

  if (format === 'xlsx') {
    // Dynamically import xlsx to keep the bundle lean during SSR
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      headers, 
      exampleRow,
      ['Which color is the sky?', 'Green', 'Red', 'Blue', 'Yellow', '3'] // A second example row
    ]);

    // Auto-width columns
    ws['!cols'] = [
      { wch: 40 }, // Question
      { wch: 20 }, // Opt 1
      { wch: 20 }, // Opt 2
      { wch: 20 }, // Opt 3
      { wch: 20 }, // Opt 4
      { wch: 20 }, // Correct Index
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Quizzes');
    // type:'array' → plain number[], safe to pass to Buffer.from()
    const arr: number[] = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const nodeBuffer = Buffer.from(arr);

    return new NextResponse(nodeBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="ramz_quiz_template.xlsx"',
      },
    });
  }

  // ── CSV (default) ──────────────────────────────────────────────────────────
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(','),
    exampleRow.map(escape).join(','),
    ['Which color is the sky?', 'Green', 'Red', 'Blue', 'Yellow', '3'].map(escape).join(','),
  ].join('\r\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ramz_quiz_template.csv"',
    },
  });
}
