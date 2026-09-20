# Email & Marca

Dois cartões em **Definições**, só para administradores.

## Envio de email real (EmailJS)

A plataforma pode enviar emails **a sério** (propostas, avisos de entrega) ou em **modo simulado** (regista mas não envia).

- As **chaves** (Service ID, Template ID, Public Key) são **fixas** - aparecem bloqueadas (🔒) para ninguém as alterar e partir o envio.
- A única coisa que geres é o **modo**: liga/desliga **“Ativar envio real”** e clica **Guardar configuração**.
- **Enviar teste** envia um email real para confirmares.

!!! info "Quem aparece como remetente depende do email"
    São dois casos, e vale a pena não os confundir:

    - Os **emails que o CRM envia a clientes** (propostas, campanhas) saem com o **nome da entidade** que está em *Definições → Entidade*, e as respostas vão para o **email dessa entidade**. Numa turma, isso é a **empresa fictícia de quem está a trabalhar** - é o que se pretende, porque o exercício é ele estar a vender em nome dela.
    - Os **avisos da própria plataforma** (convite, reposição de palavra-passe, aviso de entrega) saem com o **nome da escola**.

    O endereço visível do remetente é sempre o da conta de email da plataforma, que não muda. Por isso um cliente pode ver *"remetente externo"*: o nome é o da entidade, o endereço é o do serviço de envio.

## Marca & Aparência

Define o **nome**, a **cor principal** (que deriva a paleta toda), o **logótipo** e o **fundo do ecrã de entrada**.

!!! warning "Numa escola, a marca não é tua"
    Se estás num espaço de escola (`crm.cr0x.org/escola`), o **nome**, o **logótipo** e a **cor** vêm da configuração dessa escola e **ganham ao que puseres aqui**. O campo da cor diz-te de onde ela vem - *"definida em \<escola\>"*.

    O que continua a ser teu é o **fundo do ecrã de entrada**, e o botão que o **repõe** ao da plataforma.

    Isto é de propósito: a marca de uma escola tem de ser igual em todas as turmas dela, e não pode depender de cada formador se lembrar de a repetir.

- **Repor predefinição** volta à identidade da plataforma - **azul**, sem logótipo próprio. Se estiveres num espaço de escola, a marca da escola volta a impor-se logo a seguir.
- A marca **viaja no Export JSON** - útil para levar um ambiente de um lado para o outro.

!!! note "Fora de uma escola"
    Aberta em `crm.cr0x.org` sem espaço, a app usa a marca neutra da plataforma e aí sim estes campos mandam. É o caso de quem experimenta a plataforma sem estar ligado a nenhuma instituição.
