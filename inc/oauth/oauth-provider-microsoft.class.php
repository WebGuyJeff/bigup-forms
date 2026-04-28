<?php
namespace BigupWeb\Forms;

use BigupWeb\Forms\Settings;
use TheNetworg\OAuth2\Client\Provider\Azure;

defined( 'ABSPATH' ) || exit;

class OAuth_Provider_Microsoft implements OAuth_Provider_Interface {

	/**
	 * Value stored in settings `oauth_provider` when this integration is active.
	 */
	public const SETTINGS_PROVIDER_KEY = 'microsoft';

	/**
	 * Value stored in settings `transport` for Microsoft mailbox OAuth (XOAUTH2) delivery.
	 */
	public const TRANSPORT_SLUG = 'microsoft_oauth';

	/**
	 * Microsoft SMTP submission host for OAuth / client mail (Outlook.com, Microsoft 365 consumer).
	 *
	 * @link https://support.microsoft.com/office/outlook-com-smtp-settings
	 */
	public const OUTBOUND_SMTP_HOST = 'smtp-mail.outlook.com';

	public const OUTBOUND_SMTP_PORT = 587;

	private $provider;

	private $option_key = 'oauth_microsoft_token';

	/**
	 * Apply host, port, OAuth flags, and mailbox username for Microsoft outbound SMTP.
	 *
	 * @param array<string,mixed> $settings Raw plugin settings row.
	 * @return array<string,mixed>
	 */
	public static function merge_effective_smtp_settings( array $settings ): array {
		$out                   = $settings;
		$out['host']           = self::OUTBOUND_SMTP_HOST;
		$out['port']           = self::OUTBOUND_SMTP_PORT;
		$out['oauth_required'] = true;
		$out['oauth_provider'] = self::SETTINGS_PROVIDER_KEY;

		$provider = OAuth_Manager::get_provider();
		if ( $provider instanceof OAuth_Provider_Interface ) {
			$out['username'] = $provider->get_email();
		}

		return $out;
	}

    public function __construct() {

		$clientId     = Settings::get( 'oauth_client_id' );
		$clientSecret = Settings::get( 'oauth_client_secret' );

		$valid = Settings::validate( array(
			'oauth_client_id'     => $clientId,
			'oauth_client_secret' => $clientSecret,
		) );

		if ( ! $valid ) {
			wp_die( 'Invalid OAuth settings.' );
		}

        $this->provider = new Azure(
            array(
                'clientId'               => $clientId,
                'clientSecret'           => $clientSecret,
                'redirectUri'            => admin_url('admin-post.php'),
                'tenant'                 => 'common',
				'defaultEndPointVersion' => '2.0',
            )
        );
    }

    public function get_authorization_url() {

        return $this->provider->getAuthorizationUrl(
            array(
                'scope' => array(
					'openid',
					'profile',
					'offline_access',
					'https://graph.microsoft.com/User.Read',
                    'https://graph.microsoft.com/Mail.Send',
					'https://outlook.office365.com/SMTP.Send',
                ),
				'prompt' => 'consent',
            )
        );
    }

    public function get_access_token( $code ) {

        $token = $this->provider->getAccessToken(
            'authorization_code',
            array( 'code' => $code )
        );

        $this->store_token( $token );

        return $token;
    }

    public function refresh_access_token( $refresh_token ) {

        $token = $this->provider->getAccessToken(
            'refresh_token',
            array( 'refresh_token' => $refresh_token )
        );

        $this->store_token( $token );

        return $token;
    }

    private function store_token( $token ) {

		Settings::set(
			$this->option_key,
			array(
				'access_token'  => $token->getToken(),
				'refresh_token' => $token->getRefreshToken(),
				'expires'       => (int) $token->getExpires(),
			)
		);

		try {
			$owner = $this->provider->getResourceOwner( $token );
			$email = method_exists( $owner, 'getEmail' ) ? $owner->getEmail() : null;
			if ( empty( $email ) && method_exists( $owner, 'getUpn' ) ) {
				$email = $owner->getUpn();
			}
			if ( is_string( $email ) && '' !== $email ) {
				Settings::set( 'username', $email );
			}
		} catch ( \Exception $e ) {
			// Username may already be set; mail will still work if it matches the mailbox.
		}

		Settings::apply_transport( self::TRANSPORT_SLUG );
    }

    public function get_access_token_string() {

        $data = Settings::get( $this->option_key );

        if ( empty( $data ) ) {
            return null;
        }

        if ( $data['expires'] < time() ) {
            $token = $this->refresh_access_token( $data['refresh_token'] );
            return $token->getToken();
        }

        return $data['access_token'];
    }

    public function get_email() {
        return Settings::get( 'username' );
    }

    public function get_provider_instance() {
        return $this->provider;
    }
}