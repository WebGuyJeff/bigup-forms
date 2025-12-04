<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Store controller.
 *
 * Handle form saves and updates.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
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
			HTTP_Response::send_json( array( 405, 'Unexpected payload content-type' ) );
			exit; // Request handlers should exit() when done.
		}

		// Get REST data.
		$form_data = $request->get_body_params();
		$form_id   = $form_data['id'];
		$form_name = $form_data['name'];
		$content   = $form_data['content'];
		$tags      = array_key_exists( 'tags', $form_data ) ? $form_data['tags'] : array();

		// Save the form.
		$result = CPT_Form::save(
			$form_id,
			$form_name,
			$content,
			$tags
		);

		HTTP_Response::send_json( ( $result ) ? 200 : 500, $result );
		exit; // Request handlers should exit() when done.
	}
}
