# Modelos de Proposta

<figure class="crm-video" data-video="modelos" data-poster="/manual/assets/screens/modelos.png"></figure>

*O construtor de modelos de proposta, por blocos.*

O **construtor por blocos** que define o aspeto do PDF da proposta. Cada proposta usa um modelo; podes ter vários (ex.: um simples, um institucional).

## O editor

Ao abrir **Modelos** → escolhe um modelo (ou **+ Novo**). O editor tem três zonas:

- **Esquerda - Estrutura:** a lista de blocos (arrasta para reordenar, ↑↓, eliminar) + a palete **Adicionar bloco**.
- **Centro - Inspetor:** as opções do bloco selecionado.
- **Direita - Pré-visualização ao vivo:** a "folha" como vai sair no PDF.

## Tipos de bloco

| Bloco | O que mostra |
|---|---|
| **Cabeçalho** | Logótipo, contactos e um *badge* (ex.: PROPOSTA) |
| **Texto** | Parágrafo livre, com **tags** (`{{cliente.nome}}`) |
| **Imagem** | Imagem carregada (redimensionada automaticamente) |
| **Cliente** | Os dados do cliente da proposta |
| **Cotação** | A tabela das linhas (artigos, quantidades, IVA) |
| **Totais** | Subtotal, IVA, desconto e total |
| **Condições** | Texto de condições (validade, IVA incluído…) |
| **Assinatura** | Espaço de assinatura |
| **Divisor / Espaço** | Separadores visuais |

## Passo a passo

1. **Adicionar bloco** a partir da palete (entra no fim).
2. **Selecionar** o bloco → editar no **Inspetor** (ex.: texto, mostrar IVA, logótipo on/off).
3. **Reordenar** arrastando na Estrutura.
4. **Inserir tags** (`{{cliente.empresa}}`, `{{proposta.validade}}`…) onde fizer sentido.
5. **Testar PDF** para ver o resultado final.
6. **Guardar**.

!!! tip "Permissões"
    Por defeito, administradores e formadores editam modelos; o formando **usa** os modelos ao criar propostas e exporta o PDF.
