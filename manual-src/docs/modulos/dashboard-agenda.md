# Dashboard & Agenda

<figure class="crm-video" data-video="dashboard" data-poster="/manual/assets/screens/dashboard.png"></figure>

*Vista geral: KPIs do período, propostas recentes e pipeline por estado.*

## Dashboard

A primeira página depois de entrares - a **visão geral** do negócio. Tudo respeita o **filtro temporal** no topo (Tudo / 30 dias / Trimestre / Este mês / Este ano / datas).

### A primeira linha: o que há para fazer hoje

Por baixo do título, a app diz o que está à espera:

> **Diogo**, hoje tem **1 tarefa em atraso**, **1 tarefa para hoje**, **3 casos fora do prazo** e **2 pedidos RGPD fora de prazo**.

Cada número é uma **ligação** para o sítio respetivo. O que já passou do prazo sublinha-se a **âmbar** - distingue-se do que ainda dá para fazer hoje. Sem nada pendente, diz *"nada urgente hoje - bom dia para prospetar"*.

!!! tip "Porque é que isto substituiu a descrição da app"
    Estava ali uma frase que explicava o que o CRM é. Lê-se uma vez.

    Um painel que só **descreve** é um cartaz; um painel que **aponta** é um ponto de partida. A descrição não desapareceu - ficou mais pequena, por baixo.

### O que mostra
- **KPIs** do período: receita ganha, ticket médio, pipeline, novos clientes.
    - Com a **comparação** ativa, cada KPI mostra **▲▼ X% vs período anterior**.
    - Valores financeiros podem aparecer com 🔒 conforme o papel.
- **Receita ganha por mês** - gráfico de barras (só propostas *Ganha*), com a **leitura** por baixo: *"Melhor mês: abril, com 8.236,08 €. Em agosto ainda não há receita registada, e faltam 6 dias."* O gráfico mostra; a frase conclui - que é o que uma boa análise pede. Com um mês só, não aparece: não há comparação a fazer.
- **De onde vêm os leads** - donut das empresas por canal de aquisição, com atalho para o **ROI por canal** no Analytics, onde vive a análise a sério (conversão e valor gerado por canal).
- **Pipeline por estado** - distribuição das propostas (donut/barras).
- **Propostas recentes** - últimos movimentos; clica para abrir.
- **Atalhos pedagógicos** - acesso rápido a Empresas, Agenda, Email, etc.
- **Meta do mês** - a receita ganha do mês contra o **objetivo**, com barra e projeção *"ao ritmo atual fecha em X"*. Se houver **quotas individuais**, mostra a tua e a de cada pessoa. Define-se em **[Definições → Metas de vendas](definicoes.md#metas-de-vendas)**; sem meta, o cartão explica-o em vez de mostrar um número solto.

!!! tip "Notificações"
    O **sino** no topo junta avisos: propostas a expirar (≤15 dias), pedidos RGPD fora de prazo, tarefas em atraso. Clicar leva ao item.

---

## Agenda

![Agenda - calendário e tarefas](../assets/screens/agenda.png)

*A Agenda: calendário mensal/semanal e tarefas ligadas a clientes.*

Calendário e **tarefas** associadas a clientes.

### Vistas
- **Mês** - grelha mensal; o dia de hoje está destacado; cada dia mostra os chips das tarefas (até 3 + “mais”).
- **Semana** - eixo de horas (8h-20h), estilo Google Calendar; as tarefas com hora aparecem como blocos posicionados.
- Botões **‹ ›** e **Hoje** para navegar (recuam/avançam 7 dias na vista semana).

!!! note "Mudar de vista mantém-se no mesmo sítio"
    Até agosto de 2026, andar três meses para a frente em **Mês** e carregar em **Semana** devolvia-o à semana de hoje: havia dois cursores independentes que nunca se falavam.

    Agora as duas vistas são a **mesma viagem**. De Mês para Semana fica no mês que está a ver (no mês corrente abre na semana de hoje; noutro qualquer, na primeira semana desse mês). De Semana para Mês, vai para o mês a que a semana pertence.

    Uma semana pode cair em dois meses, por isso a regra é a mesma nos dois sentidos: **a semana pertence ao mês da sua quinta-feira** (ISO 8601). E o título di-lo quando é o caso: *"30 out - 5 nov 2026"*.

### Criar uma tarefa - campo a campo
Clica num **dia** (vista mês) ou numa **hora** (vista semana) - a data/hora entram preenchidas. Campos:

- **Título** *obrigatório*.
- **Tipo** - Chamada / Reunião / Follow-up / Email / Outro (cada tipo tem cor). Ao escolher **Outro**, abre a caixa para dizer **qual** - e é isso que passa a aparecer no selo da lista (*"Visita técnica"*, não *"Outro"*). Ver [a regra do "Outro"](empresas-contactos.md#outro-pede-sempre-o-que).
- **Data** e **Hora**.
- **Duração** - 15 / 30 / 45 / 60 / 90 / 120 min.
- **Cliente** associado.
- **Estado** (Pendente / Concluída) e **Notas**.

### Notas de uma tarefa
Na lista lateral (**Próximas tarefas**), as tarefas que **têm notas** mostram um **ícone de documento** à direita. Clica para **ler a nota** sem abrir a ficha inteira - útil para verificar rapidamente o que ficou combinado antes de uma chamada ou reunião.

### Gerir
- **Concluir/reabrir** uma tarefa pelo *checkbox* (fica riscada).
- Tarefas de **hoje** ou em **atraso** entram nos **Alertas** (sino).

!!! tip "Perguntar em vez de procurar"
    O **[Pulso](assistente.md)** responde a *"o que tenho para hoje"* e *"tenho tarefas atrasadas"* de qualquer módulo, sem teres de vir à Agenda.

!!! note "Produtos & Catálogo"
    O menu **[Produtos](produtos.md)** organiza o catálogo (Família → Subfamília → Artigo) que alimenta as linhas das propostas.
