# Criar a proposta

<figure class="crm-video" data-video="criar-proposta" data-poster="/manual/assets/screens/criar-proposta.png"></figure>

*Criar uma proposta, do cliente aos totais.*

Clica **+ Proposta** (ou num cartão existente para editar). O modal abre com o cabeçalho da proposta, **sem empresa nem contacto escolhidos** - a escolha é sempre tua.

!!! note "Trocar de empresa arrasta o contacto"
    Se mudares a empresa a meio, o contacto acompanha: com **uma** pessoa nessa empresa, é escolhida automaticamente; com **várias**, o campo fica **em branco** e a app avisa quantas há; com **nenhuma**, avisa para criares um contacto. Com várias pessoas **não se escolhe em silêncio** - seria a forma mais fácil de mandar a proposta à pessoa errada.

## Campo a campo

| Campo | Notas |
|---|---|
| **Número** | Automático (`PROP-{ano}-{nº}`), só leitura - reinicia a cada ano. |
| **Empresa (cliente da venda)** | A **empresa** a quem se vende - é a **âncora da venda**. O valor, o loyalty e o desconto vivem aqui. Pesquisa por nome ou NIPC. *(Uma venda a um particular fica sem empresa.)* |
| **Contacto (com quem se negoceia)** | A pessoa da empresa com quem se fala. A lista mostra **só quem trabalha na empresa escolhida**. Escolher primeiro o contacto **auto-preenche a empresa**. É informativo: se a pessoa **mudar de empresa**, a venda **não vai com ela** - fica na empresa. |
| **Meses de fidelização** | Duração do compromisso **SaaS recorrente**; entra no cálculo do valor total do contrato (TCV). |
| **Título** | Nome da proposta (ex.: *Licenciamento CRM*). |
| **Validade** | Data até à qual a proposta é válida. |
| **Estado** | **Criada / Enviada / Negociação / Ganha / Perdida.** Fica no **fim** do formulário e **nasce vazio** - ao Guardar, a app avisa se ficou por escolher. Ao passar a *Perdida* regista-se o **[motivo da perda](perda.md)**; a *Ganha*, o **[motivo do ganho](ganho.md)**. |

!!! note "Porque é que o Estado está no fim, e vazio"
    Estava em cima e com *Criada* por omissão. Duas consequências: quem sabia que a venda já estava fechada não conseguia pôr *Ganha* logo (ao escolher um estado terminal, o formulário **bloqueia** - título, empresa, contacto e linhas ficam só de leitura), e quem não sabia deixava ficar o valor por omissão sem pensar nele.

    Agora o estado é a **última decisão**, depois de a proposta estar escrita, e é **uma decisão** - não um valor que já lá estava. A sugestão veio de um formando.

O **IVA** usa a **região da empresa** e o **desconto** vem do **nível de loyalty da empresa** (ou do contacto, se for particular) - ver [Empresas & Contactos](../empresas-contactos.md).

## Passo a passo

1. **Propostas → + Proposta**.
2. Escolhe a **Empresa** (âncora da venda) e o **Contacto** com quem negoceias.
3. Define os **meses de fidelização** (SaaS), o **título** e a **validade**.
4. Adiciona as **[linhas do catálogo](linhas.md)** (cada uma é Único/pontual ou Mensal/Anual/recorrente).
5. **Guardar**.

## Nível de interesse do cliente

Cada proposta tem um campo **Nível de interesse** - o quão interessado o cliente está *neste* negócio, segundo o feedback dele:

| Nível | Cor |
|---|---|
| Por classificar | cinza (neutro) |
| Frio | azul |
| Morno | laranja |
| Quente | vermelho |

No **[Pipeline](pipeline.md)**, as propostas em jogo (Enviada / Negociação) deixam de ser brancas e ficam **tingidas** com a cor do nível (barra à esquerda + fundo subtil), para veres o "calor" de cada negócio de relance. Além disso, a coluna **Ganha** ganha um tom **verde** e a **Perdida** um tom **vermelho** (com o total a vermelho), para os estados terminais se lerem de imediato.

!!! tip "Auditoria"
    A proposta guarda **quem criou/alterou e quando** - visível no rodapé do modal.

➡️ A seguir: **[Linhas & catálogo](linhas.md)** · voltar a **[Propostas](index.md)**.
