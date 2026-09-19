# Companies & Contacts

Professional **Account / Contact** model (B2B): **Companies** are the legal entities; **Contacts** are the people linked to those companies. They are two separate menus in the sidebar.

<figure class="crm-video" data-video="contactos" data-poster="/manual/assets/screens/clientes.png"></figure>

*The Contacts tab - full record and 360° view of each client.*

---

## Companies

The **company is the commercial account**: this is where the sale, the value, the loyalty and **lead management** live.

### The screen
- **KPIs**: number of companies, **Hot leads** (score ≥ 70), **Customers** (stage = Customer) and **value won**.
- **Lead stage filter** (chips: All / Lead / MQL / SQL / Customer / Lost) and, on each row, the **score badge** (Hot / Warm / Cold).
- **Search**, **pagination** and **+ Company**. Click a **row** → **360° profile**.

<figure class="crm-video" data-video="gestao-leads" data-poster="/manual/assets/screens/clientes.png"></figure>

*Lead management on the company: lifecycle stage, lead score, the stage filter and the acquisition funnel.*

### Create / edit - field by field
- **Name** (legal name) *required*.
- **NIPC** - validated (check digit). As you type, it shows in real time whether it is valid and the **entity type** (company, individual, sole trader…). The **Look up** button auto-fills the company's data (name, address, CAE, contacts) from the NIPC. *Blocks saving if invalid.*
- **CAE** and **Sector** - picking **Other** opens the box to say **which** (see [the "Other" rule](#other-always-asks-which)).
- **Size (segment)** - Micro / SME / Large Enterprise.
- **Stage (lifecycle)** - **Lead** → **MQL** (*Marketing Qualified Lead*, one of its people has shown interest) → **SQL** (*Sales Qualified Lead*, a real opportunity with a proposal) → **Customer** / **Lost**. The app **infers** the stage and **advances it** on its own: email *engagement* → MQL, proposal → SQL, won → Customer.
- **Source (acquisition)** - the channel the company came through (Website, Referral, Trade fair, Email Campaign…) - the basis of the **acquisition funnel** and **ROI by source** in Analytics. Picking **Other** opens a box to **say which** (see below).
- **Tax address**, **Postal code**, **City**.
- **Region** - Mainland / Madeira / Azores (affects the VAT on proposals).
- **Owner** - who runs this account. See [Owner](#owner).
- **Website**, **Phone**, **Email**, **Notes**.

### 360° profile
Shows the company's **lead stage** and **lead score** (which **aggregates the engagement of all its people**), the **source**, the **loyalty**, the **tax data**, the **list of people** and a summary of **proposals / won / value won**.

!!! note "Lead management and value belong to the **Company**, not the contact"
    The sale (proposal), the **value**, the **loyalty**, the **segment** (size) and the **lead stage** all belong to the **company**. A person can **change company** and the history **does not follow them** - it stays on the account where the deal happened. The company's **lead score** rises when **any of its people** opens/clicks emails; the one who **closes** the sale is a contact (recorded on the proposal), but the deal is the company's. For a **sole trader (ENI)**, create the **company from the contact** (a one-click button on the profile) - it is still a company. A contact **without a company** is just a **directory** entry, with no sale, stage or value.

---

## Contacts

The people - a **directory**, like the **Yellow Pages**. A contact **has no** sale, value, loyalty or segment of its own (that belongs to the company); it holds the **identity**, the **current company**, the **job title/role** and the **history of company changes**.

### The screen
- **KPIs**: total contacts, **linked to a company**, **individuals** and **distinct companies**.
- **Search**, **pagination** and **+ Contact**. Click a row → **360° profile**.
- Each row shows the **company** (with the **company's lead stage**, as a reference), the **job title/role** and the phone.

### Create / edit - field by field
- **First name** and **Last name** *(name required)*.
- **Company** - pick from the Companies list (can be left **without a company** - it stays in the directory only; to sell to them, create the company from the profile); **Job title** and **Role** (who to turn to: owner, finance…).
- **Email**, **Phone** (primary - used for sending), **NIF (personal)** - validated.
- **Additional contacts** - a list with as many emails/phones as you need, each with a **type** (Email/Phone) and a **label** (Work / Personal). Useful when a person has personal and professional contacts.

    *Here the **Other** label was removed rather than given a box: the row already has three fields and there is no space for a fourth - and an "Other" label does not tell one phone from another. Anyone who had it now has **Work**.*
- **City** and **Region**.
- **Notes**.

### 360° profile
Shows the **Account · Company** card (the **company's** stage, loyalty and value, with a shortcut to its profile), the **person's details** (contacts, job title, role), the **additional contacts**, the **company history** (moved from A → B) and the **proposals negotiated with this person**.

!!! tip "Shortcuts"
    Click the **email** on the profile to open the CRM composer with the contact already set as recipient; click the **phone** to call (`tel:`). On a company, the **Look up** button (on the NIPC) fills the profile from the official records.

### "Other" always asks which
The rule holds across the **whole app**: wherever there is an **Other**, either there is a box to write in, or the option does not exist.

Fields with a **Which?** box:

| Field | Where |
|---|---|
| **Role at the company** | contact record |
| **Source (acquisition)** | company record |
| **Sector** | company record |
| **Type** | appointment, in the [Calendar](dashboard-agenda.md) |
| **Loss reason** and **[win reason](propostas/ganho.md)** | proposal |

What you type shows next to the value - *"Other: External trainer"* - on the record, in the drawer and in the tables. Where only one word fits (the calendar badge, a chart, the timeline) you see **only what you wrote**, without the prefix.

Picking a different value **closes the box and clears** the text, so no information stays hidden behind an option that is no longer selected.

!!! warning "Saving with Other blank is refused"
    The app **will not save** with *Other* picked and the box empty - it warns and moves the cursor there. A record that says only *Other* cannot be read, filtered or counted: it fills the form without saying anything.

    The check reads the **field itself**, not a fixed list - so it holds for these and for any field that later uses the same mechanism.

!!! tip "Why not just type into the field"
    The value stays **Other**, and that is what keeps grouping working: in the acquisition funnel and in ROI by source, those cases still add up under *Other* instead of scattering into dozens of one-off labels. The free text is the **explanation**, not the category.

### Custom fields
No CRM can guess what your business needs to store. If a field is missing - **Vehicle plate**, **Member no.**, **Renewal date** - you create it yourself:

1. Open a contact (or **+ New contact**) and click **+ Custom field**, at the bottom of the form.
2. Give it a **title** and pick the **type**: text, long text, number, date or list of options.
3. **Create** - the field appears right there, without losing anything you had already typed.

!!! info "The field belongs to your database, not to that one contact"
    A field you create exists on **every contact**. That is what makes it usable as a **tag** in templates. Manage the list in **Settings → Custom fields**, where you can **deactivate** it (hides the field but keeps what was filled in) or **delete** it (removes only the definition).

#### Using it in templates
Each field automatically gets a `{{cliente.<key>}}` tag - for example `{{cliente.matricula}}` - which shows up **on its own** in the tag list of both the **proposal template** builder and the **email template** editor. Nothing to configure: create the field and the tag is there.

!!! warning "A custom field is personal data"
    Anything you store in these fields goes into the data subject's **Access report (Art. 15)** and **JSON export**, exactly like the built-in fields. Worth discussing with the class: *creating a field is easy, but every new field is one more piece of personal data you must justify, retain and disclose on request* (minimisation - Art. 5(1)(c)).

---

## Owner

Every **company** and every **proposal** can have an **owner** - the person running that account or that deal. It shows as a **badge** on the table row and, if it is you, it says *"(me)"*.

At the top of the lists there is a filter:

- **All** · **Mine** · **Unassigned** · or one specific person.

In a class, the list of people is the **class** (it comes from the online roster), not the demo users.

!!! tip "What it is really for"
    With no owner, an account belongs to everyone and therefore to nobody - that is how follow-ups get lost. It is also what makes **[individual quotas](definicoes.md#sales-targets)** and the *"mine"* questions in **[Pulso](assistente.md)** possible.

---

## Duplicates

The app already **prevents** duplicates on creation (unique NIPC, NIF and email). What was missing was cleaning up the ones already there - and they get in through three doors: **CSV import**, the **data generator**, and records with a **blank** email/NIF, where the check never fires.

In **Companies** or **Contacts**, the **Duplicates** button looks for:

- identical **NIPC / NIF** (digits only - it ignores dots and spaces);
- identical **email**;
- practically identical **name** (ignoring accents, case and legal forms: *Lda.*, *S.A.*, *Unipessoal*).

### Merging
You pick which record **stays** and the app handles the rest:

1. Fills the **empty fields** of the survivor with what the others had.
2. **Repoints everything** that pointed at the others - proposals, contacts, cases, tasks, consents, data subject requests, sent emails, retention records.
3. Deletes the duplicates.

!!! warning "Merging has no undo"
    The app suggests keeping the **most complete** record (and, on a tie, the oldest one), but it confirms first: the operation touches every table at once.

    Note that merging does **not lose** the others' history - it moves it. What is lost are fields filled in twice with **different** values, where the survivor wins.

---

## Account timeline

At the bottom of the company **360° record** there is the **timeline**: everything that happened with that account in a single column, newest first.

It brings together what used to be filed by type - account created, stage changes, contacts added, proposals created/won/lost (with the reason), emails sent (and whether they were opened), cases and satisfaction, consents given and withdrawn, data subject requests, cancellation requests and tasks.

!!! tip "What it is for"
    To prepare a call, what matters is not the **filing by type** but the **order of events**: we won in April, they opened a case in June, they asked to cancel in July. Read in sections, that is invisible; read in order, it tells itself.

---

## Bulk import (CSV)

Both **Contacts** and **Products** have **Import** + **Template**:

1. Download the CSV **template**.
2. Fill it in (one row per record).
3. **Import** → the records are created; duplicates are ignored.

!!! tip "Generate sample data"
    In **Settings → Sample data generator** you can quickly create realistic companies, contacts and proposals (valid PT names/NIF) to practice without starting from scratch.

!!! note "Pedagogy"
    You practice modeling the data of a real CRM (entity vs person), **data quality** (NIF/NIPC validation), **segmentation**, **loyalty** and **lead management** (Lead → Customer lifecycle, *lead scoring*, qualification) - the basis of customer analysis.

## Related

<div class="grid cards" markdown>

-   <svg class="icon" viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg> __Products__

    ---
    Create the catalog before making proposals to these customers.

    [:octicons-arrow-right-24: Open](produtos.md)

-   <svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg> __Proposals__

    ---
    Create proposals for the contacts you registered.

    [:octicons-arrow-right-24: Open](propostas/index.md)

</div>
