# RAMZ Ebook — Next.js Backend

A Next.js 14 (App Router) + Prisma + MySQL backend for the RAMZ Ebook mobile application.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| MySQL | ≥ 8.0 |
| npm | ≥ 9 |

---

## First-Time Setup

```bash
# 1. Enter the backend folder
cd "d:/Ramz Ebook/backend"

# 2. Install dependencies
npm install

# 3. Create your environment file
copy .env.example .env
# Then open .env and set DATABASE_URL to your MySQL credentials:
# DATABASE_URL="mysql://root:yourpassword@localhost:3306/ramz_ebook"

# 4. Create the database (run this in MySQL or any GUI first):
#    CREATE DATABASE ramz_ebook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 5. Generate the Prisma client and push the schema to MySQL
npm run db:generate
npm run db:push

# 6. Seed the database with all mock books, modules, and words
npm run db:seed

# 7. Start the dev server on port 3000
npm run dev
```

The API is now live at **http://localhost:3000**

---

## API Reference

### Mobile Endpoints (`/api/mobile/`)

These are the primary endpoints consumed by the Flutter app.

#### `GET /api/mobile/catalog`
Returns all active books for the HomeScreen catalog sections.

**Optional query param:** `?category=Бадеӣ`

```json
[
  {
    "id": "ramz-english-1",
    "title": "Забони Англисӣ барои Тоҷикон",
    "author": "RAMZ Academy",
    "coverUrl": "https://...",
    "rating": 4.9,
    "category": "Забонҳо",
    "_count": { "modules": 3 }
  }
]
```

---

#### `GET /api/mobile/library`
Returns books owned by the current user with reading progress.

**Header required:** `x-user-id: <userId>`  
*(Or pass `?userId=<userId>` as a query param)*

```json
[
  {
    "id": "ramz-english-1",
    "title": "...",
    "isOwned": true,
    "isLocked": false,
    "progress": 0.35,
    "lastReadPageIndex": 4
  }
]
```

---

#### `GET /api/mobile/books/:id`
Returns the **full nested book** payload consumed by `BookReaderScreen`.
Includes `preface`, `alphabet`, `guide`, and all `modules` with their `words` and `quizzes`.

**Header optional:** `x-user-id: <userId>` — enriches `isOwned`, `progress`, `lastReadPageIndex`

```json
{
  "id": "ramz-english-1",
  "title": "Забони Англисӣ барои Тоҷикон",
  "preface": "Хонандаи азиз...",
  "alphabet": [{ "letter": "A a", "hint": "А - монанди «алиф»" }],
  "guide": "Роҳнамо барои навомӯзон...",
  "isOwned": true,
  "progress": 0.35,
  "lastReadPageIndex": 4,
  "modules": [
    {
      "id": "mod-greetings",
      "title": "Мавзӯи 1: Саломутобиат",
      "words": [
        { "id": "w1", "originalWord": "Hello", "transcription": "/həˈloʊ/", "pronunciation": "хэ-ЛОУ", "translation": "Салом", "audioUrl": "" }
      ],
      "quizzes": [
        { "id": "q1-1", "question": "\"Hello\" тоҷикӣ чист?", "options": ["Салом", "Хайр", "Ташаккур", "Бале"], "correctAnswerIndex": 0 }
      ]
    }
  ]
}
```

---

#### `POST /api/mobile/progress`
Updates the user's last-read page index. Called on every PageView swipe.

**Header required:** `x-user-id: <userId>`

**Request body:**
```json
{ "productId": "ramz-english-1", "lastReadPageIndex": 5 }
```

**Response:**
```json
{ "ok": true, "lastReadPageIndex": 5 }
```

---

### Legacy Public Endpoints (`/api/public/`)

These endpoints maintain backward compatibility with the existing Flutter `api_providers.dart`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/public/books` | All books |
| `GET` | `/api/public/books/:bookId/modules` | Modules for a book |
| `GET` | `/api/public/modules/:moduleId/words` | Words + quizzes for a module |

---

## Database Commands

```bash
# Open Prisma Studio (GUI for your database)
npm run db:studio

# Re-apply schema changes
npm run db:push

# Create a named migration
npm run db:migrate

# Wipe and re-seed (dev only!)
npm run db:reset
```

---

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── mobile/
│   │   │   ├── catalog/route.ts       ← GET all active books
│   │   │   ├── library/route.ts       ← GET user's purchased books
│   │   │   ├── books/[id]/route.ts    ← GET full book detail
│   │   │   └── progress/route.ts      ← POST reading progress
│   │   └── public/                    ← Legacy compatibility routes
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── prisma.ts                      ← Singleton Prisma client
│   └── auth.ts                        ← userId extraction + error helper
├── prisma/
│   ├── schema.prisma                  ← Database models
│   └── seed.ts                        ← Dev seed data (mirrors mock_data.dart)
├── .env.example
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Next Steps (Phase 3)

Once you confirm this backend is working, the Flutter integration phase will:

1. Update `api_providers.dart` to point to `/api/mobile/...`
2. Refactor `HomeScreen` to load real catalog + library data via `FutureBuilder`
3. Refactor `BookReaderScreen` to fetch `/api/mobile/books/[id]` and POST progress on every swipe
