# ZARP WhatsApp OTP 1.1.7

- Keeps `+91` internal for Interakt API calls and verified E.164 identity.
- Stores and displays only the customer's 10-digit Indian mobile number in WooCommerce `billing_phone`.
- Automatically normalizes existing `+91`, `91`, or leading-zero checkout phone values to 10 digits.
- Normalizes an existing customer's billing phone after successful WhatsApp OTP login.
- Preserves full `+91` identity separately in `zarp_whatsapp_phone_e164` for secure matching.
