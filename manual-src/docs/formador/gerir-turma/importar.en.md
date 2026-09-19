# Importing trainees (Excel/CSV)

<figure class="crm-video" data-video="importar" data-poster="/manual/assets/screens/importar.png"></figure>

*Importing trainees with preview and validation.*

The fastest route for a whole class.

## Step by step

1. **Settings → Class trainees → Excel/CSV template** and open the file.
2. Fill in **one row per trainee**. **Required** columns:

    | Column | Required | Notes |
    |---|---|---|
    | `nome` | ✅ | First name |
    | `apelido` | ✅ | |
    | `email` | ✅ | The trainee's **IEFP** email (the primary one; derives username and password) |
    | `email_pessoal` | - | Personal email (optional) - the **invite goes to both** |
    | `username` | - | The login. **Leave it empty** and the app generates it: **first letter of the first name + surname**, lowercase and unaccented (Diogo Vale → `dvale`). The template already carries the formula that fills it in. If two people collide, the app disambiguates (`jferreira`, `jferreira2`) |
    | `password` | - | Can be left empty → uses the *initial password* |
    | `papel` | - | `Formando` (default) or `Formador` |

3. **Import list** → choose the file.
4. The **preview** appears: each row is either **OK** (green) or has an **error** (missing field, invalid email, duplicate username, already existing).
5. **Import N valid** - only the correct rows are added.

!!! info "Invites are **not** sent on import"
    Importing **creates the accounts** but sends **no** email. You end up with the class loaded and decide later when to send: in the list, each trainee shows the **Invite** status (*To send* / *Sent on…*), and at the top a **"Send N invite(s)"** button mails them **all at once**. You can also send them **one by one** with each row's **Send invite** button.

!!! warning "Passwords in Excel"
    To avoid putting passwords in the file, **leave the column empty** and set the *initial password* (field below the buttons) - the same for everyone. Each trainee changes it afterwards.

!!! tip "Errors don't block"
    Rows with errors **are not imported**; you fix the file and re-import just those. The valid ones have already been created.

➡️ Next: **[Add individually](adicionar.md)** · back to **[Managing the class](index.md)**.
