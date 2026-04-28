<?php
namespace BigupWeb\Forms;

/**
 * Resolves email transport (generic SMTP vs provider-specific OAuth) and effective settings for mailers.
 *
 * Provider-specific endpoints live on the OAuth provider classes (for example {@see OAuth_Provider_Microsoft}).
 * Stored option shape stays flat; this class delegates and composes values for {@see Mail_SMTP}.
 */
class Mail_Sending_Config {

	public const TRANSPORT_SMTP = 'smtp';

	/** @var string Microsoft OAuth transport id (defined on {@see OAuth_Provider_Microsoft}). */
	public const TRANSPORT_MICROSOFT_OAUTH = OAuth_Provider_Microsoft::TRANSPORT_SLUG;

	/**
	 * Resolve transport from stored settings (explicit key or legacy flags).
	 */
	public static function transport( array $settings ): string {
		if ( ! empty( $settings['transport'] ) && self::TRANSPORT_MICROSOFT_OAUTH === $settings['transport'] ) {
			return self::TRANSPORT_MICROSOFT_OAUTH;
		}
		if ( ! empty( $settings['transport'] ) && self::TRANSPORT_SMTP === $settings['transport'] ) {
			return self::TRANSPORT_SMTP;
		}

		$oauth_required = self::truthy( $settings['oauth_required'] ?? false );
		$provider       = $settings['oauth_provider'] ?? '';
		if ( $oauth_required && OAuth_Provider_Microsoft::SETTINGS_PROVIDER_KEY === $provider ) {
			return self::TRANSPORT_MICROSOFT_OAUTH;
		}

		return self::TRANSPORT_SMTP;
	}

	/**
	 * Settings row with provider-enforced SMTP endpoints when using that provider's transport.
	 *
	 * @param array<string,mixed> $settings Raw option row.
	 * @return array<string,mixed>
	 */
	public static function effective_settings( array $settings ): array {
		if ( self::TRANSPORT_MICROSOFT_OAUTH === self::transport( $settings ) ) {
			return OAuth_Provider_Microsoft::merge_effective_smtp_settings( $settings );
		}

		return $settings;
	}

	/**
	 * First arguments for {@see Mail_SMTP::send()} (through oauth token), using effective transport.
	 *
	 * @param array<string,mixed> $settings Raw option row.
	 * @return array{0:string,1:int,2:string,3:string,4:bool,5:bool,6:string,7:string,8:array}
	 */
	public static function smtp_connection_args( array $settings ): array {
		$eff   = self::effective_settings( $settings );
		$oauth = ( self::TRANSPORT_MICROSOFT_OAUTH === self::transport( $settings ) );
		$token = $eff['oauth_microsoft_token'] ?? array();
		$token = is_array( $token ) ? $token : array();

		return array(
			$eff['host'] ?? '',
			isset( $eff['port'] ) ? (int) $eff['port'] : 587,
			$eff['username'] ?? '',
			$oauth ? '' : (string) ( $eff['password'] ?? '' ),
			! empty( $eff['auth'] ),
			$oauth,
			$eff['oauth_client_id'] ?? '',
			$eff['oauth_client_secret'] ?? '',
			$token,
		);
	}

	/**
	 * @param mixed $v
	 */
	private static function truthy( $v ): bool {
		return ! empty( $v ) && ( true === $v || 1 === (int) $v );
	}
}
