# Retention & churn

A **lost proposal** never became a customer. A **cancelled contract** is a paying customer who leaves - that is where **churn** lives. The **Retention** module manages those cancellations as a flow, to try to **save** the customer (save desk) and measure lost recurring revenue.

## The flow (kanban)

`At risk → Cancellation requested → In retention → Retained (saved) / Cancelled (churn)`

Each card is a **contract at risk** (a module, service or product), with:

- **MRR at risk** - the monthly recurring revenue lost if it cancels.
- **Type**: **Voluntary** (the customer decides) or **Involuntary** (payment failure) - solved in different ways.
- **Reason**: Price, Low usage, Competitor, No longer needed, Support/experience, Payment failed.

As in the proposal pipeline, the **Retained** column is green and **Cancelled** is red.

## The save desk (the important part)

When you open a card, the CRM shows a **retention offer suggested by the reason** - the best practice that most raises the save rate:

| Reason | Suggested offer |
|---|---|
| Price | Discount |
| Low usage · No longer needed | Pause |
| Competitor | Switch plan |
| Support/experience | Help / onboarding |
| Payment failed | Update payment |

You apply the offer, log the contact in the **history**, and finally mark **Retained** (saved) or **Cancelled**. A cancelled contract can later be **won back**.

## The metrics (Analytics)

The **Analytics** screen gains a **Retention & churn** block:

- **Retention rate** (save rate) - how many cancellations were saved.
- **MRR at risk** and **MRR churn** - recurring revenue at risk and actually lost per month (net of win-back).
- **Cancellation reasons** and **voluntary vs involuntary**.

## How to log a cancellation

- The **Retention** button on the Proposals screen (goes to the flow) and **Log cancellation** inside the module.
- On a **Won** proposal, the **Log cancellation** button creates the card pre-filled with the contract's item and MRR.

!!! note "Learning environment"
    Thresholds and offers are simplified for training. In a real product, the save desk would connect to billing and automated win-back campaigns.
