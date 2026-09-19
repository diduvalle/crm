# Pulso

A bolha verde no canto inferior direito, presente em **todos os módulos**. Escreve uma pergunta sobre os teus dados e ele responde com o número - e com o botão que abre a vista real.

## Porque é que se chama Pulso

De **"tomar o pulso ao negócio"** - um número rápido sobre como as coisas estão, sem opinião nenhuma pelo meio.

É um nome de **ferramenta**, não de pessoa, e isso é de propósito. Quase todos os chatbots se chamam Íris, Sofia ou Nova: querem que se fale com eles como se fosse alguém. Aqui o objetivo é o contrário - um nome humano desfazia em três letras o que a mensagem de abertura constrói.

## A primeira coisa que ele diz

> **Não sou inteligência artificial.** O Pulso responde com regras fixas aos dados desta sandbox. Não altera nada.

Isto não é modéstia nem um aviso legal escondido no rodapé: é a **primeira mensagem** que aparece, antes de qualquer pergunta. E se lhe perguntares diretamente *"és uma IA?"* - ou *"chamas-te Pulso porquê?"* - ele tem resposta própria:

> Sou um conjunto de regras fixas: reconheço algumas frases e vou buscar o número aos teus dados. Não aprendo, não invento e não escrevo nada que não esteja aqui.
>
> Se fosse IA, o **artigo 50.º do AI Act** obrigaria à mesma declaração - a diferença é que aí eu poderia enganar-me com confiança.

!!! info "Porque é que isto está aqui"
    O **artigo 50.º** do Regulamento (UE) 2024/1689 (*AI Act*) obriga a que quem interage com um sistema de IA **saiba que está a falar com uma máquina**. Um chatbot de reservas num site é o exemplo clássico de **risco limitado**: não está proibido nem exige avaliação de conformidade - basta a **transparência**.

    O Pulso **não é** um sistema de IA, e por isso o artigo 50.º nem se lhe aplica. Declara-o na mesma, por duas razões: porque um assistente que se deixasse confundir com IA ensinaria exatamente o contrário do que a UFCD diz, e porque é mais fácil perceber a obrigação a vê-la cumprida do que a lê-la num diploma.

## Três coisas, não duas

| | Exemplo | O que devolve |
|---|---|---|
| **Números** | *"quantas propostas tenho em aberto"* | o valor, a lista, e o botão que abre a vista |
| **Como se faz** | *"como crio uma proposta"* | os passos, o botão do módulo e o botão que abre **a página certa do manual** |
| **O que é** | *"o que é o MRR"* | a definição, em duas linhas |

Cada tipo traz o seu selo, para não haver dúvida sobre o que se está a ler.

### Números e como se faz

| | Exemplo | O que devolve |
|---|---|---|
| **Números** | *"quantas propostas tenho em aberto"* | o valor, a lista, e o botão que abre a vista |
| **Como se faz** | *"como crio uma proposta"* | os passos em duas linhas, o botão do módulo e o botão que abre **a página certa do manual** |

As respostas de instruções trazem o selo **Como se faz**, para não haver dúvida sobre o que se está a ler.

!!! tip "Porque é que isto existe"
    O manual tem 96 páginas. Quem está a meio de uma proposta não vai procurar num índice - vai perguntar ao formador. O Pulso responde ali, e o botão leva à página certa em vez de à porta do manual.

    As respostas são **escritas à mão**, como tudo o resto: o Pulso não resume o manual nem o lê. **Aponta** para ele.

### Como se faz - o que está coberto

Vinte e duas perguntas, ao longo do percurso todo:

- **Registos** - criar empresa, contacto, produto
- **Propostas** - criar, pôr linhas do catálogo, exportar PDF, enviar (proposta online), mudar o estado no Kanban
- **Modelos** - construtor da proposta, modelos de email e as tags
- **Marketing** - campanhas e automações
- **RGPD** - registar consentimento, responder a um pedido de titular
- **Dados** - importar CSV, gerador de exemplos, fundir duplicados, campos personalizados
- **Definições** - marca e aparência, metas de vendas
- **Formando** - submeter o trabalho, recuperar a palavra-passe

Se escrever *"como…"* e ele não reconhecer, manda-o na mesma ao **manual** em vez de encolher os ombros. Já uma pergunta fora do âmbito - *"qual a capital da Austrália"* - continua a dar só *"não sei"*: o manual não serve de desculpa.

!!! note "Escreva à vontade"
    Não é preciso acertar no verbo. *"como crio"*, *"como se cria"*, *"como faço"* e *"criar"* dão todos a mesma resposta - a correspondência corta a terminação dos verbos dos dois lados.

---

### O glossário

São **32 termos** - MRR, ARR, TCV, churn, CAC, LTV, RFM, SLA, NPS, CSAT, MQL, SQL, RoPA, DSAR, base legal, minimização, lead score, loyalty, persona, nurturing... - mais três comparações que se confundem sempre:

- **segmento vs nível de loyalty**
- **empresa vs contacto**
- **NPS vs CSAT**

Escreva o termo com *"o que é"*, *"o que significa"* ou *"explica"*.

!!! tip "Porque é que isto vale mais do que o glossário do manual"
    Não substitui o [Glossário](../glossario.md) - responde **sem interromper**. Estas perguntas fazem-se a meio de uma tarefa, e sair para procurar é o que faz desistir.

    As definições são escritas para **ficar**, não para estar corretas: o MRR de um contrato de 40 €/mês vale *40 €, não 480*; um churn de 5%/mês *perde metade da base num ano*; violar um SLA *não é um atraso, é uma promessa quebrada*.

!!! note "O termo sozinho dá o número, não a definição"
    Escrever **`pipeline`** dá-lhe o **valor** do seu pipeline. Escrever **`o que é o pipeline`** dá-lhe a definição.

    É deliberado: no meio do trabalho, quem escreve o nome de uma coisa quer o número dela. Os termos que não competem com nenhuma pergunta de dados - *MRR*, *CAC*, *SLA* - respondem à mesma escritos sozinhos.

---

## Quando não sabe: sugerir, não recuar

Se a pergunta não for reconhecida, o Pulso mostra as **perguntas mais próximas** do que escreveu, clicáveis:

> Não sei responder a isso - só reconheço as frases para que fui programado.
> **Quis dizer alguma destas?**
> `O que é o MRR?`

Chama-se ***fall-forward***, e é a recomendação unânime da literatura de design de assistentes: um *"não sei"* seco deixa a pessoa no mesmo sítio onde estava; mostrar o mais próximo dá-lhe um caminho.

Depois de uma **definição**, aparece também *"A seguir:"* com os termos vizinhos.

### O limiar de confiança

O Pulso só responde quando a correspondência **explica a pergunta**, não quando apenas coincide com uma palavra dela.

!!! warning "O defeito que isto corrigiu"
    Antes não havia limiar nenhum: qualquer coincidência ganhava. A pergunta *"quero ver as propostas do mês passado da equipa comercial"* recebia uma resposta sobre **grupos de utilizadores** - porque a palavra *equipa* lá estava.

    Responder com confiança a partir de uma coincidência é o **único defeito que este assistente não pode ter**, porque é exatamente o que se lhe critica quando é IA a sério. Hoje mede-se a **cobertura**: quanto da pergunta é que a correspondência explica. *"Equipa"* numa frase de 57 caracteres explica 10% dela - não é uma resposta, é uma coincidência.

    Vale a pena mostrar isto à turma ao lado de um LLM: um responde *"não sei, quis dizer isto?"*; o outro inventa uma resposta plausível para a mesma pergunta.

---

## O que sabe responder

| Área | Exemplos de pergunta |
|---|---|
| **Propostas** | *"quantas propostas tenho em aberto"* · *"quanto vendi este mês"* · *"qual a taxa de conversão"* · *"que propostas estão a expirar"* |
| **Análise** | *"porque perdemos negócios"* · *"porque ganhamos"* |
| **Empresas** | *"quantas empresas tenho"* · *"que empresas ainda não têm proposta"* · *"quais são os melhores clientes"* |
| **Agenda** | *"o que tenho para hoje"* · *"tenho tarefas atrasadas"* |
| **Serviço** | *"como estão os casos de suporte"* · *"há casos fora de SLA"* |
| **RGPD** | *"há pedidos RGPD por responder"* |
| **Retenção** | *"há contratos em risco"* |

Debaixo da conversa há **sugestões clicáveis** - as perguntas que ele garantidamente reconhece, e as do **módulo onde estás** aparecem primeiro. Se estás a começar, é por aí.

!!! tip "Ctrl+K"
    Abre e fecha o Pulso de qualquer sítio. `Escape` também fecha.

!!! note "As sugestões arrumam-se sozinhas"
    Ficam **abertas ao iniciar a conversa** - que é quando ninguém sabe o que pode perguntar - e **fecham-se assim que fizeres a primeira pergunta**, porque a partir daí o espaço é da conversa.

    Voltam com um clique em **Sugestões**, que fica sempre visível. Na prática, a área da conversa passa de 212 px para 390 px depois da primeira pergunta.

### As tuas, não as de todos
Escrever **"as minhas"**, **"eu"** ou **"meu"** restringe a resposta ao teu utilizador:

- *"propostas em aberto"* → todas as da base.
- *"as minhas propostas em aberto"* → só aquelas de que és **[responsável](empresas-contactos.md#responsavel)**.

O mesmo vale para *"quanto vendi eu este mês"*, que compara com a tua **[quota individual](definicoes.md#metas-de-vendas)** em vez da meta da equipa.

## Perguntar por um cliente

Escreva o nome de uma empresa e ele devolve o resumo de trinta segundos - o que se quer saber **antes de ligar**:

> **Silva & Filhos, Lda. · E001.**
> ⚠ Antes de ligar: **1 caso(s) de suporte por fechar**.
> Fase Cliente · Ouro · lead score 87
> 1 proposta(s) ganha(s) · 8236,08 €
> 1 contacto(s): João Silva
> Último movimento: Email enviado · 24/08/2026

A linha de **aviso** só aparece quando há alguma coisa que estrague a chamada: casos de suporte por fechar, um pedido de cancelamento em curso, ou contactos sem consentimento ativo.

Funciona com o nome completo (*"como está a Silva & Filhos?"*) e com a primeira palavra (*"a Silva já pagou?"*).

!!! note "Duas salvaguardas que valem a discussão"
    A abreviatura só é aceite se a frase for **curta** e se **nenhuma outra empresa** começar pela mesma palavra. Havendo duas *Silva*, ele prefere não responder a responder sobre a errada.

    E *"como crio uma proposta para a Silva"* devolve o **como se faz**, não a ficha: quando há uma pergunta de instruções que bate exatamente, ela ganha ao nome.

    É o mesmo princípio de sempre: entre calar-se e acertar por sorte, cala-se.

---

## As três regras

=== "Nunca inventa"

    Se não reconhecer a pergunta, diz que não reconhece - e diz **porquê**: *"só reconheço as frases para que fui programado"*. Não tenta adivinhar, não devolve um número aproximado e não muda de assunto.

    Isto é de propósito. Um assistente que responde sempre alguma coisa é mais agradável e muito mais perigoso: um número errado apresentado com confiança entra nas decisões sem ninguém o questionar.

=== "Só consulta"

    Ele **não altera um único registo**. Não cria, não apaga, não muda estados. No máximo abre a vista certa - cada resposta acaba num botão (*Ver propostas*, *Ver agenda*) que te leva ao módulo com o filtro já aplicado.

    Por isso é um **atalho de navegação**, não uma verdade paralela: o número que ele diz e o número do ecrã vêm do mesmo sítio - e o texto que ele dá é o mesmo que está no manual.

    **A única coisa que escreve** é o registo das perguntas que não soube responder (ver acima) - e diz que o faz.

=== "Respeita as permissões"

    Só responde sobre módulos a que **tens acesso**. Se o teu grupo de utilizadores não vê o Helpdesk, perguntar pelos casos dá *"não sei responder"* - e a sugestão nem sequer aparece na lista.

## O que ele não soube responder

Sempre que o Pulso não reconhece uma pergunta, guarda-a. Vê-se em dois sítios:

- **Definições → Perguntas ao Pulso sem resposta** - o seu registo, com botão para **limpar**.
- **Na entrega**, para o formador: a ficha de avaliação mostra o que cada formando tentou perguntar sem sucesso.

!!! tip "Para o formador: é o sinal mais barato que a app dá"
    O que se **tenta** perguntar é o que não se percebeu. Se metade da turma escreve *"como faço um orçamento"*, o problema não está no Pulso - está em ninguém ter ligado **orçamento** a **proposta**. Isso é vocabulário a corrigir na aula seguinte, e não se descobre de outra maneira.

    É também a lista do que falta ao Pulso, escrita por quem o usa em vez de adivinhada por quem o programou.

!!! warning "Registar sem dizer seria o contrário do que esta app ensina"
    Por isso o Pulso **declara o registo** na mensagem de abertura, antes da primeira pergunta - incluindo que fica visível na entrega.

    Vale a pena parar aqui com a turma: é texto livre escrito por uma pessoa identificada, guardado e mostrado a terceiro. Não é um caso difícil de RGPD - é um caso **banal**, do género que passa despercebido todos os dias em produtos reais. A diferença entre estar certo e estar errado foi uma frase.

---

## O que o distingue do Dashboard

À primeira vista é redundante: *"quantas propostas em aberto"* já está no Dashboard. A diferença está nas perguntas que **não têm ecrã**:

- *"que empresas ainda não têm proposta"* - não existe em lado nenhum da app; é o cruzamento entre a lista de empresas e a lista de propostas.
- *"tenho tarefas atrasadas"* - a Agenda mostra o calendário, não a lista do que passou do prazo.

O Dashboard mostra os números que **alguém decidiu mostrar**. Um CRM tem sempre mais combinações úteis do que ecrãs para as arrumar.

!!! note "Pedagogia (UFCD 10868 · 10870)"
    Vale a pena usar este assistente como exercício em três tempos:

    1. **Fazer-lhe perguntas que ele não sabe responder.** É a forma mais rápida de perceber que um assistente só chega onde os **dados** chegam - e que a limitação está quase sempre no registo, não no motor.
    2. **Comparar com um chatbot a sério.** Um LLM responderia a *"qual a capital da Austrália"*; este não. Também inventaria um número de vendas se lhe faltasse o dado - e este não. Discutir qual dos dois comportamentos se quer num CRM.
    3. **Ligar ao AI Act.** Se este assistente fosse trocado por um com IA por trás, o que mudava? Passava a ser **risco limitado** (art. 50.º); teria de continuar a declarar-se; e a **[literacia em IA](../glossario.md)** (art. 4.º, em vigor desde fevereiro de 2025) obrigaria a que quem o opera percebesse os seus limites.

## Relacionado

<div class="grid cards" markdown>

-   <svg class="icon" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> __Dashboard & Agenda__

    ---
    Onde estão os números que ele vai buscar.

    [:octicons-arrow-right-24: Abrir](dashboard-agenda.md)

-   <svg class="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> __RGPD__

    ---
    O outro regulamento que a mesma conversa aciona.

    [:octicons-arrow-right-24: Abrir](../rgpd/index.md)

</div>
