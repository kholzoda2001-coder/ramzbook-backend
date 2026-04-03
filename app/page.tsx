export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>RAMZ Ebook API</h1>
      <p>Mobile API endpoints are available under <code>/api/mobile/</code></p>
      <ul>
        <li><code>GET  /api/mobile/catalog</code> — All active books</li>
        <li><code>GET  /api/mobile/library</code> — User&apos;s purchased books with progress</li>
        <li><code>GET  /api/mobile/books/[id]</code> — Full book with modules &amp; pages</li>
        <li><code>POST /api/mobile/progress</code> — Update reading progress</li>
      </ul>
    </main>
  );
}
