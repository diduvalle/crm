# Empresas & Contactos

Modelo profissional **Account / Contact** (B2B): as **Empresas** são as entidades legais; os **Contactos** são as pessoas ligadas a essas empresas. São dois menus distintos na barra lateral.

<figure class="crm-video" data-video="contactos" data-poster="/manual/assets/screens/clientes.png"></figure>

*O separador Contactos - ficha completa e visão 360° de cada cliente.*

---

## Empresas

A **empresa é a conta comercial**: é aqui que vive a venda, o valor, o loyalty e a **gestão de leads**.

### O ecrã
- **KPIs**: nº de empresas, **Leads quentes** (score ≥ 70), **Clientes** (fase = Cliente) e **valor ganho**.
- **Filtro por Fase do lead** (chips: Todas / Lead / MQL / SQL / Cliente / Perdido) e, em cada linha, o **selo de score** (Quente / Morno / Frio).
- **Pesquisa**, **paginação** e **+ Empresa**. Clica numa **linha** → **ficha 360°**.

<figure class="crm-video" data-video="gestao-leads" data-poster="/manual/assets/screens/clientes.png"></figure>

*Gestão de leads na empresa: fase do ciclo de vida, lead score, filtro por fase e o funil de aquisição.*

### Criar / editar - campo a campo
- **Nome** (razão social) *obrigatório*.
- **NIPC** - validado (dígito de controlo). Ao escrever, mostra em tempo real se é válido e o **tipo de entidade** (empresa, pessoa singular, ENI…). O botão **Procurar** preenche automaticamente os dados da empresa (nome, morada, CAE, contactos) pelo NIPC. *Bloqueia gravar se inválido.*
- **CAE** e **Setor** - ao escolher **Outro**, abre a caixa para dizer **qual** (ver [a regra do "Outro"](#outro-pede-sempre-o-que)).
- **Dimensão (segmento)** - Micro / PME / Grande Empresa.
- **Fase (ciclo de vida)** - **Lead** → **MQL** (*Marketing Qualified Lead*, uma das suas pessoas demonstrou interesse) → **SQL** (*Sales Qualified Lead*, oportunidade real com proposta) → **Cliente** / **Perdido**. A app **infere** a fase e **avança-a** sozinha: *engagement* de email → MQL, proposta → SQL, ganha → Cliente.
- **Origem (aquisição)** - canal por onde a empresa chegou (Website, Recomendação, Feira, Campanha Email…) - base do **funil de aquisição** e do **ROI por origem** no Analytics. Ao escolher **Outro**, abre uma caixa para **especificar qual** (ver abaixo).
- **Morada fiscal**, **Código postal**, **Cidade**.
- **Região** - Continente / Madeira / Açores (influencia o IVA das propostas).
- **Responsável** - quem conduz esta conta. Ver [Responsável](#responsavel).
- **Website**, **Telefone**, **Email**, **Notas**.

### Ficha 360°
Mostra a **fase de lead** e o **lead score** da empresa (que **agrega o engagement de todas as suas pessoas**), a **origem**, o **loyalty**, os **dados fiscais**, a **lista de pessoas** e um resumo de **propostas / ganhas / valor ganho**.

!!! note "A gestão de leads e o valor são da **Empresa**, não do contacto"
    A venda (proposta), o **valor**, o **loyalty**, o **segmento** (dimensão) e a **fase de lead** são todos da **empresa**. Uma pessoa pode **mudar de empresa** e o histórico **não vai com ela** - fica na conta onde o negócio aconteceu. O **lead score** da empresa sobe quando **qualquer uma das suas pessoas** abre/clica emails; quem **fecha** a venda é um contacto (fica registado na proposta), mas o negócio é da empresa. Para um cliente em **nome individual (ENI)**, cria-se a **empresa a partir do contacto** (botão na ficha, um clique) - continua a ser uma empresa. Um contacto **sem empresa** é apenas uma entrada no **diretório**, sem venda, fase nem valor.

---

## Contactos

As pessoas - um **diretório**, como as **páginas amarelas**. O contacto **não tem** venda, valor, loyalty nem segmento próprios (isso é da empresa); guarda a **identidade**, a **empresa atual**, o **cargo/função** e o **histórico de mudanças de empresa**.

### O ecrã
- **KPIs**: total de contactos, **ligados a empresa**, **particulares** e **empresas distintas**.
- **Pesquisa**, **paginação** e **+ Contacto**. Clica numa linha → **ficha 360°**.
- Cada linha mostra a **empresa** (com a **fase de lead da empresa**, como referência), o **cargo/função** e o telefone.

### Criar / editar - campo a campo
- **Nome** e **Apelido** *(nome obrigatório)*.
- **Empresa** - escolhe da lista de Empresas (pode ficar **sem empresa** - fica só no diretório; para lhe vender, cria a empresa a partir da ficha); **Cargo** e **Função** (a quem recorrer: dono, financeiro…).
- **Email**, **Telefone** (principais - usados nos envios), **NIF (pessoal)** - validado.
- **Contactos adicionais** - lista com quantos emails/telefones quiseres, cada um com **tipo** (Email/Telefone) e **rótulo** (Profissional / Pessoal). Útil quando a pessoa tem contactos pessoais e profissionais.

    *Aqui o rótulo **Outro** foi retirado, em vez de ganhar caixa: a linha já tem três campos e não cabe mais um - e um rótulo "Outro" não distingue um telefone de outro telefone. Quem já o tinha passou a **Profissional**.*
- **Cidade** e **Região**.
- **Notas**.

### Ficha 360°
Mostra o cartão **Conta · Empresa** (a fase, o loyalty e o valor **da empresa**, com atalho para a ficha dela), a **ficha da pessoa** (contactos, cargo, função), os **contactos adicionais**, o **histórico de empresa** (moveu-se de A → B) e as **propostas negociadas com esta pessoa**.

!!! tip "Atalhos"
    Clica no **email** da ficha para abrir o compositor do CRM já com o contacto como destinatário; clica no **telefone** para ligar (`tel:`). Na empresa, o botão **Procurar** (no NIPC) preenche a ficha a partir dos registos oficiais.

### "Outro" pede sempre o quê
A regra vale para a **app inteira**: onde houver **Outro**, ou há caixa para escrever, ou a opção não existe.

Campos com caixa **Qual?**:

| Campo | Onde |
|---|---|
| **Função na empresa** | ficha do contacto |
| **Origem (aquisição)** | ficha da empresa |
| **Setor** | ficha da empresa |
| **Tipo** | agendamento, na [Agenda](dashboard-agenda.md) |
| **Motivo da perda** e **[do ganho](propostas/ganho.md)** | proposta |

O que escreveres aparece a seguir ao valor - *"Outro: Formador externo"* - na ficha, na gaveta e nas tabelas. Onde só cabe uma palavra (o selo da agenda, um gráfico, a linha do tempo) aparece **só o que escreveste**, sem o prefixo.

Escolher outro valor **fecha a caixa e apaga** o texto, para não ficar informação escondida por trás de uma opção que já não está selecionada.

!!! warning "Guardar com Outro em branco é recusado"
    A app **não deixa gravar** com *Outro* escolhido e a caixa vazia - avisa e leva o cursor até lá. Um registo que diz apenas *Outro* não se lê, não se filtra e não se conta: ocupa a ficha sem dizer nada.

    A verificação lê o **próprio campo**, não uma lista fixa - por isso vale para estes e para qualquer campo que venha a usar o mesmo mecanismo.

!!! tip "Porque não escrever direto no campo"
    O valor continua a ser **Outro**, e é isso que faz os agrupamentos funcionarem: no funil de aquisição e no ROI por origem, esses casos continuam a somar todos em *Outro*, em vez de se dispersarem em dezenas de rótulos únicos. O texto livre é a **explicação**, não a categoria.

### Campos personalizados
Nenhum CRM adivinha o que o teu negócio precisa de guardar. Se te falta um campo - **Matrícula**, **Nº de sócio**, **Data de renovação** - crias tu:

1. Abre um contacto (ou **+ Novo contacto**) e clica **+ Campo personalizado**, no fim do formulário.
2. Dá-lhe um **título** e escolhe o **tipo**: texto, texto longo, número, data ou lista de opções.
3. **Criar** - o campo aparece logo ali, sem perderes o que já tinhas escrito.

!!! info "O campo é da tua base de dados, não daquele contacto"
    Um campo criado passa a existir em **todos os contactos**. É isso que permite usá-lo como **tag** nos modelos. Geres a lista em **Definições → Campos personalizados**, onde podes **desativar** (esconde o campo mas guarda o que já foi preenchido) ou **apagar** (remove só a definição).

#### Usar nos modelos
Cada campo ganha automaticamente uma tag `{{cliente.<chave>}}` - por exemplo `{{cliente.matricula}}` - que aparece **sozinha** na lista de tags do construtor de **modelos de proposta** e do editor de **modelos de email**. Não há nada a configurar: cria o campo, e a tag está lá.

!!! warning "Um campo personalizado é dado pessoal"
    Tudo o que guardares nestes campos entra no **Relatório de acesso (art. 15.º)** e na **exportação JSON** do titular, tal como os campos de origem. Vale a pena discutir com a turma: *criar um campo é fácil, mas cada campo novo é mais um dado pessoal que passas a ter de justificar, conservar e mostrar a quem o pedir* (minimização - art. 5.º/1 c)).

---

## Responsável

Cada **empresa** e cada **proposta** podem ter um **responsável** - a pessoa que conduz aquela conta ou aquele negócio. Aparece como **selo** na linha da tabela e, se fores tu, diz *"(eu)"*.

No topo das listas há um filtro:

- **Todos** · **As minhas** · **Por atribuir** · ou uma pessoa em concreto.

Numa turma, a lista de pessoas é a **turma** (vem do registo online), não os utilizadores de demonstração.

!!! tip "Para que serve mesmo"
    Sem dono, uma conta é de toda a gente e portanto de ninguém - é assim que os *follow-ups* se perdem. É também o que torna possíveis as **[quotas individuais](definicoes.md#metas-de-vendas)** e as perguntas *"as minhas"* no **[Pulso](assistente.md)**.

---

## Duplicados

A app já **impede** duplicados na criação (NIPC, NIF e email únicos). O que faltava era limpar os que já lá estão - e entram por três portas: a **importação CSV**, o **gerador de dados** e os registos com email/NIF **em branco**, onde a verificação não dispara.

Em **Empresas** ou **Contactos**, o botão **Duplicados** procura por:

- **NIPC / NIF** iguais (só os dígitos - ignora pontos e espaços);
- **email** igual;
- **nome** praticamente igual (ignora acentos, maiúsculas e as formas jurídicas: *Lda.*, *S.A.*, *Unipessoal*).

### Fundir
Escolhes qual dos registos **fica** e a app trata do resto:

1. Preenche os **campos vazios** do que fica com o que os outros tinham.
2. **Reaponta tudo** o que apontava para os outros - propostas, contactos, casos, tarefas, consentimentos, pedidos de titular, envios, retenções.
3. Apaga os repetidos.

!!! warning "Fundir não tem desfazer"
    A app sugere ficar com o registo **mais completo** (e, em empate, o mais antigo), mas confirma antes: a operação toca em todas as tabelas de uma vez.

    Repara que fundir **não perde** o histórico dos outros - move-o. O que se perde são os campos preenchidos em duplicado com valores **diferentes**, onde o que fica ganha.

---

## Linha do tempo da conta

No fim da **ficha 360°** da empresa há a **linha do tempo**: tudo o que se passou com aquela conta numa só coluna, do mais recente para o mais antigo.

Junta o que antes estava arrumado por tipo - conta criada, mudanças de fase, contactos adicionados, propostas criadas/ganhas/perdidas (com o motivo), emails enviados (e se foram abertos), casos e satisfação, consentimentos dados e retirados, pedidos de titular, pedidos de cancelamento e tarefas.

!!! tip "Para que serve"
    Para preparar uma chamada não interessa a **arrumação por tipo**, interessa a **ordem dos acontecimentos**: ganhámos em abril, abriram um caso em junho, pediram para cancelar em julho. Lido por secções, isto não se vê; lido por ordem, conta-se sozinho.

---

## Importar em massa (CSV)

Tanto em **Contactos** como em **Produtos** há **Importar** + **Modelo**:

1. Descarrega o **modelo** CSV.
2. Preenche (uma linha por registo).
3. **Importar** → os registos são criados; duplicados são ignorados.

!!! tip "Gerar dados de exemplo"
    Em **Definições → Gerador de dados de exemplo** crias rapidamente empresas, contactos e propostas realistas (nomes/NIF PT válidos) para praticares sem partir de zero.

!!! note "Pedagogia"
    Praticas a modelação de dados de um CRM real (entidade vs pessoa), a **qualidade de dados** (validação de NIF/NIPC), a **segmentação**, o **loyalty** e a **gestão de leads** (ciclo de vida Lead → Cliente, *lead scoring*, qualificação) - base da análise de clientes.

## Relacionado

<div class="grid cards" markdown>

-   <svg class="icon" viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg> __Produtos__

    ---
    Cria o catálogo antes de fazer propostas a estes clientes.

    [:octicons-arrow-right-24: Abrir](produtos.md)

-   <svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg> __Propostas__

    ---
    Cria propostas para os contactos que registaste.

    [:octicons-arrow-right-24: Abrir](propostas/index.md)

</div>
