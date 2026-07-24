// 31 калимаи A1-ро бо IPA-и англисӣ пур мекунад (транскрипти тоҷикӣ аллакай ҳаст).
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
const env=Object.fromEntries(readFileSync(new URL('../.env',import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const jwt=await new SignJWT({username:'admin',role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('2h').sign(new TextEncoder().encode(env.JWT_SECRET));

// id → IPA (стандартӣ). Транскрипти тоҷикӣ дар база аллакай дуруст аст.
const IPA = {
  cmqnoasbm000am91p05lb8all: '/ˈfʊl ˌneɪm/',   // Full name
  cmqnoasbm000bm91pw1iqr46u: '/ˈsɜː.neɪm/',     // Surname
  cmqnoasbm000cm91p05arq1r3: '/ˈæd.res/',       // Address
  cmqnoasbm000dm91pnjbvenfr: '/ˈmæn.ɪ.dʒə/',    // Manager
  cmqnoasbm000em91pxlv6daxp: '/ɡest/',          // Guest
  cmqwgz8cq0001gvuucqo7jmns: '/striːt/',        // Street
  cmqwgz95o0003gvuukapbwe5e: '/ˈpæs.pɔːt/',     // Passport
  cmqwgz9iq0005gvuucyx5pkwe: '/ˈiː.meɪl/',      // Email
  cmqwgz9vs0007gvuuzarvx8q7: '/dʒɒb/',          // Job
  cmqwgza8z0009gvuuig3itdyl: '/ˈsæl.ər.i/',     // Salary
  cmqwgzam5000bgvuuvfspxetu: '/ˈkʌm.pə.ni/',    // Company
  cmqwgzaz6000dgvuup5hilwvd: '/ˌen.dʒɪˈnɪə/',   // Engineer
  cmqwgzbci000fgvuu3f9x2ttt: '/ˈdraɪ.və/',      // Driver
  cmqwgzbpr000hgvuuh2lc23b3: '/ˈbɪl.də/',       // Builder
  cmqwgzc36000jgvuufyp528fg: '/ˈsel.ə/',        // Seller
  cmqwgzcga000lgvuunltp6wl4: '/ˈfɑː.mə/',       // Farmer
  cmqwgzcta000ngvuuxib26zp6: '/ˈmær.id/',       // Married
  cmqwgzd6h000pgvuu03h34enl: '/ˈsɪŋ.ɡəl/',      // Single
  cmqwgzdjt000rgvuufecy44yk: '/ˈneɪ.bə/',       // Neighbour
  cmqwgzdwu000tgvuuw92oavb2: '/ˈklɑːs.meɪt/',   // Classmate
  cmqo0uac8000izi3h6grsyz3e: '/ˈkɒl.iːɡ/',      // Colleague
  cmqo0uac8000jzi3hwqu57v2s: '/ɡruːp/',         // Group
  cmqo0uac8000kzi3hmdf9rzu2: '/tiːm/',          // Team
  cmqo0uac8000lzi3h4sgtp8a8: '/ˈev.ri.wʌn/',    // Everyone
  cmqo0uac7000hzi3hqrvayuyk: '/ˈstreɪn.dʒə/',   // Stranger
  cmqo0uac8000vzi3ht6md11et: '/ˈtiːˌneɪ.dʒə/',  // Teenager
  cmqo0uac8000wzi3hyoydooed: '/ˈɡræn.peə.rənt/',// Grandparent
  cmqo0uac80010zi3h3lzfpi20: '/twɪnz/',         // Twins
  cmqqcfsyl002hrhonbf8brc53: '/ˈtræf.ɪk ˌlaɪt/',// Traffic light
  cmqqcfv01002jrhon0vz8w723: '/ˈkrɒs.rəʊdz/',   // Crossroads
  cmqqcfvzg002lrhonaho7fjja: '/brɪdʒ/',         // Bridge
};

let ok=0, fail=0;
for (const [id, ipa] of Object.entries(IPA)) {
  try {
    const r = await fetch('https://admin.ramz.tj/api/admin/words/'+id, {
      method:'PUT',
      headers:{'Content-Type':'application/json', Cookie:'admin_token='+jwt},
      body: JSON.stringify({ ipa }),
    });
    if (r.ok) { ok++; console.log('  ✓ '+ipa); }
    else { fail++; console.log('  ✗ '+id+' '+r.status+' '+(await r.text()).slice(0,80)); }
  } catch(e){ fail++; console.log('  ✗ '+id+' '+e.message); }
  await new Promise(s=>setTimeout(s,200));
}
console.log(`\nIPA: ${ok} пур шуд | ${fail} хато`);
