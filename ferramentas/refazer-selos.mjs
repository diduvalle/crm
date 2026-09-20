/* =====================================================================
   REFAZER AS IMAGENS DOS BADGES JÁ EMITIDOS
   =====================================================================
   O gerador cria badges novos, com código novo. Isto é o contrário:
   volta a desenhar as imagens DENTRO das pastas que já existem, sem
   tocar no código nem no endereço - os links que foram para o LinkedIn
   continuam a abrir e a apontar para os mesmos ficheiros.

   Porquê: as imagens foram desenhadas com JetBrains Mono, uma fonte
   que deixou de fazer parte da casa. A página de verificação já foi
   acertada; faltavam as duas imagens.

   O que refaz, em cada pasta b/<codigo>/:
     selo.png           1200x630, igual para toda a gente (og:image)
     selo-quadrado.png  1080x1080, com o nome da pessoa

   O nome e o mês são lidos da própria página, não de uma lista: a
   página é a fonte do que lá está escrito.

   COMO USAR
     node ferramentas/refazer-selos.mjs [--pasta <b/>] [--so-ver]
   ===================================================================== */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const MOLDES = path.join(AQUI, 'badges');
const a = process.argv.slice(2);
const opt = (n, o) => { const i = a.indexOf('--' + n); return i < 0 ? o : a[i + 1]; };
const SO_VER = a.includes('--so-ver');
const PASTA = opt('pasta', path.resolve(AQUI, '..', 'b'));

const quadrado = fs.readFileSync(path.join(MOLDES, 'quadrado.html'), 'utf8');
const modelo = fs.readFileSync(path.join(MOLDES, 'modelo.html'), 'utf8');

/* o selo redondo vive dentro da página de verificação; tira-se de lá e
   desenha-se sozinho sobre papel, que é o que a imagem sempre foi */
const svg = (modelo.match(/<svg viewBox="0 0 200 200"[\s\S]*?<\/svg>/) || [])[0];
if (!svg) { console.error('não achei o selo dentro do modelo.html'); process.exit(1); }
/* a original sangra em cima e em baixo: o selo e maior do que a folha */
const PX = Number(process.env.SELO_PX || 980);
const FOLHA = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;800&family=Space+Mono:wght@400;700&display=swap">
<style>html,body{margin:0;padding:0}
body{width:1200px;height:630px;background:#efe9dd;overflow:hidden;position:relative}
/* maior do que a folha, e centrado pelo meio: um place-items:center
   não centra o que transborda, e o selo saía descaído */
svg{position:absolute;left:50%;top:50%;width:${PX}px;height:${PX}px;transform:translate(-50%,-50%)}</style>` + svg.replace(/{{CODIGO}}/g, 'og');

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});

/* 1. o selo genérico, uma vez */
const pOg = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await pOg.setContent(FOLHA, { waitUntil: 'networkidle' });
await pOg.evaluate(() => document.fonts.ready);
const seloNovo = await pOg.screenshot();
await pOg.close();

/* 2. um quadrado por pessoa */
const pQ = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
let n = 0, saltados = 0;
for (const d of fs.readdirSync(PASTA)) {
  const pagina = path.join(PASTA, d, 'index.html');
  if (!fs.existsSync(pagina)) continue;
  const html = fs.readFileSync(pagina, 'utf8');
  const nome = (html.match(/<h1>([^<]+)<\/h1>/) || [])[1];
  const MESES = ['janeiro','fevereiro','marco','março','abril','maio','junho','julho',
                 'agosto','setembro','outubro','novembro','dezembro'];
  /* o badge do formador tem outra frase; procura-se o mês onde estiver */
  const baixo = html.toLowerCase();
  let mes = '';
  for (const m of MESES) { const i = baixo.indexOf(m + ' de 2'); if (i >= 0) { mes = html.slice(i, i + m.length + 8); break; } }
  if (!nome || !mes) { console.log('  ' + d + ': não li o nome ou o mês, saltado'); saltados++; continue; }
  if (SO_VER) { console.log('  ' + d.padEnd(10) + nome + '  ·  ' + mes); n++; continue; }
  await pQ.setContent(quadrado.replace(/\{\{NOME\}\}/g, nome).replace(/\{\{MES\}\}/g, mes), { waitUntil: 'networkidle' });
  await pQ.evaluate(() => document.fonts.ready);
  await pQ.screenshot({ path: path.join(PASTA, d, 'selo-quadrado.png') });
  fs.writeFileSync(path.join(PASTA, d, 'selo.png'), seloNovo);
  console.log('  ' + d.padEnd(10) + nome);
  n++;
}
await browser.close();

/* 3. e o molde, para os próximos nascerem já certos */
if (!SO_VER) fs.writeFileSync(path.join(MOLDES, 'selo.png'), seloNovo);
console.log('\n' + n + ' badge(s)' + (SO_VER ? ' (só a ver)' : ' refeitos') + (saltados ? ', ' + saltados + ' saltados' : ''));
