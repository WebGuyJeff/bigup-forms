<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Inline Script.
 *
 * Generates inline script ready for inlining with client-side JavaScript.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */
class Inline_Script {

	private const JS_OBJECT_NAME = 'bigupFormsWpInlinedScript';


	/**
	 * Generate JavaScript to be inlined by wp_add_inline_script().
	 *
	 * This is how we pass backend variables to cient-side JS.
	 */
	public static function get_frontend_form_variables() {
		return self::JS_OBJECT_NAME . ' = ' . wp_json_encode(
			array(
				'settingsOK'  => self::mail_settings_are_set(),
				'restURL'     => get_rest_url( null, 'bigup/contact-form/v1/submit' ),
				'restNonce'   => wp_create_nonce( 'wp_rest' ),
				'debug'       => BIGUPFORMS_DEBUG,
				'dataFormats' => ( ! is_admin() || Util::is_gutenberg_editor() ) ? Validate::get_data_formats() : false,
			)
		);
	}


	/**
	 * Mail settings are set check.
	 *
	 * @return boolean $result True if mail settings are set, false otherwise.
	 */
	private static function mail_settings_are_set() {
		// Check if settings have been configured ready to test email sending.
		$settings              = get_option( 'bigup_forms_settings' );
		$required_smtp         = array(
			'username',
			'password',
			'host',
			'port',
		);
		$required_headers      = array(
			'to_email',
			'from_email',
		);
		$smtp_ok               = self::all_are_set( $settings, $required_smtp );
		$headers_ok            = self::all_are_set( $settings, $required_headers );
		$local_mailer_selected = ( ! empty( $settings['use_local_mail_server'] ) && true === $settings['use_local_mail_server'] );
		$result                = ( $smtp_ok && $headers_ok || $local_mailer_selected && $headers_ok );

		return $result;
	}


	/**
	 * Check all test items exist as populated keys in data.
	 */
	private static function all_are_set( $data, $test_items ) {
		$all_set = true;
		foreach ( $test_items as $item ) {
			if ( empty( $data[ $item ] ) ) {
				$all_set = false;
			}
		}
		return $all_set;
	}
}
