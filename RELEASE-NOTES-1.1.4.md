# ZARP WhatsApp OTP 1.1.4

- Fixes fresh OTPs being reported as expired when PHP uses the India timezone while OTP timestamps are stored in UTC.
- Parses stored send and expiry timestamps explicitly as UTC.
- Aligns local OTP validity with the Interakt authentication template's 10-minute validity.
- Immediately enables the “Request new OTP” button if an OTP is genuinely expired.
- Includes the account-registration and WhatsApp-only login fixes from versions 1.1.2 and 1.1.3.
