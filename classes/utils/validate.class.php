<?php
namespace BigupWeb\Forms;

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
 * - Sanitisation differs in that it happens right before the data is processed for use i.e saving
 *   to a database or outputting to the frontend. Sanitisation doesn't care what format the data is,
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
 * @license GPL3+
 * @link https://jeffersonreal.uk
 */
class Validate {

	/**
	 * Validation Formats.
	 */
	private array $data_formats = array();


	/**
	 * Setup the class.
	 */
	public function __construct() {

		$this->data_formats = self::get_data_formats();
	}


	/**
	 * Get Validation Formats.
	 *
	 * Data format rules for use on front and back end for consistent validation.
	 */
	public static function get_data_formats() {
		return array(
			'any_text'            => array(
				'label'       => __( 'Any Text (free format)', 'bigup-forms' ),
				'description' => __( 'Disable format checking to allow any input.', 'bigup-forms' ),
				'types'       => array( 'textarea', 'text', 'email', 'tel', 'password', 'url' ),
				'error'       => '',
				'rules'       => array(
					'pattern'   => '',
					'maxlength' => '',
					'minlength' => '',
				),
			),
			'any_number'          => array(
				'label'       => __( 'Any Number (free format)', 'bigup-forms' ),
				'description' => __( 'Disable format checking to allow any input.', 'bigup-forms' ),
				'types'       => array( 'number', 'date', 'time' ),
				'error'       => '',
				'rules'       => array(
					'pattern' => '',
					'max'     => '',
					'min'     => '',
					'step'    => '',
				),
			),
			'human_name'          => array(
				'label'       => __( 'Name', 'bigup-forms' ),
				'description' => __( 'Must only include letters and non-consecutive spaces or any of - \' , .' , 'bigup-forms' ),
				'types'       => array( 'textarea', 'text' ),
				'error'       => __( 'Only letters, spaces and \' - , . allowed.', 'bigup-forms' ),
				'rules'       => array(
					// Use named back reference to avoid conversion to an octal character with '\1'.
					'pattern'   => "/^[\p{L}](?:[\p{L}]|(?<punct>[- ',\.])(?!\k<punct>))*$/u",
					'maxlength' => 50,
					'minlength' => 2,
				),
			),
			'phone_number'        => array( // See https://stackoverflow.com/questions/8634139/phone-validation-regex#answer-53297852.
				'label'       => __( 'Phone Number', 'bigup-forms' ),
				'description' => __( 'Common international phone number characters "+-()" and whitespace.', 'bigup-forms' ),
				'types'       => array( 'tel' ),
				'error'       => __( 'Only numbers, spaces and + - ( ) allowed.', 'bigup-forms' ),
				'rules'       => array(
					'pattern'   => '^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$',
					'maxlength' => 20,
					'minlength' => 5,
				),
			),
			'email_non_rfc'       => array(
				'label'       => __( 'Email', 'bigup-forms' ),
				'description' => __( 'Email format allowed by most international email providers. A maximum of 254 characters, 64 of which must be before the "@". "_.+-" are allowed and must have a full-stop after the "@" for TLDs like "co.uk". The TLD may contain additional full-stops.', 'bigup-forms' ),
				'types'       => array( 'email' ),
				'error'       => __( 'Must be a valid email address.', 'bigup-forms' ),
				'rules'       => array(
					'pattern'   => '/^(?=.{6,254}$)[\p{L}\p{N}_.+-]{1,64}@[\p{L}\p{N}-]+\.[\p{L}\p{N}.-]+$/u',
					'maxlength' => 254,
					'minlength' => 6,
				),
			),
			'domain_non_rfc'      => array( // See https://stackoverflow.com/questions/10306690/what-is-a-regular-expression-which-will-match-a-valid-domain-name-without-a-subd/30007882#answer-26987741.
				'label'       => __( 'Domain', 'bigup-forms' ),
				'description' => __( 'Must be a valid domain name.', 'bigup-forms' ),
				'types'       => array( 'url' ),
				'error'       => __( 'Must be a valid domain name.', 'bigup-forms' ),
				'rules'       => array(
					'pattern'   => '/^(?=.{4,253}$)((?!-))(xn--)?[\p{L}\p{N}][\p{L}\p{N}-]{0,61}[\p{L}\p{N}]{0,1}\.(xn--)?([\p{L}\p{N}\-]{1,61}|[\p{L}\p{N}-]{1,30}\.[\p{L}]{2,})$/u',
					'maxlength' => 253,
					'minlength' => 4,
				),
			),
			'port_number'         => array( // See https://stackoverflow.com/questions/12968093/regex-to-validate-port-number#answer-12968117.
				'label'       => __( 'Port number', 'bigup-forms' ),
				'description' => __( 'Must be a valid port number between 1 and 65535.', 'bigup-forms' ),
				'types'       => array( 'number' ),
				'error'       => __( 'Must be a valid port number.', 'bigup-forms' ),
				'rules'       => array(
					'pattern' => '^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$',
					'max'     => 65535,
					'min'     => 1,
					'step'    => 1,
				),
			),
			'alphanumeric_key'    => array(
				'label'       => __( 'Alphanumeric key', 'bigup-forms' ),
				'description' => __( 'Must only include alphanumeric characters or non-consecutive _ - and begin and end with a letter or number.', 'bigup-forms' ),
				'types'       => array( 'textarea', 'text' ),
				'error'       => __( 'Only letters, numbers and non-consecutive _ - allowed.', 'bigup-forms' ),
				'rules'       => array(
					// Use named back reference to avoid conversion to an octal character with '\1'.
					'pattern'   => '/^[\p{L}\p{N}](?:[\p{L}\p{N}]|(?<separator>[_-])(?!\k<separator>))+[\p{L}\p{N}]$/u',
					'maxlength' => 20,
					'minlength' => 0,
				),
			),
			'message_text_legacy' => array(
				'label'       => __( 'Message Text (free format)', 'bigup-forms' ),
				'description' => __( 'A minimum of 2 and maximum of 3000 characters', 'bigup-forms' ),
				'types'       => array( 'textarea' ),
				'error'       => '',
				'rules'       => array(
					'pattern'   => '',
					'maxlength' => 3000,
					'minlength' => 2,
				),
			),
		);
	}


	/**
	 * Validate form data.
	 *
	 * Validate input data from a submitted form. Requires input data and data format to determine
	 * validation method..
	 */
	public function form_data( $form_data ) {
		foreach ( $form_data['fields'] as $name => $field ) {
			$result = self::by_format( $field['value'], $field['format'] );
			if ( true !== $result ) {
				$form_data['fields'][ $name ]['errors'] = $result;
				$form_data['has_errors']                = true;
			}
		}
		if ( ! array_key_exists( 'has_errors', $form_data ) ) {
			$form_data['has_errors'] = false;
		}

		return $form_data;
	}


	/**
	 * Validate by Format
	 *
	 * Automatically selects the right method indicated by passed format. Helpful for writing
	 * dynamic functions.
	 */
	private function by_format( $data, $format ) {

		$format = $this->data_formats[ $format ];
		$errors = array();

		foreach ( $format['rules'] as $rule => $test ) {
			switch ( $rule ) {
				case 'pattern':
					if ( $test && ! preg_match( $test, $data ) ) {
						$errors[] = $format['description'];
					}
					break;

				case 'maxlength':
					if ( $test && strlen( $data ) > $test ) {
						$errors[] = __( 'Maximum characters allowed: ', 'bigup-forms' ) . $test;
					}
					break;

				case 'minlength':
					if ( $test && strlen( $data ) < $test ) {
						$errors[] = __( 'Minimum characters allowed: ', 'bigup-forms' ) . $test;
					}
					break;

				case 'max':
					if ( $test && (float) $data > $test ) {
						$errors[] = __( 'Maximum value allowed: ', 'bigup-forms' ) . $test;
					}
					break;

				case 'min':
					if ( $test && (float) $data < $test ) {
						$errors[] = __( 'Minimum value allowed: ', 'bigup-forms' ) . $test;
					}
					break;

				case 'step':
					if ( $test && ( (float) $data / $test ) !== 0 ) {
						$errors[] = __( 'Value should be divisible by : ', 'bigup-forms' ) . $test;
					}
					break;

				default:
					error_log( 'Bigup Forms: Unknown validation rule "' . $rule . '" passed with value' );
					return 'Error: Unexpected data recieved. Please try again or alert website owner';
			}
		}

		$result = ( $errors ) ? $errors : true;
		return $result;
	}
}
