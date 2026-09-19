# Produtos

<figure class="crm-video" data-video="produtos" data-poster="/manual/assets/screens/produtos.png"></figure>

*O catálogo por família, subfamília e artigo.*

O catálogo que alimenta as **linhas das propostas**. Está organizado em três níveis: **Família → Subfamília → Artigo**.

## A estrutura

| Nível | Exemplo | Para que serve |
|---|---|---|
| **Família** | "Software" | Agrupa grandes áreas |
| **Subfamília** | "Licenças CRM" | Subdivide a família |
| **Artigo** | "Licença CRM Pro" | O produto/serviço vendável |

Os **códigos** são gerados automaticamente; não tens de os inventar.

## Criar passo a passo

1. Abre **Produtos** (grupo Principal).
2. **+ Família** → dá um nome → guardar.
3. **+ Subfamília** → escolhe a família → nome → guardar.
4. **+ Artigo** → preenche:
    - **Nome**, **família** e **subfamília**.
    - **Tipo** (Produto / Serviço) e **modelo** (ex.: Anual).
    - **Preço** e **IVA** (escolhido da lista de taxas por região).
    - **Estado** (Disponível / Indisponível) - os *Indisponíveis* não aparecem nas propostas.

## Controlo de stock

Nos artigos físicos (**Produtos**) podes controlar o stock em armazém; os **Serviços** nunca têm stock. No artigo:

- **Controlar stock deste artigo** - liga/desliga o controlo (ligado por omissão nos Produtos). **Desliga-o** nos produtos digitais/licenças, que não têm stock físico.
- **Stock em armazém** - a quantidade disponível.
- **Stock mínimo** - próprio de cada artigo; abaixo ou igual a este valor, dispara um alerta.

Como funciona:

- Quando uma **proposta é Ganha**, a quantidade de cada linha é **abatida** do stock. Se **reabrires** ou **apagares** essa proposta, o stock é **reposto**.
- Quando o stock fica **no mínimo ou abaixo**, aparece um **alerta** (módulo Alertas) e o valor fica a **vermelho** na tabela de artigos.
- Uma venda acima do stock **avisa** mas deixa passar (ambiente pedagógico) - o stock fica negativo, a vermelho.

## Importar em massa (CSV)

Botão **Importar** → descarrega o **modelo** (colunas `nome;familia;subfamilia;tipo;modelo;preco;iva;estado`) → preenche → importa. Famílias/subfamílias em falta são criadas automaticamente.

!!! tip "IVA por região"
    O artigo guarda o **tipo de taxa** (Normal/Intermédia/Reduzida). Ao usá-lo numa proposta, o IVA ajusta-se à **região do cliente** (Continente 23/13/6, Madeira 22/12/5, Açores 16/9/4).

!!! note "Ligação às propostas"
    Nas propostas, as linhas escolhem-se **deste catálogo** - descrição, preço e IVA preenchem-se sozinhos. Vê **[Propostas](propostas/index.md)**.
