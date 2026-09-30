# ZARP WhatsApp OTP 1.1.6

- Keeps all OTP timestamps in UTC while WordPress remains configured for India (`UTC+05:30`).
- Makes OTP verification resilient when WooCommerce rotates or loses a guest session identifier between requests.
- Binds verification to the normalized phone number, purpose, latest active OTP, and six-digit secret.
- Supersedes every older active OTP for the same phone and purpose whenever a new OTP is sent.
- Distinguishes missing verification records from genuinely expired OTPs in the activity log.
- Logs record IDs and UTC expiry timestamps without logging OTP values.
- Includes verified guest-order claiming from version 1.1.5.
