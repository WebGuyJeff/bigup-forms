<?php
namespace BigupWeb\Forms;

/**
 * Sanitization methods.
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
	 * Automatically selects the right method using passed type.
	 */
	public static function by_type( $type, $value ) {
		switch ( $type ) {

			case 'text':
				return $self::text( $value );

			case 'textarea':
				return $self::textarea( $value );

			case 'url':
				return $self::url( $value );

			case 'email':
				return $self::email( $value );

			case 'number':
				return $self::number( $value );

			case 'checkbox':
				return $self::checkbox( $value );

			default:
				error_log( "Unknown sanitise type '{$type}' passed." );
		}
	}


	/**
	 * Sanitise a text string.
	 */
	public static function text( $text ) {

		$clean_text = sanitize_text_field( $text );
		return $clean_text;
	}


	/**
	 * Sanitise a textarea string.
	 */
	public static function textarea( $textarea ) {

		$allowed_tags   = '/(?:(?!(<(\/*)(a|b|br|code|div|h[1-6]|img|li|p|pre|q|span|small|strong|u|ul|ol)(>| [^>]*?>))))(<.*?>)/';
		$clean_textarea = preg_filter( $allowed_tags, '', $textarea );
		return $clean_textarea;
	}


	/**
	 * Sanitise a URL.
	 */
	public static function url( $url ) {

		$clean_url = filter_var( $url, FILTER_SANITIZE_URL );
		return $clean_url;
	}


	/**
	 * Sanitise an email.
	 */
	public static function email( $email ) {

		$clean_email = sanitize_email( $email );
		return $clean_email;
	}


	/**
	 * Sanitise a number.
	 */
	public static function number( $number ) {

		$clean_number = (float) $number;
		return $clean_number;
	}


	/**
	 * Sanitise a checkbox.
	 */
	public static function checkbox( $checkbox ) {

		$bool_checkbox = (bool) $checkbox;
		$bool_checkbox = $bool_checkbox ? 1 : 0;
		return $bool_checkbox;
	}
}
