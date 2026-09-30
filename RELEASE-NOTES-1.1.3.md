# ZARP WhatsApp OTP 1.1.3

- Fixes customer registration failing with `first_name_error` on sites that validate registration fields through WooCommerce hooks.
- Supplies the verified customer's first name, last name, email, and mobile number during account creation instead of only adding them afterward.
- Shows and logs WooCommerce's specific account-creation validation message if another registration rule rejects the request.
- Includes the exclusive WhatsApp-only login interface introduced in version 1.1.2.
