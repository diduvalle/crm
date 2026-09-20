/* Imprime o manual de normas gráficas em PDF, A4 deitado.

   As maquetes são capturas reais das páginas: quem quiser refrescá-las
   corre este guião com --maquetes (precisa do sítio publicado e, para o
   badge e o teste, de um servidor local na porta 8126 a servir a raiz do
   projeto - os dois usam dados simulados, porque essas páginas só abrem
   com um link pessoal).

   Uso:
     node ferramentas/imprimir-manual.mjs
     node ferramentas/imprimir-manual.mjs --maquetes
*/
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const RAIZ = path.resolve('.');
const FONTE = path.join(RAIZ, 'marca', 'manual-normas.html');
const SAIDA = path.join(RAIZ, 'marca', 'CRM-manual-de-normas-graficas.pdf');

const b = await chromium.launch();

if (process.argv.includes('--maquetes')) {
  console.error('As maquetes refrescam-se com o guião que está no README da pasta marca/.');
}

const p = await (await b.newContext()).newPage();
p.on('pageerror', e => console.error('pageerror: ' + e.message));
await p.goto('file:///' + FONTE.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);

await p.pdf({
  path: SAIDA,
  width: '297mm', height: '210mm',      // A4 deitado, sem margens
  printBackground: true,
  preferCSSPageSize: false,
});

const kb = Math.round(fs.statSync(SAIDA).size / 1024);
console.log(path.relative(RAIZ, SAIDA) + '  ' + kb + ' KB');
await b.close();
