// CRM - Pesquisa de dados de empresa por NIPC.
//
// O browser chama esta função com { nif }. A função consulta o registo oficial
// e devolve os dados da empresa normalizados (nome, morada, código postal,
// cidade). Só dados PÚBLICOS de pessoas coletivas - não expõe particulares.
//
// FONTE POR OMISSÃO: VIES (registo de IVA da União Europeia) - PÚBLICO, GRÁTIS,
// SEM CHAVE E SEM REGISTO. Cobre empresas com IVA intracomunitário (a maioria
// das empresas com atividade; algumas micro podem não estar lá).
// OPCIONAL: se definires o secret NIFPT_KEY (chave grátis do nif.pt), a função
// usa o nif.pt (dados mais ricos: CAE, contactos) em vez do VIES.
//
// Deploy (Supabase): Edge Functions → criar "nif-lookup" → colar este ficheiro →
// Deploy → desligar "Enforce JWT" (função pública). Nenhum secret é obrigatório.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Extrai código postal (NNNN-NNN) + cidade da morada multi-linha do VIES.
function parseMorada(address: string, sep = "\n") {
  const lines = String(address || "").split(sep).map((s) => s.trim()).filter(Boolean);
  let cp = "", cidade = "";
  const rua: string[] = [];
  for (const ln of lines) {
    const m = ln.match(/^(\d{4}-\d{3})\s+(.+)$/);
    if (m && !cp) { cp = m[1]; cidade = m[2]; } else rua.push(ln);
  }
  const morada = rua.filter((l) => l.toUpperCase() !== cidade.toUpperCase()).join(", ");
  return { morada, cp, cidade };
}

async function viaVIES(clean: string) {
  const r = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/PT/vat/${clean}`);
  const d = await r.json().catch(() => null);
  if (!d || !d.isValid || !d.name || d.name === "---") {
    return { error: "not_found", message: "Empresa não encontrada no VIES (só empresas com IVA intracomunitário)." };
  }
  const { morada, cp, cidade } = parseMorada(d.name && d.address ? d.address : "");
  return { nif: clean, nome: d.name, morada, codigoPostal: cp, cidade, cae: "", atividade: "", estado: "", website: "", telefone: "", email: "", fonte: "VIES" };
}

// limpa HTML/entidades do campo "atividade" (o nif.pt às vezes devolve com tags)
function stripHtml(s: string) {
  return String(s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&aacute;/g, "á").replace(/&agrave;/g, "à").replace(/&acirc;/g, "â").replace(/&atilde;/g, "ã").replace(/&eacute;/g, "é").replace(/&ecirc;/g, "ê").replace(/&iacute;/g, "í").replace(/&oacute;/g, "ó").replace(/&ocirc;/g, "ô").replace(/&otilde;/g, "õ").replace(/&uacute;/g, "ú").replace(/&ccedil;/g, "ç")
    .replace(/&Aacute;/g, "Á").replace(/&Eacute;/g, "É").replace(/&Iacute;/g, "Í").replace(/&Oacute;/g, "Ó").replace(/&Uacute;/g, "Ú").replace(/&Ccedil;/g, "Ç").replace(/&Atilde;/g, "Ã").replace(/&Otilde;/g, "Õ")
    .replace(/\s+/g, " ").trim();
}
async function viaNIFpt(clean: string, key: string) {
  const r = await fetch(`https://www.nif.pt/?json=1&q=${clean}&key=${encodeURIComponent(key)}`);
  const data = await r.json().catch(() => null);
  if (!data || data.result !== "success" || !data.records || !data.records[clean]) {
    return { error: "not_found", message: (data && data.message) || "Empresa não encontrada." };
  }
  const rec = data.records[clean]; const c = rec.contacts || {}; const st = rec.structure || {}; const geo = rec.geo || {};
  const cae = Array.isArray(rec.cae) ? (rec.cae[0] || "") : (rec.cae || "");
  let capital = "";
  if (st.capital) { try { capital = Number(st.capital).toLocaleString("pt-PT") + " " + (st.capital_currency || "EUR"); } catch (_e) { capital = String(st.capital) + " " + (st.capital_currency || "EUR"); } }
  const NAT: Record<string, string> = { SA: "SA", LDA: "Lda", UNI: "Unipessoal", ENI: "ENI (nome individual)", COOP: "Cooperativa", ACE: "ACE", SGPS: "SGPS" };
  return {
    nif: clean, nome: rec.title || "", morada: rec.address || "",
    codigoPostal: [rec.pc4, rec.pc3].filter(Boolean).join("-"), cidade: rec.city || "",
    cae: String(cae), atividade: stripHtml(rec.activity), natureza: (NAT[st.nature] || st.nature || ""),
    estado: rec.status || "", capital, concelho: geo.county || "", freguesia: geo.parish || "", dataConstituicao: rec.start_date || "",
    website: c.website || "", telefone: c.phone || "", email: c.email || "", fonte: "nif.pt",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  try {
    const { nif } = await req.json().catch(() => ({}));
    const clean = String(nif || "").replace(/\D/g, "");
    if (!/^\d{9}$/.test(clean)) return json({ error: "invalid", message: "NIPC inválido (9 dígitos)." }, 400);
    // Cobertura ampla: tenta o nif.pt (todas as empresas PT) se houver chave;
    // se falhar (ou sem chave), cai no VIES (só IVA intracomunitário, mas sem chave).
    const KEY = Deno.env.get("NIFPT_KEY");
    let out: Record<string, unknown> | null = null;
    if (KEY) { out = await viaNIFpt(clean, KEY); if (out && out.error) out = null; }
    if (!out) out = await viaVIES(clean);
    return json(out);
  } catch (e) {
    return json({ error: "server", message: String(e) }, 500);
  }
});
