# ZARP compatibility audit

## Status: Compatible with modifications

The supplied `woocommerce (1).zip` is unmodified WooCommerce core 10.3.7 (PHP 7.4+, WordPress 6.7+), not a custom ZARP plugin. It has no ZARP classes, OTP flow, Interakt client, Shiprocket integration, custom tables, or checkout/login changes. It must not be edited.

`Abandoned Checkout Recovery & Order Notifications for WooCommerce` is Interakt 2.0.0 (PHP 7.4+, WC 6.8.2–9.5). It uses the `intrkt_*` prefix, tracks `billing_phone` via `intrkt_save_cart_abandonment_data`, stores abandoned carts in `{$wpdb->prefix}intrkt_abandon_cart_abandonment`, schedules a 15-minute cron, and supplies `intrkt_cod_action` AJAX for post-order Confirm/Cancel buttons. It has a REST OAuth endpoint and event tracking, but no Authentication Template client or OTP store. Its COD setting is `intrkt_general-cod-confirmation`; disable it if ZARP’s pre-order OTP is enabled to avoid two COD confirmation journeys.

Wooma uses classic WooCommerce templates, not Checkout Blocks. Its `woocommerce/checkout/multistep-form-checkout.php` renders the final Order & Payment slide, `checkout/payment.php` renders `#payment` and `#place_order`, and `woocommerce/assets/js/multi-step-checkout.js` controls Swiper progression and listens for `updated_checkout`. It exposes the standard `woocommerce_review_order_before_submit` hook at the exact final payment location. The child theme contains only stylesheet enqueueing. Wooma also overrides My Account login templates, but retains `woocommerce_before_customer_login_form`.

| Component | Existing implementation | Risk | Integration |
|---|---|---|---|
| Checkout | Wooma classic / optional Swiper multistep | Legacy AJAX must remain intact | Use final-payment hook and `updated_checkout`; no template edits |
| COD | WooCommerce `cod` gateway + Interakt post-order buttons | Duplicate confirmation | Pre-order OTP validates with `woocommerce_after_checkout_validation`; optionally disable Interakt button setting |
| Phone | `billing_phone`, also captured by Interakt abandonment tracker | Changing number after verification | Bind verification to WC session and canonical phone; compare server-side |
| Abandonment | Interakt AJAX + 15-minute cron | OTP request could be mistaken for checkout data | ZARP does not invoke Interakt’s abandonment action or create orders |
| Login | Wooma custom templates | Template replacement would be brittle | Add OTP panel through retained hook; preserve existing form as fallback |

## Important deployment verification

The supplied Interakt plugin does **not** expose the secret required by Interakt’s Authentication Template endpoint and does not include the approved template’s button schema. Confirm the production template’s authentication button index/value structure before enabling sends. The add-on defaults to the supplied example (`buttonValues[0]`), but this is configurable only by code because template structure is an Interakt-side contract.

No live WordPress database, active plugins, payment gateways, Shiprocket plugin, or deployed Interakt template configuration was supplied, so those runtime facts cannot be verified from ZIPs.
