# Entrega & validação de trabalhos

Quando um formando submete o trabalho, ele aparece-te em **Definições → Entrega & validação de trabalhos**. Não precisas de receber ficheiros por email - chega tudo aqui automaticamente.

## Ver as entregas

A lista mostra as entregas da turma: **formando**, **data** e **mensagem**. Cada formando pode entregar até **2 vezes**.

- **Atualizar** - recarrega a lista.
- **Carregar .json** - opcional, para validar um ficheiro de trabalho que tenhas recebido por fora.

## Rever um trabalho

Clica em **Rever** numa entrega. Abre uma janela **só de leitura** (não mexe nos teus dados) com:

- **KPIs** - nº de empresas, clientes, propostas, campanhas.
- **Tabela de clientes** que o formando criou.
- **Tabela de propostas** - e, em cada uma, um botão **PDF** que **regenera o documento** a partir do trabalho entregue (com o modelo que o formando desenhou).
- **Descarregar trabalho completo (.json)**.

!!! note "O PDF é fiel ao trabalho"
    O formando não anexa um PDF: a app **reconstrói** a proposta a partir dos dados submetidos (incluindo o modelo de proposta que ele criou). Está sempre coerente com a entrega.

## Limite de entregas

O limite arranca em **2 entregas por formando** e é contado **no servidor** - o formando não o contorna mexendo no browser.

**Para o alterar**, em **Definições → Formandos da turma**:

- **Um formando** - clica no selo **X/Y** da linha dele e escreve o novo número. Fica marcado com **\*** na lista, a assinalar que tem limite próprio.
- **A turma toda** - botão **Limite da turma**, por baixo da tabela. Não mexe em quem tem limite próprio.
- Deixar o campo **vazio** devolve essa pessoa ao valor da turma.

!!! note "Não se pode baixar abaixo do que já foi entregue"
    Se alguém já fez 3 entregas, o limite não desce para 2 - as entregas feitas não se desfazem e a lista passaria a mostrar *3/2*. A app recusa, no browser **e** no servidor.

!!! warning "Cada entrega gasta um email"
    A submissão em si vai para a base de dados, mas dispara um **aviso por email** ao formador. Subir o limite de 2 para 4 numa turma de 13 significa **até mais 26 emails** no plano - ver **Consumo do plano** em [Definições](../modulos/definicoes.md#envio-de-email-real-emailjs-admin).
