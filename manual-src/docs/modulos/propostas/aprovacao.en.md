# Proposal approval

**High-value** proposals, or ones with **aggressive discounts**, should not reach the customer without a manager's sign-off. The CRM includes an **approval cycle**: when a proposal exceeds the rule, it is held until the **manager** decides.

<figure class="crm-video" data-video="aprovacao-propostas" data-poster="/manual/assets/screens/aprovacao-propostas.png"></figure>

## Set the rule

In **Settings → Proposal approval**:

| Field | What it does |
|---|---|
| **Require manager approval** | Turns the approval cycle on or off |
| **Value limit (TCV) without approval** | Above this contract value, the proposal needs approval |
| **Max line discount without approval** | Above this discount percentage on a line, it needs approval |

Only **one** condition needs to be exceeded for the proposal to go for approval.

## Flow

1. The salesperson creates the proposal and tries to move it to **Sent**, **Negotiation** or **Won**.
2. If the proposal **exceeds the rule**, the CRM does **not** let it advance: it keeps it in **Created** and flags it with the **Awaiting approval** badge.
3. The proposal shows up in the **Pending approvals** panel, at the top of the **Proposals** screen.
4. The **manager** clicks **Approve** or **Reject**:
    - **Approve** - the proposal advances to the state the salesperson intended (e.g. Sent) and fires the associated automations.
    - **Reject** - the manager can write a reason; the salesperson sees it on the proposal and adjusts before resubmitting.

!!! note "Who approves"
    Approving and rejecting are **manager** actions (groups marked as *Manager* in Settings). Other users see the pending items but cannot decide.

!!! tip "See the reason"
    Inside the proposal, a notice always shows the approval status: *awaiting*, *rejected* (with the reason) or *approved*.

➡️ Back to **[Pipeline](pipeline.md)** · **[Proposals](index.md)**.
