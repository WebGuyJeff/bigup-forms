<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Inline Script.
 *
 * Generates inline script ready for inlining with client-side JavaScript.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */
class Inline_Script {

	private const JS_OBJECT_NAME = 'bigupFormsWpInlinedScript';

	private const JS_ADMIN_SPA_OBJECT_NAME = 'bigupFormsAdminInlinedScript';


	/**
	 * Generate JavaScript to be inlined by wp_add_inline_script().
	 *
	 * This is how we pass backend variables to cient-side JS.
	 */
	public static function get_frontend_form_variables() {
		return self::JS_OBJECT_NAME . ' = ' . wp_json_encode(
			array(
				'settingsOK'            => Settings::ready(),
				'restSubmitURL'         => get_rest_url( null, 'bigup/forms/v1/submit' ),
				'restStoreURL'          => get_rest_url( null, 'bigup/forms/v1/store' ),
				'restNonce'             => wp_create_nonce( 'wp_rest' ),
				'debug'                 => BIGUPFORMS_DEBUG,
				'validationDefinitions' => self::get_validation_definitions_for_frontend(),
			)
		);
	}


	/**
	 * Get validation definitions ready for the front end.
	 */
	public static function get_validation_definitions_for_frontend() {
		if ( ! is_admin() || Util::is_gutenberg_editor() ) {
			$definitions = Validate::sanitise_patterns_for_frontend( Validate::get_definitions() );
			return $definitions;
		} else {
			return false;
		}
	}

	/**
	 * Variables for the admin SPA (REST base + nonce). Output only on the plugin settings screen.
	 */
	public static function get_admin_spa_variables(): string {
		return self::JS_ADMIN_SPA_OBJECT_NAME . ' = ' . wp_json_encode(
			array(
				'restBaseURL' => untrailingslashit( get_rest_url( null, 'bigup/forms-admin/v1' ) ),
				'restNonce'   => wp_create_nonce( 'wp_rest' ),
				'pluginSlug'  => 'bigup-web-forms',
				'urls'        => array(
					'settings'    => admin_url( 'admin.php?page=bigup-web-forms' ),
					'entriesList' => admin_url( 'edit.php?post_type=bigup_form_entry' ),
				),
			)
		);
	}
}
