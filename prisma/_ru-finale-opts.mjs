import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
for(const q of await sql`SELECT id,question qq,options o,"correctIndex" ci FROM "ComprehensionQuestion" WHERE id IN ('cmsrdkuuz006n13pc6o2ok3eq','cmsrdkv12006p13pcsfgkih2p','cmsrdkvii006t13pc0h9ns9ct','cmsrej5ug007botn5e60qm50g','cmsrej672007fotn54qapaixa','cmsrej6db007hotn58g05yl6n','cmsrf4bs000efotn59gjfdk0b','cmsrf4c4l00ejotn5uoay30ow','cmsrfp57j0089q8j7locdvgkr','cmsrfp5jt008dq8j739l4o9kv')`){
  const o=Array.isArray(q.o)?q.o:JSON.parse(q.o);
  console.log(`${q.qq}\n   ${JSON.stringify(o)} → "${o[q.ci]}"`);
}
