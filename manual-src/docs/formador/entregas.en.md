# Submission & validation of assignments

When a trainee submits their assignment, it appears for you in **Settings → Submission & validation of assignments**. You don't need to receive files by email - everything arrives here automatically.

## Viewing submissions

The box lists the class submissions: **trainee**, **date** and **message**. Each trainee can submit up to **2 times**.

- **Refresh** - reloads the list.
- **Load .json** - optional, to validate an assignment file you may have received separately.

## Reviewing an assignment

Click **Review** on a submission. It opens a **read-only** window (it doesn't touch your data) with:

- **KPIs** - number of companies, clients, proposals, campaigns.
- **Clients table** that the trainee created.
- **Proposals table** - and, in each one, a **PDF** button that **regenerates the document** from the submitted assignment (using the template the trainee designed).
- **Download full assignment (.json)**.

!!! note "The PDF is faithful to the assignment"
    The trainee doesn't attach a PDF: the app **reconstructs** the proposal from the submitted data (including the proposal template they created). It is always consistent with the submission.

## Submission limit

The limit starts at **2 submissions per trainee** and is counted **on the server** - a trainee can't get around it from the browser.

**To change it**, in **Settings → Class trainees**:

- **One trainee** - click the **X/Y** badge on their row and type the new number. They get a **\*** in the list, marking a personal limit.
- **The whole class** - the **Class limit** button below the table. It does not touch anyone with a personal limit.
- Leaving the field **empty** returns that person to the class value.

!!! note "It can't go below what was already submitted"
    If someone has already made 3 submissions, the limit won't drop to 2 - past submissions don't undo themselves and the list would read *3/2*. The app refuses, in the browser **and** on the server.

!!! warning "Every submission costs an email"
    The submission itself goes to the database, but it triggers an **email notification** to the trainer. Raising the limit from 2 to 4 in a class of 13 means **up to 26 more emails** against the plan - see **Plan usage** in [Settings](../modulos/definicoes.md#real-email-sending-emailjs-admin).
