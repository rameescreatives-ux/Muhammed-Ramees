// Sanity checks on ./dist: internal links resolve, JSON-LD parses, titles/descriptions present, hreflang pairs exist.
import fs from 'node:fs';
import path from 'node:path';
const D = path.resolve('dist');
const files = fs.readdirSync(D, { recursive: true }).filter((f) => f.endsWith('.html'));
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL', m); };
const exists = (u) => {
  u = u.split('#')[0].split('?')[0];
  if (!u) return true;
  const p = path.join(D, u);
  return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html')));
};
for (const f of files) {
  const h = fs.readFileSync(path.join(D, f), 'utf8');
  if (!/<title>[^<]{10,}<\/title>/.test(h)) fail(f + ' title');
  if (!/<meta name="description" content="[^"]{50,}/.test(h)) fail(f + ' description short/missing');
  if ((h.match(/<h1[ >]/g) || []).length !== 1) fail(f + ' h1 count ' + (h.match(/<h1[ >]/g) || []).length);
  for (const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) { try { JSON.parse(m[1]); } catch { fail(f + ' bad JSON-LD'); } }
  for (const m of h.matchAll(/(?:href|src)="(\/[^"#]*)[^"]*"/g)) if (!m[1].startsWith('//') && !exists(m[1])) fail(f + ' broken ' + m[1]);
  if (!/hreflang="x-default"/.test(h)) fail(f + ' hreflang');
}
console.log(`${files.length} pages checked, ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
