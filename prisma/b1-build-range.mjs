// Driver: B1 модулҳоро тавассути admin API месозад. Аргумент: рӯйхати файлҳо.
// node prisma/b1-build-range.mjs b1-m1 b1-m2 b1-m3 b1-m4   (order0 аз индекси аргумент — не! аз M.order-1)
import { getCtx, buildViaApi } from './b1-api-build.mjs';

const files = process.argv.slice(2);
if (!files.length) throw new Error('Usage: node b1-build-range.mjs b1-m1 b1-m2 ...');

const ctx = await getCtx();
console.log(`B1 course=${ctx.courseId} | модулҳои мавҷуда: ${ctx.b1.modules.length}`);
for (const f of files) {
  const mod = (await import('./' + f + '.mjs')).M;
  mod.order0 = (mod.order ?? 1) - 1;         // authored order 1-based → 0-based роадмап
  await buildViaApi(mod, ctx);
}
console.log('✅ ТАМОМ:', files.join(', '));
