<?php
namespace BigupWeb\Forms;

use BigupWeb\Forms\Settings;

defined( 'ABSPATH' ) || exit;

class OAuth_Manager {

    public static function get_provider() {

        $provider = Settings::get( 'bigup_oauth_provider' );

        if ( 'microsoft' === $provider ) {
            return new OAuth_Provider_Microsoft();
        }

        return null;
    }

    public static function is_oauth_enabled() {
        return '1' === Settings::get( 'bigup_oauth_required' );
    }
}