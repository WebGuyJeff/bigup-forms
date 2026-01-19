<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Get Settings and Validate From DB.
 *
 * This class fetches the settings from the database and validates their
 * values before passing them back to caller. If ANY of the settings are
 * invalid, returns false.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// Import PHPMailer for use of the email validation method.
use PHPMailer\PHPMailer\PHPMailer;

// Load Composer's autoloader (includes vendor/PHPMailer)
require BIGUPFORMS_PATH . 'vendor/autoload.php';

class Get_Settings {


	/**
	 * Get the SMTP options.
	 *
	 * Performs initial validation to ensure no values are empty.
	 */
	public static function smtp() {

		$option_names = array(
			'username',
			'password',
			'host',
			'port',
			'auth',
			'use_local_mail_server',
			'from_email',
			'to_email',
		);

		$smtp_settings = self::get_options_from_database( $option_names );

		if ( self::validate_settings( $smtp_settings ) ) {
			return $smtp_settings;
		}
		return false;
	}

	/**
	 * Get the local mail server options.
	 *
	 * Performs initial validation to ensure no values are empty.
	 */
	public static function local_mail_server() {

		$option_names = array(
			'use_local_mail_server',
			'from_email',
			'to_email',
		);

		$local_mail_server_settings = self::get_options_from_database( $option_names );

		if ( self::validate_settings( $local_mail_server_settings ) ) {
			return $local_mail_server_settings;
		}
		return false;
	}


	/**
	 * Get all passed option names from the db.
	 *
	 * Returns false if ANY option is empty.
	 */
	private static function get_options_from_database( $option_names ) {
		if ( is_array( $option_names ) ) {
			$saved_settings = get_option( 'bigup_forms_settings' );
			foreach ( $option_names as $option ) {
				$settings[ $option ] = $saved_settings[ $option ] ?? false;
			}
		} else {
			error_log( 'Bigup_Forms: get_options_from_database expects string or array but ' . gettype( $option_names ) . ' received.' );
			return false;
		}
		return $settings;
	}


	/**
	 * Validate settings
	 *
	 * Returns false if ANY option is invalid.
	 * This only validates settings and should not manipulate values.
	 */
	private static function validate_settings( $settings ) {

		// Tailored validation.
		foreach ( $settings as $name => $value ) {

			$valid = true;
			switch ( $name ) {
				case 'username':
					$valid = ( is_string( $value ) && mb_strlen( $value ) !== 0 ) ? true : false;
					break;

				case 'password':
					$valid = ( is_string( $value ) && mb_strlen( $value ) !== 0 ) ? true : false;
					break;

				case 'host':
					if ( is_string( $value ) ) {
						$ip    = gethostbyname( $value );
						$valid = ( filter_var( $ip, FILTER_VALIDATE_IP ) ) ? true : false;
					} else {
						$valid = false;
					}
					break;

				case 'port':
					$valid_ports = array( 25, 465, 587, 2525 );
					$valid       = in_array( intval( $value ), $valid_ports, true );
					break;

				case 'auth':
					$valid = ( is_bool( (bool) $value ) ) ? true : false;
					break;

				case 'use_local_mail_server':
					$valid = ( is_bool( (bool) $value ) ) ? true : false;
					break;

				case 'from_email':
					$valid = ( PHPMailer::validateAddress( $value ) ) ? true : false;
					break;

				case 'to_email':
					$valid = ( PHPMailer::validateAddress( $value ) ) ? true : false;
					break;

			}
			if ( $valid === false ) {
				// settings bad - we're done here
				return false;
			}
		}

		// settings ok
		return true;
	}
}
