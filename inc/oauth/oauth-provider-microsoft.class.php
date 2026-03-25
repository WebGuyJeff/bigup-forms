<?php
namespace BigupWeb\Forms;

use BigupWeb\Forms\Settings;
use TheNetworg\OAuth2\Client\Provider\Azure;

defined( 'ABSPATH' ) || exit;

class OAuth_Provider_Microsoft implements OAuth_Provider_Interface {

    private $provider;

    private $option_key = 'oauth_microsoft_token';

    public function __construct() {

        $this->provider = new Azure(
            array(
                'clientId'     => Settings::get( 'bigup_oauth_client_id' ),
                'clientSecret' => Settings::get( 'bigup_oauth_client_secret' ),
                'redirectUri'  => admin_url( 'admin-post.php?action=bigup_oauth_callback' ),
                'tenant'       => 'common',
            )
        );
    }

    public function get_authorization_url() {

        return $this->provider->getAuthorizationUrl(
            array(
                'scope' => array(
                    'offline_access',
                    'https://outlook.office.com/SMTP.Send',
                ),
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
                'expires'       => $token->getExpires(),
            )
        );
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