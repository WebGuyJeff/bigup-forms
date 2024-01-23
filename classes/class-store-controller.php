<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Store controller.
 *
 * Handle form saves and updates.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */

// WordPress Dependencies.
use WP_REST_Request;
use get_option;

class Store_Controller {

	/**
	 * Receive form store API requests.
	 */
	public function bigup_forms_rest_api_store_callback( WP_REST_Request $request ) {

		// Check header is multipart/form-data.
		if ( ! str_contains( $request->get_header( 'Content-Type' ), 'multipart/form-data' ) ) {
			$this->send_json_response( array( 405, 'Unexpected payload content-type' ) );
			exit; // Request handlers should exit() when done.
		}

		// Get REST data.
		$form_data = $request->get_body_params();
		$form_id   = array_key_exists( 'id', $form_data ) ? $form_data['id'] : 0;
		$content   = $form_data['content'];
		$name      = $form_data['name'];
		$tags      = $form_data['tags'];

		// https://code.tutsplus.com/posting-via-the-front-end-inserting--wp-27034t

		// https://webkul.com/blog/add-custom-rest-api-route-wordpress/#:~:text=Registering%20a%20Custom%20Rest%20Route,callback%20function%20to%20action%20rest_api_init.

		$result = Store_Forms::save( $form_id, $content, $name, $tags );
		$this->send_json_response( ( $result ) ? 200 : 500, $result );
		exit; // Request handlers should exit() when done.
	}


	/**
	 * Send JSON response to client.
	 *
	 * Sets the response header to the passed http status code and a
	 * response body containing an array of status code, status text
	 * and human-readable description of the status or error.
	 *
	 * @param array $info: [ int(http-code), str(human readable message) ].
	 */
	private function send_json_response( $status, $form_id ) {

		// Ensure response headers haven't already sent to browser.
		if ( ! headers_sent() ) {
			header( 'Content-Type: application/json; charset=utf-8' );
			status_header( $status );
		}

		$response = [
			'ok' => ( $status < 300 ) ? true : false,
			'id' => $form_id,
		];

		echo wp_json_encode( $response );
	}
}
