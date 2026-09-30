jQuery(function ($) {
	'use strict';
	function validPhone(raw) { return /^[6-9][0-9]{9}$/.test(String(raw || '').trim()); }
	function makeWhatsAppLoginExclusive() {
		$('#zarp-login-otp').each(function () {
			var box = $(this), form = box.closest('form.woocommerce-form-login');
			$('body').addClass('zarp-whatsapp-login-only');
			if (form.length) {
				form.addClass('zarp-whatsapp-only-form');
				form.children().not(box).attr('aria-hidden', 'true');
				form.closest('.account-area').addClass('zarp-whatsapp-only-area');
			}
		});
	}
	function responseMessage(xhr, fallback) {
		if (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message) return xhr.responseJSON.data.message;
		if (xhr.status === 0) return 'The request could not reach WordPress. Check the connection or security firewall.';
		return fallback + (xhr.status ? ' (HTTP ' + xhr.status + ')' : '');
	}
	function checkoutBox() { return $('#zarp-cod-otp'); }
	function checkoutPhone() { return $('#billing_phone'); }
	function normalizeCheckoutPhone() { var input=checkoutPhone(),digits=String(input.val()||'').replace(/\D/g,'');if(digits.length===12&&digits.indexOf('91')===0)digits=digits.slice(2);else if(digits.length===11&&digits.charAt(0)==='0')digits=digits.slice(1);if(validPhone(digits)&&input.val()!==digits)input.val(digits); }
	function checkoutPhoneError(force) {
		var input = checkoutPhone(), note = input.siblings('.zarp-phone-validation');
		if (!note.length) note = $('<span class="zarp-phone-validation" aria-live="polite"></span>').insertAfter(input);
		if (!input.val()) { note.text(force ? 'Enter your 10-digit Indian mobile number.' : '').toggleClass('zarp-field-error', !!force); return false; }
		if (!validPhone(input.val())) { note.text('Enter a valid 10-digit Indian mobile number.').addClass('zarp-field-error'); return false; }
		note.text('').removeClass('zarp-field-error'); return true;
	}
	function checkoutPost(data, done) {
		$.post(zarpOtp.ajax, $.extend({action: 'zarp_otp', nonce: zarpOtp.nonce, purpose: 'checkout_verification', phone: checkoutPhone().val()}, data)).done(function (result) {
			if (!result.success) return checkoutBox().find('.zarp-message').text(result.data.message);
			done(result.data);
		}).fail(function (xhr) { checkoutBox().find('.zarp-message').text(responseMessage(xhr, 'We could not complete that request. Please try again.')); });
	}
	function checkoutLabel(text) { $('#place_order').text(text).val(text).attr('data-value', text).prop('disabled', false); }
	function checkoutReset() { var box = checkoutBox(); if (!box.length) return; box.prop('hidden', false); checkoutLabel(box.data('verified') ? 'Place order' : box.data('sent') ? 'Verify OTP' : 'Verify Mobile Number'); }
	function cooldown(button, seconds) {
		clearInterval(button.data('zarpTimer')); button.prop('disabled', true);
		function tick() { if (seconds <= 0) { clearInterval(button.data('zarpTimer')); button.prop('disabled', false).text('Resend OTP'); return; } button.text('Resend OTP in ' + seconds + 's'); seconds--; }
		tick(); button.data('zarpTimer', setInterval(tick, 1000));
	}
	function checkoutSend() {
		if (!checkoutPhoneError(true)) return;
		var box = checkoutBox(); box.find('.zarp-message').text('Sending OTP…');
		checkoutPost({op: 'send'}, function (data) { box.data('sent', true).find('.zarp-otp-entry').prop('hidden', false); box.find('.zarp-message').text(data.message); checkoutLabel('Verify OTP'); cooldown(box.find('.zarp-resend'), data.cooldown || zarpOtp.cooldown); });
	}
	function checkoutVerify() {
		var box = checkoutBox(), code = box.find('#zarp-checkout-code').val();
		if (!/^\d{6}$/.test(code || '')) return box.find('.zarp-message').text('Enter the six-digit OTP received on WhatsApp.');
		box.find('.zarp-message').text('Verifying OTP…');
		checkoutPost({op: 'verify', code: code}, function (data) { box.data('verified', true).find('.zarp-otp-entry').prop('hidden', true); box.find('.zarp-message').text(data.message); checkoutLabel('Place order'); });
	}
	function loginBox() { return $('#zarp-login-otp'); }
	function loginPhone() { return loginBox().find('#zarp-login-phone').val(); }
	function loginMessage(text, error) { loginBox().find('.zarp-message').text(text || '').toggleClass('zarp-error', !!error); }
	function loginPost(operation, extra, done) {
		var data = $.extend({action: 'zarp_otp', nonce: zarpOtp.nonce, op: operation, purpose: 'account_login', phone: loginPhone(), redirect: zarpOtp.redirect || ''}, extra || {});
		$.post(zarpOtp.ajax, data).done(function (result) { if (!result.success) return loginMessage(result.data.message, true); loginMessage(result.data.message, false); done(result.data); }).fail(function (xhr) { var data=xhr.responseJSON&&xhr.responseJSON.data?xhr.responseJSON.data:{};loginMessage(responseMessage(xhr, 'We could not complete that request. Please try again.'), true);if(data.expired){var button=loginBox().find('.zarp-resend');clearInterval(button.data('zarpTimer'));button.prop('disabled',false).text('Request new OTP');} });
	}
	function sendLoginOtp(operation) {
		if (!validPhone(loginPhone())) return loginMessage('Please enter a valid 10-digit WhatsApp number.', true);
		loginMessage('Sending OTP…', false);
		loginPost(operation, {}, function (data) { loginBox().find('.zarp-login-phone-step').prop('hidden', true); loginBox().find('.zarp-otp-entry').prop('hidden', false); cooldown(loginBox().find('.zarp-resend'), data.cooldown || zarpOtp.cooldown); });
	}
	function verifyLoginOtp() {
		var code = loginBox().find('#zarp-login-code').val();
		if (!/^\d{6}$/.test(code || '')) return loginMessage('Please enter the six-digit OTP.', true);
		loginMessage('Verifying OTP…', false);
		loginPost('verify', {code: code}, function (data) {
			if (data.redirect) { window.location.assign(data.redirect); return; }
			if (data.create) { loginBox().find('.zarp-otp-entry').prop('hidden', true); loginBox().find('.zarp-account').prop('hidden', false); loginBox().find('.zarp-verified-phone').text('WhatsApp number ' + data.phone + ' — Verified ✓'); }
		});
	}
	function createAccount() {
		var name = $.trim(loginBox().find('.zarp-name').val()), email = $.trim(loginBox().find('.zarp-email').val());
		if (!name) return loginMessage('Please enter your name.', true);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return loginMessage('Please enter a valid email address.', true);
		loginMessage('Creating your account…', false);
		loginPost('create', {name: name, email: email}, function (data) { if (data.redirect) window.location.assign(data.redirect); });
	}
	function restartLogin() {
		var box = loginBox(); box.find('#zarp-login-phone, #zarp-login-code, .zarp-name, .zarp-email').val(''); box.find('.zarp-otp-entry, .zarp-account').prop('hidden', true); box.find('.zarp-login-phone-step').prop('hidden', false); loginMessage('', false);
	}
	$('body').on('input blur', '#billing_phone', function () { checkoutBox().removeData('verified').removeData('sent').find('.zarp-otp-entry').prop('hidden', true); checkoutPhoneError(false); checkoutReset(); })
	.on('click', '#place_order', function (event) { var box = checkoutBox(); if (!box.length || box.data('verified')) return; event.preventDefault(); event.stopImmediatePropagation(); box.data('sent') ? checkoutVerify() : checkoutSend(); })
	.on('click', '#zarp-cod-otp .zarp-resend', function () { if (checkoutPhoneError(true)) { checkoutBox().data('sent', false); checkoutSend(); } })
	.on('click', '#zarp-login-otp .zarp-send', function () { sendLoginOtp('send'); })
	.on('click', '#zarp-login-otp .zarp-verify', verifyLoginOtp)
	.on('click', '#zarp-login-otp .zarp-resend', function () { sendLoginOtp('resend'); })
	.on('click', '#zarp-login-otp .zarp-create', createAccount)
	.on('click', '#zarp-login-otp .zarp-restart', restartLogin)
	.on('keyup', '#zarp-login-phone, #zarp-login-code', function (event) { if (event.key === 'Enter') { event.preventDefault(); $(this).is('#zarp-login-phone') ? sendLoginOtp('send') : verifyLoginOtp(); } })
	.on('change', 'input[name=payment_method]', checkoutReset);
	$(document.body).on('updated_checkout', function(){normalizeCheckoutPhone();checkoutReset();});
	normalizeCheckoutPhone();
	makeWhatsAppLoginExclusive();
	checkoutReset();
});
