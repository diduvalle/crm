# Modelos de decisão

O ecrã **Decisão** transforma os dados do CRM em apoio à decisão: o que fazer a seguir, simulação de cenários, quem são os melhores clientes e quanto vais faturar. Cobre a UFCD 10869 - CRM, modelos de análise à decisão.

<figure class="crm-video" data-video="decisao" data-poster="/manual/assets/screens/decisao.png"></figure>

## Próxima melhor ação (Next Best Action)

Uma lista das ações com mais impacto, por conta, geradas por regras a partir do estado real:

- **Resolver caso em atraso** - a empresa tem um caso com SLA violado.
- **Contactar lead quente** - lead score alto (≥70) ainda em Lead/MQL.
- **Criar proposta** - oportunidade qualificada (SQL) sem proposta em aberto.
- **Fazer follow-up** - proposta enviada há mais de 14 dias sem fecho.
- **Reativar cliente** - sem novas compras há mais de 90 dias.

Clica em **Abrir** para ir à ficha da empresa e agir.

## Simulador What-If

Arrasta os cursores para ver, em tempo real, o impacto no negócio:

- **Variação de preço** (± no ticket médio)
- **Variação da taxa de conversão**
- **Variação do nº de leads**

O simulador mostra os **negócios previstos**, a **conversão** resultante e a **receita projetada**, comparando com o cenário base atual. Serve para responder a perguntas do tipo *"e se baixar o preço 10% mas trouxer mais 20% de leads?"*.

## Previsão de vendas (forecast)

O **pipeline aberto** é ponderado pela probabilidade típica de fecho de cada fase:

| Fase | Probabilidade |
|---|---|
| Criada | 20% |
| Enviada | 40% |
| Negociação | 70% |

A **receita esperada** é a soma ponderada - uma previsão mais realista do que somar todo o pipeline.

## Segmentação RFM

Classifica os clientes por três eixos:

- **R**ecência - há quanto tempo compraram.
- **F**requência - quantas vezes compraram.
- **M**onetário - quanto gastaram.

Os clientes caem em segmentos - **Campeões**, **Leais**, **Em desenvolvimento**, **Em risco**, **Adormecidos** - que orientam a ação: fidelizar os Campeões, reativar os que estão Em risco.

!!! note "Modelos pedagógicos"
    As probabilidades, limiares e regras são simplificados para fins de formação. Num CRM real seriam calibrados com o histórico e, muitas vezes, com machine learning.
