# Marca CRM

Tudo aqui é gerado a partir do logótipo que está em **crm.cr0x.org** - o SVG embutido no cabeçalho do `index.html`, o mesmo que o badge usa - e do `estilo/tokens.css`.

> O `favicon.svg` **não** é a fonte. É um desenho antigo, com colunas mais largas e outra grelha, e foi o erro da primeira versão desta pasta. Não há nenhuma cor nem nenhuma forma desenhada de novo: se a marca mudar, muda lá e volta a gerar-se.

## As três cores

| | Hex | Onde |
|---|---|---|
| **Tinta** | `#171412` | o tom mais escuro da marca. Usa-se em vez de preto - um `#000000` ao lado do creme lê-se como um buraco |
| **Neutra** | `#2a2622` | a tinta do quadro. **É a cor da marca** - o logótipo é todo nesta, incluindo a terceira coluna |
| **Papel** | `#efe9dd` | o creme do fundo. Usa-se em vez de branco - um `#ffffff` sobre creme aparece como uma mancha mais clara |
| **Azul** | `#0078bf` | a cor de acção: botões, links, o traço da intro. **Não entra no logótipo** - a terceira coluna a azul existe só no badge. É a cor que uma escola substitui pela sua |

A marca não tem cor. O azul é o único que muda por escola, e muda à volta da marca, não dentro dela.

## Os ficheiros

```
logo/
  crm-marca.svg          A MARCA (proporção 102:63)
  crm-marca-tinta/papel  a mesma, a uma cor, para fundos claros ou escuros
  crm-marca-badge.svg    terceira coluna a azul - SÓ para o badge
  crm-marca-*-solida.svg a mesma, com o interior das colunas preenchido
  crm-simbolo-*.svg      a marca centrada em tela quadrada
  crm-app-*.svg          a caixa arredondada com a marca recortada
  png/                   o mesmo em PNG com transparência, 64 a 1024
icones/
  svg/                   os 49 ícones da interface, em currentColor
  png-tinta/             os mesmos a 256px, em tinta
  png-papel/             os mesmos a 256px, em papel
redes/
  linkedin-capa.html     a receita da capa da pagina do LinkedIn (1128x191)
  linkedin-capa.png      a capa, a 2x - e o que se carrega la
maquetes/                capturas reais das paginas, usadas no manual
manual-normas.html       O MANUAL DE NORMAS GRAFICAS (receita)
CRM-manual-de-normas-graficas.pdf   o mesmo, impresso
```

## O manual de normas graficas

`manual-normas.html` e a fonte; o PDF e uma impressao dele. Nao se edita o PDF.
As maquetes sao capturas reais - nada la dentro e uma simulacao desenhada a parte.

```
node ferramentas/imprimir-manual.mjs
```

**Em caso de divergencia entre o PDF e esta pasta, manda esta pasta.**

A capa das redes nao desenha a marca: puxa os SVG de `logo/`. Para a voltar a gerar depois de mexer na receita (ou na marca):

```
node ferramentas/render-capa.mjs marca/redes/linkedin-capa.html marca/redes/linkedin-capa.png
```

## Qual usar

- **Sobre papel ou branco** → `crm-marca`.
- **Sobre tinta ou qualquer fundo escuro** → `crm-marca-papel`.
- **Sobre cor forte ou fotografia** → as variantes `-solida`. As normais têm o interior das colunas vazio e o fundo entra por dentro; sobre papel isso é o que se quer, sobre uma fotografia a marca perde a forma.
- **Favicon, ícone de app, avatar de canal** → `crm-app-*`, que já traz a caixa arredondada.
- **Uma cor só, gravação ou bordado** → `crm-marca-tinta` ou `crm-marca-papel`, que são monocromáticas de raiz.

## A abertura e o fecho dos vídeos

`intro/intro.html` e `intro/outro.html`, com o webm 1080p gravado ao lado de cada um.

- **A abertura** monta a marca coluna a coluna, a terceira fecha, e o nome entra.
- **O fecho** tem uma ideia só: as três colunas juntam-se numa, a coluna tomba e estica, e o que fica dela é a **pincelada** por baixo do endereço. A marca torna-se aquilo para onde aponta.

Nada no fecho foi desenhado de novo: a pincelada é o mesmo `<path>` que a página tem sob *sala de aula*, e o endereço usa o estilo `.marca` da página - Space Mono, maiúsculas, `letter-spacing:.24em`, em azul escuro.

Ambos aceitam parâmetros no endereço, para servirem qualquer escola sem se editar o ficheiro:

```
intro.html?nome=XPTO&sub=Centro%20de%20Formacao&cor=%23b31e2e
outro.html?url=xpto.pt&sub=Centro%20de%20Formacao&cor=%23b31e2e
```

> Dentro de um SVG, um `translate(31px)` do CSS vale **31 unidades do viewBox**, não 31 píxeis do ecrã. Foi o que partiu a primeira versão do fecho: as colunas voaram para fora.

## Regras

- **Ar em volta:** deixar pelo menos a largura de uma coluna (um sexto da largura da marca) livre de tudo.
- **Tamanho mínimo:** 24px de altura no ecrã. Abaixo disso, usar `crm-app-*`, que foi desenhado para aguentar.
- **Não:** rodar (a inclinação de -5° já faz parte da marca), esticar, mudar as cores das colunas uma a uma, pôr sombra, nem pôr a versão a cores sobre fundo escuro.

## Os ícones

São de traço, monocromáticos, `currentColor`, `stroke-width` 2 a 24px. Nunca se usa um emoji como ícone de interface. Se faltar um, desenha-se no mesmo estilo e entra no conjunto `I` do `404.html` - é de lá que estes saíram.

## Como se regeneram

O gerador lê o `404.html` e o `favicon.svg` e escreve esta pasta inteira. Corre-se quando a marca mudar. Não editar os ficheiros à mão: a próxima geração apaga-os.
