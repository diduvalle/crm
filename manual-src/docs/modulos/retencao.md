# Retenção & churn

Uma **proposta perdida** nunca chegou a ser cliente. Um **contrato cancelado** é um cliente que pagava e sai - é aqui que vive o **churn**. O módulo **Retenção** gere esses cancelamentos como um fluxo, para tentar **salvar** o cliente (save desk) e medir a perda de receita recorrente.

## O fluxo (kanban)

`Em risco → Pedido de cancelamento → Em retenção → Retido (salvo) / Cancelado (churn)`

Cada cartão é um **contrato em risco** (um módulo, serviço ou produto), com:

- **MRR em risco** - a receita recorrente por mês que se perde se cancelar.
- **Tipo**: **Voluntário** (o cliente decide) ou **Involuntário** (falha de pagamento) - resolvem-se de formas diferentes.
- **Motivo**: Preço, Pouco uso, Concorrência, Já não precisa, Suporte/experiência, Pagamento falhou.

Como no pipeline de propostas, a coluna **Retido** fica verde e a **Cancelado** vermelha.

## O save desk (a parte importante)

Ao abrir um cartão, o CRM mostra uma **oferta de retenção sugerida conforme o motivo** - a boa prática que mais aumenta a taxa de salvamento:

| Motivo | Oferta sugerida |
|---|---|
| Preço | Desconto |
| Pouco uso · Já não precisa | Pausa |
| Concorrência | Trocar de plano |
| Suporte/experiência | Ajuda / onboarding |
| Pagamento falhou | Atualizar pagamento |

Aplicas a oferta, registas o contacto no **histórico**, e no fim marcas **Retido** (salvo) ou **Cancelado**. Um contrato cancelado pode depois ser **recuperado** (win-back).

## As métricas (Analytics)

O ecrã **Analytics** ganha um bloco de **Retenção & churn**:

- **Taxa de retenção** (save rate) - quantos cancelamentos foram salvos.
- **MRR em risco** e **MRR churn** - a receita recorrente em risco e a efetivamente perdida por mês (líquida de win-back).
- **Motivos de cancelamento** e **voluntário vs involuntário**.

## Como registar um cancelamento

- Botão **Retenção** no ecrã Propostas (leva ao fluxo) e **Registar cancelamento** dentro do módulo.
- Numa proposta **Ganha**, o botão **Registar cancelamento** cria o cartão já preenchido com o artigo e o MRR do contrato.

!!! note "Ambiente pedagógico"
    Os limiares e ofertas são simplificados para formação. Num produto real, o save desk estaria ligado à faturação e a campanhas de win-back automáticas.
