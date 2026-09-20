/* ============ SUBIR OS VÍDEOS PARA O CANAL ============
   Sobe cada .webm da pasta de gravações, anexa-lhe o .vtt como faixa de
   legendas, e escreve os identificadores no video.js do manual. Sem
   dependências: só o fetch do Node.

   AUTORIZAÇÃO
   A API de upload exige OAuth - uma chave de API não serve. O ficheiro
   de credenciais fica FORA do repositório, em segredos.json ao lado
   deste ficheiro (está no .gitignore):

     { "client_id": "...", "client_secret": "...", "refresh_token": "..." }

   Para o obter da primeira vez:  node subir.mjs --autorizar
   Depois:                        node subir.mjs            (ensaio)
                                  node subir.mjs --a-serio  (sobe mesmo)

   QUOTA (confirmada em setembro de 2026)
   Desde junho de 2026 o videos.insert tem balde próprio: 100 chamadas
   por dia, 1 unidade cada. Os 52 vídeos cabem num dia.
   O captions.insert continua a custar 400 unidades das 10.000 diárias:
   25 faixas por dia. As 52 legendas levam dois dias, e o script
   retoma de onde ficou.

   O QUE NÃO SE PODE DESFAZER
   O YouTube não deixa trocar o ficheiro de um vídeo já publicado. Se
   um dia lhes for posta narração, são uploads novos e identificadores
   novos - o que é barato, porque é isto que os escreve no manual.
   ======================================================== */
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const AQUI = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const GRAVADOS = process.env.CRM_GRAVADOS || path.join(AQUI, 'gravados');
const SEGREDOS = path.join(AQUI, 'segredos.json');
const REGISTO = path.join(AQUI, 'subidos.json');   /* o que já subiu, para poder retomar */
const VIDEOJS = path.resolve(AQUI, '../manual-src/docs/assets/js/video.js');

const A_SERIO = process.argv.includes('--a-serio');
const SCOPE = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl';

/* ---------- autorização, uma vez ---------- */
async function autorizar() {
  const s = JSON.parse(fs.readFileSync(SEGREDOS, 'utf8'));
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: s.client_id, redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    response_type: 'code', scope: SCOPE, access_type: 'offline', prompt: 'consent',
  });
  console.log('\nAbre isto no browser, aprova, e cola aqui o código:\n\n' + url + '\n');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise(r => rl.question('código: ', x => { rl.close(); r(x.trim()); }));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: s.client_id, client_secret: s.client_secret,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob', grant_type: 'authorization_code' }),
  });
  const d = await r.json();
  if (!d.refresh_token) { console.log('não veio refresh_token:', d); return; }
  s.refresh_token = d.refresh_token;
  fs.writeFileSync(SEGREDOS, JSON.stringify(s, null, 1));
  console.log('guardado em segredos.json. Já podes correr o upload.');
}

async function token() {
  const s = JSON.parse(fs.readFileSync(SEGREDOS, 'utf8'));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: s.client_id, client_secret: s.client_secret,
      refresh_token: s.refresh_token, grant_type: 'refresh_token' }),
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('sem access_token: ' + JSON.stringify(d).slice(0, 200));
  return d.access_token;
}

/* ---------- subir um vídeo ---------- */
async function subirVideo(tk, ficheiro, meta) {
  const bytes = fs.readFileSync(ficheiro);
  /* upload retomável: primeiro os metadados, depois o corpo */
  const inicio = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + tk, 'content-type': 'application/json',
      'x-upload-content-length': String(bytes.length), 'x-upload-content-type': 'video/webm' },
    body: JSON.stringify({
      snippet: { title: meta.titulo, description: meta.descricao, tags: meta.etiquetas,
        defaultLanguage: meta.lingua, categoryId: '27' },   /* 27 = Educação */
      status: { privacyStatus: 'unlisted', selfDeclaredMadeForKids: false,
        embeddable: true, license: 'youtube' },
    }),
  });
  const destino = inicio.headers.get('location');
  if (!destino) throw new Error('sem destino de upload: ' + (await inicio.text()).slice(0, 200));
  const r = await fetch(destino, { method: 'PUT',
    headers: { authorization: 'Bearer ' + tk, 'content-type': 'video/webm' }, body: bytes });
  const d = await r.json();
  if (!d.id) throw new Error('sem id: ' + JSON.stringify(d).slice(0, 250));
  return d.id;
}

/* ---------- anexar as legendas ---------- */
async function subirLegendas(tk, videoId, vtt, lingua) {
  const corpo = fs.readFileSync(vtt);
  const limite = '----crm' + Date.now();
  const cabeca = JSON.stringify({ snippet: { videoId, language: lingua, name: '', isDraft: false } });
  const bloco = Buffer.concat([
    Buffer.from('--' + limite + '\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n' + cabeca + '\r\n'),
    Buffer.from('--' + limite + '\r\ncontent-type: text/vtt\r\n\r\n'), corpo,
    Buffer.from('\r\n--' + limite + '--\r\n'),
  ]);
  const r = await fetch('https://www.googleapis.com/upload/youtube/v3/captions?part=snippet&uploadType=multipart', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + tk, 'content-type': 'multipart/related; boundary=' + limite },
    body: bloco,
  });
  const d = await r.json();
  if (!d.id) throw new Error('legendas: ' + JSON.stringify(d).slice(0, 220));
  return d.id;
}

/* ---------- escrever os identificadores no manual ---------- */
function escreverNoManual(subidos) {
  let s = fs.readFileSync(VIDEOJS, 'utf8');
  const bloco = lg => Object.entries(subidos).filter(([k]) => k.endsWith('-' + lg))
    .map(([k, v]) => "      '" + k.replace('-' + lg, '') + "': '" + v.id + "',").sort().join('\n');
  const novo = '  var IDS = {\n    pt: {\n' + bloco('pt') + '\n    },\n    en: {\n' + bloco('en') + '\n    }\n  };';
  const re = /  var IDS = \{[\s\S]*?\n  \};/;
  if (!re.test(s)) { console.log('  não achei o mapa IDS no video.js'); return; }
  fs.writeFileSync(VIDEOJS, s.replace(re, novo));
  console.log('  video.js atualizado com ' + Object.keys(subidos).length + ' identificadores');
}

/* ---------- o trabalho ---------- */
async function main() {
  if (process.argv.includes('--autorizar')) return autorizar();
  /* o ensaio nao precisa de credenciais: serve justamente para se ver
     o que ia subir antes de haver credenciais nenhumas */
  if (A_SERIO && !fs.existsSync(SEGREDOS)) {
    console.log('falta o segredos.json - ver o cabeçalho deste ficheiro'); return; }

  const { GUIOES } = await import('./guioes.mjs');
  const subidos = fs.existsSync(REGISTO) ? JSON.parse(fs.readFileSync(REGISTO, 'utf8')) : {};
  const videos = fs.readdirSync(GRAVADOS).filter(f => f.endsWith('.webm')).sort();

  console.log((A_SERIO ? 'A SUBIR' : 'ENSAIO - nada sobe, passa --a-serio para subir a sério') +
    '   ' + videos.length + ' ficheiros, ' + Object.keys(subidos).length + ' já subidos\n');

  const tk = A_SERIO ? await token() : null;
  let novos = 0, legendasHoje = 0;

  for (const f of videos) {
    const nome = f.replace('.webm', '');
    const [chave, lingua] = [nome.replace(/-(pt|en)$/, ''), nome.slice(-2)];
    const g = GUIOES[chave];
    if (!g) { console.log('  ' + nome + ': sem guião, saltado'); continue; }

    const titulo = (lingua === 'en' ? g.titulo_en : g.titulo) + ' · CRM';
    const descricao = (lingua === 'en'
      ? 'Part of the CRM platform manual.\nFull manual: https://crm.cr0x.org/manual/en/\nPlatform: https://crm.cr0x.org'
      : 'Faz parte do manual da plataforma CRM.\nManual completo: https://crm.cr0x.org/manual/\nPlataforma: https://crm.cr0x.org');
    const meta = { titulo, descricao, lingua: lingua === 'en' ? 'en' : 'pt',
      etiquetas: ['CRM', 'RGPD', 'formação', 'crm.cr0x.org'] };

    if (subidos[nome] && subidos[nome].id) {
      /* já subiu; faltam-lhe as legendas? */
      if (subidos[nome].legendas) continue;
    }

    if (!A_SERIO) { console.log('  ' + nome.padEnd(22) + ' -> "' + titulo + '"'); continue; }

    try {
      let id = subidos[nome] && subidos[nome].id;
      if (!id) { id = await subirVideo(tk, path.join(GRAVADOS, f), meta);
        subidos[nome] = { id, legendas: false }; novos++;
        console.log('  ' + nome.padEnd(22) + ' ' + id); }

      const vtt = path.join(GRAVADOS, nome + '.vtt');
      if (fs.existsSync(vtt) && !subidos[nome].legendas) {
        if (legendasHoje >= 24) { console.log('    (quota de legendas por hoje: fica para amanhã)'); }
        else { await subirLegendas(tk, id, vtt, meta.lingua);
          subidos[nome].legendas = true; legendasHoje++; }
      }
      fs.writeFileSync(REGISTO, JSON.stringify(subidos, null, 1));
    } catch (e) {
      console.log('  ' + nome.padEnd(22) + ' FALHOU: ' + (e.message || '').slice(0, 160));
      fs.writeFileSync(REGISTO, JSON.stringify(subidos, null, 1));
    }
  }

  if (A_SERIO) {
    console.log('\n' + novos + ' vídeos novos, ' + legendasHoje + ' faixas de legendas');
    escreverNoManual(subidos);
  }
}
main();
