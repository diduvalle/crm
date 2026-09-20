/* =====================================================================
   GERADOR DE BADGES
   =====================================================================
   Produz, para cada formando, a pasta `b/<codigo>/` com:
     index.html          a pagina de verificacao, com o nome da pessoa
     selo.png            1200x630, IGUAL para toda a gente (og:image)
     selo-quadrado.png   1080x1080, com o NOME - a imagem de partilha

   PORQUE ISTO EXISTE
   Os 14 badges que ja estao publicados foram feitos numa sessao e o
   script nunca ficou no repositorio: quando foi preciso outra turma,
   ninguem sabia como se fazia. O molde (badges/modelo.html) foi extraido
   de um badge REAL ja publicado, para nascer fiel em vez de ser uma
   reconstituicao de memoria.

   GERAR NAO E ENVIAR. Isto so cria as paginas. Quem recebe o badge
   decide-se no Repo, um a um, depois de se colar la o codigo.

   COMO USAR
     node ferramentas/gerar-badges.mjs --mes "setembro de 2026" \
       --contexto "Turma 12345678 · IEFP" \
       --nomes "Ana Silva" "Bruno Costa"

   Opcoes: --data 2026-09-30 (a data do certificado; por omissao, hoje)
           --saida <pasta>   (por omissao, a pasta b/ do projeto)
   No fim imprime os pares nome -> codigo, que e o que se cola no Repo.
   ===================================================================== */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const MOLDES = path.join(AQUI, 'badges');
const RAIZ = path.resolve(AQUI, '..');

/* --- argumentos --- */
const a = process.argv.slice(2);
const opt = (n, omissao) => { const i = a.indexOf('--' + n); return i < 0 ? omissao : a[i + 1]; };
const nomes = (() => {
  const i = a.indexOf('--nomes');
  if (i < 0) return [];
  const fim = a.slice(i + 1).findIndex(x => x.startsWith('--'));
  return a.slice(i + 1, fim < 0 ? undefined : i + 1 + fim);
})();

const MES = opt('mes', '');
const CONTEXTO = opt('contexto', '');
const DATA = opt('data', new Date().toISOString().slice(0, 10));
const SAIDA = opt('saida', path.join(RAIZ, 'b'));

if (!nomes.length || !MES || !CONTEXTO) {
  console.error('Faltam dados. Exemplo:\n  node ferramentas/gerar-badges.mjs --mes "setembro de 2026" --contexto "Turma 12345678 · IEFP" --nomes "Ana Silva" "Bruno Costa"');
  process.exit(1);
}

/* Codigo de 8 caracteres, como os que ja existem. Sem vogais nem 0/O/1/l:
   estes codigos sao ditos em voz alta e escritos a mao. */
const ALFA = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const usados = new Set(fs.existsSync(SAIDA) ? fs.readdirSync(SAIDA) : []);
function codigoNovo() {
  for (let t = 0; t < 500; t++) {
    let c = ''; for (let i = 0; i < 8; i++) c += ALFA[Math.floor(Math.random() * ALFA.length)];
    if (!usados.has(c)) { usados.add(c); return c; }
  }
  throw new Error('nao consegui um codigo livre');
}
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const modelo = fs.readFileSync(path.join(MOLDES, 'modelo.html'), 'utf8');
const quadrado = fs.readFileSync(path.join(MOLDES, 'quadrado.html'), 'utf8');
const seloGenerico = fs.readFileSync(path.join(MOLDES, 'selo.png'));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const preencher = (t, v) => t.replace(/\{\{(NOME|CODIGO|MES|DATA_ISO|CONTEXTO|SLUG)\}\}/g, (m, k) => v[k]);

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const pagina = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
const feitos = [];

for (const nome of nomes) {
  const v = {
    NOME: esc(nome), CODIGO: codigoNovo(), MES: esc(MES),
    DATA_ISO: DATA + 'T00:00:00Z', CONTEXTO: esc(CONTEXTO), SLUG: slug(nome),
  };
  const pasta = path.join(SAIDA, v.CODIGO);
  fs.mkdirSync(pasta, { recursive: true });

  fs.writeFileSync(path.join(pasta, 'index.html'), preencher(modelo, v));
  fs.writeFileSync(path.join(pasta, 'selo.png'), seloGenerico);

  /* a imagem quadrada desenha-se num browser e tira-se uma fotografia */
  await pagina.setContent(preencher(quadrado, v), { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);   // sem isto sai com a letra de recurso
  await pagina.screenshot({ path: path.join(pasta, 'selo-quadrado.png') });

  feitos.push({ nome, codigo: v.CODIGO });
  console.log('  ' + v.CODIGO + '  ' + nome);
}

await browser.close();

console.log('\n' + feitos.length + ' badge(s) em ' + SAIDA);
console.log('\nA seguir: git add b/ && commit && push. Depois, no Repo, cola o codigo');
console.log('de cada um no ecra dos Badges e envia - gerar nao e enviar.\n');
console.log(JSON.stringify(Object.fromEntries(feitos.map(f => [f.nome, 'https://crm.cr0x.org/b/' + f.codigo + '/'])), null, 1));
