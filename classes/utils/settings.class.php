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

class Settings {


	/**
	 * Get plugin settings.
	 *
	 * Gets plugin settings from the database.
	 */
	public static function get( $keys = null ) {

		$settings = get_option( 'bigup_forms_settings' );

		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		// Return ALL settings
		if ( null === $keys ) {
			return is_array( $settings ) ? $settings : array();
		}

		// Single key
		if ( is_string( $keys ) ) {
			return isset( $settings[ $keys ] ) ? $settings[ $keys ] : null;
		}

		// Multiple keys
		if ( is_array( $keys ) ) {
			$result = array();

			foreach ( $keys as $key ) {
				if ( isset( $settings[ $key ] ) ) {
					$result[ $key ] = $settings[ $key ];
				}
			}

			return $result;
		}

		return null;
	}


	/**
	 * Get plugin settings or default.
	 *
	 * Gets plugin settings from the database or returns default value.
	 */
	public static function get_or_default( $key, $default = null ) {
		$value = self::get( $key );

		return ( null === $value ) ? $default : $value;
	}


	/**
	 * Set plugin settings.
	 *
	 * Sets plugin settings in the database.
	 */
	public static function set( $updates = array() ) {

		if ( ! is_array( $updates ) || empty( $updates ) ) {
			return false;
		}

		$current = get_option( 'bigup_forms_settings', array() );

		if ( ! is_array( $current ) ) {
			$current = array();
		}

		$updated = false;

		foreach ( $updates as $key => $value ) {

			// Validate single setting
			if ( ! self::validate( array( $key => $value ) ) ) {
				return false;
			}

			$current[ $key ] = $value;
			$updated = true;
		}

		return $updated ? update_option( 'bigup_forms_settings', $current ) : false;
	}


	/**
	 * Check settings are ready to send email.
	 */
	public static function ready( $settings = array() ) {
		
		if ( empty( $settings ) ) {
			$settings = self::get();
		}

		if ( ! $settings || empty( $settings ) ) {
			return false;
		}

		if ( empty( $settings['to_email'] ) 
			|| empty( $settings['from_email'] )
			|| empty( $settings['username'] ) 
			|| empty( $settings['host'] )
			|| empty( $settings['port'] ) ) {
			return false;
		}

		if ( empty( $settings['oauth_required'] ) || (int) $settings['oauth_required'] === 1 ) {
			if ( empty( $settings['oauth_provider'] )
				|| empty( $settings['oauth_client_id'] )
				|| empty( $settings['oauth_client_secret'] ) ) {
				return false;
			}
			if ( 'microsoft' === $settings['oauth_provider'] && empty( $settings['oauth_microsoft_token'] ) ) {
				return false;
			}
		} else {
			if ( empty( $settings['password'] ) ) {
				return false;
			}
		}

		return true;
	}


	/**
	 * Validate settings
	 *
	 * Returns false if ANY setting is invalid.
	 * This only validates settings and should not manipulate values.
	 */
	public static function validate( $settings ) {

		foreach ( $settings as $name => $value ) {

			$valid = true;
			switch ( $name ) {
				case 'username':
					$valid = ( is_string( $value ) && mb_strlen( $value ) < 254 ) ? true : false;
					break;

				case 'oauth_required':
					$valid = ( $value === 0 || $value === 1 || $value === true || $value === false );
					break;

				case 'password':
					$valid = ( is_string( $value ) && mb_strlen( $value ) < 100 ) ? true : false;
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
					$valid = ( $value === 0 || $value === 1 || $value === true || $value === false );
					break;

				case 'use_local_mail_server':
					$valid = ( $value === 0 || $value === 1 || $value === true || $value === false );
					break;

				case 'from_email':
					$valid = ( PHPMailer::validateAddress( $value ) ) ? true : false;
					break;

				case 'to_email':
					$valid = ( PHPMailer::validateAddress( $value ) ) ? true : false;
					break;

				case 'oauth_provider':
					$valid_providers = array( 'microsoft' );
					$valid           = in_array( $value, $valid_providers, true );
					break;

				case 'oauth_client_id':
					$valid = ( is_string( $value ) && mb_strlen( $value ) < 100 ) ? true : false;
					break;

				case 'oauth_client_secret':
					$valid = ( is_string( $value ) && mb_strlen( $value ) > 10 );
					break;

				case 'oauth_microsoft_token':
					$keys_and_types = array(
						'access_token'  => 'string',
						'refresh_token' => 'string',
						'expires'       => 'integer',
					);
					if ( is_array( $value ) && ! empty( $value ) ) {
						foreach ( $keys_and_types as $key => $type ) {
							if ( ! array_key_exists( $key, $value ) ) {
								$valid = false;
								break;
							}
							switch ( $type ) {
								case 'string':
									if ( ! is_string( $value[ $key ] ) ) {
										$valid = false;
										break;
									}
									break;
								case 'integer':
									if ( ! is_numeric( $value[ $key ] ) ) {
										$valid = false;
										break;
									}
									break;
							}
						}
					} else {
						$valid = false;
					}
					break;

				default:
					// Invalid setting name - fail the validation.
					$valid = false;

			}
			if ( $valid === false ) {
				// fail - we're done here.
				return false;
			}
		}

		// pass.
		return true;
	}
}
