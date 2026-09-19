# Proposal Templates

<figure class="crm-video" data-video="modelos" data-poster="/manual/assets/screens/modelos.png"></figure>

*The block-based proposal template builder.*

The **block builder** that defines how the proposal PDF looks. Each proposal uses a template; you can have several (e.g.: a simple one, an institutional one).

## The editor

When you open **Templates** → choose a template (or **+ New**). The editor has three areas:

- **Left - Structure:** the list of blocks (drag to reorder, ↑↓, delete) + the **Add block** palette.
- **Center - Inspector:** the options of the selected block.
- **Right - Live preview:** the "sheet" as it will come out in the PDF.

## Block types

| Block | What it shows |
|---|---|
| **Header** | Logo, contacts and a *badge* (e.g.: PROPOSAL) |
| **Text** | Free paragraph, with **tags** (`{{cliente.nome}}`) |
| **Image** | Uploaded image (automatically resized) |
| **Customer** | The data of the proposal's customer |
| **Quote** | The table of lines (items, quantities, VAT) |
| **Totals** | Subtotal, VAT, discount and total |
| **Conditions** | Conditions text (validity, VAT included…) |
| **Signature** | Signature space |
| **Divider / Spacer** | Visual separators |

## Step by step

1. **Add block** from the palette (it goes to the end).
2. **Select** the block → edit in the **Inspector** (e.g.: text, show VAT, logo on/off).
3. **Reorder** by dragging in the Structure.
4. **Insert tags** (`{{cliente.empresa}}`, `{{proposta.validade}}`…) where it makes sense.
5. **Test PDF** to see the final result.
6. **Save**.

!!! tip "Permissions"
    By default, administrators and trainers edit templates; the trainee **uses** the templates when creating proposals and exports the PDF.
