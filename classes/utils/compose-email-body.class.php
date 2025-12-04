<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Compose email body.
 *
 * Compose HTML or plain text email body.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// WordPress Dependencies.
use function get_bloginfo;
use function wp_strip_all_tags;
use function plugin_dir_path;
use function get_site_url;
use function wp_parse_url;


class Compose_Email_Body {

	/**
	 * The submitted form name.
	 */
	private $form_name = '';

	/**
	 * The website URL.
	 */
	private $domain = '';

	/**
	 * The submitted form field data.
	 */
	private $fields = array();


	/**
	 * Initialise class properties.
	 *
	 * @param array $form_data Submitted form data.
	 */
	public function __construct( $form_data ) {
		$this->form_name = strtolower( $form_data['form']['name'] );
		$this->domain    = wp_parse_url( html_entity_decode( get_bloginfo( 'url' ) ), PHP_URL_HOST );
		$this->fields    = $form_data['fields'];
	}


	/**
	 * Compose HTML body.
	 */
	public function html() {
		$html = Util::include_with_vars(
			BIGUPFORMS_PATH . 'parts/email.php',
			array(
				$this->form_name,
				$this->domain,
				$this->fields,
			),
		);
		return $html;
	}


	/**
	 * Compose plain text body.
	 */
	public function plaintext() {
		$plaintext_fields_output = "\n\n";
		foreach ( $this->fields as $name => $data ) {
			$plaintext_fields_output .= ucfirst( str_replace( '-', ' ', $name ) ) . ': ' . $data['value'] . "\n";
		}
		$plaintext_fields_output .= "\n\n";
		$plaintext                = <<<PLAIN
			This was submitted via the {$this->form_name} form at {$this->domain}.
			{$plaintext_fields_output}
			You are viewing the plaintext version of this email because you have disallowed HTML
			content in your email client. To view this and any future messages from this sender in
			complete HTML formatting, try adding the sender domain to your spam filter whitelist.
		PLAIN;
		$plaintext_cleaned        = wp_strip_all_tags( $plaintext );
		return $plaintext_cleaned;
	}
}
