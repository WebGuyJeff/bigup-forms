<?php
namespace Bigup\Forms;

/**
 * Validation methods.
 *
 * TLDR; Validation enforces a data format, sanitisation makes data safe for a process.
 *
 * - Validation should be performed immediately on user input either on the frontend, backend or
 *   or ideally both to make the process as easy as possible for the user.
 *     - Frontend for immediate feedback to the user.
 *     - Backend as a fallback for frontend errors and malicious input. If the user isn't malicious,
 *       they should never have to see the effect of slower backend rejections.
 * - Validation is specific to the data format we are expecting to receive i.e. postcode, phone
 *   number or the user's name.
 * - Sanitisation differs in that it happens right before the data is prcessed for use i.e saving to
 *   a database or outputting to the frontend. Sanitisation doesn't care what format the data is,
 *   only that it is made safe for it's intended use. Therefore we only sanitise user input
 *   server-side and the user doesn't need to be aware of this process.
 *
 * All validation methods return:
 *     PASS: true
 *     FAIL: Array of public-friendly error message strings indicating changes required.
 *
 * Here is a great resource for clear validation feedback:
 * [Gov.UK Components - Errors](https://design-system.service.gov.uk/components/error-message/)
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */
class Validate {

	/**
	 * Validation Formats.
	 */
	public array $formats = array();


	/**
	 * Setup the class.
	 */
	public function __construct() {

		$this->formats = get_formats();
	}


	/**
	 * Get Validation Formats.
	 *
	 * Data format rules for use on front and back end for consistent validation.
	 */
	public static function get_formats() {
		return array(
			'human_name'       => array(
				'label'               => __( 'Name', 'bigup-forms' ),
				'description'         => __( 'Any-case international alphanumeric characters, non-consecutive " -\',.", and an infinite number of words.', 'bigup-forms' ),
				'regex_format'        => "/^[\p{L}](?:[\p{L}]|([- ',\.])(?!\1))*$/u",
				'regex_allowed_chars' => "/[\p{L}- ',\.]/u",
				'max_length'          => 50,
				'min_length'          => 2,
			),
			'phone_number'     => array( // See https://stackoverflow.com/questions/8634139/phone-validation-regex#answer-53297852.
				'label'               => __( 'Phone Number', 'bigup-forms' ),
				'description'         => __( 'Common international phone number characters "+-()" and whitespace.', 'bigup-forms' ),
				'regex_format'        => '^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$',
				'regex_allowed_chars' => '[+ ()-]',
				'max_length'          => 20,
				'min_length'          => 5,
			),
			'email_non_rfc'    => array(
				'label'               => __( 'Email', 'bigup-forms' ),
				'description'         => __( 'Formats allowed by most international email providers. Allow a maximum of 254 characters, 64 of which must be before the "@". Allow underscore, full-stop, plus sign, hyphen, and must have a full-stop after the "@" for TLDs like "co.uk". The TLD may contain additional full-stops.', 'bigup-forms' ),
				'regex_format'        => '/^(?=.{6,254}$)[\p{L}\p{N}_.+-]{1,64}@[\p{L}\p{N}-]+\.[\p{L}\p{N}.-]+$/u',
				'regex_allowed_chars' => '/[\p{L}p{N}_.+-]/u',
				'max_length'          => 254,
				'min_length'          => 6,
			),
			'domain_non_rfc'   => array( // See https://stackoverflow.com/questions/10306690/what-is-a-regular-expression-which-will-match-a-valid-domain-name-without-a-subd/30007882#answer-26987741.
				'label'               => __( 'Domain', 'bigup-forms' ),
				'description'         => __( 'Allow most valid domain names. May not match extremely obscure domain names which would likely never be submitted in a public form.', 'bigup-forms' ),
				'regex_format'        => '/^(?=.{4,253}$)((?!-))(xn--)?[\p{L}\p{N}][\p{L}\p{N}-]{0,61}[\p{L}\p{N}]{0,1}\.(xn--)?([\p{L}\p{N}\-]{1,61}|[\p{L}\p{N}-]{1,30}\.[\p{L}{2,})$/u',
				'regex_allowed_chars' => '/[\p{L}\p{N}-\.]/u',
				'max_length'          => 253,
				'min_length'          => 4,
			),
			'port_number'      => array( // See https://stackoverflow.com/questions/12968093/regex-to-validate-port-number#answer-12968117.
				'label'               => __( 'Port number', 'bigup-forms' ),
				'description'         => __( 'Only allow valid port numbers.', 'bigup-forms' ),
				'regex_format'        => '^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$',
				'regex_allowed_chars' => '[0-9]',
				'max_length'          => 5,
				'min_length'          => 1,
			),
			'alphanumeric_key' => array(
				'label'               => __( 'Alphanumeric key', 'bigup-forms' ),
				'description'         => __( 'Any-case international alphanumeric characters and non-consecutive "_-" but not at the beginning or end.', 'bigup-forms' ),
				'regex_format'        => "/^[\p{L}\p{N}](?:[\p{L}\p{N}]|([_-])(?!\1))+[\p{L}\p{N}]$/u",
				'regex_allowed_chars' => '/[\p{L}\p{N}-_]/u',
				'max_length'          => 999,
				'min_length'          => 0,
			),
		);
	}


	/**
	 * Validate form data.
	 *
	 * Validate input data from a submitted form. Requires input data and data format to determine
	 * validation method..
	 */
	public function form_data( $data ) {
		foreach ( $fields as $field => $data ) {
			$field['errors'] = self::by_format( $field['data'], $field['format'] );
		}

		return $fields;
	}


	/**
	 * Validate by Format
	 *
	 * Automatically selects the right method indicated by passed format. Helpful for writing
	 * dynamic functions.
	 */
	public static function by_format( $data, $format ) {
		switch ( $format ) {

			case 'alphanumeric':
				return self::alphanumeric( $data );

			case 'human_name':
				return self::human_name( $data );

			case 'email':
				return self::email( $data );

			case 'domain':
				return self::domain( $data );

			case 'port':
				return self::port( $data );

			case 'boolean':
				return self::boolean( $data );

			default:
				error_log( 'Bigup Forms: Unknown validation format "' . $format . '" passed with value' );
				return false;
		}
	}


	/**
	 * Validate alphanumeric text.
	 */
	public static function alphanumeric( $data ) {

		$word_chars         = preg_replace( '/[£]||[^- \p{L}\p{N}]/', '', $data );
		$no_uscore          = preg_replace( '/_/', '-', $word_chars );
		$single_hyphen      = preg_replace( '/--+/', '-', $no_uscore );
		$clean_alphanumeric = preg_replace( '/  +/', ' ', $single_hyphen );
		return $clean_alphanumeric;
	}


	/**
	 * Validate a human name.
	 */
	public static function human_name( $data ) {

		if ( strlen( $data ) > 2 && strlen( $data ) < 50 ) {
			return true;
		}

		$errors = array( __( '2-50 characters allowed.', 'bigup-forms' ) );
		return $errors;
	}


	/**
	 * Validate an email address.
	 */
	public static function email( $data ) {

		if ( PHPMailer::validateAddress( $data ) ) {
			return true;
		}

		$errors = array( __( 'Not a valid email address.', 'bigup-forms' ) );
		return $errors;
	}


	/**
	 * Validate a domain name.
	 */
	public static function domain( $domain ) {

		$ip = gethostbyname( $domain );
		$ip = filter_var( $ip, FILTER_VALIDATE_IP );

		if ( $domain === '' || $domain === null ) {
			return '';
		} elseif ( $ip ) {
			return $domain;
		} else {
			return 'INVALID DOMAIN';
		}
	}


	/**
	 * Validate a port number.
	 */
	public static function port( $port ) {
		$port = (int) $port;
		if ( is_int( $port )
			&& $port >= 1
			&& $port <= 65535 ) {
			return $port;
		} else {
			return '';
		}
	}


	/**
	 * Validate a boolean input.
	 *
	 * Check the input is a valid representation of either true or false.
	 */
	public static function checkbox( $checkbox ) {

		$bool_checkbox = (bool) $checkbox;
		$bool_checkbox = $bool_checkbox ? 1 : 0;
		return $bool_checkbox;
	}
}
