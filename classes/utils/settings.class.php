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
	public static function get( $keys = array(
			'username',
			'oauth_required',
			'password',
			'oauth',
			'host',
			'port',
			'auth',
			'use_local_mail_server',
			'from_email',
			'to_email',
			'oauth_provider',
			'oauth_client_id',
			'oauth_client_secret',
			'oauth_microsoft_token',
		) ) {

		if ( empty( $keys ) ) {
			return false;
		}

		if ( ! is_array( $keys ) && ! is_string( $keys ) ) {
			return false;
		}

		if ( is_string( $keys ) ) {
			$keys = array( $keys );
		}

		$settings       = array();
		$saved_settings = get_option( 'bigup_forms_settings' );
		foreach ( $keys as $key ) {
			if ( array_key_exists( $key, $saved_settings ) ) {
				$settings[ $key ] = $saved_settings[ $key ];
			}
		}

		if ( self::validate( $settings ) ) {
			return $settings;
		}
		return false;
	}


	/**
	 * Set plugin settings.
	 *
	 * Sets plugin settings in the database.
	 */
	public static function set( $settings = array() ) {

		if ( ! self::validate( $settings ) || empty( $settings ) ) {
			return false;
		}

		$new_settings = get_option( 'bigup_forms_settings' );
		foreach ( $settings as $key => $value ) {
			if ( array_key_exists( $key, $new_settings ) ) {
				$new_settings[ $key ] = $value;
			}
		}
		return update_option( 'bigup_forms_settings', $new_settings );
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

		if ( isset( $settings['oauth_required'] ) && $settings['oauth_required'] ) {
			if ( empty( $settings['oauth'] )
				|| empty( $settings['oauth_provider'] )
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
	private static function validate( $settings ) {

		foreach ( $settings as $name => $value ) {

			$valid = true;
			switch ( $name ) {
				case 'username':
					$valid = ( is_string( $value ) && mb_strlen( $value ) !== 0 ) ? true : false;
					break;

				case 'oauth_required':
					$valid = ( is_bool( (bool) $value ) ) ? true : false;
					break;

				case 'password':
					$valid = ( is_string( $value ) && mb_strlen( $value ) !== 0 ) ? true : false;
					break;

				case 'oauth':
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

				case 'oauth_provider':
					$valid_providers = array( 'microsoft' );
					$valid           = in_array( $value, $valid_providers, true );
					break;

				case 'oauth_client_id':
					$valid = ( is_string( $value ) && mb_strlen( $value ) !== 0 ) ? true : false;
					break;

				case 'oauth_client_secret':
					$valid = ( is_string( $value ) && mb_strlen( $value ) !== 0 ) ? true : false;
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
									if ( ! is_int( $value[ $key ] ) ) {
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
