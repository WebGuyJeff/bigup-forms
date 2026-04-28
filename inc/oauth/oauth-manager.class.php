<?php
namespace BigupWeb\Forms;

use BigupWeb\Forms\Settings;

defined( 'ABSPATH' ) || exit;

class OAuth_Manager {

    public static function get_provider() {

		$provider = Settings::get( 'oauth_provider' );

        if ( OAuth_Provider_Microsoft::SETTINGS_PROVIDER_KEY === $provider ) {
            return new OAuth_Provider_Microsoft();
        }

        return null;
    }

    public static function is_oauth_enabled() {
		$settings = Settings::get();
		if ( is_array( $settings )
			&& Mail_Sending_Config::TRANSPORT_MICROSOFT_OAUTH === Mail_Sending_Config::transport( $settings ) ) {
			return true;
		}

		$required = Settings::get( 'oauth_required' );

		return ! empty( $required ) && ( true === $required || 1 === (int) $required );
    }
}