/* Varre páginas à procura do tipo de coisa que ele tem estado a apontar:
   texto fora de escala, serif em controlos, contraste baixo, caixas
   desproporcionadas. Para correr ANTES de dizer que está pronto.

   A primeira versão mentiu: leu CSS em cache e deu 1.2:1 onde a página
   ao vivo tinha 15:1. Agora desliga a cache do contexto e compõe o fundo
   real (alfa e opacity acumulada dos pais), que é o que o olho vê. */
import { chromium } from 'playwright';

const ALVO = process.argv.slice(2);
if (!ALVO.length) ALVO.push('https://crm.cr0x.org/manual/formando/trabalhar/');

const b = await chromium.launch();
const ctx = await b.newContext({ bypassCSP: true });
await ctx.route('**/*.{css,js}', r => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
let total = 0;

for (const alvo of ALVO) {
  const p = await ctx.newPage({ viewportSize: { width: 1600, height: 1020 } });
  await p.goto(alvo + (alvo.includes('?') ? '&' : '?') + 'x=' + Date.now(), { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);

  const r = await p.evaluate(() => {
    const vis = e => { const q = e.getBoundingClientRect();
      if (q.width <= 0 || q.height <= 0) return false;
      /* um pai escondido esconde o filho: o dropdown de idioma e o overlay
         de busca estao montados mas invisiveis, e nao contam */
      let x = e; while (x && x !== document.documentElement) { const c = getComputedStyle(x);
        if (c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) < .1) return false;
        x = x.parentElement; }
      return q.bottom > -200 && q.right > -200; };
    const soTexto = e => [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
    const num = s => (s.match(/[\d.]+/g) || []).map(Number);

    /* o fundo que o olho vê: compõe as camadas com alfa até achar opaco */
    /* um gradiente nao tem cor em backgroundColor: fingir que e' papel
       dava leituras de 1:1 em texto branco sobre o heroi. Devolve null e
       o contraste desse elemento nao se mede. */
    const fundo = e => { let x = e, pilha = [];
      while (x) { const bi = getComputedStyle(x).backgroundImage;
        if (bi && bi !== 'none') return null;
        const g = num(getComputedStyle(x).backgroundColor);
        if (g.length >= 3 && (g[3] === undefined || g[3] > 0)) { pilha.push(g); if (g[3] === undefined || g[3] >= 1) break; }
        x = x.parentElement; }
      if (!pilha.length) return [255, 255, 255];
      let out = pilha.pop().slice(0, 3);
      while (pilha.length) { const c = pilha.pop(), a = c[3] === undefined ? 1 : c[3];
        out = [0,1,2].map(i => c[i] * a + out[i] * (1 - a)); }
      return out; };
    /* opacity acumulada: texto a .5 sobre papel não contrasta como a 1 */
    const opac = e => { let x = e, o = 1; while (x && x !== document.documentElement) { o *= parseFloat(getComputedStyle(x).opacity); x = x.parentElement; } return o; };
    const L = v => { const s = v.slice(0,3).map(n => { n = n/255; return n <= .03928 ? n/12.92 : Math.pow((n+.055)/1.055, 2.4); });
      return .2126*s[0] + .7152*s[1] + .0722*s[2]; };

    const a = { escala: [], serif: [], contraste: [], caixas: [] };
    const CHAO = 11, TETO = 34;
    const capa = e => !!e.closest('.crm-hero, .hero, header');   /* o titulo de capa e grande de proposito */

    for (const e of document.querySelectorAll('body *')) {
      if (e.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;   /* o texto de um desenho SVG nao tem fundo em CSS */
      if (!vis(e) || !soTexto(e)) continue;
      const c = getComputedStyle(e), fs = parseFloat(c.fontSize);
      const t = (e.textContent || '').trim().slice(0, 40);
      const tag = e.tagName.toLowerCase();
      const cls = (typeof e.className === 'string' ? e.className : '').split(' ')[0];
      const nome = tag + (cls ? '.' + cls : '');

      if ((fs < CHAO || fs > TETO) && !/^(h1|h2)$/.test(tag) && !(fs > TETO && capa(e))) a.escala.push(nome + '  ' + fs + 'px  "' + t + '"');
      if (/Newsreader|Georgia|serif/i.test(c.fontFamily) && /^(input|button|select|textarea)$/.test(tag))
        a.serif.push(nome + '  "' + t + '"');

      const cor = num(c.color), bg = fundo(e), o = opac(e);
      if (cor.length >= 3 && bg && t) {
        const frente = [0,1,2].map(i => cor[i] * o + bg[i] * (1 - o));   /* o texto já esbatido */
        const x = L(frente), y = L(bg), ct = (Math.max(x,y)+.05) / (Math.min(x,y)+.05);
        const grande = fs >= 24 || (fs >= 18.66 && parseInt(c.fontWeight) >= 700);
        if (ct < (grande ? 3 : 4.5)) a.contraste.push(nome + '  ' + ct.toFixed(1) + ':1  ' + fs + 'px  "' + t + '"');
      }
    }

    const barra = document.querySelector('.md-header');
    if (barra) { const hb = barra.getBoundingClientRect().height;
      for (const s of ['.md-search__form', '.md-header__button']) {
        const e = document.querySelector(s); if (!e) continue;
        const h = e.getBoundingClientRect().height;
        if (h > hb * .85) a.caixas.push(s + '  ' + Math.round(h) + 'px numa barra de ' + Math.round(hb)); } }
    return a;
  });
  await p.close();

  const nome = { escala: 'fora de escala', serif: 'serif em controlos', contraste: 'contraste fraco', caixas: 'caixas desproporcionadas' };
  const linhas = [];
  for (const k of Object.keys(r)) [...new Set(r[k])].forEach(x => linhas.push('   ' + nome[k] + ' · ' + x));
  total += linhas.length;
  console.log('\n' + alvo.replace('https://crm.cr0x.org', '') + (linhas.length ? '  (' + linhas.length + ')' : '  ok'));
  linhas.slice(0, 12).forEach(x => console.log(x));
}
console.log('\n' + (total ? total + ' a rever' : 'nada a apontar em ' + ALVO.length + ' páginas'));
await b.close();
