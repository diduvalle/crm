/* ============ OS GUIÕES DOS VÍDEOS ============
   Cada vídeo é uma lista de passos. Um passo faz uma coisa no ecrã e
   traz a frase que a acompanha, em PT e EN. O gravador marca a legenda
   no instante em que o passo aconteceu, e por isso ela bate certo com o
   que se vê.

   OS SELECTORES SÃO POR ÍNDICE, não por texto. O mesmo guião grava em
   português e em inglês, e um separador chamado "Jornadas" passa a
   "Journeys" - procurar por texto partia metade dos vídeos ingleses.

   Nada aqui foi escrito de memória: as rotas, os separadores e os
   nomes das secções saíram de uma sondagem à própria app.

   Regras: uma frase por passo, curta, sobre o que está a acontecer.
   Nada de "como podem ver" nem de "vamos agora".
   ============================================== */

/* ---------- ajudas ---------- */
const ir = rota => async f => { await f.evaluate(r => { location.hash = '#' + r; }, rota); };

/* o n-ésimo separador da página (0 = o primeiro) */
const aba = n => async f => {
  await f.evaluate(i => { const t = [...document.querySelectorAll('.tab')].filter(e => e.offsetParent);
    if (t[i]) t[i].click(); }, n);
};

/* a n-ésima secção <h3> do conteúdo, trazida para a vista */
const seccao = n => async f => {
  await f.evaluate(i => {
    const alvo = document.querySelector('.content, main') || document.body;
    const h = [...alvo.querySelectorAll('h3')].filter(e => e.offsetParent)[i];
    if (h) { const c = h.closest('.card, section') || h; c.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }, n);
};

const abrir = sel => async f => { await f.evaluate(s => document.querySelector(s)?.click(), sel); };

/* clicar num cartão do quadro não abre nada: o elemento clicável é este */
const abrirProposta = async f => {
  await f.evaluate(() => document.querySelector('[data-act="open-prop"]')?.click());
};
/* "Nova proposta" não tem act próprio - é o último [data-act="new"] da
   página; o primeiro é o "Novo" do cabeçalho */
const novaProposta = async f => {
  await f.evaluate(() => { const b = [...document.querySelectorAll('[data-act="new"]')].filter(e => e.offsetParent);
    if (b.length) b[b.length - 1].click(); });
};
/* o modelo de proposta: o nome é dado do utilizador e não muda com a
   língua, por isso aqui pode procurar-se por texto */
const escolherModelo = nome => async f => {
  await f.evaluate(x => {
    const sel = [...document.querySelectorAll('select')]
      .find(s => [...s.options].some(o => new RegExp(x, 'i').test(o.textContent)));
    if (!sel) return;
    const o = [...sel.options].find(o => new RegExp(x, 'i').test(o.textContent));
    sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, nome);
};
const clicarAct = act => async f => { await f.evaluate(a => document.querySelector('[data-act="' + a + '"]')?.click(), act); };
/* com um modal aberto, rolar a janela não mexe nada - o corpo do modal
   tem o seu próprio scroll */
const rolar = px => async f => {
  await f.evaluate(y => {
    const m = [...document.querySelectorAll('.modal,.modal-wrap,.modal-body')]
      .find(e => e.offsetParent && e.scrollHeight > e.clientHeight + 20);
    (m || window).scrollBy({ top: y, behavior: 'smooth' });
  }, px);
};
const topo = async f => { await f.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); };

/* fecha o que estiver aberto. O passo recebe o FRAME da app, e um frame
   não tem teclado próprio - fecha-se clicando. */
const fechar = async f => {
  await f.evaluate(() => {
    const x = document.querySelector('[data-act="close-modal"]');
    if (x) { x.click(); return; }
    const y = [...document.querySelectorAll('button')]
      .find(e => /^(×|✕|fechar|close)$/i.test((e.textContent || '').trim()) && e.offsetParent);
    if (y) y.click();
  });
};
const nada = async () => {};

/* abre o cartão das Definições que contém esta âncora, e traz-lo à
   vista. Por âncora e não por título: em inglês o título é outro. */
const abrirCartao = sel => async f => {
  await f.evaluate(x => {
    const alvo = document.querySelector(x);
    const card = alvo && alvo.closest('.collapsible-card');
    if (!card) return;
    if (card.classList.contains('collapsed')) card.querySelector('.section-head').click();
    card.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, sel);
};


/* põe um ficheiro no campo de importação. É o único passo que precisa
   do Playwright e não só do DOM: um <input type=file> não se preenche
   por script da página. O ficheiro é escrito na pasta temporária do
   sistema, com nomes obviamente inventados. */
const CSV_DEMO = [
  'nome,apelido,email,email_pessoal,username,password,papel',
  'Ana,Costa,ana.costa@exemplo.pt,,,,Formando',
  'Bruno,Dias,bruno.dias@exemplo.pt,,,,Formando',
  'Carla,Nunes,carla.nunes@exemplo.pt,,,,Formando',
  'Duarte,Melo,isto-nao-e-um-email,,,,Formando',
];
const porFicheiro = async f => {
  const os = await import('os'), pathm = await import('path'), fsm = await import('fs');
  const alvo = pathm.join(os.tmpdir(), 'turma-exemplo.csv');
  fsm.writeFileSync(alvo, CSV_DEMO.join(String.fromCharCode(10)), 'utf8');
  await f.setInputFiles('#importRosterFile', alvo);
};


export const GUIOES = {

/* ===================== 1 ===================== */
resumo: { titulo: 'Visão geral', titulo_en: 'Overview', passos: [
  { fazer: ir('dashboard'), espera: 3.2,
    pt: 'Um CRM completo, usado como sala de aula.',
    en: 'A complete CRM, used as a classroom.' },
  { fazer: nada, espera: 3.0,
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
]},

/* ===================== 2 ===================== */
entrar: { titulo: 'Entrar na turma', titulo_en: 'Signing in', semLogin: true, passos: [
  { fazer: nada, espera: 3.6,
    pt: 'Cada escola tem o seu endereço, e cada turma o seu código.',
    en: 'Each school has its own address, and each class its own code.' },
  { fazer: nada, espera: 3.2,
    pt: 'O formador recebe o código e as credenciais já feitas: a turma é criada pela administração.',
    en: 'The trainer receives the code and ready-made credentials: the class is created by the administration.' },
  { fazer: nada, espera: 3.2,
    pt: 'O formando abre o mesmo endereço e entra com o utilizador que lhe deram.',
    en: 'Trainees open the same address and sign in with the username they were given.' },
  { fazer: nada, espera: 3.0,
    pt: 'A partir daí, cada um trabalha na sua própria cópia do CRM.',
    en: 'From there, each person works in their own copy of the CRM.' },
]},

/* ===================== 3 ===================== */
dashboard: { titulo: 'Dashboard & Agenda', titulo_en: 'Dashboard & Calendar', passos: [
  { fazer: ir('dashboard'), espera: 3.2,
    pt: 'O painel dá o estado do negócio num relance.',
    en: 'The dashboard gives the state of the business at a glance.' },
  { fazer: nada, espera: 3.0,
    pt: 'Receita ganha, ticket médio, pipeline aberto e taxa de conversão.',
    en: 'Revenue won, average ticket, open pipeline and conversion rate.' },
  { fazer: aba(2), espera: 2.8,
    pt: 'O período escolhe-se num clique, e todos os indicadores acompanham.',
    en: 'Pick the period with one click, and every indicator follows.' },
  { fazer: seccao(2), espera: 3.0,
    pt: 'Mais abaixo, as propostas recentes e o pipeline dividido por estado.',
    en: 'Further down, the recent proposals and the pipeline split by stage.' },
  { fazer: seccao(4), espera: 3.0,
    pt: 'E de onde vieram os leads, por canal de aquisição.',
    en: 'And where the leads came from, by acquisition channel.' },
  { fazer: ir('agenda'), espera: 3.4,
    pt: 'A Agenda junta o calendário e as tarefas, com o que está em atraso à frente.',
    en: 'The Calendar brings together events and tasks, with anything overdue up front.' },
]},

/* ===================== 4 ===================== */
contactos: { titulo: 'Empresas & Contactos', titulo_en: 'Companies & Contacts', passos: [
  { fazer: ir('empresas'), espera: 3.2,
    pt: 'Um CRM profissional separa a empresa da pessoa.',
    en: 'A professional CRM keeps the company apart from the person.' },
  { fazer: nada, espera: 3.0,
    pt: 'A empresa é a entidade legal: NIPC, CAE, dimensão e nível de fidelização.',
    en: 'The company is the legal entity: tax number, activity code, size and loyalty tier.' },
  { fazer: abrir('tbody tr'), espera: 3.6,
    pt: 'A ficha mostra tudo o que aconteceu com essa conta.',
    en: 'The record shows everything that happened with that account.' },
  { fazer: fechar, espera: 1.4, pt: '', en: '' },
  { fazer: ir('clientes'), espera: 3.0,
    pt: 'Os contactos são as pessoas, cada uma ligada à sua empresa.',
    en: 'Contacts are the people, each linked to their company.' },
  { fazer: abrir('tbody tr'), espera: 3.8,
    pt: 'E aqui está a vista de 360 graus: propostas, valor, consentimentos e pedidos.',
    en: 'And here is the 360-degree view: proposals, value, consents and requests.' },
]},

/* ===================== 5 ===================== */
'gestao-leads': { titulo: 'Gestão de leads', titulo_en: 'Lead management', passos: [
  { fazer: ir('empresas'), espera: 3.2,
    pt: 'Uma empresa não nasce cliente: percorre um ciclo de vida.',
    en: 'A company is not born a customer: it goes through a lifecycle.' },
  { fazer: nada, espera: 3.4,
    pt: 'Lead, depois MQL quando alguém de lá demonstra interesse, SQL quando já há proposta, e por fim Cliente.',
    en: 'Lead, then MQL when someone there shows interest, SQL once there is a proposal, and finally Customer.' },
  { fazer: nada, espera: 3.2,
    pt: 'A pontuação ao lado é o lead scoring: agrega o comportamento das pessoas dessa empresa.',
    en: 'The score beside it is lead scoring: it aggregates the behaviour of that company’s people.' },
  { fazer: ir('analytics'), espera: 2.6, pt: '', en: '' },
  { fazer: seccao(2), espera: 3.6,
    pt: 'O funil de aquisição mostra quantas contas passam de uma fase à seguinte.',
    en: 'The acquisition funnel shows how many accounts move from one stage to the next.' },
]},

/* ===================== 6 ===================== */
produtos: { titulo: 'Produtos', titulo_en: 'Products', passos: [
  { fazer: ir('produtos'), espera: 3.2,
    pt: 'O catálogo organiza-se em família, subfamília e artigo.',
    en: 'The catalogue is organised into family, subfamily and item.' },
  { fazer: nada, espera: 3.2,
    pt: 'Cada artigo tem preço, taxa de IVA e se é pontual ou recorrente.',
    en: 'Each item has a price, a VAT rate, and whether it is one-off or recurring.' },
  { fazer: abrir('tbody tr'), espera: 3.6,
    pt: 'É daqui que as linhas da proposta saem, já com o preço certo.',
    en: 'This is where proposal lines come from, already with the right price.' },
]},

/* ===================== 7 ===================== */
propostas: { titulo: 'Propostas - o pipeline', titulo_en: 'Proposals - the pipeline', passos: [
  { fazer: ir('propostas'), espera: 3.2,
    pt: 'O pipeline é um quadro: cada coluna é um estado.',
    en: 'The pipeline is a board: each column is a stage.' },
  { fazer: nada, espera: 3.0,
    pt: 'Criada, enviada, em negociação, ganha ou perdida.',
    en: 'Created, sent, in negotiation, won or lost.' },
  { fazer: nada, espera: 3.0,
    pt: 'O rótulo do cartão diz o nível de interesse do cliente.',
    en: 'The card label tells you how warm the client is.' },
  { fazer: aba(1), espera: 3.2,
    pt: 'A mesma informação em tabela, para quando se quer ordenar e comparar.',
    en: 'The same information as a table, for when you want to sort and compare.' },
  { fazer: aba(0), espera: 2.4, pt: '', en: '' },
  { fazer: abrirProposta, espera: 3.8,
    pt: 'Abrir um cartão dá a proposta inteira, com linhas, descontos e total.',
    en: 'Opening a card gives you the whole proposal, with lines, discounts and total.' },
]},

/* ===================== 8 ===================== */
'criar-proposta': { titulo: 'Criar uma proposta', titulo_en: 'Creating a proposal', passos: [
  { fazer: ir('propostas'), espera: 2.4, pt: '', en: '' },
  { fazer: novaProposta, espera: 3.6,
    pt: 'Uma proposta nova já chega com número e responsável.',
    en: 'A new proposal already arrives with a number and an owner.' },
  { fazer: nada, espera: 3.4,
    pt: 'A venda ancora-se na empresa, e o contacto é a pessoa com quem se negoceia.',
    en: 'The sale is anchored on the company, and the contact is the person you negotiate with.' },
  { fazer: rolar(420), espera: 3.4,
    pt: 'O nível de interesse tinge o cartão no quadro, para se ver o que está quente.',
    en: 'The interest level colours the card on the board, so you can see what is hot.' },
  { fazer: rolar(420), espera: 3.4,
    pt: 'As linhas saem do catálogo, e o total conta o IVA da região e o desconto de fidelização.',
    en: 'Lines come from the catalogue, and the total accounts for regional VAT and the loyalty discount.' },
]},

/* ===================== 9 ===================== */
linhas: { titulo: 'Linhas & catálogo', titulo_en: 'Lines & catalogue', passos: [
  { fazer: ir('propostas'), espera: 2.4, pt: '', en: '' },
  { fazer: abrirProposta, espera: 3.6,
    pt: 'Cada linha de uma proposta vem de um artigo do catálogo.',
    en: 'Every line of a proposal comes from an item in the catalogue.' },
  { fazer: rolar(500), espera: 3.6,
    pt: 'Quantidade, preço e IVA vêm preenchidos; o desconto aplica-se por linha.',
    en: 'Quantity, price and VAT come filled in; the discount applies per line.' },
  { fazer: rolar(400), espera: 3.6,
    pt: 'Um artigo recorrente multiplica pelos meses de fidelização - é assim que se calcula o valor total do contrato.',
    en: 'A recurring item multiplies by the committed months - that is how total contract value is worked out.' },
]},

/* ===================== 10 ===================== */
pdf: { titulo: 'Exportar em PDF', titulo_en: 'Exporting as PDF', passos: [
  { fazer: ir('propostas'), espera: 2.4, pt: '', en: '' },
  { fazer: abrirProposta, espera: 2.8,
    pt: 'Qualquer proposta se transforma num documento apresentável.',
    en: 'Any proposal turns into a presentable document.' },
  { fazer: escolherModelo('cl.ssico'), espera: 1.2, pt: '', en: '' },
  { fazer: clicarAct('prop-preview'), espera: 4.0,
    pt: 'A pré-visualização mostra exatamente o que o cliente vai receber.',
    en: 'The preview shows exactly what the client will receive.' },
  { fazer: rolar(400), espera: 3.6,
    pt: 'O aspeto vem do modelo de proposta, e o modelo usa a cor da marca.',
    en: 'The look comes from the proposal template, and the template uses the brand colour.' },
]},

/* ===================== 11 ===================== */
'proposta-online': { titulo: 'Proposta online', titulo_en: 'Online proposal', passos: [
  { fazer: ir('propostas'), espera: 2.4, pt: '', en: '' },
  { fazer: abrirProposta, espera: 3.4,
    pt: 'Em vez de anexar um PDF, a proposta pode ir como link.',
    en: 'Instead of attaching a PDF, the proposal can go out as a link.' },
  { fazer: nada, espera: 3.6,
    pt: 'O cliente abre-a no browser, e o CRM conta quantas vezes a abriu.',
    en: 'The client opens it in the browser, and the CRM counts how many times they did.' },
  { fazer: nada, espera: 3.4,
    pt: 'E pode adjudicar ali mesmo, num clique, sem responder a um email.',
    en: 'And they can accept it right there, in one click, without replying to an email.' },
]},

/* ===================== 12 ===================== */
'aprovacao-propostas': { titulo: 'Aprovação de propostas', titulo_en: 'Proposal approval', passos: [
  { fazer: ir('definicoes'), espera: 2.6, pt: '', en: '' },
  { fazer: seccao(1), espera: 3.8,
    pt: 'Acima de certo valor, ou de certo desconto, uma proposta não sai sem aprovação.',
    en: 'Above a given value, or a given discount, a proposal does not go out without approval.' },
  { fazer: nada, espera: 3.4,
    pt: 'A regra define-se aqui, e é o gestor que aprova.',
    en: 'The rule is set here, and it is the manager who approves.' },
  { fazer: ir('propostas'), espera: 3.4,
    pt: 'Quem tentar avançar uma proposta retida vê-a ficar onde está, à espera.',
    en: 'Anyone trying to advance a held proposal sees it stay put, waiting.' },
]},

/* ===================== 13 ===================== */
modelos: { titulo: 'Modelos de Proposta', titulo_en: 'Proposal templates', passos: [
  { fazer: ir('modelos'), espera: 3.4,
    pt: 'O modelo define o aspeto do documento que o cliente recebe.',
    en: 'The template defines how the document the client receives looks.' },
  { fazer: nada, espera: 3.2,
    pt: 'Monta-se por blocos: cabeçalho, saudação, tabela de linhas, condições, rodapé.',
    en: 'It is assembled from blocks: header, greeting, line table, terms, footer.' },
  { fazer: abrir('tbody tr'), espera: 3.8,
    pt: 'A cor é a da marca, e as etiquetas puxam os dados da proposta sozinhas.',
    en: 'The colour is the brand’s, and the tags pull the proposal data in by themselves.' },
]},

/* ===================== 14 ===================== */
'casos': { titulo: 'Helpdesk', titulo_en: 'Helpdesk', passos: [
  { fazer: ir('casos'), espera: 3.4,
    pt: 'Vender é metade; a outra metade é o que acontece depois.',
    en: 'Selling is half of it; the other half is what happens afterwards.' },
  { fazer: nada, espera: 3.4,
    pt: 'Cada caso tem prioridade, estado e um prazo de resposta - o SLA.',
    en: 'Each case has a priority, a status and a response deadline - the SLA.' },
  { fazer: nada, espera: 3.2,
    pt: 'Quando o prazo estoura, o caso marca-se sozinho como violado.',
    en: 'When the deadline is missed, the case flags itself as breached.' },
  { fazer: abrir('tbody tr'), espera: 3.8,
    pt: 'No fim pergunta-se ao cliente se ficou satisfeito, e a resposta entra nos números.',
    en: 'At the end the client is asked whether they were satisfied, and the answer feeds the numbers.' },
]},

/* ===================== 15 ===================== */
retencao: { titulo: 'Retenção & churn', titulo_en: 'Retention & churn', passos: [
  { fazer: ir('retencao'), espera: 3.4,
    pt: 'Uma proposta perdida nunca chegou a ser cliente. Um contrato cancelado é um cliente que se vai embora.',
    en: 'A lost proposal never became a customer. A cancelled contract is a paying customer walking away.' },
  { fazer: nada, espera: 3.4,
    pt: 'O fluxo acompanha-o: em risco, pedido de cancelamento, tentativa de retenção.',
    en: 'The flow follows them: at risk, cancellation requested, retention attempt.' },
  { fazer: nada, espera: 3.4,
    pt: 'O motivo do cancelamento sugere a oferta que pode travá-lo.',
    en: 'The reason for cancelling suggests the offer that might stop it.' },
  { fazer: ir('analytics'), espera: 2.4, pt: '', en: '' },
  { fazer: seccao(9), espera: 3.6,
    pt: 'E o que se perdeu em receita recorrente aparece no Analytics.',
    en: 'And the recurring revenue lost shows up in Analytics.' },
]},

/* ===================== 16 ===================== */
campanhas: { titulo: 'Campanhas & segmentação', titulo_en: 'Campaigns & segmentation', passos: [
  { fazer: ir('campanhas'), espera: 3.4,
    pt: 'Uma campanha fala com um segmento, não com toda a gente.',
    en: 'A campaign speaks to a segment, not to everyone.' },
  { fazer: nada, espera: 3.2,
    pt: 'O alvo cruza a dimensão da empresa com o nível de fidelização.',
    en: 'The target crosses company size with loyalty tier.' },
  { fazer: seccao(1), espera: 3.6,
    pt: 'A segmentação mostra quantas contas caem em cada grupo.',
    en: 'Segmentation shows how many accounts fall into each group.' },
]},

/* ===================== 17 ===================== */
'web-to-lead': { titulo: 'Formulário de captação', titulo_en: 'Web-to-lead form', passos: [
  { fazer: ir('campanhas'), espera: 2.6, pt: '', en: '' },
  { fazer: seccao(2), espera: 3.8,
    pt: 'Um lead não tem de ser escrito à mão.',
    en: 'A lead does not have to be typed in by hand.' },
  { fazer: nada, espera: 3.6,
    pt: 'O formulário de captação gera-se aqui e cola-se num site.',
    en: 'The capture form is generated here and pasted into a website.' },
  { fazer: nada, espera: 3.4,
    pt: 'Quem o preenche entra no CRM já como lead, com a origem registada.',
    en: 'Whoever fills it in lands in the CRM as a lead, with the source already recorded.' },
]},

/* ===================== 18 ===================== */
comunicacao: { titulo: 'Comunicação', titulo_en: 'Communication', passos: [
  { fazer: ir('comunicacao'), espera: 3.4,
    pt: 'Tudo o que sai do CRM passa por aqui.',
    en: 'Everything that leaves the CRM goes through here.' },
  { fazer: nada, espera: 3.2,
    pt: 'O histórico regista cada envio, e se foi aberto ou clicado.',
    en: 'The history records every send, and whether it was opened or clicked.' },
  { fazer: aba(2), espera: 3.6,
    pt: 'Os modelos de email guardam o texto que se repete, com etiquetas para os dados do cliente.',
    en: 'Email templates keep the text that repeats, with tags for the client’s data.' },
  { fazer: aba(1), espera: 3.2,
    pt: 'E os agendados são os que estão à espera da data de envio.',
    en: 'And the scheduled ones are those waiting for their send date.' },
]},

/* ===================== 19 ===================== */
'automacao-comportamental': { titulo: 'Automações', titulo_en: 'Automations', passos: [
  { fazer: ir('comunicacao'), espera: 2.4, pt: '', en: '' },
  { fazer: aba(3), espera: 3.6,
    pt: 'Uma automação é uma regra que age sozinha quando algo acontece.',
    en: 'An automation is a rule that acts on its own when something happens.' },
  { fazer: nada, espera: 3.6,
    pt: 'Cliente novo, proposta ganha, subida de nível - ou um comportamento, como abrir um email.',
    en: 'A new client, a won proposal, a tier upgrade - or a behaviour, like opening an email.' },
  { fazer: nada, espera: 3.4,
    pt: 'A ação pode ser enviar um email, mudar a fase, criar uma tarefa ou deixar uma nota.',
    en: 'The action can be sending an email, changing the stage, creating a task or leaving a note.' },
]},

/* ===================== 20 ===================== */
jornadas: { titulo: 'Jornadas do cliente', titulo_en: 'Customer journeys', passos: [
  { fazer: ir('comunicacao'), espera: 2.4, pt: '', en: '' },
  { fazer: aba(4), espera: 3.8,
    pt: 'Uma jornada é a mesma automação vista como percurso.',
    en: 'A journey is the same automation seen as a path.' },
  { fazer: nada, espera: 3.6,
    pt: 'Evento, espera, email - e outra vez, ao longo de dias.',
    en: 'Event, wait, email - and again, over days.' },
  { fazer: nada, espera: 3.4,
    pt: 'É assim que se nutre um lead sem estar em cima dele todos os dias.',
    en: 'That is how you nurture a lead without chasing it every day.' },
]},

/* ===================== 21 ===================== */
analytics: { titulo: 'Analytics', titulo_en: 'Analytics', passos: [
  { fazer: ir('analytics'), espera: 3.2,
    pt: 'O Analytics transforma os registos em decisões.',
    en: 'Analytics turns records into decisions.' },
  { fazer: nada, espera: 3.2,
    pt: 'O funil de vendas mostra onde as oportunidades se perdem.',
    en: 'The sales funnel shows where opportunities are lost.' },
  { fazer: seccao(4), espera: 3.4,
    pt: 'A receita por mês diz se o ano está a crescer ou a travar.',
    en: 'Revenue by month tells you whether the year is growing or stalling.' },
  { fazer: seccao(12), espera: 3.6,
    pt: 'O custo de aquisição e o valor do tempo de vida dizem se o negócio compensa.',
    en: 'Acquisition cost and lifetime value tell you whether the business pays off.' },
  { fazer: seccao(13), espera: 3.6,
    pt: 'E o lead scoring ordena quem merece atenção primeiro.',
    en: 'And lead scoring ranks who deserves attention first.' },
]},

/* ===================== 22 ===================== */
decisao: { titulo: 'Modelos de decisão', titulo_en: 'Decision models', passos: [
  { fazer: ir('decisao'), espera: 3.4,
    pt: 'Saber os números é uma coisa; saber o que fazer a seguir é outra.',
    en: 'Knowing the numbers is one thing; knowing what to do next is another.' },
  { fazer: nada, espera: 3.4,
    pt: 'A próxima melhor ação aponta as contas em risco e as que adormeceram.',
    en: 'Next best action points out the accounts at risk and the ones that went quiet.' },
  { fazer: seccao(1), espera: 3.6,
    pt: 'O simulador responde a "e se" - mudar o desconto, mudar a conversão.',
    en: 'The simulator answers "what if" - change the discount, change the conversion.' },
  { fazer: seccao(2), espera: 3.4,
    pt: 'A previsão estima o fecho do mês ao ritmo atual.',
    en: 'The forecast estimates the month’s close at the current pace.' },
  { fazer: seccao(3), espera: 3.6,
    pt: 'E a segmentação RFM separa os melhores clientes dos que estão a escapar.',
    en: 'And RFM segmentation separates the best customers from the ones slipping away.' },
]},

/* ===================== 23 ===================== */
rgpd: { titulo: 'RGPD', titulo_en: 'GDPR', passos: [
  { fazer: ir('rgpd'), espera: 3.2,
    pt: 'A conformidade vive dentro do CRM, não num dossiê à parte.',
    en: 'Compliance lives inside the CRM, not in a separate binder.' },
  { fazer: nada, espera: 3.2,
    pt: 'Os consentimentos ficam registados com data, finalidade e canal.',
    en: 'Consents are recorded with date, purpose and channel.' },
  { fazer: aba(6), espera: 3.6,
    pt: 'Os pedidos dos titulares têm prazo, e o prazo conta-se sozinho.',
    en: 'Data subject requests have a deadline, and the deadline counts itself.' },
  { fazer: aba(7), espera: 3.4,
    pt: 'O registo de atividades de tratamento é o RoPA do artigo 30.',
    en: 'The record of processing activities is the Article 30 RoPA.' },
  { fazer: aba(8), espera: 3.4,
    pt: 'E as violações de dados têm as suas 72 horas.',
    en: 'And data breaches have their 72 hours.' },
]},

/* ===================== 24 ===================== */
alertas: { titulo: 'Alertas', titulo_en: 'Alerts', passos: [
  { fazer: ir('alertas'), espera: 3.2,
    pt: 'Os alertas são a lista do que precisa de atenção hoje.',
    en: 'Alerts are the list of what needs attention today.' },
  { fazer: nada, espera: 3.4,
    pt: 'Tarefas em atraso, propostas paradas, prazos de RGPD a acabar.',
    en: 'Overdue tasks, stalled proposals, GDPR deadlines running out.' },
  { fazer: seccao(1), espera: 3.4,
    pt: 'E o histórico guarda o que já se fez, para não se repetir.',
    en: 'And the history keeps what has been done, so it is not repeated.' },
]},

/* ===================== 25 ===================== */
definicoes: { titulo: 'Definições', titulo_en: 'Settings', passos: [
  { fazer: ir('definicoes'), espera: 3.2,
    pt: 'As Definições são a configuração do sistema, e só o administrador lá entra.',
    en: 'Settings are the system configuration, and only the administrator goes in there.' },
  { fazer: abrirCartao('[data-set="entidade"]'), espera: 3.4,
    pt: 'A entidade é a empresa em nome de quem se vende: é ela que aparece nas propostas.',
    en: 'The entity is the company you sell on behalf of: it is what appears on proposals.' },
  { fazer: abrirCartao('[data-act="new-group"]'), espera: 3.6,
    pt: 'Os grupos definem o que cada perfil vê, módulo a módulo.',
    en: 'Groups define what each profile sees, module by module.' },
  { fazer: abrirCartao('[data-type="loyalty"]'), espera: 3.4,
    pt: 'Os níveis de fidelização calculam-se do volume ganho, não se atribuem à mão.',
    en: 'Loyalty tiers are calculated from won volume, not assigned by hand.' },
  { fazer: abrirCartao('[data-act="reset-iva"]'), espera: 3.4,
    pt: 'E o IVA muda com a região: continente, Madeira e Açores.',
    en: 'And VAT changes by region: mainland, Madeira and the Azores.' },
]},

/* ===================== 26 ===================== */
'montar-turma': { titulo: 'Gerir a turma', titulo_en: 'Managing the class', passos: [
  { fazer: ir('definicoes'), espera: 2.6, pt: '', en: '' },
  { fazer: abrirCartao('#importRosterFile'), espera: 3.8,
    pt: 'Dentro de uma turma, as Definições ganham dois cartões que só o formador vê.',
    en: 'Inside a class, Settings gain two cards only the trainer sees.' },
  { fazer: nada, espera: 3.6,
    pt: 'Os formandos importam-se de um Excel, com pré-visualização e os erros marcados.',
    en: 'Trainees are imported from a spreadsheet, with a preview and the errors flagged.' },
  { fazer: nada, espera: 3.4,
    pt: 'Cada um recebe utilizador e palavra-passe, e entra na sua própria cópia.',
    en: 'Each one gets a username and a password, and enters their own copy.' },
  { fazer: abrirCartao('[data-act="comparar-turma"]'), espera: 3.8,
    pt: 'E quando entregam o trabalho, chega aqui - com os dados todos, para rever e avaliar.',
    en: 'And when they submit their work, it lands here - with all the data, to review and grade.' },
]},


/* ===================== 27 ===================== */
importar: { titulo: 'Importar formandos', titulo_en: 'Importing trainees', passos: [
  { fazer: ir('definicoes'), espera: 2.6, pt: '', en: '' },
  { fazer: abrirCartao('#importRosterFile'), espera: 3.6,
    pt: 'Uma turma inteira não se escreve à mão: importa-se.',
    en: 'A whole class is not typed in by hand: it is imported.' },
  { fazer: nada, espera: 3.6,
    pt: 'O modelo traz as colunas certas - nome, apelido e email são as obrigatórias.',
    en: 'The template comes with the right columns - first name, surname and email are the required ones.' },
  { fazer: nada, espera: 3.4,
    pt: 'O utilizador e a palavra-passe ficam vazios: a app gera-os pela mesma regra para todos.',
    en: 'Username and password are left empty: the app generates them by the same rule for everyone.' },
  { fazer: porFicheiro, espera: 4.2,
    pt: 'Ao escolher o ficheiro, cada linha é validada antes de entrar seja o que for.',
    en: 'When the file is picked, every row is validated before anything is created.' },
  { fazer: nada, espera: 4.0,
    pt: 'As linhas boas ficam verdes, e a que tem o email mal escrito fica marcada a vermelho.',
    en: 'Good rows turn green, and the one with the malformed email is flagged in red.' },
  { fazer: nada, espera: 3.8,
    pt: 'Só as válidas são importadas - as outras corrigem-se no ficheiro e voltam a entrar.',
    en: 'Only valid rows are imported - the rest are fixed in the file and imported again.' },
  { fazer: fechar, espera: 3.6,
    pt: 'E importar não envia convites: as contas ficam criadas, o email vai quando o formador quiser.',
    en: 'And importing sends no invitations: the accounts exist, the email goes out when the trainer decides.' },
]},

/* ===================== 28 ===================== */
recuperar: { titulo: 'Recuperar a palavra-passe', titulo_en: 'Recovering a password', passos: [
  { fazer: clicarAct('profile'), espera: 3.8,
    pt: 'Quem sabe a palavra-passe atual muda-a no próprio perfil.',
    en: 'Anyone who knows their current password changes it in their own profile.' },
  { fazer: rolar(320), espera: 3.6,
    pt: 'Escreve-se a atual, escreve-se a nova, e guarda-se.',
    en: 'Type the current one, type the new one, and save.' },
  { fazer: fechar, espera: 2.4, pt: '', en: '' },
  { fazer: ir('definicoes'), espera: 2.6, pt: '', en: '' },
  { fazer: abrirCartao('#importRosterFile'), espera: 4.0,
    pt: 'Quem se esqueceu não fica sem acesso: pede ao formador, que a repõe na lista da turma.',
    en: 'Anyone who forgot is not locked out: they ask the trainer, who resets it in the class list.' },
  { fazer: nada, espera: 3.8,
    pt: 'A nova palavra-passe é entregue à pessoa, que a muda depois para uma só sua.',
    en: 'The new password is handed over, and the person changes it afterwards to one only they know.' },
]},


/* ===================== 29 ===================== */
/* Grava-se com a conta de um formando: o botão de entrega não existe
   para o formador. O diálogo abre-se e fecha-se - não se gasta uma
   das duas entregas da pessoa a fazer um vídeo. */
submeter: { titulo: 'Submeter o trabalho', titulo_en: 'Submitting your work', passos: [
  { fazer: clicarAct('profile'), espera: 3.6,
    pt: 'Antes de entregar, a assinatura: é ela que autentica a autoria do trabalho.',
    en: 'Before submitting, the signature: it is what authenticates the authorship of the work.' },
  { fazer: rolar(520), espera: 3.6,
    pt: 'Escreve-se uma vez no perfil, e fica.',
    en: 'It is written once in the profile, and stays.' },
  { fazer: fechar, espera: 2.2, pt: '', en: '' },
  { fazer: clicarAct('submit-work'), espera: 4.2,
    pt: 'A entrega faz-se do próprio CRM: o que segue é um retrato completo da sandbox.',
    en: 'Submitting happens from inside the CRM: what goes is a complete snapshot of the sandbox.' },
  { fazer: nada, espera: 4.0,
    pt: 'O email do formador vem preenchido, e o contador diz quantas entregas faltam.',
    en: 'The trainer email comes filled in, and the counter says how many submissions are left.' },
  { fazer: rolar(300), espera: 3.8,
    pt: 'São duas, no máximo - entrega-se quando o trabalho estiver mesmo pronto.',
    en: 'There are two at most - submit when the work is really finished.' },
  { fazer: nada, espera: 3.6,
    pt: 'Depois de submeter, a confirmação fica no ecrã, com a data e o resumo do que foi entregue.',
    en: 'After submitting, the confirmation stays on screen, with the date and a summary of what was sent.' },
]},

};
