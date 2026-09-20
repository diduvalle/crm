// CRM - Recuperação de acesso do formador por email (self-service).
//
// O browser chama esta função com { codigo, email }. A função (com a
// service_role) gera um NOVO código de recuperação via a função SQL
// gerar_recovery_email e ENVIA-O por email (Resend) para a caixa do
// formador. O código NUNCA volta ao browser - a resposta é sempre neutra
// ({ ok: true }), para não revelar se o email existe (anti-enumeração).
//
// Deploy (Supabase): Edge Functions → criar "recuperar-email" → colar este
// ficheiro. Desligar "Enforce JWT" (função pública). Secrets necessários:
//   RESEND_API_KEY   = re_xxx (da conta Resend)
//   RECOVERY_FROM    = "CRM <crm@crm.cr0x.org>"   (o dominio verificado no
//                      Resend e o crm.cr0x.org; o cr0x.org pertence a outra
//                      equipa la dentro e um envio de la e recusado)
//                      O NOME é só a omissão: quando a turma tem escola,
//                      quem recebe vê o nome dela.
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já são injetados automaticamente.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

function esc(s: string) {
  return String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}


// O nome do remetente entra num cabeçalho de email: fora tudo o que possa
// parti-lo ou fazer passar o email por outro endereço.
function nomeSeguro(s: string) {
  return String(s ?? "").replace(/[<>"\r\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}
// Escurece um hex, para o gradiente do cabeçalho nascer da cor da escola.
function escurecer(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => Math.max(0, Math.round(v * (1 - f))));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}
// A marca do email é a da ESCOLA da turma: o nome que aparece na caixa de
// entrada e a cor do cabeçalho. O endereço é sempre o mesmo - verificar um
// domínio por escola no Resend não era comportável. Uma turma sem escola
// fica com o remetente do segredo e o azul da plataforma.
// Chave ANÓNIMA, não a de serviço: a turma_espaco é publica de propósito (a
// app chama-a antes de alguem entrar) e tem o execute revogado a public, por
// isso o service_role - que nao e membro de authenticated - levava com um
// "permission denied" e o email saia sem a marca, sem dar erro nenhum.
async function marcaDaTurma(url: string, chave: string, codigo: string, fromOmissao: string) {
  const out = { from: fromOmissao, nome: "", cor: "#0078bf", cor2: "#004d7a" };
  try {
    const r = await fetch(`${url}/rest/v1/rpc/turma_espaco`, {
      method: "POST",
      headers: { apikey: chave, Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_codigo: codigo }),
    });
    const e = r.ok ? await r.json() : null;
    if (e) {
      /* o campo "Nome que aparece nos emails" manda; sem ele, o nome
         da escola - que é o que se via aqui antes */
      out.nome = nomeSeguro(e.remetenteNome || e.nome || "");
      if (/^#[0-9a-f]{6}$/i.test(e.cor || "")) { out.cor = e.cor; out.cor2 = escurecer(e.cor, 0.34); }
    }
  } catch (_) { /* sem escola: fica o remetente do segredo e o azul */ }
  const endereco = (fromOmissao.match(/<([^>]+)>/) || [, fromOmissao])[1].trim();
  if (out.nome) out.from = `${out.nome} <${endereco}>`;
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: true });

  const NEUTRAL = json({ ok: true }); // resposta padrão - nunca revela nada

  try {
    const { codigo, email } = await req.json().catch(() => ({}));
    if (!codigo || !email) return NEUTRAL;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") || SERVICE_ROLE;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("RECOVERY_FROM") || "CRM <onboarding@resend.dev>";

    // 1) Gerar o código no servidor (service_role → ignora RLS).
    const rpc = await fetch(`${SUPABASE_URL}/rest/v1/rpc/gerar_recovery_email`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_ROLE,
        "Authorization": `Bearer ${SERVICE_ROLE}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_codigo: String(codigo), p_email: String(email) }),
    });
    const data = await rpc.json().catch(() => null);

    // Email não corresponde a um formador desta turma → resposta neutra.
    if (!data || data.ok !== true || !data.code) return NEUTRAL;

    // 2) Enviar o email com o utilizador + novo código.
    if (RESEND_API_KEY) {
      const nome = esc(data.nome || "Formador(a)");
      const user = esc(data.username || "");
      const code = esc(data.code);
      const turma = esc(String(codigo));
      const marca = await marcaDaTurma(SUPABASE_URL, ANON, String(codigo), FROM);
      const titulo = (marca.nome || "CRM") + " - Recuperação de acesso";
      const html = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#172a36">
          <div style="background:linear-gradient(135deg,${marca.cor2},${marca.cor});color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">
            <h1 style="margin:0;font-size:18px;font-weight:800">${esc(titulo)}</h1>
          </div>
          <div style="border:1px solid #dbe3ea;border-top:0;border-radius:0 0 14px 14px;padding:24px">
            <p>Olá ${nome},</p>
            <p>Recebemos um pedido para recuperar o acesso à turma <strong>${turma}</strong>. Use estes dados no ecrã de entrada, em <em>"Recuperar palavra-passe"</em>:</p>
            <table style="border-collapse:collapse;margin:16px 0;font-size:15px">
              <tr><td style="padding:4px 12px 4px 0;color:#5f6f7a">Turma</td><td style="font-weight:700">${turma}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#5f6f7a">Utilizador</td><td style="font-weight:700">${user}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#5f6f7a">Código de recuperação</td><td style="font-weight:800;font-size:18px;letter-spacing:1px;color:${marca.cor}">${code}</td></tr>
            </table>
            <p style="color:#5f6f7a;font-size:13px">Aí define a sua nova palavra-passe. Este código substitui qualquer código anterior. Se não foi você a pedir, ignore este email - o acesso mantém-se seguro.</p>
          </div>
        </div>`;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: marca.from,
          to: [data.email],
          subject: titulo,
          html,
        }),
      }).catch(() => {});
    }

    return NEUTRAL;
  } catch (_e) {
    return NEUTRAL;
  }
});
