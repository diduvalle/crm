# Importar formandos (Excel/CSV)

<figure class="crm-video" data-video="importar" data-poster="/manual/assets/screens/importar.png"></figure>

*Importar formandos com pré-visualização e validação.*

A via mais rápida para uma turma inteira.

## Passo a passo

1. **Definições → Formandos da turma → Modelo Excel/CSV** e abre o ficheiro.
2. Preenche **uma linha por formando**. Colunas **obrigatórias**:

    | Coluna | Obrigatória | Notas |
    |---|---|---|
    | `nome` | ✅ | Primeiro nome |
    | `apelido` | ✅ | |
    | `email` | ✅ | Email **IEFP** do formando (o principal; gera o utilizador e a palavra-passe) |
    | `email_pessoal` | - | Email pessoal (opcional) - o **convite vai para os dois** |
    | `username` | - | O login. **Deixa vazio** e a app gera-o: **1.ª letra do nome + apelido**, em minúsculas e sem acentos (Diogo Vale → `dvale`). O Modelo já traz a fórmula que o preenche sozinho. Se dois derem o mesmo, a app desambigua (`jferreira`, `jferreira2`) |
    | `password` | - | Pode ficar vazia → usa a *palavra-passe inicial* |
    | `papel` | - | `Formando` (predefinido) ou `Formador` |

3. **Importar lista** → escolhe o ficheiro.
4. Aparece a **pré-visualização**: cada linha **OK** (verde) ou com o **erro** (campo em falta, email inválido, utilizador repetido, já existente).
5. **Importar N válido(s)** - só entram as linhas corretas.

!!! info "Os convites **não** são enviados na importação"
    Importar **cria as contas**, mas **não envia** nenhum email. Ficas com a turma carregada e decides depois quando enviar: na lista, cada formando mostra o estado do **Convite** (*Por enviar* / *Enviado em…*), e no topo aparece **"Enviar N convite(s)"** para os mandar **todos de uma vez**. Também podes enviar **um a um** com o botão **Enviar convite** de cada linha.

!!! warning "Palavras-passe no Excel"
    Para não pôr palavras-passe no ficheiro, **deixa a coluna vazia** e define a *palavra-passe inicial* (campo por baixo dos botões) - igual para todos. Cada formando muda-a depois.

!!! tip "Os erros não bloqueiam"
    As linhas com erro **não são importadas**; corriges o ficheiro e voltas a importar só essas. As válidas já ficaram criadas.

➡️ A seguir: **[Adicionar individual](adicionar.md)** · voltar a **[Gerir a turma](index.md)**.
