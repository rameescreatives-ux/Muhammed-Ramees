import { chromium } from 'playwright';
const B='http://localhost:3700/artifacts/abc123';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
for (const [name,u,w] of [['sub-home','/en/index.html',1366],['sub-mobile','/en/index.html',390],['sub-products','/en/products/ice-cream/index.html',1366]]) {
  const p = await b.newPage({ viewport:{width:w,height:1000} });
  await p.goto(B+u,{waitUntil:'load',timeout:45000}); await p.waitForTimeout(3000);
  await p.screenshot({path:`/tmp/shots/${name}.png`, fullPage: w===390?false:true});
  console.log(name,'ok'); await p.close();
}
await b.close();
