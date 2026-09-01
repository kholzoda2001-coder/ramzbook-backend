import { defineConfig } from 'vitest/config';
import path from 'node:path';

// ⚠️ `.mts` = ESM, пас `__dirname` вуҷуд НАДОРАД. `import.meta.dirname`
// (Node ≥20.11) ҳамон қиматро медиҳад. Ҳамин ягона фарқ аз §6-и патч аст —
// худи конфиг бетағйир мемонад.
export default defineConfig({
  test: { include: ['lib/**/*.test.ts'], environment: 'node' },
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './') } },
});
