<?php
namespace BigupWeb\Forms;

/**
 * Get Settings and Validate From DB.
 *
 * Mirrors Error Monitor: {@see get()}, {@see get_or_default()}, {@see set()} for a single key,
 * {@see validate()}, and {@see email_configured()}. Bigup-specific: {@see ready()}.
 *
 * @package bigup-forms
 */

use PHPMailer\PHPMailer\PHPMailer;

require BIGUPFORMS_PATH . 'vendor/autoload.php';

class Settings {

	private const OPTION_NAME = 'bigup_forms_settings';

	/**
	 * Get plugin settings from the database.
	 *
	 * @param null|string|string[] $keys Null = all settings, string = one key, array = subset.
	 * @return array|mixed|null
	 */
	public static function get( $keys = null ) {

		$settings = get_option( self::OPTION_NAME );

		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		if ( null === $keys ) {
			return $settings;
		}

		if ( is_string( $keys ) ) {
			return isset( $settings[ $keys ] ) ? $settings[ $keys ] : null;
		}

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

	public static function get_or_default( $key, $default = null ) {
		$value = self::get( $key );

		return ( null === $value ) ? $default : $value;
	}

	/**
	 * Set a single setting (same contract as Error Monitor).
	 *
	 * @param string $key   Setting key.
	 * @param mixed  $value New value (must pass {@see validate()}).
	 * @return bool
	 */
	public static function set( $key, $value ) {

		if ( ! is_string( $key ) || '' === $key || ! isset( $value ) ) {
			return false;
		}

		$current = get_option( self::OPTION_NAME, array() );

		if ( ! is_array( $current ) ) {
			$current = array();
		}

		if ( ! self::validate( array( $key => $value ) ) ) {
			return false;
		}

		$current[ $key ] = $value;

		return update_option( self::OPTION_NAME, $current );
	}

	/**
	 * Apply transport mode and sync legacy oauth flags in one write.
	 */
	public static function apply_transport( string $transport ): bool {
		if ( ! in_array(
			$transport,
			array( Mail_Sending_Config::TRANSPORT_SMTP, Mail_Sending_Config::TRANSPORT_MICROSOFT_OAUTH ),
			true
		) ) {
			return false;
		}

		$current = get_option( self::OPTION_NAME, array() );
		if ( ! is_array( $current ) ) {
			$current = array();
		}

		$current['transport'] = $transport;

		if ( Mail_Sending_Config::TRANSPORT_MICROSOFT_OAUTH === $transport ) {
			$current['oauth_required'] = true;
			$current['oauth_provider'] = OAuth_Provider_Microsoft::SETTINGS_PROVIDER_KEY;
		} else {
			$current['oauth_required'] = false;
			$current['oauth_provider'] = 'generic';
		}

		foreach (
			array(
				'transport'      => $current['transport'],
				'oauth_required' => $current['oauth_required'],
				'oauth_provider' => $current['oauth_provider'],
			) as $k => $v
		) {
			if ( ! self::validate( array( $k => $v ) ) ) {
				return false;
			}
		}

		return update_option( self::OPTION_NAME, $current );
	}

	/**
	 * Generic SMTP completeness (Error Monitor–style check).
	 */
	public static function email_configured( $settings = array() ) {

		if ( empty( $settings ) ) {
			$settings = self::get();
		}

		if ( ! is_array( $settings ) || empty( $settings ) ) {
			return false;
		}

		$email_settings = array(
			'username',
			'password',
			'host',
			'port',
			'from_email',
			'to_email',
		);

		foreach ( $email_settings as $setting ) {
			if ( ! isset( $settings[ $setting ] ) || '' === $settings[ $setting ] ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Bigup Forms: ready to send (OAuth or password path).
	 */
	public static function ready( $settings = array() ) {

		if ( empty( $settings ) ) {
			$settings = self::get();
		}

		if ( ! is_array( $settings ) || empty( $settings ) ) {
			return false;
		}

		if ( empty( $settings['to_email'] ) || empty( $settings['from_email'] ) ) {
			return false;
		}

		$transport = Mail_Sending_Config::transport( $settings );

		if ( Mail_Sending_Config::TRANSPORT_MICROSOFT_OAUTH === $transport ) {
			if ( empty( $settings['oauth_client_id'] ) || empty( $settings['oauth_client_secret'] ) ) {
				return false;
			}
			$token = $settings['oauth_microsoft_token'] ?? array();
			if ( ! is_array( $token ) || empty( $token['refresh_token'] ) ) {
				return false;
			}
			return (bool) OAuth_Manager::get_provider();
		}

		if ( empty( $settings['username'] )
			|| empty( $settings['host'] )
			|| empty( $settings['port'] ) ) {
			return false;
		}

		if ( empty( $settings['password'] ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Validate one or more settings (invalid key name → fail).
	 *
	 * @param array<string,mixed> $settings Key => value pairs to validate.
	 */
	public static function validate( $settings ) {

		foreach ( $settings as $name => $value ) {

			$valid = true;
			switch ( $name ) {
				case 'username':
					$valid = ( is_string( $value ) && mb_strlen( $value ) < 254 );
					break;

				case 'oauth_required':
					$valid = ( $value === 0 || $value === 1 || $value === true || $value === false );
					break;

				case 'password':
					$valid = ( is_string( $value ) && mb_strlen( $value ) < 100 );
					break;

				case 'host':
					if ( ! is_string( $value ) ) {
						$valid = false;
						break;
					}
					$value = trim( $value );
					if ( filter_var( $value, FILTER_VALIDATE_IP ) ) {
						$valid = true;
						break;
					}
					$valid = (bool) preg_match(
						'/^(?=.{1,253}$)(?!-)([a-zA-Z0-9-]{1,63}\.)*[a-zA-Z0-9-]{1,63}$/',
						$value
					);
					break;

				case 'port':
					$valid_ports = array( 25, 465, 587, 2525 );
					$valid       = in_array( intval( $value ), $valid_ports, true );
					break;

				case 'auth':
				case 'use_local_mail_server':
				case 'debug':
					$valid = ( $value === 0 || $value === 1 || $value === true || $value === false );
					break;

				case 'from_email':
				case 'to_email':
					$valid = ( PHPMailer::validateAddress( $value ) );
					break;

				case 'oauth_provider':
					$valid = in_array(
						$value,
						array( OAuth_Provider_Microsoft::SETTINGS_PROVIDER_KEY, 'generic' ),
						true
					);
					break;

				case 'transport':
					$valid = in_array(
						$value,
						array(
							Mail_Sending_Config::TRANSPORT_SMTP,
							Mail_Sending_Config::TRANSPORT_MICROSOFT_OAUTH,
						),
						true
					);
					break;

				case 'smtp_encryption':
					$valid = in_array( $value, array( 'auto', 'none', 'starttls', 'ssl' ), true );
					break;

				case 'oauth_client_id':
					$valid = ( is_string( $value ) && mb_strlen( $value ) < 100 );
					break;

				case 'oauth_client_secret':
					$valid = ( is_string( $value ) && ( '' === $value || mb_strlen( $value ) > 10 ) );
					break;

				case 'oauth_microsoft_token':
					if ( is_array( $value ) && empty( $value ) ) {
						$valid = true;
						break;
					}
					$keys_and_types = array(
						'access_token'  => 'string',
						'refresh_token' => 'string',
						'expires'       => 'integer',
					);
					if ( is_array( $value ) && ! empty( $value ) ) {
						foreach ( $keys_and_types as $k => $type ) {
							if ( ! array_key_exists( $k, $value ) ) {
								$valid = false;
								break;
							}
							if ( 'string' === $type && ! is_string( $value[ $k ] ) ) {
								$valid = false;
								break;
							}
							if ( 'integer' === $type && ! is_numeric( $value[ $k ] ) ) {
								$valid = false;
								break;
							}
						}
					} else {
						$valid = false;
					}
					break;

				default:
					$valid = false;
			}

			if ( false === $valid ) {
				return false;
			}
		}

		return true;
	}
}
