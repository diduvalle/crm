/* ============ A LINHA DE GRAVAÇÃO DOS VÍDEOS ============
   Um vídeo = abertura + ecrã + fecho, numa gravação contínua. Sem
   ffmpeg e sem juntar ficheiros.

   A PÁGINA GRAVADA É MINHA, e a app vive dentro de um <iframe>. A
   primeira versão injetava a abertura dentro da própria app, e deu
   duas maneiras de correr mal ao mesmo tempo:

   - a folha de estilo da abertura tem `svg{width:360px}` e `body{...}`
     sem âmbito, e pôs os ícones da app do tamanho de um punho;
   - o arranque da app volta a desenhar o corpo e levava a camada com
     ela, deixando o ecrã de entrada à vista nos primeiros segundos.

   Com a app fechada num iframe, nada disto pode acontecer: a CSS não
   passa a fronteira e a app não mexe no que está por fora. A abertura e
   o fecho são os PRÓPRIOS ficheiros intro.html e outro.html, também em
   iframes - o que se vê no vídeo é exatamente o que se vê ao abri-los.

   AS LEGENDAS SAEM DO RELÓGIO DA GRAVAÇÃO. Cada passo traz a sua frase,
   e o tempo é o instante em que o passo aconteceu.

   Uso:
     CRM_SENHA=... node gravar.mjs <chave>
     CRM_SENHA=... node gravar.mjs todos
     CRM_SENHA=... node gravar.mjs <chave> --en
   ======================================================== */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { GUIOES } from './guioes.mjs';

const AQUI = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const MARCA = process.env.CRM_MARCA || path.resolve(AQUI, '../marca/intro');
const SAIDA = process.env.CRM_SAIDA || path.resolve(AQUI, 'gravados');

const TURMA = process.env.CRM_TURMA || 'https://crm.cr0x.org/crm?t=crm';
const UTILIZADOR = process.env.CRM_UTILIZADOR || 'duvalle';
const SENHA = process.env.CRM_SENHA || '';
const ABERTURA = 4.3, FECHO = 4.3;
const PORTA = 8739;

/* ---------- servir a abertura e o fecho ---------- */
/* têm de vir por http: um iframe file:// dentro de uma página que não é
   file:// é bloqueado pelo browser */
const tipos = { '.html': 'text/html;charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
const servidor = http.createServer((q, r) => {
  const f = path.join(MARCA, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => {
    if (e) { r.writeHead(404); r.end('x'); return; }
    r.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' });
    r.end(d);
  });
}).listen(PORTA);

/* ---------- o palco ---------- */
const palco = urlApp => `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;height:100%;overflow:hidden;background:#efe9dd}
  iframe{position:fixed;inset:0;width:100%;height:100%;border:0;display:block}
  #app{z-index:1}
  #intro,#outro{z-index:9;transition:opacity .45s ease}
</style></head><body>
  <iframe id="app" src="${urlApp}"></iframe>
  <iframe id="intro" src="http://127.0.0.1:${PORTA}/intro.html?hold=1"></iframe>
</body></html>`;

/* ---------- o .vtt ---------- */
function vtt(cues) {
  const t = s => { const m = Math.floor(s / 60), q = s % 60;
    return '00:' + String(m).padStart(2, '0') + ':' + q.toFixed(3).padStart(6, '0'); };
  return 'WEBVTT\n\n' + cues.map(c => t(c.de) + ' --> ' + t(c.ate) + '\n' + c.texto).join('\n\n') + '\n';
}

/* a app oferece a cópia do servidor sempre que a sandbox está vazia, e o
   browser da gravação está sempre vazio. Cancelar mantém os dados de
   exemplo - e com eles a gravação fica repetível */
async function semDialogo(f) {
  await f.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find(x => /^(cancelar|cancel)$/i.test((x.textContent || '').trim()) && x.offsetParent);
    if (b) b.click();
  }).catch(() => {});
}

/* ---------- gravar ---------- */
async function gravar(chave, lingua) {
  const g = GUIOES[chave];
  if (!g) { console.log('  guião desconhecido: ' + chave); return; }
  const nome = chave + '-' + lingua;
  fs.mkdirSync(SAIDA + '/tmp', { recursive: true });

  const b = await chromium.launch();
  const ctx = await b.newContext({
    /* em newContext a opção chama-se viewport, não viewportSize */
    viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
    recordVideo: { dir: SAIDA + '/tmp/', size: { width: 1920, height: 1080 } },
  });
  const sufixo = '::' + (new URL(TURMA).searchParams.get('t') || '');
  if (lingua === 'en') await ctx.addInitScript(s => {
    try { localStorage.setItem('crm-v1-lang' + s, 'en'); } catch (e) {}
  }, sufixo);

  const p = await ctx.newPage();
  const t0 = Date.now();
  const agora = () => (Date.now() - t0) / 1000;
  const cues = [];

  await p.setContent(palco(TURMA));

  /* a app, dentro do iframe */
  let app = null;
  for (let i = 0; i < 40 && !app; i++) {
    await p.waitForTimeout(300);
    app = p.frames().find(f => f.url().includes('crm.cr0x.org'));
  }
  if (!app) { console.log('  a app não carregou'); await ctx.close(); await b.close(); return; }

  /* o login acontece por trás da abertura */
  await app.waitForSelector('input[name=username]', { timeout: 25000 }).catch(() => {});
  if (await app.$('input[name=username]')) {
    await app.fill('input[name=username]', UTILIZADOR);
    await app.fill('input[name=password]', SENHA);
    await app.press('input[name=password]', 'Enter');
    await app.waitForFunction(() => document.querySelectorAll('.nav-link').length > 5,
      null, { timeout: 25000 }).catch(() => {});
  }
  const erro = (await app.textContent('#loginErr').catch(() => '') || '').trim();
  if (erro) { console.log('  NÃO ENTROU: ' + erro); await ctx.close(); await b.close(); return; }
  await p.waitForTimeout(900);
  await semDialogo(app);

  /* a abertura sai quando a sessão está pronta, não a meio */
  const falta = ABERTURA - agora();
  if (falta > 0) await p.waitForTimeout(falta * 1000);
  await p.evaluate(() => { const i = document.getElementById('intro'); if (i) i.style.opacity = '0'; });
  await p.waitForTimeout(480);
  await p.evaluate(() => document.getElementById('intro')?.remove());
  await p.waitForTimeout(250);

  /* ---- os passos ---- */
  for (const passo of g.passos) {
    await semDialogo(app);
    const de = agora();
    try { await passo.fazer(app); } catch (e) { console.log('    passo falhou: ' + (e.message || '').slice(0, 70)); }
    await p.waitForTimeout((passo.espera ?? 2.6) * 1000);
    const texto = passo[lingua] || passo.pt;
    if (texto) cues.push({ de: +de.toFixed(3), ate: +agora().toFixed(3), texto });
  }

  /* ---- o fecho ---- */
  await p.evaluate(porta => {
    const f = document.createElement('iframe');
    f.id = 'outro'; f.src = 'http://127.0.0.1:' + porta + '/outro.html';
    document.body.appendChild(f);
  }, PORTA);
  await p.waitForTimeout(FECHO * 1000);

  const duracao = agora();
  await p.close(); await ctx.close(); await b.close();

  const feitos = fs.readdirSync(SAIDA + '/tmp').filter(f => f.endsWith('.webm'));
  if (!feitos.length) { console.log('  ' + nome + ': NÃO GRAVOU'); return; }
  const destino = path.join(SAIDA, nome + '.webm');
  fs.renameSync(path.join(SAIDA, 'tmp', feitos[0]), destino);
  fs.writeFileSync(path.join(SAIDA, nome + '.vtt'), vtt(cues));
  console.log('  ' + nome.padEnd(26) + duracao.toFixed(1) + 's  ' +
    ((fs.statSync(destino).size / 1024) | 0) + 'kB  ' + cues.length + ' legendas');
}

const args = process.argv.slice(2);
const lingua = args.includes('--en') ? 'en' : 'pt';
const chaves = args[0] === 'todos' ? Object.keys(GUIOES) : [args[0]];
for (const k of chaves) await gravar(k, lingua);
try { fs.rmdirSync(SAIDA + '/tmp'); } catch (e) {}
servidor.close();
