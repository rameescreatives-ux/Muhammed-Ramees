import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });

async function check(label, url){
  const p = await b.newPage({viewport:{width:1366,height:900}});
  const bad=[];
  p.on('response', r=>{ if(r.status()>=400 && !r.url().includes('unikai.com')) bad.push(r.status()+' '+r.url().split('/').pop()); });
  await p.goto(url,{waitUntil:'load',timeout:45000}); await p.waitForTimeout(2500);
  const r = await p.evaluate(()=>({
    h1: document.querySelector('h1')?.textContent?.trim().slice(0,32),
    fw: document.querySelector('h1') ? getComputedStyle(document.querySelector('h1')).fontWeight : null,
    sheets: document.styleSheets.length,
    themeApplied: getComputedStyle(document.documentElement).getPropertyValue('--color-brand-navy').trim(),
    js: !!document.querySelector('button[aria-label="Chat with us"]'),
  }));
  console.log(`${label}\n   h1="${r.h1}" weight=${r.fw} sheets=${r.sheets} navy=${r.themeApplied} js=${r.js} errors=${bad.length?bad.slice(0,3):'none'}`);
  await p.close();
}

await check('A. file:// from disk', 'file:///home/claude/unikai/out/index.html');
await check('B. served at sub-path', 'http://localhost:3700/artifacts/abc123/');
await check('C. deep page at sub-path', 'http://localhost:3700/artifacts/abc123/en/products/ice-cream/index.html');
await check('D. arabic at sub-path', 'http://localhost:3700/artifacts/abc123/ar/index.html');
await b.close();
