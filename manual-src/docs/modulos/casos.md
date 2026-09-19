# Serviço ao cliente (Casos)

O módulo **Casos** gere os pedidos de apoio dos clientes de ponta a ponta: registo, conversa, prazos (SLA) e satisfação (CSAT/NPS). Cobre a UFCD 10866 - gestão de vendas e serviços ao cliente.

<figure class="crm-video" data-video="casos" data-poster="/manual/assets/screens/casos.png"></figure>

## Abrir um caso

**Casos → Novo caso**. Preenche:

| Campo | Notas |
|---|---|
| **Assunto** | O que o cliente precisa (obrigatório) |
| **Empresa** / **Contacto** | A quem se refere o caso |
| **Canal** | Email, Telefone, Chat, Portal ou Presencial |
| **Prioridade** | Baixa, Média, Alta ou Urgente - define o prazo de SLA |
| **Responsável** | Quem trata o caso. A lista são os **elementos da tua turma** (a equipa de apoio); pode ficar por atribuir |
| **Descrição** | Fica como a **1.ª mensagem** da conversa |

!!! tip "Procurar um caso"
    No topo da lista há uma **barra de pesquisa**: escreve o **número** (ex.: `002`) ou parte do **assunto/empresa/contacto** e a lista filtra-se de imediato. Combina com os filtros de estado.

## O ciclo do caso

`Novo → Em curso → À espera → Resolvido → Fechado`

- Abre o caso na lista para ver a **conversa**. Escreve no campo de resposta e **Responder** - cada resposta fica no histórico.
- Muda o **estado** com os botões (Novo / Em curso / À espera).
- **Marcar resolvido** quando o problema estiver tratado.
- **Fechar com inquérito** pede o **CSAT** (1-5) e o **NPS** (0-10) do cliente.

## SLA (prazos)

Cada prioridade tem um prazo de resposta, com semáforo:

| Prioridade | Prazo | 
|---|---|
| Urgente | 1 dia |
| Alta | 2 dias |
| Média | 4 dias |
| Baixa | 7 dias |

O selo indica **No prazo** (verde), **SLA em risco** (falta 1 dia) ou **SLA violado** (prazo ultrapassado). A lista ordena os casos abertos pelo prazo mais urgente.

## Satisfação (CSAT & NPS)

Ao fechar, regista-se a satisfação:

- **CSAT** (Customer Satisfaction) - nota de **1 a 5** sobre o atendimento.
- **NPS** (Net Promoter Score) - de **0 a 10**; o indicador global vai de **-100 a +100** (promotores 9-10 menos detratores 0-6).

O ecrã **Analytics** resume o **CSAT médio**, o **NPS** e o cumprimento de **SLA**.

!!! tip "Onde ver o resumo"
    Em **Analytics → Satisfação do serviço** e **Casos por estado** tens os indicadores agregados do apoio ao cliente.
