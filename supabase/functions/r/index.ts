// CRM - Repositório: registo de abertura à prova de scanners de email.
//
// PORQUÊ ASSIM: as Edge Functions do Supabase NÃO servem HTML - forçam
// text/plain, nosniff e uma CSP "sandbox". Uma página servida daqui aparece
// como código em bruto e os scripts nunca correm. Por isso a página de
// passagem vive no GitHub Pages (/repo/abrir.html) e esta função faz só:
//
//   r?t=<token>          -> 302 para /repo/abrir.html?t=<token>   NÃO regista
//   r?t=<token>&hit=1    -> regista a abertura, devolve {ok,link} (JSON+CORS)
//
// O registo só acontece no 2.º passo, que é disparado por JavaScript na
// página. Os scanners de email (Microsoft Safe Links, antivírus) seguem o
// 302 e buscam a página, mas não executam JS -> deixam de contar aberturas.
//
// Os links já enviados (ex.: sessão 03) continuam a funcionar: apontam para
// esta função, que agora os reencaminha para a página.
//
// Deploy (Supabase): Edge Functions → r → Code → colar → Deploy.
// "Verify JWT" DESLIGADO (quem clica no email não traz credenciais).

// A página de passagem é a da plataforma NOVA. Era a do iefpcrm, e por isso
// os links dos emails levavam os formandos ao site antigo. As duas páginas
// fazem o mesmo (chamam esta função com &hit=1), por isso os links já
// enviados continuam a contar - passam só a abrir no sítio certo.
const PAGINA = "https://crm.cr0x.org/repo/abrir.html";
const FALLBACK = "https://crm.cr0x.org/repo/";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A página está noutra origem (crm.cr0x.org), por isso o JSON precisa de CORS.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (b: unknown) =>
  new Response(JSON.stringify(b), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const url = new URL(req.url);
  const t = url.searchParams.get("t") ||
    url.pathname.split("/").filter(Boolean).pop() || "";
  const hit = url.searchParams.get("hit"); // presente = veio do JS da página

  if (!UUID.test(t)) {
    return hit ? json({ ok: false }) : Response.redirect(FALLBACK, 302);
  }

  // 1) Abertura do link (humano OU scanner): manda para a página. NÃO regista.
  //    302 e não 301: um 301 ficaria em cache e os cliques seguintes não
  //    voltariam a passar por aqui.
  if (!hit) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${PAGINA}?t=${encodeURIComponent(t)}`,
        "Cache-Control": "no-store",
      },
    });
  }

  // 2) O JavaScript da página confirmou: regista e devolve o link do Drive.
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/repo_click`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_token: t }),
    });
    const d = await res.json().catch(() => null);
    return json(d?.ok ? { ok: true, link: d.link } : { ok: false });
  } catch (_e) {
    return json({ ok: false });
  }
});
