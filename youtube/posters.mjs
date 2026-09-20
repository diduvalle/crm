/* ============ AS IMAGENS DE CAPA ============
   A fachada dos vídeos mostra uma imagem local enquanto ninguém carrega
   em play - é ela que evita contactar a Google. Essa imagem vinha de
   capturas feitas à mão, e para os vídeos novos não havia nenhuma.

   Tira-se do próprio vídeo: o fotograma do segundo plano, já com a
   abertura fora do ecrã. A capa passa a ser exatamente aquilo que se
   vai ver, e nunca fica desatualizada em relação ao vídeo.

   Uso:  node posters.mjs [chave ...]      (sem argumentos: as que faltam)
   ============================================= */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const AQUI = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'));
const FINAIS = process.env.CRM_FINAIS || path.join(AQUI, 'finais');
const ECRAS = process.env.CRM_ECRAS || path.resolve(AQUI, '../manual-src/docs/assets/screens');
const FFMPEG = process.env.CRM_FFMPEG || 'ffmpeg';

/* o instante da segunda legenda, mais um pouco: a primeira ainda apanha
   a abertura a desvanecer */
function quando(vtt) {
  const t = [...fs.readFileSync(vtt, 'utf8').matchAll(/^(\d\d):(\d\d):([\d.]+)\s+-->/gm)]
    .map(m => Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]));
  return (t[1] || t[0] || 6) + 1.2;
}

const pedidas = process.argv.slice(2);
let feitas = 0;
for (const f of fs.readdirSync(FINAIS).filter(x => x.endsWith('-pt.webm'))) {
  const chave = f.replace('-pt.webm', '');
  if (pedidas.length && !pedidas.includes(chave)) continue;
  const destino = path.join(ECRAS, chave + '.png');
  if (!pedidas.length && fs.existsSync(destino)) continue;   /* só as que faltam */
  const vtt = path.join(FINAIS, chave + '-pt.vtt');
  if (!fs.existsSync(vtt)) { console.log('  ' + chave + ': sem .vtt'); continue; }
  try {
    execFileSync(FFMPEG, ['-y', '-v', 'error', '-ss', String(quando(vtt)),
      '-i', path.join(FINAIS, f), '-frames:v', '1', '-vf', 'scale=1280:-1', destino], { stdio: 'pipe' });
    console.log('  ' + chave.padEnd(24) + ((fs.statSync(destino).size / 1024) | 0) + 'kB');
    feitas++;
  } catch (e) { console.log('  ' + chave + ': ffmpeg falhou'); }
}
console.log(feitas + ' capas');
