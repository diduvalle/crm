# Settings

<figure class="crm-video" data-video="definicoes" data-poster="/manual/assets/screens/definicoes.png"></figure>

*Settings, with collapsible cards (several admin-only).*

The **system configuration** (System group). The cards are **collapsible** - click the title to open/close; on the first visit they are collapsed to keep the page compact. Several cards are **administrators only** (*Admin* badge).

## Available cards

### Entity
Data used in proposals and communications: **entity name**, **NIF/NIPC**, **phone**, **email** (the *reply-to* of emails), **city**, **DPO** (Data Protection Officer).

### Data & backup
**Export** / **Import** the full CRM JSON (backup or migration). This is also where you **restore the sample data**.

### Sample data generator
Quickly creates realistic **companies, contacts and proposals** (PT) - adds to the existing data.

### Brand & Appearance
*White-label*: **name**, **primary color** (derives the palette), **logo**, **login background**. **Apply** / **Reset to default**. → [Email & Brand](../formador/email-marca.md).

### Real email sending (EmailJS) *(Admin)*
The **keys** are **fixed** (🔒); you only manage the **mode** (real/simulated) + **Send test**. → [Email & Brand](../formador/email-marca.md).

**Invitations and password resets** - you choose whether the email goes to the **institutional address + the personal one** (2 sends per person) or **only the institutional one** (1 send). Each address counts as one send against your plan: in a class of 13, that is the difference between **26** and **13** sends every time you invite the class.

**Plan usage** - the **Check usage** button reads the **real EmailJS history** and shows how many sends were made **in this cycle**, a progress bar (amber at 70%, red at 90%) and the reset date. Under **Cap and cycle day** you enter both values from your plan as `200/4` (200 sends, resets on the 4th) - the EmailJS dashboard states *"Resets on…"*.

!!! note "Why the cycle isn't the month"
    EmailJS resets the quota on the **plan's anniversary day**, not on the 1st. Counting by calendar month would disagree with EmailJS **precisely at the start of each month**, which is exactly when the number matters.

!!! warning "What consumes sends"
    **Invitations and password resets** (1 or 2 per person), the **notification for each submitted assignment**, the **CRM emails** sent by the trainer and the **test email**. Trainees are in **simulated mode** inside the CRM - the only real messages they trigger are submission notifications. The **Session repository** uses a different service and does **not** count against this plan.

### User Groups *(Admin)*
**Roles × modules** matrix: defines what each group sees (Administrator/Trainer = everything; Trainee limited). Includes the option to **hide financial values** by group.

### Proposal Templates
Shortcut to the template builder. → [Proposal Templates](modelos.md).

### View as
The **eye** button, next to sign-out, shows the app **exactly as a learner gets it** - without switching accounts.

While it is on, a purple bar at the top makes sure you do not forget, with **Back to Administrator** always in sight. In **User Groups**, each group has its own *view as* too, so you can preview the groups you created.

!!! tip "What it is really for"
    A trainer only finds out that a learner cannot see the figures, or is missing a module, **when the learner says so**. This shows it in two clicks.

    It is also the fastest way to prepare a lesson on access profiles: switch the finance lock on for a group, enter the mode, and the class watches the app shrink live.

!!! note "It is only the view"
    It changes no data, no session and saves nothing - it just answers permission questions as if it were the other group. **Reloading the page exits the mode**, which is the simplest safety net there is against getting stuck in it.

### Team & permissions
Two cards answering *"what if I have a team?"*:

- **Users** - who they are, with what access and in which **department**.
- **User Groups** - what each group sees and can do.

A user **always belongs to a group** (the *Role* field has no empty option), and everyone in a group has the same permissions. Each group picks the **modules** it sees, whether it is a **manager**, and whether **finance is hidden**.

!!! tip "The exercise worth doing"
    Create a *Junior Sales* group with two or three modules, create a person in it, and **log in as them**. You watch the menu shrink. It is the fastest way to understand an access profile - and what it feels like from the other side.

    In a class, the trainer can grant the **Team & permissions** capability to learners, so each one builds the team of their own fictional company.

### Departments
The level that was missing between "the company" and "the person".

| | Answers |
|---|---|
| **Group** | what you **can do** |
| **Department** | **where you work** |

They are different things: two people can have exactly the same permissions and sit in different teams.

Type a name and **+ Add**, or use **Suggest the usual ones** (Sales, Marketing, Support). Removing a department **does not touch** anyone who already had it - the app says how many they are first.

After that, the owner filter in **Companies** and **Proposals** gains **"The whole X team"** - what a team lead actually wants: the team pipeline, not one person at a time.

### Hidden values (the 🔒)
A group can have **finance hidden**: instead of the figures you see 🔒 (and in Companies the value column disappears). Real CRMs do this - a junior rep does not see company-wide revenue.

!!! warning "It ships off, and that was deliberate"
    Until August 2026 the **Learner** role was born with the lock on. Counting padlocks per module: Analytics **17**, Proposals 13, Dashboard 12, Decision 12, Retention 12.

    The worst part was not the Kanban - it was **Analytics**, which became unreadable: average deal size, revenue per month, top companies, LTV/CAC, all covered. And the sandbox is the learner's **own fictional company**: hiding the figures of the business they are building took away precisely the calculations the course wants to teach - regional VAT, loyalty discount, TCV.

    The feature **stays**: switch it on for a group when you want to demonstrate it. It makes good classroom material - ask someone to work for ten minutes with the lock on.

### Sales targets
A goal for **won revenue** in the month. Two levels:

- **Team target** (€/month) - the total to reach. `0` = no target.
- **Individual targets (quotas)** - one per person, counted over the **won** proposals each one **[owns](empresas-contactos.md#owner)**. In a class, the list is the class.

The result shows on the **Target for the month** card on the **[Dashboard](dashboard-agenda.md)**, with a bar, a percentage and the projection at the current pace.

!!! tip "Why a target changes everything"
    With no target, *"€12,400"* is just a number - it does not say whether the month is going well or badly. With a target, the same number tells you **how much is left** and **whether there is time**. It is what CRMs call *goal tracking*, and it is the difference between reporting and managing.

### Segments
Editable list of the **company size** (Micro / SME / Large Company, out of the box). It feeds the **Segment (size)** field on the company record, the **campaign target**, the **automation condition** and the **Segmentation** chart.

Type the name and **+ Add**; **✕** removes it. Removing does **not** change companies that already use it - it just stops being offered.

!!! warning "Segment is not loyalty level"
    These are **two different things** and, until August 2026, they shared the same field - which is why the campaign target list mixed *Micro/SME/Large* with *Bronze/Silver/Gold*. They are now separate: the **segment** is the company's **size** (it never changes on its own); the **level** is computed from **won volume**. Campaigns and automations have **both filters separately** and can combine them ("SME **and** Bronze"), which was impossible before. The app refuses to create a segment named after a loyalty level, so the two can't get mixed up again.

### Other references
**Loyalty levels**, **VAT rates** (by region), **Customer sources** (editable list - if you leave *Other* in it, the app will always ask you to [say which](empresas-contactos.md#other-always-asks-which)) and **[Custom contact fields](empresas-contactos.md#custom-fields)** - fields you create yourself, available as tags in templates.

## In class mode (online)

In a class, Settings gain two central cards:

- **Trainees in the class** - access management (import, individual, reset password). → [Manage the class](../formador/gerir-turma/index.md).
- **Submission & validation of work** - receive and grade submissions. → [Submission & validation](../formador/entregas.md).

!!! note "Who sees Settings"
    **Trainees do not access** Settings. It is a **trainer/administrator** space.
