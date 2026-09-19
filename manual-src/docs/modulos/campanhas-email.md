# Campanhas & Email

<figure class="crm-video" data-video="campanhas" data-poster="/manual/assets/screens/campanhas.png"></figure>

*Planeamento de campanhas e comunicação por email.*

Dois menus: **Campanhas** (planeamento de marketing) e **Email/Comunicação** (envio e acompanhamento).

---

## Campanhas

### O ecrã
Filtro temporal + lista de campanhas (nome, canal, segmento, estado, métricas) + **+ Campanha** e **✨ Gerar de persona**.

### Criar - campo a campo
- **Nome**, **Canal** (Email / SMS / Redes Sociais).
- **Segmento**-alvo (Todos / Micro / PME / Grande Empresa).
- **Estado** (Planeada / Ativa…), **Início** e **Fim**.
- **Template** de email associado.

### Gerador por persona (✨)
1. Clica **Gerar de persona**.
2. Escolhe uma **persona** (ex.: Zé Miguel - hoteleiro; Sofia - diretora comercial; António - comerciante).
3. Define **Objetivo** (Aquisição/Fidelização/Reativação/Lançamento) e **Canal**.
4. A app mostra a **audiência estimada** no segmento e uma **mensagem sugerida** → **Gerar**.

### Enviar
**Enviar** dispara para os contactos do segmento e regista os envios no **Histórico** (com origem "Campanha").

#### Quem recebe, e quem fica de fora

Antes de sair alguma coisa, a app mostra a **audiência**.

| Fica de fora | Porquê |
|---|---|
| **Sem consentimento ativo** | marketing direto por email precisa de **base legal** - art. 6.º/1 a) do RGPD e art. 13.º-A da Lei 41/2004 |
| **Sem email** | não há por onde |

A linha da campanha diz para quantos vai e quantos ficam de fora; o botão **Enviar** abre a lista **com os nomes**, email e telefone, antes de confirmar.

!!! tip "É aqui que a lição entra"
    A app **recusa-se** a enviar a quem não deu consentimento. Não avisa e envia à mesma - não envia.

    Vale mais do que um slide sobre o artigo 6.º: quem quiser que a campanha chegue a toda a gente tem de ir a **RGPD → Consentimentos** registar a base legal, que é exatamente o que teria de fazer na vida real.


---

## Email / Comunicação

### Separadores
- **Histórico de envios** - tabela rica; clica num envio para ver a pré-visualização e reenviar.
- **Templates** - modelos de email.
- **Automações** - regras automáticas.
- **Agendados** - fila de envios futuros.

### Compositor (módulo Email)
- **Cliente** - por **pesquisa** (não dropdown gigante).
- **Template** - pré-preenche assunto + mensagem.
- **CC / BCC**, **Assunto**, **Mensagem** (textarea).
- **Pré-visualização ao vivo** + **chip de modo** (real/simulado).
- **Sugerir com IA** *(simulado)* - gera um rascunho personalizado.
- A **assinatura** do utilizador entra automaticamente no fim.

### Templates de email - campo a campo
Nome, assunto, cor, mostrar logótipo, saudação, corpo, texto/​link do botão, assinatura. Usa **tags** (`{{cliente.nome}}`, `{{entidade.nome}}`).

### Automações (marketing automation)
Regras **gatilho → sequência de ações**:

- **Gatilhos de ciclo de vida:** novo cliente / proposta criada / proposta enviada / proposta ganha.
- **Gatilhos comportamentais** (*nurturing*): o lead fica **"quente"** (score ≥ 70) / **abre** um email / **clica** num email / está **sem contacto há N dias**. Reagem ao comportamento do lead, não só a eventos internos.
- **Gatilhos de fidelização:** a conta **sobe** ou **desce de nível** (Bronze → Prata → Ouro). Podes restringir a um nível concreto ("só quando chega a Ouro").
- **Condições** (todas têm de bater): por **segmento**, por **fase** (Lead/MQL/SQL/…) e por **score** (Frio/Morno/Quente). No gatilho *sem contacto* defines os **dias**.
- **Passos** em sequência, cada um com **atraso (dias)** → vão para **Agendados**.
- **Parar a sequência quando…** - critério de saída (ver abaixo).
- Toggle **Ativa/Inativa** + contador de disparos.

#### O nível de fidelização muda sozinho
O nível **não se atribui à mão**: é calculado a partir do **volume ganho da empresa** (Definições → Níveis de fidelização). Quando uma proposta é ganha, o volume sobe e a conta pode mudar de patamar - e é essa mudança que dispara a automação. É por isso que este gatilho é dos mais realistas: reage a negócio a sério, não a um clique de alguém.

!!! note "Não dispara em massa"
    Na primeira vez que a app calcula os níveis, apenas os **regista**, sem disparar nada. Só mudanças posteriores contam como "subiu" ou "desceu" - senão, ao abrir a app, toda a base de clientes receberia email de uma vez.

#### Ações: nem tudo é email
Cada passo escolhe **o que faz**:

| Ação | O que acontece |
|---|---|
| **Enviar email** | Envia o template escolhido (o comportamento clássico). |
| **Mudar a fase da conta** | Move a empresa no funil (Lead → MQL → SQL → Cliente). |
| **Criar tarefa na Agenda** | Cria uma tarefa atribuída ao contacto, com a data do atraso. |
| **Registar nota no contacto** | Escreve uma nota datada na ficha. |

!!! warning "A fase só avança"
    A ação de fase **nunca recua** nem tira uma conta de "Perdido" - segue a mesma regra do resto da app. Uma automação não pode despromover um cliente por ele ter clicado num email.

#### Critério de saída
**Parar a sequência quando…** o lead **clica num email** ou uma **proposta é ganha**. Quando isso acontece, os passos **ainda por enviar** dessa automação são cancelados - só os dela, as outras automações continuam.

É a diferença entre automação e insistência cega: quem já reagiu não deve continuar a receber a sequência de quem não reagiu.

#### Registo de execução
No separador **Jornadas**, por baixo dos percursos, o **Registo de execução** mostra **o que cada automação fez, a quem e quando**. Serve para responder à pergunta mais incómoda de um cliente - *"porque é que recebi este email?"* - com um facto em vez de um palpite.

!!! tip "Ver os gatilhos comportamentais a disparar"
    No **Histórico de envios**, abre um email e usa **Simular abertura** ou **Simular clique**: o lead é marcado como aberto/clicado e a automação correspondente **dispara à tua frente** (o *email quente* também reavalia o score). Ideal para demonstrar o *nurturing* sem esperar por comportamento real.

<figure class="crm-video" data-video="automacao-comportamental" data-poster="/manual/assets/screens/campanhas.png"></figure>

*Criar uma automação comportamental (gatilho "email aberto" + condições de fase e score) e vê-la disparar com "Simular abertura".*

### Jornadas do cliente
O separador **Jornadas** mostra cada automação como um **percurso visual**: `Início (evento) → Esperar N dias → Email → Tarefa → Sai se…`. É a mesma automação, vista como o caminho que o lead percorre ao longo do tempo (*nurturing*). Cada tipo de ação tem a sua cor, e o critério de saída aparece no fim do percurso. Clica **Editar jornada** para alterar os passos.

<figure class="crm-video" data-video="jornadas" data-poster="/manual/assets/screens/jornadas.png"></figure>

*Jornadas do cliente e formulário de captação web-to-lead.*

## Formulário de captação (web-to-lead)

No fundo do ecrã **Campanhas** há um **formulário de captação**. Simula um formulário de site (landing page): ao **submeter**, os dados entram no CRM como:

- um **contacto** novo, com **origem "Formulário"**;
- a respetiva **empresa** (se indicada), criada em **fase Lead**;
- disparo das automações de **novo cliente**.

Assim demonstra-se o **web-to-lead**: como um lead que preenche um formulário online chega automaticamente ao funil. A origem "Formulário" aparece depois no **funil de aquisição** e no **ROI por origem** (Analytics).

### O código para o seu site

O formulário aqui ao lado **simula** a captação. Para o pôr num site a sério, o botão **Ver o código para o meu site** gera o HTML pronto a colar.

O que vem no código, e porquê:

- os **campos** que o CRM espera, com a origem `Formulário` já preenchida;
- a caixa de **consentimento obrigatória e por marcar** - o art. 7.º do RGPD não aceita caixas pré-marcadas;
- a **data** em que foi aceite: sem ela, o consentimento não se prova;
- uma **armadilha anti-spam** (*honeypot*): um campo invisível para pessoas, que os robots preenchem.

!!! warning "O endpoint fica por preencher, de propósito"
    `O_SEU_ENDPOINT` é o endereço que recebe os dados, e tem de ser escrito por quem monta o site.

    Isto **não** é uma peça em falta - é a lição. Um formulário de site **nunca fala diretamente com a base de dados**: se falasse, qualquer pessoa podia escrever na sua base a partir do browser. Entre os dois há sempre um servidor que valida tudo outra vez.

### Quando alguém subscreve

Aparece um alerta no **sino**: *"Nova subscrição por atender"*. Fica lá **até haver seguimento** - não até ser lido.

- Abrir a ficha **não** o apaga: ver não é atender.
- Sai quando houver um **email enviado por uma pessoa**, uma **tarefa** marcada, ou a conta avançar de Lead.
- O email de boas-vindas que a **automação** dispara não conta - seria a máquina a responder à máquina.

### Métricas
Taxa de **abertura** e **cliques** por envio e agregadas.

!!! warning "Envio real vs simulado · rastreio"
    Os **formandos** enviam sempre em **simulado** (seguro). As métricas de abertura/clique no ambiente pedagógico são **simuladas** - a app explica que o rastreio real exige pixel + servidor.

## Relacionado

<div class="grid cards" markdown>

-   <svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1A4 4 0 0 1 16 11M21 21v-2a4 4 0 0 0-3-3.8"/></svg> __Contactos__

    ---
    A base de clientes que vais segmentar nas campanhas.

    [:octicons-arrow-right-24: Abrir](empresas-contactos.md)

-   <svg class="icon" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg> __Analytics__

    ---
    Mede o impacto das campanhas (aberturas, cliques, conversão).

    [:octicons-arrow-right-24: Abrir](analytics.md)

</div>
