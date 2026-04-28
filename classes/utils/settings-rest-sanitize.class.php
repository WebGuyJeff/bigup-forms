<?php
namespace BigupWeb\Forms;

/**
 * Sanitize a single setting key/value for REST updates.
 */
class Settings_REST_Sanitize {

	/**
	 * Keys allowed to be updated via the admin REST API.
	 */
	private const ALLOWED_KEYS = array(
		'oauth_client_id',
		'oauth_client_secret',
		'username',
		'oauth_required',
		'password',
		'host',
		'port',
		'auth',
		'use_local_mail_server',
		'to_email',
		'from_email',
		'debug',
		'oauth_provider',
		'transport',
		'smtp_encryption',
	);

	/**
	 * @param string $key   Setting key.
	 * @param mixed  $value Raw value from JSON.
	 * @return mixed Sanitized value, or null if the key is not allowed or value is invalid.
	 */
	public static function value( string $key, $value ) {
		if ( ! in_array( $key, self::ALLOWED_KEYS, true ) ) {
			return null;
		}

		switch ( $key ) {
			case 'oauth_client_id':
				return is_string( $value ) ? sanitize_text_field( $value ) : null;

			case 'oauth_client_secret':
				return is_string( $value ) ? trim( $value ) : null;

			case 'username':
				return is_string( $value ) ? sanitize_text_field( $value ) : null;

			case 'oauth_required':
			case 'auth':
			case 'use_local_mail_server':
			case 'debug':
				return self::to_bool( $value );

			case 'password':
				return is_string( $value ) ? trim( $value ) : null;

			case 'host':
				return self::sanitize_host( $value );

			case 'port':
				return self::sanitize_port( $value );

			case 'to_email':
			case 'from_email':
				return is_string( $value ) ? sanitize_email( $value ) : null;

			case 'oauth_provider':
				if ( ! is_string( $value ) ) {
					return null;
				}
				$v = sanitize_text_field( $value );
				return in_array(
					$v,
					array( OAuth_Provider_Microsoft::SETTINGS_PROVIDER_KEY, 'generic' ),
					true
				) ? $v : null;

			case 'transport':
				if ( ! is_string( $value ) ) {
					return null;
				}
				$v = sanitize_text_field( $value );
				return in_array(
					$v,
					array(
						Mail_Sending_Config::TRANSPORT_SMTP,
						Mail_Sending_Config::TRANSPORT_MICROSOFT_OAUTH,
					),
					true
				) ? $v : null;

			case 'smtp_encryption':
				if ( ! is_string( $value ) ) {
					return null;
				}
				$v = sanitize_text_field( strtolower( $value ) );
				return in_array( $v, array( 'auto', 'none', 'starttls', 'ssl' ), true ) ? $v : null;

			default:
				return null;
		}
	}

	/**
	 * @return bool|null
	 */
	private static function to_bool( $value ) {
		if ( is_bool( $value ) ) {
			return $value;
		}
		if ( is_int( $value ) ) {
			return 0 !== $value;
		}
		if ( is_string( $value ) ) {
			$v = strtolower( trim( $value ) );
			if ( in_array( $v, array( '1', 'true', 'yes', 'on' ), true ) ) {
				return true;
			}
			if ( in_array( $v, array( '0', 'false', 'no', 'off', '' ), true ) ) {
				return false;
			}
		}
		return null;
	}

	/**
	 * @param mixed $domain
	 * @return string
	 */
	private static function sanitize_host( $domain ) {
		if ( ! is_string( $domain ) ) {
			return '';
		}
		$domain = trim( $domain );
		if ( '' === $domain || null === $domain ) {
			return '';
		}
		$ip = gethostbyname( $domain );
		$ip = filter_var( $ip, FILTER_VALIDATE_IP );
		return $ip ? $domain : 'INVALID DOMAIN';
	}

	/**
	 * @param mixed $port
	 * @return int|string Empty string if invalid.
	 */
	private static function sanitize_port( $port ) {
		$port_int    = intval( $port );
		$valid_ports = array( 25, 465, 587, 2525 );
		return in_array( $port_int, $valid_ports, true ) ? $port_int : '';
	}
}
