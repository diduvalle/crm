/* ============ A LINHA DE GRAVAÇÃO DOS VÍDEOS ============
   Um vídeo = abertura + ecrã + fecho, numa GRAVAÇÃO CONTÍNUA. Não há
   junção de ficheiros nem ffmpeg: a abertura e o fecho entram como uma
   camada por cima da própria app, tocam, e saem.

   A ABERTURA ESTÁ LÁ DESDE O PRIMEIRO FOTOGRAMA. Entra por
   addInitScript, antes de qualquer script da página, e é por trás dela
   que a sessão é iniciada. Na primeira versão o login aparecia no
   vídeo - dez segundos a ver um formulário a ser preenchido.

   AS LEGENDAS SAEM DO RELÓGIO DA GRAVAÇÃO, não de tempos escritos à
   mão. Cada passo traz a sua frase, e o tempo é o instante em que o
   passo aconteceu. É a única forma de baterem certo com o ecrã, mesmo
   que uma página demore mais a carregar num dia do que noutro.

   Uso:
     CRM_SENHA=... node gravar.mjs <chave>
     CRM_SENHA=... node gravar.mjs todos
     CRM_SENHA=... node gravar.mjs <chave> --en
   ======================================================== */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { GUIOES } from './guioes.mjs';

const AQUI = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
/* podem vir de fora: o gravador corre a partir de onde o Playwright está
   instalado, e não de dentro da pasta sincronizada */
const MARCA = process.env.CRM_MARCA || path.resolve(AQUI, '../marca/intro');
const SAIDA = process.env.CRM_SAIDA || path.resolve(AQUI, 'gravados');

const TURMA = process.env.CRM_TURMA || 'https://crm.cr0x.org/crm?t=crm';
const UTILIZADOR = process.env.CRM_UTILIZADOR || 'duvalle';
const SENHA = process.env.CRM_SENHA || '';
const ABERTURA = 4.2, FECHO = 4.2;

/* ---------- ler a abertura e o fecho ---------- */
function pedaco(ficheiro) {
  const s = fs.readFileSync(path.join(MARCA, ficheiro), 'utf8');
  return {
    /* fora a animação de saída: quem manda sair é o gravador, quando a
       sessão estiver pronta. Senão a abertura acaba antes do login e
       ficam segundos de creme vazio no vídeo. */
    estilo: ((s.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1])
              .replace(/\.palco\{animation:sai[^}]*\}/, ''),
    corpo: (s.match(/<body>([\s\S]*?)<\/body>/) || [, ''])[1].replace(/<script>[\s\S]*?<\/script>/g, ''),
  };
}

/* a camada, com o seu próprio estilo, para não colidir com o da app */
const montar = (estilo, corpo, fundo) => `(() => {
  const pôr = () => {
    if (document.getElementById('__camada')) return;
    const s = document.createElement('style'); s.id = '__camada-estilo';
    s.textContent = ${JSON.stringify(estilo)};
    const d = document.createElement('div'); d.id = '__camada';
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:${fundo};display:grid;place-items:center';
    d.innerHTML = ${JSON.stringify(corpo)};
    (document.head || document.documentElement).appendChild(s);
    (document.body || document.documentElement).appendChild(d);
  };
  if (document.documentElement) pôr(); else addEventListener('DOMContentLoaded', pôr);
})()`;

const desvanecer = `(() => { const d = document.getElementById('__camada');
  if (d) { d.style.transition = 'opacity .45s ease'; d.style.opacity = '0'; } })()`;
/* a app oferece a copia do servidor sempre que a sandbox esta vazia, e
   o browser da gravacao esta sempre vazio. Cancelar mantem os dados de
   exemplo, e com eles a gravacao fica repetivel. */
async function semDialogo(p) {
  await p.evaluate(() => {
    const bs = [...document.querySelectorAll('button')];
    const cancelar = bs.find(b => /^(cancelar|cancel)$/i.test((b.textContent || '').trim()) && b.offsetParent);
    if (cancelar) cancelar.click();
  }).catch(() => {});
}

const tirar = `(() => { document.getElementById('__camada')?.remove();
  document.getElementById('__camada-estilo')?.remove(); })()`;

/* ---------- o .vtt ---------- */
function vtt(cues) {
  const t = s => { const m = Math.floor(s / 60), q = s % 60;
    return '00:' + String(m).padStart(2, '0') + ':' + q.toFixed(3).padStart(6, '0'); };
  return 'WEBVTT\n\n' + cues.map(c => t(c.de) + ' --> ' + t(c.ate) + '\n' + c.texto).join('\n\n') + '\n';
}

/* ---------- gravar ---------- */
async function gravar(chave, lingua) {
  const g = GUIOES[chave];
  if (!g) { console.log('  guião desconhecido: ' + chave); return; }
  const nome = chave + '-' + lingua;
  fs.mkdirSync(SAIDA + '/tmp', { recursive: true });

  const intro = pedaco('intro.html'), outro = pedaco('outro.html');
  const b = await chromium.launch();
  const ctx = await b.newContext({
    /* em newContext a opcao chama-se viewport, nao viewportSize: com o
       nome errado a pagina ficava a 1280x720 dentro de um video de 1920 */
    viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
    recordVideo: { dir: SAIDA + '/tmp/', size: { width: 1920, height: 1080 } },
  });

  /* a língua fica escolhida antes de a página arrancar, para o ecrã não
     piscar de PT para EN a meio */
  const sufixo = '::' + (new URL(TURMA).searchParams.get('t') || '');
  if (lingua === 'en') await ctx.addInitScript(s => {
    try { localStorage.setItem('crm-v1-lang' + s, 'en'); } catch (e) {}
  }, sufixo);

  /* A ABERTURA, desde o primeiro fotograma */
  await ctx.addInitScript(montar(intro.estilo, intro.corpo, '#efe9dd'));

  const p = await ctx.newPage();
  const t0 = Date.now();
  const agora = () => (Date.now() - t0) / 1000;
  const cues = [];

  /* o login acontece POR TRÁS da abertura */
  await p.goto(TURMA, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('input[name=username]', { timeout: 20000 }).catch(() => {});
  if (await p.$('input[name=username]')) {
    await p.fill('input[name=username]', UTILIZADOR);
    await p.fill('input[name=password]', SENHA);
    await p.keyboard.press('Enter');
    /* esperar pela app, nao por um numero de segundos */
    await p.waitForFunction(() => document.querySelectorAll('.nav-link').length > 5,
      null, { timeout: 25000 }).catch(() => {});
  }
  const erro = (await p.textContent('#loginErr').catch(() => '') || '').trim();
  if (erro) { console.log('  NÃO ENTROU: ' + erro); await ctx.close(); await b.close(); return; }
  await p.evaluate(() => document.fonts.ready);

  /* a abertura tocou o que tinha a tocar; o resto do tempo foi o login */
  /* dispensar a oferta de recuperacao enquanto a abertura ainda tapa */
  await p.waitForTimeout(1200);
  await semDialogo(p);
  const falta = ABERTURA - agora();
  if (falta > 0) await p.waitForTimeout(falta * 1000);
  await p.evaluate(desvanecer);
  await p.waitForTimeout(480);
  await p.evaluate(tirar);
  await p.waitForTimeout(250);

  /* ---- os passos ---- */
  for (const passo of g.passos) {
    await semDialogo(p);
    const de = agora();
    try { await passo.fazer(p); } catch (e) { console.log('    passo falhou: ' + (e.message || '').slice(0, 70)); }
    await p.waitForTimeout((passo.espera ?? 2.6) * 1000);
    const texto = passo[lingua] || passo.pt;
    if (texto) cues.push({ de: +de.toFixed(3), ate: +agora().toFixed(3), texto });
  }

  /* ---- o fecho ---- */
  await p.evaluate(montar(outro.estilo, outro.corpo, '#efe9dd'));
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
