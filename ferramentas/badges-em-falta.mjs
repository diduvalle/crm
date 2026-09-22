/* =====================================================================
   PÁGINAS DOS BADGES QUE AINDA NÃO TÊM PASTA
   =====================================================================
   PORQUE ISTO EXISTE
   Os badges antigos nasceram do gerador: cada um com a sua pasta
   `b/<codigo>/`, com o nome no título e no selo. Os badges novos nascem
   no Repo, dentro do Supabase, e são desenhados por JavaScript em
   `/b/?c=<codigo>`.

   Um leitor de links não corre JavaScript. Ao partilhar um badge novo,
   o LinkedIn lia a página genérica, mostrava o selo de ninguém e
   guardava `https://crm.cr0x.org/b/` como destino - um ecrã em branco.
   Enquanto a pasta não existir, o endereço certo do badge nem sequer
   responde: dá 404 e o GitHub Pages serve a aplicação inteira.

   Isto fecha essa distância: lê os badges do Supabase e escreve a pasta
   dos que ainda não a têm. Não toca nas que existem - os links que já
   foram para o LinkedIn continuam a apontar para os mesmos ficheiros.

   COMO USAR
     SUPABASE_URL=...  SUPABASE_SERVICE_KEY=...  node ferramentas/badges-em-falta.mjs
     --so-ver   diz o que faria, sem escrever nada
     --saida    outra pasta que não a b/ do projeto

   A chave é a de serviço porque a tabela `badges` está fechada à chave
   pública: só a função `badge_publico` a abre, e um código de cada vez.
   Ela vive nos segredos do repositório e nunca em ficheiro.
   ===================================================================== */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const MOLDES = path.join(AQUI, 'badges');
const RAIZ = path.resolve(AQUI, '..');

const a = process.argv.slice(2);
const opt = (n, o) => { const i = a.indexOf('--' + n); return i < 0 ? o : a[i + 1]; };
const SO_VER = a.includes('--so-ver');
const SAIDA = opt('saida', path.join(RAIZ, 'b'));

/* --ficheiro troca o Supabase por um JSON local. Serve para provar o
   desenho - estrelas, ouro, medidas - sem chave nenhuma e sem tocar em
   dados reais. Em producao nunca se usa. */
const FICHEIRO = opt('ficheiro', '');

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!FICHEIRO && (!URL || !KEY)) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_KEY no ambiente (ou --ficheiro para ensaiar).');
  process.exit(1);
}

/* ---------- ler os badges ---------- */
let badges;
if (FICHEIRO) {
  badges = JSON.parse(fs.readFileSync(FICHEIRO, 'utf8'));
  console.log(badges.length + ' badges do ficheiro ' + FICHEIRO);
} else {
  const r = await fetch(URL.replace(/\/+$/, '') + '/rest/v1/badges'
    + '?select=codigo,nome,curso,formacao,mes,data_iso,contexto,formador,formador_url,estrelas,cum_laude'
    + '&order=criado_em.asc',
    { headers: { apikey: KEY, authorization: 'Bearer ' + KEY } });
  if (!r.ok) { console.error('Supabase respondeu ' + r.status + ': ' + (await r.text()).slice(0, 300)); process.exit(1); }
  badges = await r.json();
  console.log(badges.length + ' badges no Supabase');
}

const existentes = new Set(fs.existsSync(SAIDA)
  ? fs.readdirSync(SAIDA).filter(d => fs.existsSync(path.join(SAIDA, d, 'index.html')))
  : []);
const faltam = badges.filter(b => !existentes.has(b.codigo));
console.log(existentes.size + ' com pasta, ' + faltam.length + ' por fazer');
if (!faltam.length) { console.log('nada a fazer'); process.exit(0); }
if (SO_VER) { faltam.forEach(b => console.log('  ' + b.codigo + '  ' + b.nome
  + (b.cum_laude ? '  [cum laude]' : '') + (b.estrelas ? '  ' + '*'.repeat(b.estrelas) : ''))); process.exit(0); }

/* ---------- as estrelas, desenhadas como na página ao vivo ---------- */
/* uma estrela de cinco pontas, centrada em (cx,cy) */
function estrela(cx, cy, rr0) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? rr0 * 0.40 : rr0;
    p.push((cx + rr * Math.cos(ang)).toFixed(2) + ',' + (cy + rr * Math.sin(ang)).toFixed(2));
  }
  return '<polygon points="' + p.join(' ') + '" fill="#171412"/>';
}
/* a fila em arco por cima: cada uma assenta no raio do emblema e
   inclina-se para fora, como nas camisolas dos clubes */
function estrelas(n) {
  if (!n) return '';
  const R = 96, rr = 9.5, passo = 15, ini = -90 - (n - 1) * passo / 2;
  let o = '';
  for (let i = 0; i < n; i++) {
    const g = ini + i * passo, ang = g * Math.PI / 180;
    const x = 100 + R * Math.cos(ang), y = 100 + R * Math.sin(ang);
    o += '<g transform="rotate(' + (g + 90).toFixed(1) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ')">'
       + estrela(x, y, rr) + '</g>';
  }
  return o;
}

/* ---------- moldes ---------- */
const modelo = fs.readFileSync(path.join(MOLDES, 'modelo.html'), 'utf8');
const quadrado = fs.readFileSync(path.join(MOLDES, 'quadrado.html'), 'utf8');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const preencher = (t, v) => t.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in v ? v[k] : ''));

/* O CARTÃO 1200x630.
   Era o selo sozinho, sangrado para fora da folha - e igual para toda a
   gente. Deixou de servir por duas razões: o selo ganhou uma coroa de
   estrelas, que o sangramento cortava, e o cartão é agora POR PESSOA -
   é o que o LinkedIn mostra, e mostrar um selo sem nome desperdiça o
   único sítio onde o nome interessa.

   A composição não é inventada: é o cabeçalho da própria página de
   verificação - selo à esquerda, nome à direita - que é o que quem
   clicar vai encontrar do outro lado. */
const PX = Number(process.env.SELO_PX || 470);
const folhaOg = (svg, v) => `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&family=Space+Mono:wght@400;700&display=swap">
<style>html,body{margin:0;padding:0}
body{width:1200px;height:630px;background:#efe9dd;color:#171412;overflow:hidden;
  font-family:Archivo,system-ui,sans-serif;display:flex;align-items:center;gap:56px;padding:0 78px;box-sizing:border-box}
#bSelo{width:${PX}px;height:${Math.round(PX * 218 / 200)}px;flex:none}
#bSelo.ouro [stroke="#171412"]{stroke:url(#ouroG)}
#bSelo.ouro [fill="#171412"]{fill:url(#ouroG)}
#bSelo.ouro [fill="#0078bf"]{fill:url(#ouroC)}
#bSelo.ouro #seloDistincao polygon{fill:url(#ouroG)}
.rotulo{font-family:'Space Mono',monospace;font-size:22px;letter-spacing:.22em;
  text-transform:uppercase;color:${v.CLASSE_BODY ? '#6b4f08' : '#005e95'};margin:0 0 16px}
.nome{font-size:68px;font-weight:800;letter-spacing:-.02em;line-height:1.04;margin:0}
.curso{font-size:30px;font-weight:800;color:#4a423c;margin:16px 0 0}
.pe{font-family:'Space Mono',monospace;font-size:18px;letter-spacing:.14em;
  text-transform:uppercase;color:#8a7f75;margin:26px 0 0}</style>
<body class="${v.CLASSE_BODY}">${svg}<div>
<p class="rotulo">Concluiu a formação</p>
<h1 class="nome">${v.NOME}</h1>
<p class="curso">Formação prática em CRM</p>
<p class="pe">${v.MES} · crm.cr0x.org</p></div>`;

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const pOg = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const pQ = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });

let feitos = 0;
for (const b of faltam) {
  const n = Math.max(0, Math.min(4, +b.estrelas || 0));
  const v = {
    NOME: esc(b.nome), CODIGO: b.codigo, MES: esc(b.mes),
    DATA_ISO: String(b.data_iso || '').slice(0, 10) + 'T00:00:00Z',
    CONTEXTO: esc(b.contexto), SLUG: String(b.nome || 'badge').normalize('NFD')
      .replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    ESTRELAS: estrelas(n),
    CLASSE_OURO: b.cum_laude ? 'ouro' : '',
    CLASSE_BODY: b.cum_laude ? 'cumlaude' : '',
  };
  const pasta = path.join(SAIDA, b.codigo);
  fs.mkdirSync(pasta, { recursive: true });
  const pagina = preencher(modelo, v);
  fs.writeFileSync(path.join(pasta, 'index.html'), pagina);

  /* o selo desta pessoa, tirado da página que acabei de escrever */
  const svg = (pagina.match(/<svg id="bSelo"[\s\S]*?<\/svg>/) || [])[0];
  if (!svg) { console.error('  ' + b.codigo + ': não achei o selo na página gerada'); continue; }
  await pOg.setContent(folhaOg(svg, v), { waitUntil: 'networkidle' });
  await pOg.evaluate(() => document.fonts.ready);
  fs.writeFileSync(path.join(pasta, 'selo.png'), await pOg.screenshot());

  await pQ.setContent(preencher(quadrado, v), { waitUntil: 'networkidle' });
  await pQ.evaluate(() => document.fonts.ready);
  await pQ.screenshot({ path: path.join(pasta, 'selo-quadrado.png') });

  console.log('  ' + b.codigo.padEnd(10) + b.nome
    + (b.cum_laude ? '  [cum laude]' : '') + (n ? '  ' + '*'.repeat(n) : ''));
  feitos++;
}
await browser.close();
console.log('\n' + feitos + ' pasta(s) escrita(s) em ' + SAIDA);
