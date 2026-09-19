# Create the proposal

<figure class="crm-video" data-video="criar-proposta" data-poster="/manual/assets/screens/criar-proposta.png"></figure>

*Creating a proposal, from client to totals.*

Click **+ Proposal** (or an existing card to edit). The modal opens with the proposal header, with **no company and no contact selected** - the choice is always yours.

!!! note "Changing the company brings the contact along"
    If you change the company halfway, the contact follows: with **one** person at that company it is picked automatically; with **several**, the field is left **blank** and the app tells you how many there are; with **none**, it tells you to create a contact. With several people it does **not** pick silently - that would be the easiest way to send the proposal to the wrong person.

## Field by field

| Field | Notes |
|---|---|
| **Number** | Automatic (`PROP-{year}-{no.}`), read-only - resets each year. |
| **Company (buyer)** | The **company** you are selling to - the **anchor of the sale**. Value, loyalty and discount live here. Search by name or NIPC. *(A sale to an individual has no company.)* |
| **Contact (who you negotiate with)** | The person at the company you talk to. Choosing the contact **auto-fills the company**. It is informative: if the person **changes company**, the sale **does not follow them** - it stays with the company. |
| **Loyalty months** | Duration of the **recurring SaaS** commitment; it feeds the total contract value (TCV). |
| **Title** | Name of the proposal (e.g. *CRM Licensing*). |
| **Validity** | Date up to which the proposal is valid. |
| **Status** | **Created / Sent / Negotiation / Won / Lost.** It sits at the **end** of the form and **starts empty** - on Save, the app warns if it was left unset. Moving to *Lost* records the **[loss reason](perda.md)**; to *Won*, the **[win reason](ganho.md)**. |

!!! note "Why Status sits at the end, and empty"
    It used to be at the top with *Created* as the default. Two consequences: whoever knew the deal was already closed could not set *Won* right away (choosing a terminal status **locks** the form - title, company, contact and lines become read-only), and whoever did not know left the default in place without thinking about it.

    Status is now the **last decision**, taken once the proposal is written, and it is **a decision** - not a value that was already sitting there. The suggestion came from a learner.

**VAT** uses the **company's region** and the **discount** comes from the **company's loyalty tier** (or the contact's, for an individual) - see [Companies & Contacts](../empresas-contactos.md).

## Step by step

1. **Proposals → + Proposal**.
2. Choose the **Company** (the anchor of the sale) and the **Contact** you negotiate with.
3. Set the **loyalty months** (SaaS), the **title** and the **validity**.
4. Add the **[catalogue lines](linhas.md)** (each is One-off or Monthly/Annual/recurring).
5. **Save**.

## Customer interest level

Each proposal has an **Interest level** field - how interested the customer is in *this* deal, based on their feedback:

| Level | Colour |
|---|---|
| Unclassified | grey (neutral) |
| Cold | blue |
| Warm | orange |
| Hot | red |

In the **[Pipeline](pipeline.md)**, proposals in play (Sent / Negotiation) stop being white and get **tinted** with the level colour (left bar + subtle background), so you read each deal's "temperature" at a glance. In addition, the **Won** column gets a **green** tone and the **Lost** column a **red** tone (with a red total), so the terminal states read instantly.

!!! tip "Audit trail"
    The proposal records **who created/changed it and when** - visible in the modal footer.

➡️ Next: **[Lines & catalogue](linhas.md)** · back to **[Proposals](index.md)**.
