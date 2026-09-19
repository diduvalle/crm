# Definições

<figure class="crm-video" data-video="definicoes" data-poster="/manual/assets/screens/definicoes.png"></figure>

*As Definições, com cartões colapsáveis (vários só de administrador).*

A **configuração do sistema** (grupo Sistema). Os cartões são **colapsáveis** - clica no título para abrir/fechar; na primeira visita estão recolhidos para a página ficar compacta. Vários cartões são **só para administradores** (selo *Admin*).

## Cartões disponíveis

### Entidade
Dados usados em propostas e comunicações: **nome da entidade**, **NIF/NIPC**, **telefone**, **email** (é o *reply-to* dos emails), **cidade**, **EPD** (Encarregado de Proteção de Dados).

### Dados & backup
**Exportar** / **Importar** o JSON completo do CRM (backup ou migração). É também aqui que **repões os dados de exemplo**.

### Gerador de dados de exemplo
Cria rapidamente **empresas, contactos e propostas** realistas (PT) - acrescenta aos dados existentes.

### Marca & Aparência
*White-label*: **nome**, **cor principal** (deriva a paleta), **logótipo**, **fundo do login**. **Aplicar** / **Repor IEFP**. → [Email & Marca](../formador/email-marca.md).

### Envio de email real (EmailJS) *(Admin)*
As **chaves** estão **fixas** (🔒); geres só o **modo** (real/simulado) + **Enviar teste**. → [Email & Marca](../formador/email-marca.md).

**Convite e reposição de password** - escolhes se o email vai para o **endereço do IEFP + o pessoal** (2 envios por pessoa) ou **só para o do IEFP** (1 envio). Cada endereço conta como um envio no plano: numa turma de 13, é a diferença entre **26** e **13** envios de cada vez que convidas a turma.

**Consumo do plano** - o botão **Consultar consumo** vai ao **histórico real do EmailJS** e mostra quantos envios já foram feitos **neste ciclo**, a barra de progresso (laranja aos 70%, vermelha aos 90%) e a data em que repõe. Em **Teto e dia do ciclo** escreves os dois valores do teu plano no formato `200/4` (200 envios, repõe dia 4) - o painel do EmailJS diz *"Resets on…"*.

!!! note "Porque é que o ciclo não é o mês"
    O EmailJS repõe a quota no **dia de aniversário do plano**, não no dia 1. Contar por mês de calendário daria números diferentes dos dele **precisamente no início de cada mês**, que é quando a informação interessa.

!!! warning "O que gasta envios"
    **Convites e reposições de password** (1 ou 2 por pessoa), o **aviso de cada entrega** de trabalho, os **emails do CRM** enviados pelo formador e o **email de teste**. Os formandos ficam em **modo simulado** no CRM - as únicas mensagens reais que eles provocam são os avisos de entrega. O **Repositório de sessões** usa outro serviço e **não** conta para este plano.

### Grupos de Utilizadores *(Admin)*
Matriz **papéis × módulos**: define o que cada grupo vê (Administrador/Formador = tudo; Formando limitado). Inclui a opção **ocultar valores financeiros** por grupo.

### Modelos de Proposta
Atalho para o construtor de modelos. → [Modelos de Proposta](modelos.md).

### Ver como
O botão do **olho**, ao lado do sair, mostra a app **exatamente como ela chega a um formando** - sem trocar de conta.

Enquanto está ligado, uma barra roxa no topo não deixa esquecer, com **Voltar a Administrador** sempre à vista. Em **Grupos de Utilizadores**, cada grupo tem também o seu *ver como*, para espreitar os grupos que criou.

!!! tip "Para que serve mesmo"
    Um formador só descobre que um formando não vê os valores, ou que lhe falta um módulo, **quando o formando o diz**. Isto mostra-o em dois cliques.

    É também a forma mais rápida de preparar uma aula sobre perfis de acesso: ligue o cadeado financeiro num grupo, entre no modo, e a turma vê a app encolher em direto.

!!! note "É só a vista"
    Não muda dados, não muda a sessão e não grava nada - apenas responde às perguntas de permissão como se fosse o outro grupo. **Recarregar a página sai do modo**, que é a rede de segurança mais simples que há para não ficar lá preso.

### Equipa & permissões
Dois cartões que respondem à pergunta *"e se eu tiver uma equipa?"*:

- **Utilizadores** - quem são, com que acesso e em que **departamento**.
- **Grupos de Utilizadores** - o que cada grupo vê e pode fazer.

Um utilizador **pertence sempre a um grupo** (o campo *Papel* não tem opção vazia), e dentro do grupo têm todos as mesmas permissões. Cada grupo escolhe os **módulos** que vê, se é **gestor**, e se tem o **financeiro oculto**.

!!! tip "O exercício que vale a pena"
    Criar um grupo *Comercial Júnior* com dois ou três módulos, criar uma pessoa nesse grupo, e **entrar como ela**. Vê-se o menu encolher. É a forma mais rápida de perceber o que é um perfil de acesso - e o que se sente do outro lado.

    Numa turma, o formador pode dar a permissão **Equipa & permissões** aos formandos, para cada um montar a equipa da sua empresa fictícia.

### Departamentos
O nível que faltava entre "a empresa" e "a pessoa".

| | Responde a |
|---|---|
| **Grupo** | o que se **pode fazer** |
| **Departamento** | **onde se trabalha** |

São coisas diferentes: duas pessoas podem ter exatamente as mesmas permissões e estar em equipas diferentes.

Escreve o nome e **+ Adicionar**, ou usa **Sugerir os habituais** (Comercial, Marketing, Suporte). Remover um departamento **não mexe** em quem já o tinha - a app diz quantos são antes de remover.

Depois disso, o filtro de responsável em **Empresas** e **Propostas** ganha **"Toda a equipa X"** - é o que um chefe de equipa quer ver: o pipeline da equipa, e não o de cada um a seu tempo.

### Valores ocultos (o 🔒)
Um grupo pode ter o **financeiro oculto**: em vez dos valores aparece 🔒 (e nas Empresas a coluna do valor desaparece). Num CRM a sério isto existe mesmo - um comercial júnior não vê a receita da empresa toda.

!!! warning "Vem desligado, e foi de propósito"
    Até agosto de 2026 o papel **Formando** nascia com o cadeado. Contando os cadeados por módulo: Analytics **17**, Propostas 13, Dashboard 12, Decisão 12, Retenção 12.

    O mais grave não era o Kanban - era o **Analytics**, que ficava ilegível: ticket médio, receita por mês, top de empresas, LTV/CAC, tudo tapado. E a sandbox é a **empresa fictícia do próprio formando**: esconder-lhe os números do negócio que ele está a construir tirava-lhe justamente os cálculos que a formação quer ensinar - IVA regional, desconto de loyalty, TCV.

    A funcionalidade **fica**: ligue-a num grupo quando quiser demonstrá-la. Dá bom material de aula - peça a alguém para trabalhar dez minutos com o cadeado ligado.

### Metas de vendas
Objetivo de **receita ganha** no mês. Dois níveis:

- **Meta da equipa** (€/mês) - o total a atingir. `0` = sem meta.
- **Metas individuais (quotas)** - uma por pessoa, contadas sobre as propostas **ganhas** de que cada um é **[responsável](empresas-contactos.md#responsavel)**. Numa turma, a lista é a turma.

O resultado aparece no cartão **Meta do mês** do **[Dashboard](dashboard-agenda.md)**, com barra, percentagem e a projeção ao ritmo atual.

!!! tip "Porque é que uma meta muda tudo"
    Sem meta, *"12 400 €"* é só um número - não diz se o mês está a correr bem ou mal. Com meta, o mesmo número passa a dizer **quanto falta** e **se dá tempo**. É o que os CRM chamam *goal tracking*, e é a diferença entre relatar e gerir.

### Segmentos
Lista editável da **dimensão da empresa** (Micro / PME / Grande Empresa, de origem). Alimenta o campo **Segmento (dimensão)** da ficha da empresa, o **alvo das campanhas**, a **condição das automações** e o gráfico de **Segmentação**.

Escreve o nome e **+ Adicionar**; o **✕** remove. Remover **não altera** as empresas que já o têm - deixa apenas de estar disponível para escolher.

!!! warning "Segmento não é nível de fidelização"
    São **dois conceitos diferentes** e, até agosto de 2026, partilhavam o mesmo campo - por isso a lista de alvo das campanhas misturava *Micro/PME/Grande Empresa* com *Bronze/Prata/Ouro*. Agora estão separados: o **segmento** é a **dimensão** da empresa (não muda sozinho); o **nível** é calculado do **volume ganho**. Campanhas e automações têm os **dois filtros em separado** e podem cruzá-los ("PME **e** Bronze"), o que antes era impossível. A app recusa criar um segmento com o nome de um nível, para não voltar a baralhar.

### Outras referências
**Níveis de loyalty**, **Taxas de IVA** (por região), **Origens de cliente** (lista editável - se lá deixares *Outro*, a app pede sempre para [dizer qual](empresas-contactos.md#outro-pede-sempre-o-que)) e **[Campos personalizados do contacto](empresas-contactos.md#campos-personalizados)** - campos que crias tu e que ficam disponíveis como tag nos modelos.

## Em modo turma (online)

Numa turma, as Definições ganham dois cartões centrais:

- **Formandos da turma** - gestão de acessos (importar, individual, repor palavra-passe). → [Gerir a turma](../formador/gerir-turma/index.md).
- **Entrega & validação de trabalhos** - receber e avaliar entregas. → [Entrega & validação](../formador/entregas.md).

!!! note "Quem vê as Definições"
    Os **formandos não acedem** às Definições. É um espaço de **formador/administrador**.
