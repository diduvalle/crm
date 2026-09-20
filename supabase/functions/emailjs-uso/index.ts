// Consumo do EmailJS deste mes, lido do historico real da conta.
//
// Porque e que isto e uma Edge Function e nao codigo da app:
// o endpoint /history do EmailJS exige a chave PRIVADA (accessToken). O index.html
// e servido em GitHub Pages e qualquer pessoa o le - a chave privada NAO pode la
// estar. Fica aqui como segredo, tal como no nif-lookup.
//
// Segredos (Supabase -> Edge Functions -> Secrets):
//   EMAILJS_PUBLIC_KEY   (a mesma que esta na app)
//   EMAILJS_PRIVATE_KEY  (EmailJS -> Account -> API Keys -> Private Key)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// primeiro valor nao vazio de uma lista de caminhos possiveis
const pega = (o: any, ...chaves: string[]) => {
  for (const k of chaves) {
    const v = k.split('.').reduce((a: any, p) => (a == null ? a : a[p]), o);
    if (v != null && String(v).trim() !== '') return String(v);
  }
  return '';
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const userId = Deno.env.get('EMAILJS_PUBLIC_KEY');
  const token  = Deno.env.get('EMAILJS_PRIVATE_KEY');
  if (!userId || !token) return json({ erro: 'FALTAM_SEGREDOS' }, 500);

  // O ciclo do EmailJS NAO e o mes de calendario: reinicia no dia de aniversario
  // do plano (o dashboard diz 'Resets on <dia>'). Contar desde dia 1 dava numeros
  // diferentes dos do EmailJS no inicio de cada mes.
  let diaCiclo = 1;
  try { const b = await req.json(); diaCiclo = Math.min(28, Math.max(1, Number(b?.diaCiclo) || 1)); } catch (_) { /* corpo vazio */ }
  const agora = new Date();
  let inicioMes = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), diaCiclo);
  if (inicioMes > agora.getTime()) inicioMes = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - 1, diaCiclo);
  const proximo = new Date(inicioMes); proximo.setUTCMonth(proximo.getUTCMonth() + 1);

  let mes = 0, falhas = 0, total = 0;
  const recentes: Array<Record<string, unknown>> = [];
  // nomes dos campos da 1.a linha - serve para afinar a leitura sem adivinhar
  let campos: string[] = [], camposParams: string[] = [];

  try {
    for (let page = 1; page <= 20; page++) {
      const url = `https://api.emailjs.com/api/v1.1/history?user_id=${encodeURIComponent(userId)}&accessToken=${encodeURIComponent(token)}&page=${page}&count=100`;
      const r = await fetch(url);
      if (!r.ok) return json({ erro: 'EMAILJS_' + r.status, detalhe: (await r.text()).slice(0, 200) }, 502);
      const d = await r.json();
      const linhas: any[] = Array.isArray(d) ? d : (d.rows || d.history || d.data || []);
      if (!linhas.length) break;

      if (!campos.length && linhas[0] && typeof linhas[0] === 'object') {
        campos = Object.keys(linhas[0]);
        const p = linhas[0].template_params || linhas[0].params || linhas[0].variables;
        if (p && typeof p === 'object') camposParams = Object.keys(p);
      }

      let saiu = false;
      for (const l of linhas) {
        total++;
        const quando = new Date(l.created_at || l.updated_at || l.date || 0);
        if (quando.getTime() < inicioMes) { saiu = true; break; }
        mes++;
        const ok = String(l.result ?? l.status ?? '').toLowerCase() !== 'failure' && !l.error;
        if (!ok) falhas++;
        if (recentes.length < 20) {
          recentes.push({
            quando: quando.toISOString().slice(0, 16).replace('T', ' '),
            para: pega(l, 'template_params.to_email', 'template_params.email', 'params.to_email',
                          'to_email', 'to', 'recipient', 'variables.to_email'),
            assunto: pega(l, 'template_params.subject', 'params.subject', 'subject',
                             'variables.subject', 'template_id'),
            ok,
          });
        }
      }
      if (saiu || d.is_last_page === true) break;
    }
  } catch (e) {
    return json({ erro: 'FALHA_HISTORICO', detalhe: String(e).slice(0, 200) }, 502);
  }

  return json({ mes, falhas, lidos: total, recentes, campos, camposParams,
                desde: new Date(inicioMes).toISOString().slice(0, 10),
                repoeEm: proximo.toISOString().slice(0, 10), diaCiclo });
});
