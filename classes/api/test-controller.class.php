<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Test controller.
 *
 * Handle submissions from the admin settings SMTP test button.
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

class Test_Controller {

	/**
	 * Receive admin test form submissions.
	 */
	public function bigup_forms_rest_api_test_callback( WP_REST_Request $request ) {

		// Verify header Content-Type of the request is what we want to see.
		$type = $request->get_header( 'Content-Type' );
		if ( ! str_contains( $type, 'application/json' ) ) {
			HTTP_Response::send_json( array( 406, 'Test failed: Header Content-Type has an unexpected value.' ) );
			error_log( 'Bigup_Forms: bigup_forms_rest_api_test_callback expects application/json but header Content-Type ' . $type . ' received.' );
			exit;
		}

		// Verify request body looks like a test request from the client side script.
		$test_request = json_decode( $request->get_body(), true );
		if ( ! is_array( $test_request ) || ! array_key_exists( 'test', $test_request ) ) {
			HTTP_Response::send_json( array( 400, 'Test failed: The data recieved does not look like a test request.' ) );
			error_log( 'Bigup_Forms: bigup_forms_rest_api_test_callback expects request body to be an array containing a "test" key.' );
			exit;
		}

		switch ( $test_request['test'] ) {
			case 'SMTP':
				$settings = Get_Settings::smtp();
				if ( false === (bool) $settings ) {
					return array( 500, 'There was a problem retrieving your SMTP settings from the database.' );
				}
				$test_settings = new Test_Settings();
				$result        = $test_settings->smtp_connection(
					$settings['host'],
					$settings['port'],
					$settings['username'],
					$settings['password'],
					$settings['auth'],
				);
				HTTP_Response::send_json( $result );
				exit;

			default:
				HTTP_Response::send_json( array( 400, 'Test failed:. The requested test does not exist.' ) );
				error_log( 'Bigup_Forms: bigup_forms_rest_api_test_callback recieved an unknown test type.' );
				exit;
		}
	}
}
