# Products

<figure class="crm-video" data-video="produtos" data-poster="/manual/assets/screens/produtos.png"></figure>

*The catalog by family, subfamily and item.*

The catalog that feeds the **proposal lines**. It is organized into three levels: **Family → Subfamily → Item**.

## The structure

| Level | Example | What it is for |
|---|---|---|
| **Family** | "Software" | Groups large areas |
| **Subfamily** | "CRM Licenses" | Subdivides the family |
| **Item** | "CRM Pro License" | The sellable product/service |

The **codes** are generated automatically; you don't have to invent them.

## Create step by step

1. Open **Products** (Main group).
2. **+ Family** → give it a name → save.
3. **+ Subfamily** → choose the family → name → save.
4. **+ Item** → fill in:
    - **Name**, **family** and **subfamily**.
    - **Type** (Product / Service) and **model** (e.g.: Annual).
    - **Price** and **VAT** (chosen from the list of rates by region).
    - **Status** (Available / Unavailable) - *Unavailable* ones do not appear in proposals.

## Stock control

For physical items (**Products**) you can track warehouse stock; **Services** never have stock. On the item:

- **Track stock for this item** - turns tracking on/off (on by default for Products). **Turn it off** for digital products/licenses, which have no physical stock.
- **Stock on hand** - the available quantity.
- **Minimum stock** - per item; at or below this value, an alert fires.

How it works:

- When a **proposal is Won**, each line's quantity is **deducted** from stock. If you **reopen** or **delete** that proposal, the stock is **restored**.
- When stock reaches the **minimum or below**, an **alert** appears (Alerts module) and the value turns **red** in the items table.
- A sale beyond available stock **warns** but is allowed (learning environment) - stock goes negative, in red.

## Bulk import (CSV)

**Import** button → download the **template** (columns `nome;familia;subfamilia;tipo;modelo;preco;iva;estado`) → fill it in → import. Missing families/subfamilies are created automatically.

!!! tip "VAT by region"
    The item stores the **rate type** (Standard/Intermediate/Reduced). When you use it in a proposal, the VAT adjusts to the **customer's region** (Mainland 23/13/6, Madeira 22/12/5, Azores 16/9/4).

!!! note "Link to proposals"
    In proposals, the lines are chosen **from this catalog** - description, price and VAT fill in by themselves. See **[Proposals](propostas/index.md)**.
