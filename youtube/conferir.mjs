/* ============ CONFERIR OS VÍDEOS GRAVADOS ============
   Um ficheiro existir não quer dizer que preste. Já houve aqui um
   vídeo de 52 segundos que era a abertura segurada com o ecrã de
   entrada por trás, e outro baptizado com uma gravação antiga - e eu
   dei os dois por bons porque olhei para a lista em vez de olhar para
   as imagens.

   Isto tira um fotograma do meio de cada vídeo, monta folhas de
   contacto, e aponta o que cheira mal: ficheiros magros de mais,
   duração fora do esperado, ou legendas a menos.

   Uso:  node conferir.mjs [pasta]
   ===================================================== */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import http from 'http';

const D = process.argv[2] || path.resolve('./gravados');
const videos = fs.readdirSync(D).filter(f => f.endsWith('.webm')).sort();
if (!videos.length) { console.log('nada em ' + D); process.exit(0); }

const servidor = http.createServer((q, r) => {
  const nome = decodeURIComponent(q.url).replace(/^\//, '');
  const f = path.join(D, nome);
  if (!fs.existsSync(f)) { r.writeHead(404); r.end('x'); return; }
  r.writeHead(200, { 'content-type': 'video/webm' });
  fs.createReadStream(f).pipe(r);
}).listen(8737);

const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1000, height: 620 } })).newPage();
const fichas = [], avisos = [];

for (const v of videos) {
  const kb = (fs.statSync(path.join(D, v)).size / 1024) | 0;
  await p.setContent('<body style="margin:0;background:#000">' +
    '<video id="v" src="http://127.0.0.1:8737/' + encodeURIComponent(v) + '" width="960" style="display:block"></video></body>');
  const dur = await p.evaluate(() => new Promise(r => {
    const x = document.getElementById('v');
    const ok = () => r(x.duration);
    if (x.readyState > 0) ok(); else { x.onloadedmetadata = ok; setTimeout(() => r(0), 9000); }
  }));
  /* a meio do conteúdo: depois da abertura, antes do fecho */
  const alvo = Math.max(6, dur * 0.45);
  await p.evaluate(() => document.getElementById('v').play());
  await p.waitForTimeout(alvo * 1000);
  await p.evaluate(() => document.getElementById('v').pause());
  const png = 'conf-' + v.replace('.webm', '') + '.png';
  await p.locator('#v').screenshot({ path: path.join(D, png) });

  const vtt = path.join(D, v.replace('.webm', '.vtt'));
  const legendas = fs.existsSync(vtt) ? (fs.readFileSync(vtt, 'utf8').match(/-->/g) || []).length : 0;
  fichas.push({ v, png, kb, dur, legendas });

  if (kb < dur * 25) avisos.push(v + ': magro (' + kb + 'kB para ' + dur.toFixed(0) + 's)');
  if (dur < 14 || dur > 60) avisos.push(v + ': duração estranha (' + dur.toFixed(0) + 's)');
  if (!legendas) avisos.push(v + ': sem legendas');
}
await p.close();

/* folhas de contacto, oito por folha */
const p2 = await (await b.newContext()).newPage({ viewportSize: { width: 1500, height: 1000 } });
for (let i = 0, n = 0; i < fichas.length; i += 8, n++) {
  const lote = fichas.slice(i, i + 8);
  await p2.setContent('<body style="margin:0;background:#666;padding:7px;font:600 11px Archivo,system-ui">' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px">' +
    lote.map(f => '<div><img src="data:image/png;base64,' +
      fs.readFileSync(path.join(D, f.png)).toString('base64') +
      '" style="width:100%;display:block"><div style="color:#fff">' + f.v.replace('.webm', '') +
      '  ·  ' + f.dur.toFixed(0) + 's  ·  ' + f.kb + 'kB</div></div>').join('') +
    '</div></body>');
  await p2.waitForTimeout(400);
  await p2.screenshot({ path: path.join(D, 'folha-' + n + '.png'), fullPage: true });
}
await b.close(); servidor.close();

console.log(fichas.length + ' vídeos conferidos');
console.log(avisos.length ? '\nA VER:\n  ' + avisos.join('\n  ') : '\nnada a apontar');
