# Analytics

O módulo de **KPIs & Dashboards** - o foco da UFCD **10868**. Tudo respeita o **filtro temporal** e permite **comparar com o período anterior**.

<figure class="crm-video" data-video="analytics" data-poster="/manual/assets/screens/analytics.png"></figure>

*Funil de vendas, conversão, ticket médio, churn e top empresas (UFCD 10868).*

## Filtro e comparação

- **Filtro temporal** no topo: Tudo / 30 dias / Trimestre / Este mês / Este ano / datas De-Até.
- Botão **Comparar** - calcula o período anterior de igual duração e mostra **▲▼ X% vs anterior** em cada KPI (o churn aparece invertido).

## Os indicadores - um a um

- **Funil de vendas** - conversão entre etapas do pipeline (ou propostas criadas no período).
- **Funil de aquisição** - conversão das **empresas** ao longo do ciclo de vida (**Lead → MQL → SQL → Cliente**), com a % entre etapas. Complementa o funil de vendas: mede a **qualificação** das contas, não a proposta.
- **Aquisição por origem (ROI)** - tabela por **canal de origem** (Website, Recomendação, Feira, Campanha…) com **leads**, **clientes convertidos**, **taxa de conversão** e **valor gerado**. Mostra que canal traz os melhores clientes.
- **Taxa de conversão** - % de propostas que chegam a *Ganha*.
- **Ticket médio** - valor médio das propostas ganhas.
- **Churn** - perda de clientes (menor é melhor).
- **Receita por mês** - barras das propostas ganhas no período.
- **Vendas por estado** - distribuição por estado do pipeline.
- **Top empresas** - por valor ganho (as vendas agregam-se por **empresa**, não por contacto).
- **Análise de ganhos** - agrupa os **[motivos do ganho](propostas/ganho.md)** das propostas ganhas. É o cartão irmão do de baixo: um ensina a evitar erros, o outro a repetir acertos.
- **Análise de perdas** - agrupa os **[motivos de perda](propostas/perda.md)** das propostas perdidas (barras + maior causa).
- **CAC** - Custo de Aquisição de Cliente = **orçamento de marketing ÷ novos clientes**. Defines o orçamento no campo próprio (**Aplicar**).
- **LTV / CAC** - rácio entre o valor do cliente e o custo de o adquirir; fica **verde quando ≥ 3:1** (saudável).
- **Lead scoring** - pontuação **0-100** de cada contacto (compras, *engagement*, loyalty, segmento) → **Quente / Morno / Frio**, com barras.
- **Insights de IA** *(simulado)* - cartões com leituras automáticas dos KPIs e sugestões.

## Exportar

Botão **Imprimir relatório** (no callout) → gera um PDF com **KPIs** (e comparação, se ativa), **funil** e **top empresas**, respeitando o período.

!!! tip "Balões pedagógicos"
    Vários indicadores têm o ícone **ⓘ** com a definição do conceito e a página dos slides (conversão, ticket, churn, funil, funil de aquisição, origem, LTV, CAC, lead scoring, ciclo de vida do lead).

!!! note "Dashboard vs Analytics"
    O **Dashboard** dá a visão rápida do dia; o **Analytics** é a análise aprofundada com comparações e exportação.
