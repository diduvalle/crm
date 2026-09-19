# Email & Marca

Dois cartões em **Definições**, só para administradores.

## Envio de email real (EmailJS)

A plataforma pode enviar emails **a sério** (propostas, avisos de entrega) ou em **modo simulado** (regista mas não envia).

- As **chaves** (Service ID, Template ID, Public Key) são **fixas** - aparecem bloqueadas (🔒) para ninguém as alterar e partir o envio.
- A única coisa que geres é o **modo**: liga/desliga **“Ativar envio real”** e clica **Guardar configuração**.
- **Enviar teste** envia um email real para confirmares.

!!! info "Identidade dos emails"
    Os emails saem com o nome **IEFP CRM** e as respostas vão para o email da entidade. O endereço visível do remetente é o configurado na conta de email da plataforma.

## Marca & Aparência (white-label)

Permite replicar o CRM para outra entidade:

- **Nome**, **cor principal** (deriva automaticamente toda a paleta), **logótipo** e **fundo do login**.
- **Aplicar marca** recolore a app ao vivo; **Repor IEFP** volta ao verde original.
- A marca **viaja no Export JSON** - replicas o ambiente noutra utilização só com import + trocar nome/cor/logo.
