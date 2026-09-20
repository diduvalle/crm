/* =====================================================================
   A BASE DE PERGUNTAS DO PULSO, GERADA DO MANUAL
   =====================================================================
   O Pulso respondia a ~96 "como se faz" escritos à mão. O manual tem 48
   páginas, 196 secções, 60 perguntas frequentes e um glossário - tudo
   escrito, revisto, e em duas línguas. Reescrever isso à mão dentro da
   app era trabalho a dobrar e ficava desatualizado à primeira edição.

   Isto lê o manual e produz pulso-base.json: uma entrada por secção
   (título → pergunta; primeira frase → resposta; âncora → "Abrir no
   manual" a cair no sítio certo), uma por pergunta da FAQ, uma por termo
   do glossário. A app carrega o ficheiro no arranque e junta-o às
   entradas escritas à mão, que continuam a ganhar quando batem melhor.

   As chaves de cada entrada são o título mais as suas variantes (verbo
   no infinitivo, sinónimos correntes): o motor do Pulso já corta as
   terminações dos dois lados, por isso "como crio" apanha "criar".

   COMO USAR
     node ferramentas/pulso-base.mjs            (escreve pulso-base.json)
     node ferramentas/pulso-base.mjs --ver      (só mostra o que faria)
   Correr sempre que o manual mudar; o ficheiro vai para o repositório.
   ===================================================================== */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const DOCS = path.join(RAIZ, 'manual-src', 'docs');
const SAIDA = path.join(RAIZ, 'pulso-base.json');
const SO_VER = process.argv.includes('--ver');

/* página do manual → módulo da app (inverso do HELP_MAP da app). Serve
   para o Pulso só oferecer o que a pessoa pode ver, e para dar
   prioridade ao ecrã onde ela está. */
const MOD = [
  ['modulos/dashboard-agenda', 'dashboard'], ['modulos/empresas-contactos', 'empresas'],
  ['modulos/produtos', 'produtos'], ['modulos/propostas', 'propostas'], ['modulos/modelos', 'modelos'],
  ['modulos/campanhas-email', 'campanhas'], ['modulos/casos', 'casos'], ['modulos/decisao', 'decisao'],
  ['modulos/retencao', 'retencao'], ['modulos/analytics', 'analytics'], ['rgpd', 'rgpd'],
  ['modulos/alertas', 'alertas'], ['modulos/definicoes', 'definicoes'], ['modulos/assistente', null],
  ['formador', 'definicoes'], ['tutoriais/montar-turma', 'definicoes'],
];
const modDe = rel => { for (const [p, m] of MOD) if (rel.startsWith(p)) return m; return null; };

/* o slug que o MkDocs dá a um título: minúsculas, sem acentos, tudo o
   que não é letra ou número vira hífen */
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/* tira o markdown de uma frase, deixando o texto e o negrito (que a
   app já usa nas respostas) */
function limpar(s) {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/<figure[\s\S]*?<\/figure>/g, '')
    .replace(/<[^>]+>/g, m => /^<\/?strong>$/.test(m) ? m : '')
    .replace(/\s+/g, ' ').trim();
}
/* a primeira frase de um parágrafo, até um ponto seguido de espaço;
   se for muito longa corta-se numa vírgula ou aos 220 caracteres */
function primeiraFrase(p) {
  const t = limpar(p);
  const m = t.match(/^(.{20,}?[.!?])(\s|$)/);
  let f = m ? m[1] : t;
  if (f.length > 220) { const v = f.lastIndexOf(', ', 200); f = (v > 80 ? f.slice(0, v) : f.slice(0, 200)) + '…'; }
  return f;
}

/* variantes de uma pergunta: o título e as formas como alguém o
   escreveria. "Passo a passo" numa página de propostas vale pouco
   sozinho - por isso o título da PÁGINA entra também. */
const SIN = [
  ['criar', 'novo', 'nova', 'adicionar', 'registar', 'inserir', 'fazer'],
  ['apagar', 'remover', 'eliminar', 'tirar'],
  ['enviar', 'mandar', 'expedir'],
  ['exportar', 'descarregar', 'sacar', 'guardar em pdf'],
  ['importar', 'carregar', 'subir'],
  ['editar', 'alterar', 'mudar', 'corrigir', 'atualizar'],
  ['ver', 'consultar', 'mostrar', 'onde está', 'onde vejo'],
  ['proposta', 'orçamento', 'cotação'],
  ['empresa', 'conta', 'cliente'],
  ['contacto', 'pessoa'],
  ['palavra-passe', 'password', 'senha'],
  ['formando', 'aluno'],
  ['formador', 'professor'],
];
function variantes(titulo, pagina) {
  const base = limpar(titulo).replace(/<[^>]+>/g, '').replace(/[?!.:]+$/, '').trim();
  const ks = new Set([base.toLowerCase()]);
  /* o assunto da página, sem o que vem a seguir a um travessão ou entre
     parênteses: "Tutorial guiado: montar a turma em 10 minutos" fica
     "montar a turma"; "Pedidos de titular (DSAR)" fica "pedidos de titular" */
  let pag = limpar(pagina).replace(/<[^>]+>/g, '').replace(/\s*-.*$/, '').replace(/\s*\(.*?\)/g, '')
    .replace(/^.*?:\s*/, '').replace(/\s+em \d+ minutos$/, '').toLowerCase().trim();
  if (/^(faq|glossário|manual)/i.test(pag)) pag = '';
  const low = base.toLowerCase();
  /* títulos genéricos, que se repetem de página para página, viram
     perguntas com o assunto: ninguém escreve "passo a passo", escreve
     "como crio um modelo de proposta" */
  if (pag) {
    ks.add(base.toLowerCase() + ' ' + pag);
    if (/^passo a passo|^criar\b|^como (criar|fazer|adicionar)/.test(low) || /^passo \d/.test(low)) {
      ks.add('como criar ' + pag); ks.add('como faço ' + pag); ks.add('como se faz ' + pag); ks.add('criar ' + pag);
    }
    if (/^o ecrã|^a lista|^a vista/.test(low)) { ks.add('o ecrã de ' + pag); ks.add('onde vejo ' + pag); ks.add(pag); }
    if (/campo a campo|^cada (pedido|linha|proposta|caso|contacto|empresa)/.test(low)) { ks.add('campos de ' + pag); ks.add('o que preencher em ' + pag); ks.add('que campos tem ' + pag); }
    if (/^enviar|^exportar|^importar|^apagar|^remover|^editar/.test(low)) { ks.add(low.split(' ')[0] + ' ' + pag); }
  }
  /* sinónimos: uma variante por sinónimo da primeira palavra que bater */
  for (const grupo of SIN) {
    const w = grupo.find(x => new RegExp('(^|\\s)' + x + '(\\s|$)').test(low));
    if (!w) continue;
    for (const alt of grupo) if (alt !== w) ks.add(low.replace(new RegExp('(^|\\s)' + w + '(\\s|$)'), '$1' + alt + '$2'));
    break;
  }
  return [...ks].filter(k => k.length >= 4).slice(0, 8);
}

function lerPagina(rel) {
  const pt = fs.readFileSync(path.join(DOCS, rel), 'utf8').replace(/\r/g, '');
  const relEn = rel.replace(/\.md$/, '.en.md');
  const en = fs.existsSync(path.join(DOCS, relEn)) ? fs.readFileSync(path.join(DOCS, relEn), 'utf8').replace(/\r/g, '') : '';
  return { pt, en };
}
/* caminho publicado: modulos/propostas/criar.md → modulos/propostas/criar/ */
const caminho = rel => rel.replace(/index\.md$/, '').replace(/\.md$/, '/');

/* secções H2/H3: título → primeira frase do corpo. Em inglês procura-se
   a secção de índice igual - os dois manuais têm a mesma estrutura. */
function seccoes(md) {
  const out = []; const L = md.split('\n');
  let titulo = (L.find(x => x.startsWith('# ')) || '# ').slice(2);
  let atual = null;
  for (const l of L) {
    const h = l.match(/^(##|###) (.+)$/);
    if (h) { atual = { h: h[2].trim(), corpo: [], alt: '' }; out.push(atual); continue; }
    if (!atual || !l.trim() || l.startsWith('!!!') || l.startsWith('|') || l.startsWith('<')) continue;
    /* um "Passo a passo" começa logo pela lista: o primeiro passo serve
       de resposta, sem o número à frente */
    const item = l.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
    if (item) { if (!atual.corpo.length && !atual.alt) atual.alt = item[1]; continue; }
    atual.corpo.push(l.trim());
  }
  return { titulo, lista: out.filter(s => s.corpo.length || s.alt) };
}
/* FAQ: ??? question "Pergunta" + resposta indentada */
function faq(md) {
  const out = []; const L = md.split('\n');
  for (let i = 0; i < L.length; i++) {
    const m = L[i].match(/^\?\?\? question "(.+)"\s*$/);
    if (!m) continue;
    const corpo = []; for (let j = i + 1; j < L.length && L[j].startsWith('    '); j++) corpo.push(L[j].trim());
    if (corpo.length) out.push({ q: m[1], a: corpo.join(' ') });
  }
  return out;
}
/* glossário: | **Termo** | Significado | */
function glossario(md) {
  return md.split('\n').map(l => l.match(/^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*$/)).filter(Boolean)
    .map(m => ({ termo: m[1], def: m[2] }));
}

const entradas = [];
function andar(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { andar(p); continue; }
    if (!f.name.endsWith('.md') || f.name.endsWith('.en.md')) continue;
    const rel = path.relative(DOCS, p).split(path.sep).join('/');
    if (/^(aviso-legal|videos|quiz|index)\.md$/.test(rel)) continue;
    const { pt, en } = lerPagina(rel);
    const doc = caminho(rel), mod = modDe(rel);

    if (rel === 'faq.md') {
      const enF = faq(en);
      faq(pt).forEach((x, i) => entradas.push({ k: variantes(x.q, ''), t: limpar(x.a), en: enF[i] ? limpar(enF[i].a) : '', doc, mod, faq: 1 }));
      continue;   /* um return aqui abortava a pasta inteira - e a FAQ vem cedo, por ordem alfabética */
    }
    if (rel === 'glossario.md') {
      const enG = glossario(en);
      glossario(pt).forEach((x, i) => entradas.push({
        k: [x.termo.toLowerCase(), 'o que é ' + x.termo.toLowerCase(), 'o que significa ' + x.termo.toLowerCase()].filter(k => k.length >= 4),
        t: '<strong>' + limpar(x.termo) + '</strong> - ' + limpar(x.def), en: enG[i] ? '<strong>' + limpar(enG[i].termo) + '</strong> - ' + limpar(enG[i].def) : '',
        doc, mod: null, glos: 1, termo: x.termo }));
      continue;
    }
    const S = seccoes(pt), E = seccoes(en);
    S.lista.forEach((s, i) => {
      const e = E.lista[i];
      entradas.push({ k: variantes(s.h, S.titulo), t: primeiraFrase(s.corpo[0] || s.alt), en: e ? primeiraFrase(e.corpo[0] || e.alt || '') : '',
        doc: doc + '#' + slug(limpar(s.h).replace(/<[^>]+>/g, '')), mod, pagina: limpar(S.titulo).replace(/<[^>]+>/g, '') });
    });
  }
}
andar(DOCS);

/* duas entradas com a mesma chave principal: fica a primeira, que é a
   da página mais geral (a ordem de leitura é alfabética por pasta) */
const vistas = new Set(); const finais = [];
for (const e of entradas) { const k0 = e.k[0]; if (!k0 || vistas.has(k0 + '|' + (e.mod || ''))) continue; vistas.add(k0 + '|' + (e.mod || '')); finais.push(e); }

const conta = { seccoes: finais.filter(x => !x.faq && !x.glos).length, faq: finais.filter(x => x.faq).length, glos: finais.filter(x => x.glos).length };
console.log(finais.length + ' entradas: ' + conta.seccoes + ' secções, ' + conta.faq + ' FAQ, ' + conta.glos + ' termos');
if (SO_VER) { finais.slice(0, 6).forEach(e => console.log('  ' + e.k.join(' | ').slice(0, 90) + '\n      → ' + e.t.slice(0, 100) + '\n      ' + e.doc)); }
else { fs.writeFileSync(SAIDA, JSON.stringify(finais)); console.log('escrito ' + path.relative(RAIZ, SAIDA) + ' (' + (fs.statSync(SAIDA).size / 1024 | 0) + ' kB)'); }
