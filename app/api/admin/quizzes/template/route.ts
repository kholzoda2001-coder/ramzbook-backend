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
    // МУҲИМ: Ҷавоби дурустро бо рақам (1,2,3,4) ё ҳарф (A,B,C,D) нависед.
    // Мисол: "2" ё "B" маънии "Вариянти 2 дуруст аст"
    'Correct Option Index',
  ];

  // Row 1 — ҷавоби дуруст бо рақам (1-based)
  const exampleRow = [
    'What is the capital of Tajikistan?',  // Question
    'Khujand',                             // Option 1
    'Dushanbe',                            // Option 2 ← Дуруст
    'Bokhtar',                             // Option 3
    'Kulob',                               // Option 4
    '2',                                   // Correct Option Index: рақами 2 = Option 2
  ];

  if (format === 'xlsx') {
    // Dynamically import xlsx to keep the bundle lean during SSR
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    // Row 0 — a hint/instruction row shown right after headers
    const instructionRow = [
      '⬅ Fill your question here',
      '⬅ Option 1',
      '⬅ Option 2',
      '⬅ Option 3',
      '⬅ Option 4',
      '⬅ Enter 1, 2, 3 or 4  (OR A, B, C, D) — which option is correct?',
    ];
    const ws = XLSX.utils.aoa_to_sheet([
      headers,
      instructionRow,
      exampleRow,
      // Row with letter-format correct answer (B = Option 2)
      ['Which color is the sky?', 'Green', 'Blue', 'Red', 'Yellow', 'B'],
      // Row with number-format correct answer (3 = Option 3)
      ['How many sides does a triangle have?', 'Two', 'Four', 'Three', 'Five', '3'],
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
  // Add an instruction row right below headers so users understand the format
  const instructionRow = [
    'Fill your question here',
    'Option 1 text',
    'Option 2 text',
    'Option 3 text',
    'Option 4 text',
    'Enter: 1 or A = Option1, 2 or B = Option2, 3 or C = Option3, 4 or D = Option4',
  ];
  const csv = [
    headers.map(escape).join(','),
    instructionRow.map(escape).join(','),
    exampleRow.map(escape).join(','),
    // Example using letter format (B = Option 2)
    ['Which color is the sky?', 'Green', 'Blue', 'Red', 'Yellow', 'B'].map(escape).join(','),
    // Example using number format (3 = Option 3)
    ['How many sides does a triangle have?', 'Two', 'Four', 'Three', 'Five', '3'].map(escape).join(','),
  ].join('\r\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ramz_quiz_template.csv"',
    },
  });
}
