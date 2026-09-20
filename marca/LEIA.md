# Marca CRM

Tudo aqui é gerado a partir do logótipo que está em **crm.cr0x.org** - o SVG embutido no cabeçalho do `index.html`, o mesmo que o badge usa - e do `estilo/tokens.css`.

> O `favicon.svg` **não** é a fonte. É um desenho antigo, com colunas mais largas e outra grelha, e foi o erro da primeira versão desta pasta. Não há nenhuma cor nem nenhuma forma desenhada de novo: se a marca mudar, muda lá e volta a gerar-se.

## As três cores

| | Hex | Onde |
|---|---|---|
| **Tinta** | `#171412` | o tom mais escuro da marca. Usa-se em vez de preto - um `#000000` ao lado do creme lê-se como um buraco |
| **Neutra** | `#2a2622` | a tinta do quadro. É esta que o logótipo do cabeçalho usa, e não a tinta |
| **Papel** | `#efe9dd` | o creme do fundo. Usa-se em vez de branco - um `#ffffff` sobre creme aparece como uma mancha mais clara |
| **Azul** | `#0078bf` | a cor de acção. É a terceira coluna da marca, e é a cor que uma escola substitui quando põe a sua |

O azul é o único que muda por escola. A tinta e o papel são da plataforma e ficam.

## Os ficheiros

```
logo/
  crm-marca-*.svg        a marca sozinha (proporção 102:63)
  crm-marca-*-solida.svg a mesma, com o interior das colunas preenchido
  crm-simbolo-*.svg      a marca centrada em tela quadrada
  crm-app-*.svg          a caixa arredondada com a marca recortada
  png/                   o mesmo em PNG com transparência, 64 a 1024
icones/
  svg/                   os 49 ícones da interface, em currentColor
  png-tinta/             os mesmos a 256px, em tinta
  png-papel/             os mesmos a 256px, em papel
```

## Qual usar

- **Sobre papel ou branco** → `crm-marca-cor` ou `crm-marca-tinta`.
- **Sobre tinta ou qualquer fundo escuro** → `crm-marca-papel`.
- **Sobre cor forte ou fotografia** → as variantes `-solida`. As normais têm o interior das colunas vazio e o fundo entra por dentro; sobre papel isso é o que se quer, sobre uma fotografia a marca perde a forma.
- **Favicon, ícone de app, avatar de canal** → `crm-app-*`, que já traz a caixa arredondada.
- **Uma cor só, gravação ou bordado** → `crm-marca-tinta` ou `crm-marca-papel`, que são monocromáticas de raiz.

## Regras

- **Ar em volta:** deixar pelo menos a largura de uma coluna (um sexto da largura da marca) livre de tudo.
- **Tamanho mínimo:** 24px de altura no ecrã. Abaixo disso, usar `crm-app-*`, que foi desenhado para aguentar.
- **Não:** rodar (a inclinação de -5° já faz parte da marca), esticar, mudar as cores das colunas uma a uma, pôr sombra, nem pôr a versão a cores sobre fundo escuro.

## Os ícones

São de traço, monocromáticos, `currentColor`, `stroke-width` 2 a 24px. Nunca se usa um emoji como ícone de interface. Se faltar um, desenha-se no mesmo estilo e entra no conjunto `I` do `404.html` - é de lá que estes saíram.

## Como se regeneram

O gerador lê o `404.html` e o `favicon.svg` e escreve esta pasta inteira. Corre-se quando a marca mudar. Não editar os ficheiros à mão: a próxima geração apaga-os.
