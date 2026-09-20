/* ============ A NARRAÇÃO ============
   Gera um ficheiro de áudio por passo de cada guião, na voz neural
   portuguesa ou inglesa, e mede quanto dura cada um.

   A ORDEM IMPORTA: é a narração que manda nos tempos, não o contrário.
   Primeiro gera-se a fala, mede-se, e só depois se grava o ecrã com as
   pausas ajustadas a ela. Ao contrário - pôr voz por cima de um vídeo
   já feito - a fala não cabe nos planos e fica tudo a fugir.

   O texto que sai daqui são as legendas dos guiões, que já vão ser
   públicas no manual. Nada de privado é enviado para fora.

   Uso:  node narrar.mjs <chave|todos> [--en]
   Escreve:  narracao/<chave>-<lingua>-<n>.mp3  e  narracao/tempos.json
   ===================================== */
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { GUIOES } from './guioes.mjs';

const AQUI = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'));
const SAIDA = process.env.CRM_NARRACAO || path.join(AQUI, 'narracao');
const FFPROBE = process.env.CRM_FFPROBE || 'ffprobe';

const VOZ = { pt: process.env.CRM_VOZ_PT || 'pt-PT-DuarteNeural',
              en: process.env.CRM_VOZ_EN || 'en-GB-RyanNeural' };
/* um pouco mais devagar do que o normal: é para acompanhar um ecrã, não
   para despachar */
const RITMO = process.env.CRM_RITMO || '-8%';

function duracao(f) {
  const s = execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', f], { encoding: 'utf8' });
  return Math.round(parseFloat(s) * 1000) / 1000;
}

async function falar(texto, voz, destino) {
  const t = new MsEdgeTTS();
  await t.setMetadata(voz, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = await t.toStream(texto, { rate: RITMO });
  const pedacos = [];
  await new Promise((res, rej) => {
    audioStream.on('data', c => pedacos.push(c));
    audioStream.on('end', res);
    audioStream.on('error', rej);
  });
  fs.writeFileSync(destino, Buffer.concat(pedacos));
  return duracao(destino);
}

async function narrar(chave, lingua) {
  const g = GUIOES[chave];
  if (!g) { console.log('  guião desconhecido: ' + chave); return; }
  fs.mkdirSync(SAIDA, { recursive: true });
  const tempos = fs.existsSync(path.join(SAIDA, 'tempos.json'))
    ? JSON.parse(fs.readFileSync(path.join(SAIDA, 'tempos.json'), 'utf8')) : {};
  const nome = chave + '-' + lingua;
  const lista = [];

  for (let i = 0; i < g.passos.length; i++) {
    const texto = (g.passos[i][lingua] || '').trim();
    if (!texto) { lista.push({ i, dur: 0, f: null }); continue; }
    const f = path.join(SAIDA, nome + '-' + String(i).padStart(2, '0') + '.mp3');
    let d;
    try { d = await falar(texto, VOZ[lingua], f); }
    catch (e) { console.log('    passo ' + i + ' falhou: ' + (e.message || '').slice(0, 80)); d = 0; }
    lista.push({ i, dur: d, f: path.basename(f) });
  }
  tempos[nome] = lista;
  fs.writeFileSync(path.join(SAIDA, 'tempos.json'), JSON.stringify(tempos, null, 1));
  const total = lista.reduce((s, x) => s + x.dur, 0);
  console.log('  ' + nome.padEnd(26) + lista.filter(x => x.dur).length + ' falas  ' +
    total.toFixed(1) + 's de voz');
}

const args = process.argv.slice(2);
const lingua = args.includes('--en') ? 'en' : 'pt';
const chaves = args[0] === 'todos' ? Object.keys(GUIOES) : [args[0]];
console.log('voz: ' + VOZ[lingua] + '   ritmo: ' + RITMO + '\n');
for (const k of chaves) await narrar(k, lingua);
