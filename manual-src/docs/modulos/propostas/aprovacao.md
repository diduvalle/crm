# Aprovação de propostas

Propostas de **valor elevado** ou com **desconto agressivo** não devem seguir para o cliente sem o "OK" de um responsável. O CRM inclui um **ciclo de aprovação**: quando uma proposta ultrapassa a regra, fica retida até o **gestor** decidir.

<figure class="crm-video" data-video="aprovacao-propostas" data-poster="/manual/assets/screens/aprovacao-propostas.png"></figure>

## Definir a regra

Em **Definições → Aprovação de propostas**:

| Campo | O que faz |
|---|---|
| **Exigir aprovação do gestor** | Liga ou desliga o ciclo de aprovação |
| **Limite de valor (TCV) sem aprovação** | Acima deste valor de contrato, a proposta precisa de aprovação |
| **Desconto máximo por linha sem aprovação** | Acima desta percentagem de desconto numa linha, precisa de aprovação |

Basta **uma** das condições ser ultrapassada para a proposta seguir para aprovação.

## Fluxo

1. O comercial cria a proposta e tenta passá-la a **Enviada**, **Negociação** ou **Ganha**.
2. Se a proposta **excede a regra**, o CRM **não** a deixa avançar: mantém-na em **Criada** e marca-a com o selo **Aguarda aprovação**.
3. A proposta aparece no painel **Aprovações pendentes**, no topo do ecrã **Propostas**.
4. O **gestor** clica em **Aprovar** ou **Rejeitar**:
    - **Aprovar** - a proposta avança para o estado que o comercial pretendia (ex.: Enviada) e dispara as automações associadas.
    - **Rejeitar** - o gestor pode escrever um motivo; o comercial vê-o na proposta e ajusta antes de voltar a submeter.

!!! note "Quem aprova"
    Aprovar e rejeitar são ações do **gestor** (grupos marcados como *Gestor* nas Definições). Outros utilizadores veem as pendências, mas não podem decidir.

!!! tip "Ver o motivo"
    Dentro da proposta, um aviso mostra sempre o estado da aprovação: *aguarda*, *rejeitada* (com o motivo) ou *aprovada*.

➡️ Voltar a **[Pipeline](pipeline.md)** · **[Propostas](index.md)**.
