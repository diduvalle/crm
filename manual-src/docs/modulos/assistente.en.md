# Pulso

The green bubble in the bottom-right corner, present in **every module**. Type a question about your data and it answers with the number - and with the button that opens the real view.

## Why it is called Pulso

From the Portuguese **"tomar o pulso ao negócio"** - to take the business's pulse: a quick number on how things stand, with no opinion in between.

It is a **tool**'s name, not a person's, and that is deliberate. Almost every chatbot is called Iris, Sophia or Nova: they want you to talk to them as if they were someone. Here the aim is the opposite - a human name would undo in three letters what the opening message builds.

## The first thing it says

> **I am not artificial intelligence.** Pulso answers with fixed rules over this sandbox's data. It changes nothing.

This is not modesty, nor a legal notice buried in a footer: it is the **first message** shown, before any question. And if you ask it directly *"are you an AI?"* - or *"why are you called Pulso?"* - it has its own answer:

> I am a set of fixed rules: I recognise a few phrases and fetch the number from your data. I do not learn, I do not invent and I write nothing that is not already here.
>
> If I were AI, **Article 50 of the AI Act** would require the same declaration - the difference is that then I could be confidently wrong.

!!! info "Why this is here"
    **Article 50** of Regulation (EU) 2024/1689 (*AI Act*) requires that anyone interacting with an AI system **knows they are talking to a machine**. A booking chatbot on a website is the textbook case of **limited risk**: it is neither prohibited nor subject to a conformity assessment - **transparency** is enough.

    Pulso **is not** an AI system, so Article 50 does not even apply to it. It declares itself anyway, for two reasons: because an assistant that let itself be mistaken for AI would teach the exact opposite of what the course says, and because the obligation is easier to grasp when you see it met than when you read it in a statute.

## Three things, not two

| | Example | What you get |
|---|---|---|
| **Numbers** | *"how many proposals are open"* | the value, the list, and the button that opens the view |
| **How-to** | *"how do I create a proposal"* | the steps, the module button and the button that opens **the right manual page** |
| **What is** | *"what is MRR"* | the definition, in two lines |

Each kind carries its own badge, so there is no doubt about what you are reading.

### Numbers and how-to

| | Example | What you get |
|---|---|---|
| **Numbers** | *"how many proposals are open"* | the value, the list, and the button that opens the view |
| **How-to** | *"how do I create a proposal"* | the steps in two lines, the module button and the button that opens **the right manual page** |

Instruction answers carry the **How to** badge, so there is no doubt about what you are reading.

!!! tip "Why this exists"
    The manual has 96 pages. Someone halfway through a proposal will not search an index - they will ask the trainer. Pulso answers right there, and the button opens the right page instead of the manual's front door.

    The answers are **hand-written**, like everything else here: Pulso does not summarise the manual, nor read it. It **points** at it.

### How-to - what is covered

Twenty-two questions, across the whole journey:

- **Records** - create a company, a contact, a product
- **Proposals** - create, add catalogue lines, export PDF, send (online proposal), move status on the Kanban
- **Templates** - the proposal builder, email templates and tags
- **Marketing** - campaigns and automations
- **GDPR** - record a consent, answer a data subject request
- **Data** - CSV import, sample generator, merging duplicates, custom fields
- **Settings** - brand and appearance, sales targets
- **Learner** - submit your work, recover your password

If you write *"how…"* and it does not recognise the phrase, it still sends you to the **manual** instead of shrugging. An out-of-scope question - *"what is the capital of Australia"* - still gets only *"I don't know"*: the manual is not an excuse.

!!! note "Write freely"
    You do not have to get the verb right. The matching trims verb endings on both sides, so different conjugations land on the same answer.

---

### The glossary

**32 terms** - MRR, ARR, TCV, churn, CAC, LTV, RFM, SLA, NPS, CSAT, MQL, SQL, RoPA, DSAR, legal basis, minimisation, lead score, loyalty, persona, nurturing... - plus three comparisons people always confuse:

- **segment vs loyalty tier**
- **company vs contact**
- **NPS vs CSAT**

Type the term with *"what is"*, *"what does X mean"* or *"explain"*.

!!! tip "Why this beats the manual glossary"
    It does not replace the [Glossary](../glossario.md) - it answers **without interrupting**. These questions come up mid-task, and leaving to go looking is what makes people give up.

    The definitions are written to **stick**, not merely to be correct: MRR on a €40/month contract is *€40, not €480*; a 5%/month churn *loses half the base in a year*; breaching an SLA *is not a delay, it is a broken promise*.

!!! note "The bare term gives the number, not the definition"
    Typing **`pipeline`** gives you the **value** of your pipeline. Typing **`what is the pipeline`** gives you the definition.

    That is deliberate: mid-work, someone typing the name of a thing wants its number. Terms that compete with no data question - *MRR*, *CAC*, *SLA* - answer anyway when typed on their own.

---

## When it does not know: suggest, do not retreat

If the question is not recognised, Pulso shows the **closest questions** to what you typed, clickable:

> I don't know how to answer that - I only recognise the phrases I was programmed for.
> **Did you mean one of these?**
> `What is MRR?`

It is called ***fall-forward***, and it is the unanimous recommendation in assistant-design literature: a bare *"I don't know"* leaves the person exactly where they were; showing the nearest match gives them a way on.

After a **definition**, it also shows *"Next:"* with neighbouring terms.

### The confidence threshold

Pulso only answers when the match **explains the question**, not when it merely coincides with one word of it.

!!! warning "The defect this fixed"
    There used to be no threshold at all: any coincidence won. The question *"show me last month's proposals from the sales team"* got an answer about **user groups** - because the word *team* was in it.

    Answering confidently from a coincidence is the **one defect this assistant cannot have**, because it is exactly what people criticise in real AI. It now measures **coverage**: how much of the question the match explains. *"Team"* in a 57-character sentence explains 10% of it - that is not an answer, it is a coincidence.

    Worth showing the class next to an LLM: one says *"I don't know, did you mean this?"*; the other invents a plausible answer to the same question.

---

## What it can answer

| Area | Example questions |
|---|---|
| **Proposals** | *"how many proposals are open"* · *"how much did I sell this month"* · *"what is my conversion rate"* · *"which proposals are expiring"* |
| **Analysis** | *"why do we lose deals"* · *"why do we win"* |
| **Companies** | *"how many companies do I have"* · *"which companies have no proposal yet"* · *"who are the best customers"* |
| **Calendar** | *"what do I have today"* · *"do I have overdue tasks"* |
| **Service** | *"how are the support cases"* · *"any cases past SLA"* |
| **GDPR** | *"any data subject requests pending"* |
| **Retention** | *"any contracts at risk"* |

Below the conversation there are **clickable suggestions** - the questions it is guaranteed to recognise, with the ones for the **module you are in** first. If you are starting out, start there.

!!! tip "Ctrl+K"
    Opens and closes Pulso from anywhere. `Escape` closes it too.

!!! note "The suggestions get out of the way"
    They stay **open at the start of the conversation** - which is when nobody knows what can be asked - and **collapse as soon as you ask your first question**, because from then on the space belongs to the conversation.

    One click on **Suggestions**, always visible, brings them back. In practice the conversation area goes from 212 px to 390 px after the first question.

### Yours, not everyone's
Writing **"my"** or **"I"** narrows the answer to your user:

- *"open proposals"* → all of them in the base.
- *"my open proposals"* → only the ones you **[own](empresas-contactos.md#owner)**.

The same applies to *"how much did I sell this month"*, which compares against your **[individual quota](definicoes.md#sales-targets)** instead of the team target.

## Asking about a customer

Type a company name and you get the thirty-second summary - what you want to know **before you call**:

> **Silva & Filhos, Lda. · E001.**
> ⚠ Before you call: **1 support case still open**.
> Stage Customer · Gold · lead score 87
> 1 won proposal · 8236,08 €
> 1 contact: João Silva
> Last activity: Email sent · 24/08/2026

The **warning** line only shows when something would spoil the call: open support cases, a cancellation request in progress, or contacts with no active consent.

It works with the full name (*"how is Silva & Filhos doing?"*) and with the first word (*"has Silva paid?"*).

!!! note "Two safeguards worth discussing"
    The short form is only accepted if the sentence is **short** and **no other company** starts with the same word. With two *Silvas*, it would rather not answer than answer about the wrong one.

    And *"how do I create a proposal for Silva"* returns the **how-to**, not the record: when an instruction question matches exactly, it beats the name.

    Same principle as always: between staying quiet and being right by luck, it stays quiet.

---

## The three rules

=== "It never invents"

    If it does not recognise the question, it says so - and says **why**: *"I only recognise the phrases I was programmed for"*. It does not guess, does not return an approximate number and does not change the subject.

    This is deliberate. An assistant that always answers something is friendlier and far more dangerous: a wrong number delivered with confidence enters decisions without anyone questioning it.

=== "It only reads"

    It **changes no record whatsoever**. It does not create, delete or move statuses. At most it opens the right view - every answer ends in a button (*See proposals*, *See calendar*) that takes you to the module with the filter already applied.

    That makes it a **navigation shortcut**, not a parallel truth: the number it states and the number on screen come from the same place - and the text it gives is the text in the manual.

    **The only thing it writes** is the log of questions it could not answer (see above) - and it says that it does.

=== "It respects permissions"

    It only answers about modules you **can access**. If your user group cannot see the Helpdesk, asking about cases returns *"I don't know how to answer that"* - and the suggestion does not even appear in the list.

## What it could not answer

Whenever Pulso does not recognise a question, it keeps it. You see it in two places:

- **Settings → Unanswered questions to Pulso** - your own log, with a **clear** button.
- **In the submission**, for the trainer: the assessment sheet shows what each learner tried to ask without success.

!!! tip "For the trainer: the cheapest signal the app gives"
    What people **try** to ask is what they did not understand. If half the class writes *"how do I make a quote"*, the problem is not Pulso - it is that nobody connected **quote** to **proposal**. That is vocabulary to fix in the next session, and there is no other way to find it.

    It is also the list of what Pulso is missing, written by the people using it rather than guessed by whoever programmed it.

!!! warning "Logging without saying so would be the opposite of what this app teaches"
    So Pulso **declares the log** in its opening message, before the first question - including that it is visible in the submission.

    It is worth pausing here with the class: it is free text written by an identified person, stored and shown to a third party. This is not a hard GDPR case - it is a **mundane** one, the kind that slips through every day in real products. The difference between getting it right and getting it wrong was one sentence.

---

## What sets it apart from the Dashboard

At first glance it is redundant: *"how many open proposals"* is already on the Dashboard. The difference lies in the questions that have **no screen**:

- *"which companies have no proposal yet"* - it exists nowhere in the app; it is the cross between the company list and the proposal list.
- *"do I have overdue tasks"* - the Calendar shows the calendar, not the list of what is past due.

The Dashboard shows the numbers **somebody decided to show**. A CRM always has more useful combinations than it has screens to hold them.

!!! note "Pedagogy (UFCD 10868 · 10870)"
    It is worth using this assistant as a three-part exercise:

    1. **Ask it questions it cannot answer.** It is the fastest way to see that an assistant only reaches as far as the **data** reaches - and that the limit is almost always in the record keeping, not in the engine.
    2. **Compare it with a real chatbot.** An LLM would answer *"what is the capital of Australia"*; this one will not. It would also invent a sales figure if the data were missing - and this one will not. Discuss which of the two behaviours you want in a CRM.
    3. **Connect it to the AI Act.** If this assistant were swapped for one with AI behind it, what would change? It would become **limited risk** (Art. 50); it would still have to declare itself; and **[AI literacy](../glossario.md)** (Art. 4, in force since February 2025) would require whoever operates it to understand its limits.

## Related

<div class="grid cards" markdown>

-   <svg class="icon" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> __Dashboard & Calendar__

    ---
    Where the numbers it fetches actually live.

    [:octicons-arrow-right-24: Open](dashboard-agenda.md)

-   <svg class="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> __GDPR__

    ---
    The other regulation the same conversation triggers.

    [:octicons-arrow-right-24: Open](../rgpd/index.md)

</div>
