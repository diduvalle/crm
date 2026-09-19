# Campaigns & Email

<figure class="crm-video" data-video="campanhas" data-poster="/manual/assets/screens/campanhas.png"></figure>

*Campaign planning and email communication.*

Two menus: **Campaigns** (marketing planning) and **Email/Communication** (sending and follow-up).

---

## Campaigns

### The screen
Date filter + list of campaigns (name, channel, segment, status, metrics) + **+ Campaign** and **✨ Generate from persona**.

### Create - field by field
- **Name**, **Channel** (Email / SMS / Social Media).
- Target **segment** (All / Micro / SME / Large Enterprise).
- **Status** (Planned / Active…), **Start** and **End**.
- Associated email **template**.

### Persona generator (✨)
1. Click **Generate from persona**.
2. Choose a **persona** (e.g.: Zé Miguel - hotelier; Sofia - sales director; António - shopkeeper).
3. Set the **Objective** (Acquisition/Retention/Reactivation/Launch) and **Channel**.
4. The app shows the **estimated audience** in the segment and a **suggested message** → **Generate**.

### Send
**Send** dispatches to the contacts in the segment and records the sends in the **History** (with source "Campaign").

#### Who receives it, and who is left out

Before anything goes out, the app shows the **audience**.

| Left out | Why |
|---|---|
| **No active consent** | direct email marketing needs a **legal basis** - Art. 6(1)(a) GDPR and Art. 13-A of Portuguese Law 41/2004 |
| **No email** | there is nowhere to send it |

The campaign row states how many it reaches and how many are excluded; the **Send** button opens the list **with the names**, email and phone, before confirming.

!!! tip "This is where the lesson lands"
    The app **refuses** to send to people who never consented. It does not warn and send anyway - it does not send.

    That beats a slide about Article 6: anyone who wants the campaign to reach everybody has to go to **GDPR → Consents** and record the legal basis, which is exactly what they would have to do in real life.


---

## Email / Communication

### Tabs
- **Send history** - rich table; click a send to view the preview and resend.
- **Templates** - email templates.
- **Automations** - automatic rules.
- **Scheduled** - queue of future sends.

### Composer (Email module)
- **Customer** - by **search** (not a giant dropdown).
- **Template** - pre-fills subject + message.
- **CC / BCC**, **Subject**, **Message** (textarea).
- **Live preview** + **mode chip** (real/simulated).
- **Suggest with AI** *(simulated)* - generates a personalized draft.
- The user's **signature** is automatically added at the end.

### Email templates - field by field
Name, subject, color, show logo, greeting, body, button text/link, signature. Uses **tags** (`{{cliente.nome}}`, `{{entidade.nome}}`).

### Automations (marketing automation)
**Trigger → sequence of actions** rules:

- **Lifecycle triggers:** new customer / proposal created / proposal sent / proposal won.
- **Behavioural triggers** (*nurturing*): the lead turns **"hot"** (score ≥ 70) / **opens** an email / **clicks** an email / has had **no contact for N days**. They react to the lead's behaviour, not only to internal events.
- **Loyalty triggers:** the account **moves up** or **moves down a tier** (Bronze → Silver → Gold). You can restrict it to one specific tier ("only when it reaches Gold").
- **Conditions** (all must match): by **segment**, by **stage** (Lead/MQL/SQL/…) and by **score** (Cold/Warm/Hot). The *no contact* trigger lets you set the **days**.
- **Steps** in sequence, each with a **delay (days)** → they go to **Scheduled**.
- **Stop the sequence when…** - exit criterion (see below).
- **Active/Inactive** toggle + trigger counter.

#### The loyalty tier changes on its own
The tier is **not set by hand**: it is calculated from the company's **won volume** (Settings → Loyalty tiers). When a proposal is won, the volume rises and the account may cross a threshold - and that change is what fires the automation. That is what makes this trigger so realistic: it reacts to actual business, not to someone clicking a button.

!!! note "It does not fire in bulk"
    The first time the app calculates the tiers it only **records** them, without firing anything. Only later changes count as "moved up" or "moved down" - otherwise opening the app would email your whole customer base at once.

#### Actions: not everything is an email
Each step chooses **what it does**:

| Action | What happens |
|---|---|
| **Send email** | Sends the chosen template (the classic behaviour). |
| **Change the account stage** | Moves the company along the funnel (Lead → MQL → SQL → Customer). |
| **Create a task in the Calendar** | Creates a task linked to the contact, dated by the delay. |
| **Log a note on the contact** | Writes a dated note on the record. |

!!! warning "The stage only moves forward"
    The stage action **never moves backwards** and never pulls an account out of "Lost" - it follows the same rule as the rest of the app. An automation must not demote a customer just because they clicked an email.

#### Exit criterion
**Stop the sequence when…** the lead **clicks an email** or a **proposal is won**. When that happens, the steps of that automation that are **still pending** are cancelled - only its own; other automations carry on.

That is the difference between automation and blind nagging: someone who has already responded should not keep receiving the sequence built for people who have not.

#### Execution log
On the **Journeys** tab, below the journeys, the **Execution log** shows **what each automation did, to whom and when**. It answers a customer's most awkward question - *"why did I get this email?"* - with a fact instead of a guess.

!!! tip "See the behavioural triggers fire"
    In **Send history**, open an email and use **Simulate open** or **Simulate click**: the lead is marked as opened/clicked and the matching automation **fires right in front of you** (the *hot lead* trigger also re-evaluates the score). Perfect for demonstrating *nurturing* without waiting for real behaviour.

<figure class="crm-video" data-video="automacao-comportamental" data-poster="/manual/assets/screens/campanhas.png"></figure>

*Creating a behavioural automation (trigger "email opened" + stage and score conditions) and watching it fire with "Simulate open".*

### Customer journeys
The **Journeys** tab shows each automation as a **visual path**: `Start (event) → Wait N days → Email → Task → Exits if…`. It is the same automation, seen as the path the lead travels over time (*nurturing*). Each action type has its own colour, and the exit criterion appears at the end of the path. Click **Edit journey** to change the steps.

<figure class="crm-video" data-video="jornadas" data-poster="/manual/assets/screens/jornadas.png"></figure>

*Customer journeys and the web-to-lead capture form.*

## Lead capture form (web-to-lead)

At the bottom of the **Campaigns** screen there is a **lead capture form**. It simulates a website form (landing page): on **submit**, the data enters the CRM as:

- a new **contact**, with **origin "Form"**;
- its **company** (if given), created in **Lead** stage;
- firing the **new customer** automations.

This demonstrates **web-to-lead**: how a lead filling in an online form reaches the funnel automatically. The "Form" origin then shows up in the **acquisition funnel** and the **ROI by origin** (Analytics).

### The code for your website

The form next to it **simulates** capture. To put it on a real site, the **See the code for my site** button generates ready-to-paste HTML.

What the code contains, and why:

- the **fields** the CRM expects, with the source `Formulário` already set;
- a **required, unticked** consent box - Art. 7 GDPR does not accept pre-ticked boxes;
- the **date** it was accepted: without it, consent cannot be proven;
- an **anti-spam trap** (*honeypot*): a field invisible to people that bots fill in.

!!! warning "The endpoint is left blank, on purpose"
    `O_SEU_ENDPOINT` is the address that receives the data, and whoever builds the site has to write it.

    This is **not** a missing piece - it is the lesson. A website form **never talks directly to the database**: if it did, anyone could write into your database from a browser. There is always a server in between that validates everything again.

### When somebody subscribes

An alert appears in the **bell**: *"New subscription unattended"*. It stays **until there is follow-up** - not until it is read.

- Opening the record does **not** clear it: seeing is not attending.
- It goes when there is an **email sent by a person**, a **task** created, or the account moves past Lead.
- The welcome email fired by the **automation** does not count - that would be the machine answering the machine.

### Metrics
**Open** and **click** rate per send and aggregated.

!!! warning "Real vs simulated sending · tracking"
    **Trainees** always send in **simulated** mode (safe). The open/click metrics in the learning environment are **simulated** - the app explains that real tracking requires a pixel + server.

## Related

<div class="grid cards" markdown>

-   <svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1A4 4 0 0 1 16 11M21 21v-2a4 4 0 0 0-3-3.8"/></svg> __Contacts__

    ---
    The customer base you will segment in campaigns.

    [:octicons-arrow-right-24: Open](empresas-contactos.md)

-   <svg class="icon" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg> __Analytics__

    ---
    Measure the impact of campaigns (opens, clicks, conversion).

    [:octicons-arrow-right-24: Open](analytics.md)

</div>
