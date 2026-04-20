<?php
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

	// DEBUG.
	error_log( '## admin_post_bigup_forms_connect_microsoft ##' );
	error_log( 'OAuth POST: ' . implode( ', ', $_POST ) );

	    // Security check
        if (
            ! isset( $_POST['bigup_forms_connect_microsoft_nonce'] ) ||
            ! wp_verify_nonce( $_POST['bigup_forms_connect_microsoft_nonce'], 'bigup_forms_connect_microsoft_action' )
        ) {
            wp_die( 'Security check failed' );
        }

        Settings::set( 'bigup_oauth_provider', 'microsoft' );

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


error_log('AUTH URL: ' . $provider->get_authorization_url());


        wp_redirect( $authUrl );
        exit;
    }
);

/**
 * OAuth callback handler
 */
add_action('admin_init', function () {

    // Only run if this looks like an OAuth callback
    if (
        empty($_GET['code']) ||
        empty($_GET['state'])
    ) {
        return;
    }

    // Optional: extra safety so we don't run on unrelated admin pages
    if (!is_admin()) {
        return;
    }

    // DEBUG.
    error_log('## OAuth callback via admin_init ##');
    error_log('OAuth GET: ' . implode( ', ', $_GET ));

    $user_id = get_current_user_id();

    $stored_state = get_transient('bigup_oauth_state_' . $user_id);

    // Always delete after reading (one-time use)
    delete_transient('bigup_oauth_state_' . $user_id);

    if (
        empty($stored_state) ||
        $_GET['state'] !== str_replace('bigup_', '', $stored_state)
    ) {
        wp_die('Invalid OAuth state');
    }

    if (empty($_GET['code'])) {
        wp_die('Missing authorization code');
    }

    $provider = \BigupWeb\Forms\OAuth_Manager::get_provider();

    try {
        $provider->get_access_token(
            sanitize_text_field($_GET['code'])
        );
    } catch (\Exception $e) {
        wp_die('Token exchange failed: ' . $e->getMessage());
    }

    wp_redirect(
        admin_url('options-general.php?page=bigup-settings&oauth=success')
    );

    exit;
});