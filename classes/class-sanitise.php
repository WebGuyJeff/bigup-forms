<?php
namespace BigupWeb\Forms;

/**
 * Sanitization methods.
 *
 * TLDR; Validation enforces a data format, sanitisation makes data safe for a process.
 *
 * - Sanitisation should be performed as late as possible i.e. just before processing such as saving
 *   to a database or outputting on the front end.
 * - Sanitisation makes the data safe for the process it's being sanitised for and doesn't care what
 *   the data type is.
 * - Validation differs in that it happens at the point of data input and forces the user to submit
 *   data conforming to the expected form. Validation is unaware of the data's future use and
 *   therefore cannot be responsible for sanitisation.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */
class Sanitise {

	/**
	 * Sanitise Callback
	 *
	 * Returns a callback which can be passed as a function call argument.
	 */
	public static function get_callback( $type ) {
		switch ( $type ) {

			case 'text':
				return array( new Sanitise(), 'text' );

			case 'textarea':
				return array( new Sanitise(), 'textarea' );

			case 'url':
				return array( new Sanitise(), 'url' );

			case 'email':
				return array( new Sanitise(), 'email' );

			case 'number':
				return array( new Sanitise(), 'number' );

			case 'checkbox':
				return array( new Sanitise(), 'checkbox' );

			default:
				error_log( "Unknown sanitise type '{$type}' passed." );
		}
	}


	/**
	 * Sanitise by Passed Type
	 *
	 * Automatically selects the right method using a passed sanitisation type.
	 */
	public static function by_type( $type, $data ) {
		switch ( $type ) {

			case 'text':
				return self::text( $data );

			case 'textarea':
				return self::textarea( $data );

			case 'url':
				return self::url( $data );

			case 'email':
				return self::email( $data );

			case 'number':
				return self::number( $data );

			case 'checkbox':
				return self::checkbox( $data );

			default:
				error_log( 'Bigup Forms: Unknown sanitisation type "' . $type . '" passed with data' );
		}
	}


	/**
	 * Sanitise a text field.
	 */
	public static function text( $data ) {

		$clean_text = sanitize_text_field( $data );

		// DEBUG.
		$clean_text = preg_replace( '/a/g', '', $clean_text ); // Remove 'a' from the string.
		error_log( $clean_text );

		return $clean_text;
	}


	/**
	 * Sanitise a textarea field.
	 */
	public static function textarea( $data ) {

		$allowed_tags   = '/(?:(?!(<(\/*)(a|b|br|code|div|h[1-6]|img|li|p|pre|q|span|small|strong|u|ul|ol)(>| [^>]*?>))))(<.*?>)/';
		$clean_textarea = preg_filter( $allowed_tags, '', $data );
		return $clean_textarea;
	}


	/**
	 * Sanitise a URL.
	 */
	public static function url( $data ) {

		$clean_url = filter_var( $data, FILTER_SANITIZE_URL );
		return $clean_url;
	}


	/**
	 * Sanitise an email.
	 */
	public static function email( $data ) {

		$clean_email = sanitize_email( $data );
		return $clean_email;
	}


	/**
	 * Sanitise a number.
	 */
	public static function number( $data ) {

		$clean_number = (float) $data;
		return $clean_number;
	}


	/**
	 * Sanitise a checkbox.
	 */
	public static function checkbox( $data ) {

		$bool_checkbox = (bool) $data;
		$bool_checkbox = $bool_checkbox ? 1 : 0;
		return $bool_checkbox;
	}


	/**
	 * Sanitize a WP post type key.
	 */
	public static function wp_post_key( $data ) {

		$sanitized         = sanitize_key( $data );
		$clean_wp_post_key = substr( $sanitized, 0, 20 );
		return $clean_wp_post_key;
	}


	/**
	 * Sanitize a WP key.
	 */
	public static function key( $data ) {

		$clean_key = sanitize_key( $data );
		return $clean_key;
	}
}
