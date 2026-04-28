<?php
use BigupWeb\Forms\Mail_Sending_Config;
use BigupWeb\Forms\OAuth_Manager;
use BigupWeb\Forms\OAuth_Provider_Microsoft;
use BigupWeb\Forms\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Connect Microsoft button handler
 */
add_action(
    'admin_post_bigup_forms_connect_microsoft',
    function () {

	    // Security check
        if (
            ! isset( $_POST['bigup_forms_connect_microsoft_nonce'] ) ||
            ! wp_verify_nonce( $_POST['bigup_forms_connect_microsoft_nonce'], 'bigup_forms_connect_microsoft_action' )
        ) {
            wp_die( 'Security check failed' );
        }

		Settings::apply_transport( Mail_Sending_Config::TRANSPORT_MICROSOFT_OAUTH );

        $provider = new OAuth_Provider_Microsoft();

		$authUrl = $provider->get_authorization_url();

		// Get the generated state from provider
        $state = $provider->get_provider_instance()->getState();

        // Store state in transient (10 min expiry is typical)
        set_transient(
            'bigup_oauth_state_' . get_current_user_id(),
            'bigup_' . $state,
            10 * MINUTE_IN_SECONDS
        );


        wp_redirect( $authUrl );
        exit;
    }
);

/**
 * OAuth callback handler
 */
add_action(
	'admin_init',
	function () {

		if ( ! is_admin() ) {
			return;
		}

		if ( empty( $_GET['code'] ) || empty( $_GET['state'] ) ) {
			return;
		}

		$user_id = get_current_user_id();

		$transient_key = 'bigup_oauth_state_' . $user_id;
		$stored_state  = get_transient( $transient_key );

		// No pending Bigup OAuth handshake — ignore (other plugins may use ?code=).
		if ( empty( $stored_state ) ) {
			return;
		}

		if ( $_GET['state'] !== str_replace( 'bigup_', '', $stored_state ) ) {
			delete_transient( $transient_key );
			wp_die( 'Invalid OAuth state' );
		}

		delete_transient( $transient_key );

		$provider = OAuth_Manager::get_provider();

		if ( ! $provider ) {
			wp_die( 'Microsoft OAuth is not configured.' );
		}

		try {
			$provider->get_access_token(
				sanitize_text_field( wp_unslash( $_GET['code'] ) )
			);
		} catch ( \Exception $e ) {
			wp_die( esc_html( 'Token exchange failed: ' . $e->getMessage() ) );
		}

		wp_redirect( admin_url( 'admin.php?page=bigup-web-forms&oauth=success' ) );
		exit;
	}
);