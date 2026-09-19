# Email & Branding

Two cards in **Settings**, for administrators only.

## Real email sending (EmailJS)

The platform can send emails **for real** (proposals, submission notices) or in **simulated mode** (it logs but does not send).

- The **keys** (Service ID, Template ID, Public Key) are **fixed** - they appear locked (🔒) so nobody can change them and break sending.
- The only thing you manage is the **mode**: turn **“Enable real sending”** on/off and click **Save configuration**.
- **Send test** sends a real email so you can confirm.

!!! info "Email identity"
    Emails go out under the name **IEFP CRM** and replies go to the entity's email. The visible sender address is the one configured in the platform's email account.

## Branding & Appearance (white-label)

Lets you replicate the CRM for another entity:

- **Name**, **primary colour** (automatically derives the whole palette), **logo** and **login background**.
- **Apply branding** recolours the app live; **Reset to IEFP** returns to the original green.
- The branding **travels in the JSON Export** - you replicate the environment in another use just with import + changing name/colour/logo.
