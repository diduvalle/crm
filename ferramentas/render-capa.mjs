/* Tira o PNG de uma receita de capa (marca/redes/*.html) no tamanho que a
   página declara, a 2x - as capas das redes são vistas em ecrãs retina e a 1x
   sai mole. O tamanho vem do próprio <body>, para não haver dois sítios a
   dizer quanto mede.

   Uso:
     node ferramentas/render-capa.mjs marca/redes/linkedin-capa.html marca/redes/linkedin-capa.png
*/
import { chromium } from 'playwright';
import path from 'path';

const [ENTRADA, SAIDA] = process.argv.slice(2);
if (!ENTRADA || !SAIDA) {
  console.error('uso: node ferramentas/render-capa.mjs <receita.html> <saida.png>');
  process.exit(1);
}

const b = await chromium.launch();
const p = await (await b.newContext({ deviceScaleFactor: 2 })).newPage();
const erros = [];
p.on('pageerror', e => erros.push(e.message));

await p.goto('file:///' + path.resolve(ENTRADA).replace(/\\/g, '/'), { waitUntil: 'networkidle' });
const { w, h } = await p.evaluate(() => {
  const s = getComputedStyle(document.body);
  return { w: parseInt(s.width, 10), h: parseInt(s.height, 10) };
});
await p.setViewportSize({ width: w, height: h });
await p.evaluate(() => document.fonts.ready);   // sem isto sai na letra de recurso
await p.waitForTimeout(300);
await p.screenshot({ path: SAIDA, clip: { x: 0, y: 0, width: w, height: h } });

console.log(SAIDA + '  ' + (w * 2) + 'x' + (h * 2) + (erros.length ? '  ERROS: ' + erros.join(' | ') : ''));
await b.close();
