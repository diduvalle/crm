# auditar.mjs

Corre uma ou mais páginas publicadas e aponta o que se vê mal:

- texto fora de escala (abaixo de 11px ou acima de 34px, fora dos títulos de capa);
- serif em campos e botões;
- contraste abaixo do mínimo (4.5:1, ou 3:1 em texto grande);
- caixas desproporcionadas na barra de cabeçalho.

```
node ferramentas/auditar.mjs https://crm.cr0x.org/manual/ https://crm.cr0x.org/
```

Sem argumentos, audita a página do formando.

## Cuidados que ele já tem, porque já falhou neles

- **Lê o CSS sem cache.** A primeira versão deu 1.2:1 onde a página ao
  vivo tinha 15:1, porque leu uma folha antiga.
- **Compõe o fundo real**, camada a camada, com o alfa e com a opacity
  acumulada dos pais - é o que o olho vê, não o que a cor diz.
- **Ignora gradientes.** Um elemento com `background-image` não tem cor
  em `backgroundColor`; fingir que era papel dava 1:1 em texto branco
  sobre o herói.
- **Ignora o que está escondido por um pai** (dropdown de idioma, overlay
  de busca) e o texto dentro de SVG, que não tem fundo em CSS.

Correr isto **antes** de dar uma página por pronta.
