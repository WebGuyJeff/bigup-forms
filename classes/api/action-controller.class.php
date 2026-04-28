<?php
namespace BigupWeb\Forms;

use WP_REST_Request;
use WP_REST_Response;

/**
 * REST API controller for the admin SPA (JSON shape: ok, output, data).
 */
class Action_Controller {

	public function can_manage_options(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * @param int|string $output Message(s) for SPA toasts.
	 * @param array      $data   Extra payload.
	 */
	private function response( int $status, $output, array $data = array() ): WP_REST_Response {
		$messages = is_array( $output ) ? $output : array( (string) $output );
		return new WP_REST_Response(
			array(
				'ok'     => $status < 300,
				'output' => $messages,
				'data'   => $data,
			),
			$status
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function get_payload( WP_REST_Request $request ): array {
		$payload = $request->get_json_params();
		return is_array( $payload ) ? $payload : array();
	}

	/**
	 * Settings safe for JSON (no secrets or tokens).
	 *
	 * @param array $settings Raw option array.
	 * @return array<string, mixed>
	 */
	private function settings_for_bootstrap( array $settings ): array {
		$out = $settings;

		$out['hasPassword']           = ! empty( $out['password'] );
		$out['hasOauthClientSecret']  = ! empty( $out['oauth_client_secret'] );
		$out['hasMicrosoftToken']     = ! empty( $out['oauth_microsoft_token']['refresh_token'] );
		$out['transport']             = Mail_Sending_Config::transport( $settings );

		unset( $out['password'], $out['oauth_client_secret'], $out['oauth_microsoft_token'] );

		return $out;
	}

	public function bootstrap(): WP_REST_Response {
		$settings     = Settings::get();
		$settings     = is_array( $settings ) ? $settings : array();
		$plugin_data  = get_plugin_data( BIGUPFORMS_PATH . 'plugin-entry.php', false, true );
		$ms_token     = $settings['oauth_microsoft_token'] ?? array();
		$ms_connected = is_array( $ms_token ) && ! empty( $ms_token['refresh_token'] );

		return $this->response(
			200,
			'Bootstrap loaded.',
			array(
				'pluginData' => $plugin_data,
				'settings'   => $this->settings_for_bootstrap( $settings ),
				'status'     => array(
					'settingsOK'    => Settings::ready( $settings ),
					'msConnected'   => $ms_connected,
					'mailFunction'  => function_exists( 'mail' ),
				),
				'tabs'       => array(
					array( 'slug' => 'overview', 'title' => 'Overview' ),
					array( 'slug' => 'email', 'title' => 'Email' ),
					array( 'slug' => 'advanced', 'title' => 'Advanced' ),
				),
				'oauth'      => array(
					'connectPostUrl'   => admin_url( 'admin-post.php' ),
					'connectAction'    => 'bigup_forms_connect_microsoft',
					'connectNonceName' => 'bigup_forms_connect_microsoft_nonce',
					'connectNonce'     => wp_create_nonce( 'bigup_forms_connect_microsoft_action' ),
					'azurePortalUrl'   => 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
					'redirectUri'      => admin_url( 'admin-post.php' ),
				),
			)
		);
	}

	public function update_setting( WP_REST_Request $request ): WP_REST_Response {
		$payload = $this->get_payload( $request );
		$key     = isset( $payload['key'] ) ? sanitize_text_field( (string) $payload['key'] ) : '';
		$value   = $payload['value'] ?? null;

		if ( ! $key ) {
			return $this->response( 400, 'Invalid setting key.' );
		}

		$sanitized = Settings_REST_Sanitize::value( $key, $value );
		if ( null === $sanitized ) {
			return $this->response( 400, 'Invalid value or unknown setting key.', array( 'field' => $key ) );
		}

		if ( ( 'password' === $key || 'oauth_client_secret' === $key ) && '' === $sanitized ) {
			return $this->response( 200, 'Unchanged.', array() );
		}

		if ( ! Settings::validate( array( $key => $sanitized ) ) ) {
			return $this->response( 400, 'Invalid value', array( 'field' => $key ) );
		}

		if ( 'transport' === $key ) {
			$ok = Settings::apply_transport( (string) $sanitized );
		} else {
			$ok = Settings::set( $key, $sanitized );
		}
		if ( ! $ok ) {
			return $this->response( 400, 'Could not save setting.', array( 'field' => $key ) );
		}

		return $this->response( 200, 'Setting updated.' );
	}

	/**
	 * Clear Microsoft tokens and switch transport back to SMTP password mode.
	 */
	public function oauth_disconnect( WP_REST_Request $request ): WP_REST_Response {
		unset( $request );

		if ( ! Settings::validate( array( 'oauth_microsoft_token' => array() ) ) ) {
			return $this->response( 400, 'Could not clear OAuth token.' );
		}

		if ( ! Settings::set( 'oauth_microsoft_token', array() ) ) {
			return $this->response( 400, 'Could not clear OAuth token.' );
		}

		if ( ! Settings::apply_transport( Mail_Sending_Config::TRANSPORT_SMTP ) ) {
			return $this->response( 400, 'Could not update transport mode.' );
		}

		return $this->response( 200, 'Microsoft account disconnected.' );
	}

	public function test( WP_REST_Request $request ): WP_REST_Response {
		$payload = $this->get_payload( $request );
		$type    = isset( $payload['type'] ) ? sanitize_text_field( (string) $payload['type'] ) : '';

		if ( ! in_array( $type, array( 'smtp', 'email' ), true ) ) {
			return $this->response( 400, 'Test failed: The action requested was not possible.' );
		}

		$settings = Settings::get();
		if ( ! is_array( $settings ) || empty( $settings ) ) {
			return $this->response( 500, 'There was a problem retrieving your SMTP settings from the database.' );
		}

		if ( ! Settings::ready( $settings ) ) {
			return $this->response( 500, 'Email settings must be configured before performing this action.' );
		}

		$test_account = new Test_Account();

		if ( 'smtp' === $type ) {
			$result   = $test_account->smtp_connection_from_settings( $settings );
			$status   = isset( $result[0] ) ? (int) $result[0] : 500;
			$messages = isset( $result[1] ) ? $result[1] : 'Unknown response.';
			$summary  = $status < 300 ? 'SMTP test complete.' : 'SMTP test failed.';
			$lines    = is_array( $messages ) ? $messages : array( (string) $messages );

			return $this->response( $status, $summary, $lines );
		}

		$result   = $test_account->send_test_email_from_settings( $settings );
		$status   = isset( $result[0] ) ? (int) $result[0] : 500;
		$message  = isset( $result[1] ) ? (string) $result[1] : 'Unknown response.';
		$summary  = $status < 300 ? 'Test email sent.' : 'Test email failed.';

		return $this->response( $status, $summary, array( $message ) );
	}
}
