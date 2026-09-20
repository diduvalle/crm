/* ============ OS GUIÕES DOS VÍDEOS ============
   Cada vídeo é uma lista de passos. Um passo faz uma coisa no ecrã e
   traz a frase que a acompanha, em PT e EN. O gravador marca a legenda
   no instante em que o passo aconteceu, e por isso ela bate certo com o
   que se vê - não com um tempo escrito à mão que deixa de servir à
   primeira vez que uma página demora mais a carregar.

   Regras que valem para todos:
   - uma frase por passo, curta, no que está a acontecer;
   - nada de "como podem ver" nem de "vamos agora": diz-se o que é;
   - `precisaTurma` marca os que só existem dentro de uma turma a sério.
   ============================================== */

/* ---------- ajudas ---------- */
const ir = rota => async p => { await p.evaluate(r => { location.hash = '#' + r; }, rota); };
const clicar = texto => async p => {
  await p.evaluate(t => {
    const alvo = [...document.querySelectorAll('button,a,.btn,.btn-sec,.tab,.seg,[data-act]')]
      .find(e => (e.textContent || '').trim().toLowerCase().includes(t.toLowerCase()) && e.offsetParent);
    if (alvo) alvo.click();
  }, texto);
};
const abrirPrimeiro = selector => async p => {
  await p.evaluate(s => { document.querySelector(s)?.click(); }, selector);
};
const fechar = async p => { await p.keyboard.press('Escape'); };
const rolar = px => async p => { await p.evaluate(y => window.scrollBy({ top: y, behavior: 'smooth' }), px); };

export const GUIOES = {

  /* =================== 1. visão geral =================== */
  resumo: {
    titulo: 'Visão geral', titulo_en: 'Overview',
    passos: [
      { fazer: ir('dashboard'), espera: 3.2,
        pt: 'Um CRM completo, usado como sala de aula.',
        en: 'A complete CRM, used as a classroom.' },
      { fazer: async () => {}, espera: 3.0,
        pt: 'O painel abre com o estado do negócio: receita, ticket médio, pipeline e conversão.',
        en: 'The dashboard opens with the state of the business: revenue, average ticket, pipeline and conversion.' },
      { fazer: ir('empresas'), espera: 3.0,
        pt: 'As empresas são as entidades legais, com NIPC, CAE e morada.',
        en: 'Companies are the legal entities, with tax number, activity code and address.' },
      { fazer: ir('clientes'), espera: 3.0,
        pt: 'Os contactos são as pessoas, ligadas a essas empresas.',
        en: 'Contacts are the people, linked to those companies.' },
      { fazer: ir('propostas'), espera: 3.2,
        pt: 'As propostas andam num quadro por estado, da criação à venda ganha.',
        en: 'Proposals move across a board by stage, from created to won.' },
      { fazer: ir('analytics'), espera: 3.2,
        pt: 'O Analytics responde com números: funil, conversão, custo de aquisição e valor do cliente.',
        en: 'Analytics answers with numbers: funnel, conversion, acquisition cost and customer value.' },
      { fazer: ir('rgpd'), espera: 3.2,
        pt: 'E a conformidade não é um anexo: consentimentos, pedidos dos titulares e registo de tratamentos.',
        en: 'And compliance is not an afterthought: consents, data subject requests and processing records.' },
    ],
  },

  /* =================== 2. dashboard =================== */
  dashboard: {
    titulo: 'Dashboard & Agenda', titulo_en: 'Dashboard & Calendar',
    passos: [
      { fazer: ir('dashboard'), espera: 3.2,
        pt: 'O painel dá o estado do negócio num relance.',
        en: 'The dashboard gives the state of the business at a glance.' },
      { fazer: async () => {}, espera: 3.0,
        pt: 'Receita ganha, ticket médio, pipeline aberto e taxa de conversão.',
        en: 'Revenue won, average ticket, open pipeline and conversion rate.' },
      { fazer: clicar('Trimestre'), espera: 2.8,
        pt: 'O período escolhe-se num clique, e todos os indicadores acompanham.',
        en: 'Pick the period with one click, and every indicator follows.' },
      { fazer: rolar(500), espera: 3.0,
        pt: 'Mais abaixo, as propostas recentes e a distribuição do pipeline por estado.',
        en: 'Further down, the recent proposals and the pipeline split by stage.' },
      { fazer: ir('agenda'), espera: 3.2,
        pt: 'A Agenda junta o calendário e as tarefas, com o que está em atraso à frente.',
        en: 'The Calendar brings together events and tasks, with anything overdue up front.' },
    ],
  },

  /* =================== 3. empresas & contactos =================== */
  contactos: {
    titulo: 'Empresas & Contactos', titulo_en: 'Companies & Contacts',
    passos: [
      { fazer: ir('empresas'), espera: 3.0,
        pt: 'Um CRB profissional separa a empresa da pessoa.',
        en: 'A professional CRM keeps the company apart from the person.' },
      { fazer: async () => {}, espera: 3.0,
        pt: 'A empresa é a entidade legal: NIPC, CAE, dimensão e morada.',
        en: 'The company is the legal entity: tax number, activity code, size and address.' },
      { fazer: abrirPrimeiro('tbody tr'), espera: 3.4,
        pt: 'A ficha mostra tudo o que aconteceu com essa conta.',
        en: 'The record shows everything that happened with that account.' },
      { fazer: fechar, espera: 1.6, pt: '', en: '' },
      { fazer: ir('clientes'), espera: 3.0,
        pt: 'Os contactos são as pessoas, cada uma ligada à sua empresa.',
        en: 'Contacts are the people, each linked to their company.' },
      { fazer: abrirPrimeiro('tbody tr'), espera: 3.4,
        pt: 'E aqui está a vista de 360 graus: propostas, valor, consentimentos e pedidos.',
        en: 'And here is the 360-degree view: proposals, value, consents and requests.' },
    ],
  },

  /* =================== 4. produtos =================== */
  produtos: {
    titulo: 'Produtos', titulo_en: 'Products',
    passos: [
      { fazer: ir('produtos'), espera: 3.0,
        pt: 'O catálogo organiza-se em família, subfamília e artigo.',
        en: 'The catalogue is organised into family, subfamily and item.' },
      { fazer: async () => {}, espera: 3.0,
        pt: 'Cada artigo tem preço, taxa de IVA e se é pontual ou recorrente.',
        en: 'Each item has a price, a VAT rate, and whether it is one-off or recurring.' },
      { fazer: abrirPrimeiro('tbody tr'), espera: 3.4,
        pt: 'É daqui que as linhas da proposta saem, já com o preço certo.',
        en: 'This is where proposal lines come from, already with the right price.' },
    ],
  },

  /* =================== 5. propostas =================== */
  propostas: {
    titulo: 'Propostas - o pipeline', titulo_en: 'Proposals - the pipeline',
    passos: [
      { fazer: ir('propostas'), espera: 3.2,
        pt: 'O pipeline é um quadro: cada coluna é um estado.',
        en: 'The pipeline is a board: each column is a stage.' },
      { fazer: async () => {}, espera: 3.0,
        pt: 'Criada, enviada, em negociação, ganha ou perdida.',
        en: 'Created, sent, in negotiation, won or lost.' },
      { fazer: async () => {}, espera: 3.0,
        pt: 'A cor do cartão diz o nível de interesse do cliente.',
        en: 'The card colour tells you how warm the client is.' },
      { fazer: abrirPrimeiro('.kanban-card'), espera: 3.6,
        pt: 'Abrir um cartão dá a proposta inteira, com linhas, descontos e total.',
        en: 'Opening a card gives you the whole proposal, with lines, discounts and total.' },
    ],
  },

  /* =================== 6. analytics =================== */
  analytics: {
    titulo: 'Analytics', titulo_en: 'Analytics',
    passos: [
      { fazer: ir('analytics'), espera: 3.2,
        pt: 'O Analytics transforma os registos em decisões.',
        en: 'Analytics turns records into decisions.' },
      { fazer: async () => {}, espera: 3.2,
        pt: 'O funil mostra onde as oportunidades se perdem.',
        en: 'The funnel shows where opportunities are lost.' },
      { fazer: rolar(500), espera: 3.2,
        pt: 'O custo de aquisição e o valor do tempo de vida dizem se o negócio compensa.',
        en: 'Acquisition cost and lifetime value tell you whether the business pays off.' },
      { fazer: rolar(500), espera: 3.2,
        pt: 'E o lead scoring ordena quem merece atenção primeiro.',
        en: 'And lead scoring ranks who deserves attention first.' },
    ],
  },

  /* =================== 7. RGPD =================== */
  rgpd: {
    titulo: 'RGPD', titulo_en: 'GDPR',
    passos: [
      { fazer: ir('rgpd'), espera: 3.2,
        pt: 'A conformidade vive dentro do CRM, não num dossiê à parte.',
        en: 'Compliance lives inside the CRM, not in a separate binder.' },
      { fazer: async () => {}, espera: 3.0,
        pt: 'Os consentimentos ficam registados com data e finalidade.',
        en: 'Consents are recorded with date and purpose.' },
      { fazer: rolar(450), espera: 3.2,
        pt: 'Os pedidos dos titulares têm prazo, e o prazo conta-se sozinho.',
        en: 'Data subject requests have a deadline, and the deadline counts itself.' },
      { fazer: rolar(450), espera: 3.2,
        pt: 'O registo de tratamentos e as violações de dados estão no mesmo sítio.',
        en: 'The processing record and any data breaches are in the same place.' },
    ],
  },

  /* =================== 8. alertas =================== */
  alertas: {
    titulo: 'Alertas', titulo_en: 'Alerts',
    passos: [
      { fazer: ir('alertas'), espera: 3.2,
        pt: 'Os alertas são a lista do que precisa de atenção hoje.',
        en: 'Alerts are the list of what needs attention today.' },
      { fazer: async () => {}, espera: 3.2,
        pt: 'Tarefas em atraso, propostas paradas, pedidos por responder.',
        en: 'Overdue tasks, stalled proposals, unanswered requests.' },
      { fazer: async () => {}, espera: 3.0,
        pt: 'Cada um leva ao sítio onde se resolve.',
        en: 'Each one takes you to where it gets solved.' },
    ],
  },
};
