# Badges: como se fazem

Os 14 badges que já estão em `crm.cr0x.org/b/` foram feitos numa sessão de
agosto e **o script nunca ficou no repositório**. Quando foi preciso outra
turma, ninguém sabia como se fazia. Isto existe para isso não voltar a
acontecer.

## O fluxo, do princípio ao fim

**1. Gerar as páginas** (uma vez por turma)

```
node ferramentas/gerar-badges.mjs \
  --mes "setembro de 2026" \
  --contexto "Turma 12345678 · IEFP" \
  --nomes "Ana Silva" "Bruno Costa"
```

Cria `b/<codigo>/` para cada pessoa, com:

| ficheiro | o que é |
|---|---|
| `index.html` | a página de verificação, com o nome, a data e a credencial Open Badges v3 |
| `selo.png` | 1200×630, **igual para toda a gente** - é o que aparece ao partilhar o link |
| `selo-quadrado.png` | 1080×1080, **com o nome** - é a imagem para publicar nas redes |

No fim imprime os pares `nome → endereço`. Guarda isso.

**2. Publicar**: `git add b/`, commit, push. São ficheiros estáticos no
GitHub Pages - é por isso que este passo não pode ser feito pela app.

**3. Atribuir e enviar**: no Repo, ecrã **Badges** da turma, cola o código de
cada formando e envia. **Gerar não é enviar** - quem recebe decide-se lá, um
a um, e é lá que se vê quem abriu.

## Precisa de Playwright

A imagem quadrada é desenhada num browser e fotografada. O `auditar.mjs`
precisa do mesmo e ninguém tinha escrito isto:

```
npm install playwright
npx playwright install chromium
```

Se já tiveres o Chromium do Playwright noutro sítio, dá para apontar:
`CHROME=/caminho/para/chrome-headless-shell node ferramentas/gerar-badges.mjs ...`

## Os moldes

- `modelo.html` - a página, com `{{NOME}}`, `{{CODIGO}}`, `{{MES}}`,
  `{{DATA_ISO}}`, `{{CONTEXTO}}` e `{{SLUG}}`.
- `quadrado.html` - a página 1080×1080 que vira imagem.
- `selo.png` - o carimbo genérico, tal como está publicado.

**Os moldes foram extraídos de um badge real já publicado**, não escritos de
memória. Foi assim que se garantiu que os novos saem iguais aos antigos: o
teste foi regenerar o badge `7cp55GGy` e a página saiu **idêntica** à que
está no ar, byte a byte, trocando só o código.

Se mexeres no desenho, repete esse teste antes de gerar uma turma.

## O que isto NÃO decide

Nada aqui diz **quem merece** um badge. Não há ligação entre a submissão do
trabalho, a avaliação e o badge: a lista de nomes és tu que a dás. Se um dia
quiseres que saia da avaliação das entregas, é outra conversa.
