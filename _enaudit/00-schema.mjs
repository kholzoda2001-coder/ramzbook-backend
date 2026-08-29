import { q } from './db.mjs';
const tabs = await q(`select table_name from information_schema.tables where table_schema='public' order by table_name`);
console.log('TABLES:', tabs.map(t => t.table_name).join(', '));
