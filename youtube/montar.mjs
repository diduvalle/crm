/* ============ JUNTAR A VOZ AO VÍDEO ============
   Pega no .webm gravado, nas falas geradas e no .vtt, e monta um só
   ficheiro com faixa de som.

   CADA FALA ENTRA NO INSTANTE DA SUA LEGENDA. O .vtt foi escrito pelo
   relógio da própria gravação, por isso é ele que diz onde cada frase
   começa - não uma conta feita à parte que se desencontra ao primeiro
   carregamento mais lento.

   A imagem é COPIADA, não recodificada: o que se grava é o que sobe, e
   a única coisa nova no ficheiro é o som.

   Uso:  node montar.mjs <chave>-<lingua> | todos
   ============================================== */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const AQUI = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'));
const GRAVADOS = process.env.CRM_GRAVADOS || path.join(AQUI, 'gravados');
const NARRACAO = process.env.CRM_NARRACAO || path.join(AQUI, 'narracao');
const FINAIS = process.env.CRM_FINAIS || path.join(AQUI, 'finais');
const FFMPEG = process.env.CRM_FFMPEG || 'ffmpeg';

/* os instantes das legendas, em segundos */
function inicios(vtt) {
  return [...fs.readFileSync(vtt, 'utf8').matchAll(/^(\d\d):(\d\d):([\d.]+)\s+-->/gm)]
    .map(m => Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]));
}

function montar(nome) {
  const video = path.join(GRAVADOS, nome + '.webm');
  const vtt = path.join(GRAVADOS, nome + '.vtt');
  if (!fs.existsSync(video) || !fs.existsSync(vtt)) { console.log('  ' + nome + ': falta o vídeo ou o .vtt'); return; }

  const tempos = JSON.parse(fs.readFileSync(path.join(NARRACAO, 'tempos.json'), 'utf8'))[nome];
  if (!tempos) { console.log('  ' + nome + ': sem narração gerada'); return; }

  /* as falas, pela ordem em que aparecem; casam uma a uma com as legendas */
  const falas = tempos.filter(x => x.dur && x.f).map(x => path.join(NARRACAO, x.f));
  const quando = inicios(vtt);
  if (falas.length !== quando.length) {
    console.log('  ' + nome + ': ' + falas.length + ' falas para ' + quando.length +
      ' legendas - não batem, saltado');
    return;
  }

  fs.mkdirSync(FINAIS, { recursive: true });
  const destino = path.join(FINAIS, nome + '.webm');

  /* cada fala atrasada até ao instante da sua legenda, e tudo somado
     numa faixa só. normalize=0 para o amix não baixar o volume quando
     há várias entradas - elas não se sobrepõem. */
  const filtros = falas.map((_, i) =>
    '[' + (i + 1) + ':a]adelay=' + Math.round(quando[i] * 1000) + ':all=1[a' + i + ']').join(';');
  const soma = falas.map((_, i) => '[a' + i + ']').join('') +
    'amix=inputs=' + falas.length + ':normalize=0:dropout_transition=0[voz]';

  const args = ['-y', '-i', video];
  falas.forEach(f => args.push('-i', f));
  args.push('-filter_complex', filtros + ';' + soma,
    '-map', '0:v', '-map', '[voz]',
    '-c:v', 'copy',              /* a imagem passa intacta */
    '-c:a', 'libopus', '-b:a', '96k',
    /* SEM -shortest: quem manda no comprimento é a imagem. Com ele, o
       ficheiro acabava na última frase e o outro desaparecia. */
    destino);

  try {
    execFileSync(FFMPEG, args, { stdio: 'pipe' });
    /* o .vtt viaja com o vídeo: quem sobe encontra os dois no mesmo
       sítio, sem ter de saber de onde veio a gravação */
    fs.copyFileSync(vtt, path.join(FINAIS, nome + '.vtt'));
    const kb = (fs.statSync(destino).size / 1024) | 0;
    console.log('  ' + nome.padEnd(26) + falas.length + ' falas  ' + kb + 'kB');
  } catch (e) {
    console.log('  ' + nome + ': ffmpeg falhou - ' +
      String(e.stderr || e.message).split('\n').slice(-3).join(' ').slice(0, 200));
  }
}

const alvo = process.argv[2];
const nomes = alvo === 'todos'
  ? fs.readdirSync(GRAVADOS).filter(f => f.endsWith('.webm')).map(f => f.replace('.webm', '')).sort()
  : [alvo];
for (const n of nomes) montar(n);
