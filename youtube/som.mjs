/* Um vídeo com faixa de som pode na mesma estar mudo, ou ter a voz a
   acabar muito antes do fim. Aqui mede-se.

   NUM WEBM O CAMPO duration DA STREAM VEM SEMPRE N/A - o valor está na
   etiqueta DURATION. Ler o campo errado dava "SEM SOM" em todos os
   ficheiros, incluindo nos que eu já tinha ouvido com voz. */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const D = process.env.CRM_FINAIS;
const FP = process.env.CRM_FFPROBE;
const FECHO = 4.3;
const segs = t => { const m = /(\d+):(\d+):([\d.]+)/.exec(t || ''); return m ? +m[1]*3600 + +m[2]*60 + +m[3] : 0; };
let maus = 0, n = 0;
for (const f of fs.readdirSync(D).filter(x => x.endsWith('.webm')).sort()) {
  n++;
  const nome = f.replace('.webm', '');
  let vid = 0, aud = 0;
  try {
    const s = execFileSync(FP, ['-v', 'error',
      '-show_entries', 'stream=codec_type:stream_tags=DURATION', '-of', 'default=nw=1',
      path.join(D, f)], { encoding: 'utf8' });
    for (const b of s.split(/codec_type=/).slice(1)) {
      const d = segs((b.match(/TAG:DURATION=([\d:.]+)/) || [])[1]);
      if (b.startsWith('video')) vid = d; else if (b.startsWith('audio')) aud = d;
    }
  } catch (e) { console.log('  ' + nome + ': ffprobe falhou'); maus++; continue; }
  const sobra = vid - aud;
  const mau = !aud ? 'SEM SOM' : (sobra > FECHO + 6 ? 'voz acaba ' + sobra.toFixed(1) + 's antes do fim' : '');
  if (mau) maus++;
  console.log('  ' + nome.padEnd(28) + vid.toFixed(1) + 's vídeo  ' + aud.toFixed(1) + 's voz   ' + mau);
}
console.log('\n' + n + ' ficheiros, ' + maus + ' a rever');
