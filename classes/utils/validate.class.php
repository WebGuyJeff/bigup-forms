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
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */
class Validate {

	/**
	 * Validation definitions.
	 */
	private array $definitions = array();


	/**
	 * Setup the class.
	 */
	public function __construct() {
		$this->definitions = self::get_definitions();
	}


	/**
	 * Sanitise definition patterns for front end.
	 *
	 * Check stored regex patterns are compatible with HTML input `pattern` attribute. Generates
	 * error log warnings if they are not.
	 *
	 * @param  array $definitions Validation definitions.
	 * @return array Sanitised definitions.
	 */
	public static function sanitise_patterns_for_frontend( $definitions ) {
		foreach ( $definitions as $key => $value ) {
			$regex                       = $value['rules']['pattern']['regex'];
			[ $pattern_attr, $warnings ] = Regex::php_regex_to_html_pattern( $regex );
			if ( ! empty( $warnings ) ) {
				// Regex inconsistencies are errors.
				error_log( 'Bigup Forms error: ' . implode( ' | ', $warnings ) );
			}
			$definitions[ $key ]['rules']['pattern']['regex'] = $pattern_attr;
		}
		return $definitions;
	}


	/**
	 * Get validation definitions.
	 *
	 * Data format rules for use on front and back end for consistent validation.
	 *
	 * NOTE: Patterns must be parsed before passing to front end.
	 *
	 * @return array Validation definitions.
	 */
	public static function get_definitions() {
		return array(
			'custom_text'  => array(
				'label'       => __( 'Custom Text (free format)', 'bigup-forms' ),
				'description' => __( 'Fill in this text field.', 'bigup-forms' ),
				'types'       => array( 'textarea', 'text', 'email', 'tel', 'password', 'url' ),
				'error'       => 'Enter a valid value.',
				'rules'       => array(
					'pattern'   => array(
						'regex' => '',
						'flags' => '',
					),
					'maxlength' => '',
					'minlength' => '',
				),
			),
			'number'       => array(
				'label'       => __( 'Number', 'bigup-forms' ),
				'description' => __( 'Fill in this number field.', 'bigup-forms' ),
				'types'       => array( 'text', 'number', 'date', 'time' ),
				'error'       => 'Enter a valid number.',
				'rules'       => array(
					'pattern' => array(
						'regex' => '[0-9\,.-]+',
						'flags' => '',
					),
					'max'     => '',
					'min'     => '',
					'step'    => '',
				),
			),
			'name'         => array(
				'label'       => __( 'Name', 'bigup-forms' ),
				'description' => __( 'Fill in a name.', 'bigup-forms' ),
				'types'       => array( 'textarea', 'text' ),
				'error'       => __( 'Enter a valid name.', 'bigup-forms' ),
				'rules'       => array(
					'pattern'   => array(
						'regex' => "[A-Za-zÀ-ÖØ-öø-ÿ'\\-\\s.]+",
						'flags' => 'u',
					),
					'maxlength' => 100,
					'minlength' => 2,
				),
			),
			'phone'        => array( // See https://stackoverflow.com/questions/8634139/phone-validation-regex#answer-53297852.
				'label'       => __( 'Phone Number', 'bigup-forms' ),
				'description' => __( 'Fill in a phone number.', 'bigup-forms' ),
				'types'       => array( 'text', 'tel' ),
				'error'       => __( 'Enter a valid phone number' ),
				'rules'       => array(
					'pattern'   => array(
						'regex' => '[0-9+\-\s().]+',
						'flags' => '',
					),
					'maxlength' => 20,
					'minlength' => 6,
				),
			),
			'email'        => array(
				'label'       => __( 'Email', 'bigup-forms' ),
				'description' => __( 'Fill in an email address.', 'bigup-forms' ),
				'types'       => array( 'text', 'email' ),
				'error'       => __( 'Enter a valid email address.', 'bigup-forms' ),
				'rules'       => array(
					'pattern'   => array(
						'regex' => '[^@\s]+@[^@\s]+\.[^@\s]+',
						'flags' => 'i',
					),
					'maxlength' => 254,
					'minlength' => 6,
				),
			),
			'url'          => array( // See https://stackoverflow.com/questions/10306690/what-is-a-regular-expression-which-will-match-a-valid-domain-name-without-a-subd/30007882#answer-26987741.
				'label'       => __( 'URL', 'bigup-forms' ),
				'description' => __( 'Fill in a URL.', 'bigup-forms' ),
				'types'       => array( 'text', 'url' ),
				'error'       => __( 'Enter a valid URL.', 'bigup-forms' ),
				'rules'       => array(
					'pattern'   => array(
						'regex' => '(https?:\/\/)[^\s\/$.?#].[^\s]*',
						'flags' => 'i',
					),
					'maxlength' => 253,
					'minlength' => 4,
				),
			),
			'message_body' => array(
				'label'       => __( 'Message Body', 'bigup-forms' ),
				'description' => __( 'Enter a message.', 'bigup-forms' ),
				'types'       => array( 'textarea' ),
				'error'       => 'Please enter a valid message.',
				'rules'       => array(
					'pattern'   => array(
						'regex' => '',
						'flags' => '',
					),
					'maxlength' => 1000,
					'minlength' => 10,
				),
			),
		);
	}


	/**
	 * Validate form data.
	 *
	 * Validate input data from a submitted form. Requires input data and data format to determine
	 * validation method.
	 *
	 * @param  array $form_data Associative array of form data.
	 * @return array $form_data Associative array of form data with any validation errors.
	 */
	public function form_data( $form_data ) {
		$has_errors = false;

		foreach ( $form_data['fields'] as $name => $field ) {
			[ $be_errors, $be_rejects ] = self::backend_tests( $field['value'], $field['validationDefinition'] );
			[ $fe_errors, $fe_rejects ] = self::frontend_tests( $field['value'], $field['validationDefinition'] );

			$errors  = array_merge( $be_errors, $fe_errors );
			$rejects = array_merge( $be_rejects, $fe_rejects );

			if ( ! empty( $errors ) || ! empty( $rejects ) ) {
				$form_data['fields'][ $name ]['errors']  = $errors;
				$form_data['fields'][ $name ]['rejects'] = $rejects;
				$has_errors                              = true;
			}
		}
		$form_data['has_errors'] = $has_errors;

		return $form_data;
	}


	/**
	 * Validate against frontend rules.
	 *
	 * We retest here as we don't trust client data, but we want to ensure all restrictions
	 * configured on the inputs have been adhered to.
	 *
	 * @param string $data - The data to validate.
	 * @param string $validation_definition - The name of the validation definition to use.
	 * @return arrray Error strings and rejex rejections matches.
	 */
	private function frontend_tests( string $data, string $validation_definition ): array {
		$definition = $this->definitions[ $validation_definition ];
		$errors     = array(); // User error messages to display on form input.
		$rejects    = array(); // Regex matches that caused rejection for frontend validation handling.

		/**
		 * These are the same rules used client side. We retest here as we don't trust client data.
		 */
		foreach ( $definition['rules'] as $rule => $test ) {
			switch ( $rule ) {
				case 'pattern':
					if (
						$test
						&& array_key_exists( 'regex', $test )
						&& array_key_exists( 'flags', $test )
						&& preg_match( '/' . $test['regex'] . '/' . $test['flags'], $data ) !== 1 ) {

						$errors[] = __( 'Please check your input.', 'bigup-forms' );
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
						$errors[] = __( 'Round to the nearest : ', 'bigup-forms' ) . $test;
					}
					break;

				default:
					error_log( 'Bigup Forms: Unknown validation rule "' . $rule . '" passed with value' );
					return 'Error: Unexpected data recieved. Please try again or alert website owner';
			}
		}

		// Make error messages safe for output.
		foreach ( $errors as $key => $error ) {
			$errors[ $key ] = htmlspecialchars( $errors[ $key ] );
		}
		return array( $errors, $rejects );
	}


	/**
	 * Validate against robust server-side tests.
	 *
	 * Here we only check the data is a valid format to match the type of data expected. All other
	 * block-customisable restrictions such as length, min/max etc are handled by frontend_tests().
	 *
	 * @param string $data - The data to validate.
	 * @param string $validation_definition - The name of the validation definition to use.
	 * @return arrray Error strings and rejex rejections matches.
	 */
	private function backend_tests( string $data, string $validation_definition ): array {
		$errors  = array(); // User error messages to display on form input.
		$rejects = array(); // Regex matches that caused rejection for frontend validation handling.

		switch ( $validation_definition ) {
			case 'custom_text':
				// Do nothing as any validation will be handled by user config / frontend_tests().
				break;

			case 'number':
				if ( ! $this->number( $data ) ) {
					$errors[] = 'Invalid number.';
				}
				break;

			case 'name':
				if ( ! $this->name( $data ) ) {
					$errors[] = 'Invalid name.';
				}
				break;

			case 'phone':
				if ( ! $this->phone( $data ) ) {
					$errors[] = 'Invalid phone number.';
				}
				break;

			case 'email':
				if ( ! $this->email( $data ) ) {
					$errors[] = 'Invalid email.';
				}
				break;

			case 'url':
				if ( ! $this->url( $data ) ) {
					$errors[] = 'Invalid URL.';
				}
				break;

			case 'message_body':
				$result = $this->language_text( $data );
				if ( true !== $result && is_array( $result ) ) {
					if ( $result['bad_newlines'] ) {
						$errors[] = 'Newlines are not allowed.';
					} elseif ( $result['has_unicode'] ) {
						$errors[] = 'Disallowed characters detected.';
					} elseif ( $result['has_code'] ) {
						// These matches will be used to build a dynamic error message on frontend.
						$rejects = $result['code_matches'];
					}
				}
				break;

			default:
				error_log( 'Bigup Forms: Unknown validation definition "' . $validation_definition . '" passed with value' );
				return 'Error: Unexpected data recieved. Please try again or alert website owner';
		}

		// Make error messages safe for output.
		foreach ( $errors as $key => $error ) {
			$errors[ $key ] = htmlspecialchars( $errors[ $key ] );
		}
		return array( $errors, $rejects );
	}


	/**
	 * Validate a numeric value - int (whole number), float (decimal) or a numeric string.
	 *
	 * @param string $data - The data to validate.
	 * @return bool - True if valid, false if not.
	 */
	private function numeric( $data ): bool {
		$result = is_numeric( $data );
		// is_numeric() returns true if value is a number or a numeric string, false otherwise.
		return true === $result;
	}


	/**
	 * Validate a person's name.
	 *
	 * - Assumes length is handled by frontend_tests().
	 * - Allows letters (Unicode), combining marks, spaces.
	 * - Allows common punctuation: apostrophes, hyphens, periods.
	 * - Rejects digits and most symbols.
	 *
	 * @param string $data - The data to validate.
	 * @return bool - True if valid, false if not.
	 */
	private function name( string $data ): bool {
		$name = trim( $data );
		if ( $this->has_disallowed_unicode( $name ) ) {
			return false;
		}
		// Allow: letters + marks + space separators + ' ’ - . (and non-breaking hyphen variants).
		// \p{Zs} = space separators (covers normal spaces and a few others).
		if ( preg_match( "/^[\p{L}\p{M}\p{Zs}().'’\-\x{2010}\x{2011}]+$/u", $name ) !== 1 ) {
			return false;
		}
		// Also avoid leading/trailing punctuation-only names.
		if ( preg_match( '/^\p{L}.*\p{L}$/u', $name ) !== 1 ) {
			return false;
		}
		return true;
	}


	/**
	 * Validate a phone number.
	 *
	 * - Assumes string length is handled by frontend_tests() but does restrict digit count.
	 * - Allows +, digits, spaces, parentheses, hyphens, dots.
	 * - Requires a reasonable digit count (E.164 max is 15 digits; min here 6).
	 *
	 * @param string $data - The data to validate.
	 * @return bool - True if valid, false if not.
	 */
	private function phone( string $data, int $min_digits = 6, int $max_digits = 15 ): bool {
		$phone = trim( $data );
		if ( '' === $phone || has_disallowed_unicode( $phone ) ) {
			return false;
		}
		// Allowed characters only.
		if ( preg_match( '/^[0-9+\s().\-\.]+$/', $phone ) !== 1 ) {
			return false;
		}
		// Digit count check.
		$digits = preg_replace( '/\D+/', '', $phone );
		$len    = strlen( $digits );
		return $len >= $min_digits && $len <= $max_digits;
	}


	/**
	 * Validate an email.
	 *
	 * @param string $data - The data to validate.
	 * @return bool - True if valid, false if not.
	 */
	private function email( $data ): bool {
		$result = filter_var( $data, FILTER_VALIDATE_EMAIL );
		// filter_var() returns the filtered data on succes, false on failure.
		return false !== $result;
	}


	/**
	 * Validate a url.
	 *
	 * @param string $data - The data to validate.
	 * @return bool - True if valid, false if not.
	 */
	private function url( $data ): bool {
		$result = filter_var( $data, FILTER_VALIDATE_URL );
		// filter_var() returns the filtered data on succes, false on failure.
		return false !== $result;
	}


	/**
	 * Validate language text.
	 *
	 * This should only fail on non-language characters and code syntax patterns.
	 *
	 * @param string $data - The data to validate.
	 * @return bool|array  - True if valid, array of error details if not.
	 */
	private function language_text( string $data, $allow_newlines = true ): bool|array {
		$text = trim( $data );

		// Newlines.
		$has_newlines = preg_match( '/\r\n|\r|\n/', $text ) === 1 ? true : false;
		$bad_newlines = $has_newlines && ! $allow_newlines ? true : false;

		// Nasty unicode.
		$has_disallowed_unicode = $this->has_disallowed_unicode( $text ) ? true : false;

		[ $has_code, $code_matches ] = $this->has_disallowed_code_syntax( $text );

		if ( $bad_newlines || $has_disallowed_unicode || $has_code ) {
			return array(
				'bad_newlines' => $bad_newlines,
				'has_unicode'  => $has_disallowed_unicode,
				'has_code'     => $has_code,
				'code_matches' => $code_matches,
			);
		} else {
			return true;
		}
	}


	/** ------------------------------------------------------------
	 * Helper functions.
	 * ------------------------------------------------------------ */


	/**
	 * Normalize newlines to '\n'.
	 *
	 * @param  string $s - String to normalize.
	 * @return string - Normalized string.
	 */
	private function normalize_newlines( string $s ): string {
		return str_replace( array( '\r\n', '\r' ), '\n', $s );
	}


	/**
	 * Reject problematic Unicode categories:
	 *
	 * - \p{Cc} Control chars (Allow newlines and tabs)
	 * - \p{Cs} Surrogates (should never appear in valid UTF-8 text)
	 * - \p{Co} Private-use characters (often “non-language”)
	 *
	 * IMPORTANT: Do NOT reject \p{Cf} (format chars) because emoji sequences use ZWJ etc.
	 *
	 * @param  string $s - String to normalize.
	 * @param  bool   $allow_newlines - Whether to allow \n and \r.
	 * @return string Normalized string.
	 */
	private function has_disallowed_unicode( string $s ): bool {
		// Normalise and remove newlines and tabs to prevent them flagging.
		$s = $this->normalize_newlines( $s );
		$s = str_replace( array( "\n", "\t" ), '', $s );

		// If the environment lacks PCRE unicode props, this may not work but most modern PHP builds support it.
		return preg_match( '/[\p{Cc}\p{Cs}\p{Co}]/u', $s ) === 1;
	}


	/**
	 * Detect HTML and code-ish syntax.
	 *
	 * - HTML tag detection.
	 * - HTML entities (encoded payloads).
	 * - Other Common code syntax (broad heuristic).
	 *
	 * @param  string $s - String to test.
	 * @return array  Result of detection: array( bool $has_matches, array $matches ).
	 */
	private function has_disallowed_code_syntax( string $s ): array {

		$re_codeish = '~'
		. '(?:</?[a-z][a-z0-9:-]*\b[^>]*>)|'                      // HTML tags.
		. '(?:<!--[\s\S]*?-->)|'                                  // HTML comments.
		. '(?:<!DOCTYPE\b[^>]*>)|'                                // HTML doctype.
		. '(?:&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);)|'            // HTML entities.
		. '(?:<\?php|\?>)|'                                       // PHP tags.
		. '(?:\{|\}|\[|\])|'                                      // brackets except ().
		. '(?:!==|===|=>|->|::)|'                                 // syntax tokens.
		. '(?:^\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b)|' // SQL at start of line.
		. '(?:^\s*[{[]\s*".*"\s*:)|'                              // JSON-ish object start.
		. '(?:^---\s*$)|'                                         // YAML doc marker.
		. '(?:^\s*[A-Za-z_][\w.-]*\s*=\s*.+$)'                    // .env / config key=value line.
		. '~mi';

		$m       = array();
		$count   = preg_match_all( $re_codeish, $s, $m );
		$matches = $m[0];

		if ( false === $count ) {
			// Result false, so preg_match failed.
			error_log( 'Regex syntax error: ' . $re );
		}

		$has_matches = ! empty( $matches ) ? true : false;
		return array( $has_matches, $matches );
	}
}
