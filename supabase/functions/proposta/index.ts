// CRM - Edge Function "proposta"
// Página pública da proposta: publicar, servir+contar aberturas, adjudicar, estatísticas.
// Deploy: slug "proposta"; DESLIGAR "Verify JWT" (é público, o cliente não tem login).
// Usa a service_role key (injetada automaticamente) para tocar na tabela com RLS ligado.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = new URL(req.url);

    // ---- POST: publicar ou adjudicar ----
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const token = String(b.token || "").trim();
      if (!token) return json({ error: "SEM_TOKEN" }, 400);

      if (b.action === "publish") {
        const html = String(b.html || "");
        if (!html || html.length > 600000) return json({ error: "HTML_INVALIDO" }, 400);
        const row = {
          token,
          turma: String(b.turma || "") || null,
          numero: String(b.numero || "") || null,
          titulo: String(b.titulo || "") || null,
          entidade: String(b.entidade || "") || null,
          cliente: String(b.cliente || "") || null,
          html,
          atualizado_em: new Date().toISOString(),
        };
        const { error } = await db.from("propostas_publicas").upsert(row, { onConflict: "token" });
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true, token });
      }

      if (b.action === "adjudicar") {
        const nome = String(b.nome || "").trim().slice(0, 120) || "Cliente";
        const { data: cur } = await db.from("propostas_publicas")
          .select("adjudicada_em, adjudicante").eq("token", token).maybeSingle();
        if (!cur) return json({ error: "NAO_ENCONTRADA" }, 404);
        if (cur.adjudicada_em) return json({ ok: true, adjudicada_em: cur.adjudicada_em, adjudicante: cur.adjudicante, ja: true });
        const agora = new Date().toISOString();
        const { error } = await db.from("propostas_publicas")
          .update({ adjudicada_em: agora, adjudicante: nome, atualizado_em: agora }).eq("token", token);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true, adjudicada_em: agora, adjudicante: nome });
      }
      return json({ error: "ACCAO_DESCONHECIDA" }, 400);
    }

    // ---- GET: servir (conta abertura) ou estatísticas (não conta) ----
    const token = String(url.searchParams.get("t") || "").trim();
    if (!token) return json({ error: "SEM_TOKEN" }, 400);
    const stats = url.searchParams.get("stats") === "1";

    const { data: row } = await db.from("propostas_publicas").select("*").eq("token", token).maybeSingle();
    if (!row) return json({ error: "NAO_ENCONTRADA" }, 404);

    if (stats) {
      return json({
        ok: true, aberturas: row.aberturas, primeira_abertura: row.primeira_abertura,
        ultima_abertura: row.ultima_abertura, adjudicada_em: row.adjudicada_em, adjudicante: row.adjudicante,
      });
    }

    // conta a abertura
    const agora = new Date().toISOString();
    await db.from("propostas_publicas").update({
      aberturas: (row.aberturas || 0) + 1,
      ultima_abertura: agora,
      primeira_abertura: row.primeira_abertura || agora,
    }).eq("token", token);

    return json({
      ok: true, numero: row.numero, titulo: row.titulo, entidade: row.entidade, cliente: row.cliente,
      html: row.html, adjudicada_em: row.adjudicada_em, adjudicante: row.adjudicante,
    });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});
