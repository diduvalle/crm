# Email & Branding

Two cards in **Settings**, for administrators only.

## Real email sending (EmailJS)

The platform can send emails **for real** (proposals, submission notices) or in **simulated mode** (it logs but does not send).

- The **keys** (Service ID, Template ID, Public Key) are **fixed** - they appear locked (🔒) so nobody can change them and break sending.
- The only thing you manage is the **mode**: turn **“Enable real sending”** on/off and click **Save configuration**.
- **Send test** sends a real email so you can confirm.

!!! info "Who appears as the sender depends on the email"
    There are two cases, and they are worth keeping apart:

    - Emails the **CRM sends to clients** (proposals, campaigns) go out under the **entity name** set in *Settings → Entity*, and replies go to **that entity's email**. In a class, that is the **fictional company of whoever is working** - which is the point, because the exercise is selling on its behalf.
    - **Platform notices** (invitation, password reset, submission notice) go out under the **school's name**.

    The visible sender address is always the platform's email account, which does not change. That is why a client may see *"external sender"*: the name is the entity's, the address belongs to the sending service.

## Branding & Appearance

Sets the **name**, the **primary colour** (which derives the whole palette), the **logo** and the **sign-in background**.

!!! warning "Inside a school, the branding is not yours"
    If you are in a school space (`crm.cr0x.org/school`), the **name**, the **logo** and the **colour** come from that school's configuration and **override whatever you set here**. The colour field tells you where it comes from - *"set in \<school\>"*.

    What stays yours is the **sign-in background**, and the button that **resets** it to the platform's.

    This is deliberate: a school's branding has to be the same across all of its classes, and cannot depend on each trainer remembering to repeat it.

- **Reset to default** returns to the platform identity - **blue**, with no custom logo. In a school space, the school's branding takes over again right after.
- The branding **travels in the JSON Export** - handy for moving an environment from one place to another.

!!! note "Outside a school"
    Opened at `crm.cr0x.org` with no space, the app uses the platform's neutral branding and these fields do rule. That is the case for anyone trying the platform without being tied to an institution.
