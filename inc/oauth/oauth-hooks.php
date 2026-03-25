<?php
use BigupWeb\Forms\OAuth_Manager;
use BigupWeb\Forms\OAuth_Provider_Microsoft;
use BigupWeb\Forms\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Connect Microsoft button handler
 */
add_action(
    'admin_post_bigup_connect_microsoft',
    function () {

        Settings::set( 'bigup_oauth_provider', 'microsoft' );

        $provider = new OAuth_Provider_Microsoft();

        wp_redirect( $provider->get_authorization_url() );
        exit;
    }
);

/**
 * OAuth callback handler
 */
add_action(
    'admin_post_bigup_oauth_callback',
    function () {

        if ( empty( $_GET['code'] ) ) {
            wp_die( 'OAuth failed.' );
        }

        $provider = OAuth_Manager::get_provider();

        $provider->get_access_token(
            sanitize_text_field( $_GET['code'] )
        );

        wp_redirect(
            admin_url( 'options-general.php?page=bigup-settings&oauth=success' )
        );

        exit;
    }
);