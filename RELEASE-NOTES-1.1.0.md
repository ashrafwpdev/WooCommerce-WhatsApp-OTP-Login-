# ZARP WhatsApp OTP 1.1.0

## Added

- Passwordless WhatsApp login for existing WooCommerce customers.
- OTP-verified registration for new customers using name and email.
- Automatic login after OTP verification or account creation.
- Separate admin controls for checkout OTP, WhatsApp login and WhatsApp registration.
- Wooma-compatible account styling without theme-file changes.
- Safe My Account redirect support.
- Duplicate-phone detection and registration locking.
- Verified and consumed OTP transaction lifecycle.
- Account-authentication activity events in the existing privacy-safe log.

## Security

- Checkout and account OTP purposes remain isolated.
- OTP transactions remain bound to phone, purpose and WooCommerce/browser session.
- OTPs become unusable after checkout, login or registration.
- Registration grants expire after ten minutes.
- API keys, OTPs and generated passwords are never returned or logged.
- Phone numbers remain masked in activity logs.

## Compatibility

- Reuses the working Interakt authentication template and request payload from 1.0.5.
- Preserves the existing classic WooCommerce checkout verification flow.
- Uses native WordPress authentication cookies and login hooks.
- Uses `wc_create_new_customer()` for standard WooCommerce customer creation.
