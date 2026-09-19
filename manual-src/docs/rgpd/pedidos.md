# Pedidos de titular (DSAR)

Os **DSAR** (*Data Subject Access Requests*) são os pedidos de exercício de direitos do titular.

## Direitos (tipos de pedido)

| Direito | O que é |
|---|---|
| **Acesso** | Saber que dados existem sobre si |
| **Retificação** | Corrigir dados errados |
| **Apagamento** | "Direito a ser esquecido" |
| **Portabilidade** | Receber os dados num formato reutilizável |
| **Oposição** | Opor-se a um tratamento |
| **Limitação** | Restringir o tratamento |

## Cada pedido

- **Titular**, **Tipo**, **Data**, **Prazo** (1 mês) e **Estado** (Recebido / Em curso / Concluído).

## Passo a passo

1. **RGPD → separador Pedidos**.
2. **+ Pedido** (ou chega via **[Portal do Titular](portal.md)**).
3. Trata o pedido e atualiza o **estado**.

!!! warning "Prazo"
    Há **1 mês** para responder. Pedidos **fora de prazo ou a vencer (≤7 dias)** entram nos **Alertas**.


## Responder: dois formatos, dois direitos

Na **ficha de um contacto** há dois botões, e **não são alternativas** - servem direitos diferentes:

| Botão | Direito | Porquê |
|---|---|---|
| **Relatório RGPD** (PDF) | **Acesso** - art. 15.º | O titular tem direito a uma **cópia dos seus dados** e a informação em **linguagem clara** (art. 12.º/1). Um PDF é o formato natural |
| **Exportar JSON** | **Portabilidade** - art. 20.º | A lei exige um formato **estruturado, de uso corrente e de leitura automática**. Um PDF **não** cumpre esse requisito |

### O que o Relatório RGPD inclui

Não basta listar dados. O documento traz também o que o artigo 15.º/1 obriga:

- as **finalidades** e a base legal (a), as **categorias** de dados (b) e os **destinatários** (c);
- o **prazo de conservação** (d), a **origem** dos dados (g);
- os **direitos** de retificação, apagamento, limitação e oposição (e) e o direito de **reclamar à CNPD** (f);
- a existência de **decisões automatizadas e definição de perfis** (h) - no CRM, o **lead score**;
- a identificação do **responsável** e do **EPD**.

### Boas práticas antes de entregar

- **Confirmar a identidade** de quem pede (art. 12.º/6) - responder à pessoa errada é, em si, uma violação de dados.
- **Prazo de 1 mês**, prorrogável por mais dois em casos complexos (art. 12.º/3).
- **Primeira cópia gratuita** (art. 15.º/3).
- **Minimizar**: só os dados daquele titular - nunca dados de terceiros que apareçam nas mesmas notas.
- **Canal seguro** na entrega e **registo** da resposta (responsabilidade, art. 5.º/2). Ao gerar o relatório, se existir um pedido de *Acesso* em aberto, o CRM propõe marcá-lo como concluído.

!!! tip "Cuidado com as notas internas"
    As notas que a equipa escreve no CRM (ex.: *"cliente difícil"*) **são dados pessoais** e entram num pedido de acesso. Boa regra: só escrever o que se está disposto a mostrar ao próprio.

➡️ A seguir: **[RoPA](ropa.md)** · voltar a **[RGPD](index.md)**.
