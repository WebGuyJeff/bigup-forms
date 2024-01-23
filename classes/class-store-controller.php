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
			$this->send_json_response( [ 405, 'Sending your message failed due to a malformed request from your browser' ] );

			// Request handlers should exit() when done.
			exit;
		}

		// Get form text data.
		$form_fields = $request->get_body_params();
		$fields      = [];
		foreach ( $form_fields as $name => $json_field ) {
			$field           = json_decode( $json_field, true );
			$fields[ $name ] = array(
				'type'   => $field['type'],
				'value'  => $field['value'],
				'format' => $field['format'],
			);
		}


		// https://code.tutsplus.com/posting-via-the-front-end-inserting--wp-27034t

		// https://webkul.com/blog/add-custom-rest-api-route-wordpress/#:~:text=Registering%20a%20Custom%20Rest%20Route,callback%20function%20to%20action%20rest_api_init.


		Store_Forms::save( $data, $id );
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
	private function send_json_response( $status, $fields = [] ) {

		if ( ! is_array( $status ) ) {
			error_log( 'Bigup_Forms: send_json_response expects array but ' . gettype( $status ) . ' received.' );
			$status = [ 500, 'Sending your message failed due to an unexpected error.' ];
		}

		// Ensure response headers haven't already sent to browser.
		if ( ! headers_sent() ) {
			header( 'Content-Type: application/json; charset=utf-8' );
			status_header( $status[0] );
		}

		// Create response body.
		$response['ok']     = ( $status[0] < 300 ) ? true : false;
		$response['output'] = $status[1];
		$response['fields'] = $fields;

		// PHPMailer debug ($mail->SMTPDebug) gets dumped to output buffer
		// and breaks JSON response. Using ob_clean() before output prevents this.
		ob_clean();
		echo wp_json_encode( $response );
	}
}
