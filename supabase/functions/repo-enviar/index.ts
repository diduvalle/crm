// CRM - Repositório: envia o aviso de uma publicação à turma (Resend).
//
// O browser (formador, autenticado) chama isto com { token, publicacao_id }.
// A função pede ao Postgres os destinatários AINDA POR ENVIAR - cada um com
// o SEU token de envio - manda um email a cada, e marca o resultado.
//
// O email é TODO do formador: assunto, cabeçalho, saudação, mensagem (texto
// rico), rótulo do botão e nota de rodapé vêm da base de dados, não daqui.
// Marcadores: {nome} {ufcd} {titulo} {turma}
//
// O link do botão NÃO aponta ao bitly: aponta à função `r` desta mesma app,
// que regista o clique e só depois reencaminha. É assim que se sabe QUEM leu.
//
// Deploy (Supabase): Edge Functions → "repo-enviar" → colar este ficheiro.
// Desligar "Enforce JWT" (a autorização é o token de sessão, validado no SQL).
// Secrets:
//   RESEND_API_KEY  = re_xxx
//   REPO_FROM       = "CRM <crm@cr0x.org>"
//                     ^ o domínio depois do @ TEM de estar verificado no Resend.
//                     O NOME é só a omissão: quando a turma tem escola, quem
//                     recebe vê o nome dela. O endereço é sempre este.
//   REPO_REPLY_TO   = "crm@cr0x.org"   (opcional; para onde vão as respostas)

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
  return String(s ?? "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

// A mensagem é HTML escrito pelo formador (editor de texto rico). Confiamos
// nele, mas não em acidentes: fora scripts, iframes e handlers inline.
function limpar(html: string) {
  return String(html ?? "")
    .replace(/<\s*(script|iframe|object|embed|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

// O corpo da mensagem chega de duas caixas diferentes: o editor de texto
// rico das sessoes, que ja produz HTML, e a caixa simples dos badges, que
// produz texto com quebras de linha. Sem distinguir, um email escrito em
// paragrafos chegava todo numa linha so.
function corpoHTML(txt: string, vars: Record<string, string>) {
  const t = String(txt ?? "");
  if (/<[a-z][\s\S]*>/i.test(t)) return limpar(marcadores(t, vars));
  return marcadores(esc(t), vars).replace(/\r?\n/g, "<br>");
}

// {nome} {titulo} {turma} {modulo} - sempre com o valor escapado.
function marcadores(txt: string, d: Record<string, string>) {
  return String(txt ?? "").replace(/\{(nome|titulo|turma|modulo)\}/g, (_, k) => esc(d[k] || ""));
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
  if (req.method !== "POST") return json({ ok: false, erro: "METODO" }, 405);

  try {
    const body0 = await req.json().catch(() => ({}));
    const token = body0.token;
    const sessao_id = body0.sessao_id || body0.publicacao_id; // aceita o nome novo e o antigo
    // opcional: enviar a UMA pessoa em vez de a todos os que faltam
    const acesso_id = body0.acesso_id || null;
    if (!token || !sessao_id) return json({ ok: false, erro: "DADOS_EM_FALTA" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") || SERVICE_ROLE;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("REPO_FROM") ||
      Deno.env.get("RECOVERY_FROM") ||
      "CRM <onboarding@resend.dev>";
    const REPLY_TO = Deno.env.get("REPO_REPLY_TO") || "";

    if (!RESEND_API_KEY) return json({ ok: false, erro: "SEM_RESEND" }, 500);

    const rpc = (nome: string, body: unknown) =>
      fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

    // 1) Quem falta? (o SQL valida que o `token` é de root)
    const rDest = await rpc("repo_pendentes", {
      p_token: token,
      p_sessao_id: sessao_id,
      p_acesso_id: acesso_id,
    });
    if (!rDest.ok) {
      const t = await rDest.text();
      return json({
        ok: false,
        erro: t.includes("SEM_PERMISSAO") ? "SEM_PERMISSAO" : "SESSAO_INVALIDA",
      }, 403);
    }
    const destinos = (await rDest.json()) as Array<{
      acesso_id: string; email: string; email2: string | null; nome: string; envio_token: string;
      titulo: string; texto: string; turma: string; modulo: string;
      assunto: string; cabecalho: string; saudacao: string; botao: string; rodape: string;
    }>;
    if (!destinos.length) return json({ ok: true, enviados: 0, falhados: 0 });

    // Toda a gente desta sessão é da mesma turma: a escola pede-se uma vez.
    const marca = await marcaDaTurma(SUPABASE_URL, ANON, destinos[0].turma, FROM);

    // 2) Enviar, um a um, com o link tokenizado de cada formando.
    let enviados = 0, falhados = 0;
    for (const d of destinos) {
      const vars = { nome: d.nome, titulo: d.titulo, turma: d.turma, modulo: d.modulo || "" };
      const url = `${SUPABASE_URL}/functions/v1/r?t=${d.envio_token}`;

      const html = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#172a36">
          <div style="background:linear-gradient(135deg,${marca.cor2},${marca.cor});color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">
            <h1 style="margin:0;font-size:18px;font-weight:800">${marcadores(d.cabecalho, vars)}</h1>
          </div>
          <div style="border:1px solid #dbe3ea;border-top:0;border-radius:0 0 14px 14px;padding:24px">
            <p style="margin:0 0 12px">${marcadores(d.saudacao, vars)}</p>
            <p style="margin:0 0 16px;font-weight:700;font-size:16px">${esc(d.titulo)}</p>
            <div style="margin:0 0 8px">${corpoHTML(d.texto, vars)}</div>
            <p style="margin:24px 0 8px">
              <a href="${url}" style="display:inline-block;background:${marca.cor};color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700">${marcadores(d.botao, vars)}</a>
            </p>
            <p style="color:#5f6f7a;font-size:12px;margin:16px 0 0">${corpoHTML(d.rodape, vars)}</p>
          </div>
        </div>`;

      // Enviar para os dois emails (pessoal + o da escola, se houver).
      // Um só clique de qualquer deles conta, porque o token é do envio, não do email.
      const to = [...new Set([d.email, d.email2].filter(Boolean))] as string[];
      const corpo: Record<string, unknown> = {
        from: marca.from,
        to,
        subject: marcadores(d.assunto, vars).replace(/&amp;/g, "&"),
        html,
      };
      if (REPLY_TO) corpo.reply_to = REPLY_TO;

      let erro: string | null = null;
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(corpo),
        });
        if (!res.ok) erro = (await res.text()).slice(0, 300);
      } catch (e) {
        erro = String(e).slice(0, 300);
      }

      if (erro) falhados++; else enviados++;
      await rpc("repo_marcar_enviado", {
        p_token: token,
        p_acesso_id: d.acesso_id,
        p_erro: erro,
      });
    }

    return json({ ok: true, enviados, falhados });
  } catch (e) {
    return json({ ok: false, erro: String(e).slice(0, 300) }, 500);
  }
});
