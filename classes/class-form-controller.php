<?php
namespace Bigup\Forms;

/**
 * Bigup Forms - Submission handler.
 *
 * Handle form submissions by data validation, sanitization and response messaging before passing to
 * the mail handler.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */

// Import PHPMailer classes into the global namespace.
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader.
require BIGUPFORMS_PATH . 'vendor/autoload.php';

// WordPress Dependencies.
use WP_REST_Request;
use get_option;

class Form_Controller {

	/**
	 * Receive form submissions.
	 */
	public function bigup_forms_rest_api_callback( WP_REST_Request $request ) {

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

		// Get form file data.
		$form_files = $request->get_file_params();
		$files      = [];
		if ( array_key_exists( 'files', $form_files ) ) {
			$number_of_files = count( $form_files['files']['name'] ) - 1;
			for ( $n = 0; $n <= $number_of_files; $n++ ) {
				$files[ $n ] = [
					'name'     => $form_files['files']['name'][ $n ],
					'tmp_name' => $form_files['files']['tmp_name'][ $n ],
				];
			}
		}

		$form_data = [
			'fields' => $fields,
			'files'  => $files,
		];

		/*
		 * Validate data.
		 *
		 * No modified values are returned to front end. Only errors are returned so the user can
		 * update their entries before resubmission. This functionality was chosen to ensure all
		 * submitted data is verified by the user.
		 */
		$Validate            = new Validate();
		$validated_form_data = $Validate->form_data( $form_data );
		if ( $validated_data['has_errors'] ) {
			$this->send_json_response( [ 400, __( 'Correct errors and resubmit', 'bigup-forms' ) ], $validated_form_data );

			// Request handlers should exit() when done.
			exit;
		}

		// Mail the form entry to the site owner.
		$saved_settings   = get_option( 'bigup_forms_settings' );
		$use_local_mailer = ( ! empty( $saved_settings['use_local_mail_server'] ) && true === $saved_settings['use_local_mail_server'] );
		$mail_handler     = ( isset( $use_local_mailer ) && true === $use_local_mailer ) ? new Send_Local() : new Send_SMTP();
		$result           = $mail_handler->compose_and_send_email( $form_data );
		$this->send_json_response( $result );

		// Save the form entry to the database.
		Store_Submissions::log_form_entry( $form_data, $result );

		// Request handlers should exit() when done.
		exit;
	}


	/**
	 * Sanitise user input.
	 * 
	 * TO BE REFACTORED - SANITISATION SHOULD NOT OCCUR ON USER INPUT!!!
	 *
	 * - Performed BEFORE validation.
	 * - Returns an array with cleaned values.
	 * - Does not validate values and will return empty array keys in cases where all characters are
	 *   invalid.
	 * - Returned array is a clone of input array, plus a $modified sub-array containing an error
	 *   message, original value and sanitised value for public-safe error message output.
	 *
	 * **Input array structure**
	 *
	 * $form_data = [
	 *     'fields' => [
	 *         $name => [
	 *             'value' => <field value>,
	 *             'type'  => <html input type or 'textarea'>,
	 *         ]
	 *         ...
	 * ];
	 *
	 * **Output array structure**
	 *
	 * $form_data = [
	 *     'fields' => [
	 *         $name => [
	 *             'value'  => <sanitised field value>,
	 *             'type'   => <html input type or 'textarea'>,
	 *             'errors' => [ <Public friendly message indicating removed characters> ],
	 *         ],
	 *         ...
	 *     ]
	 *     ...
	 * ]
	 *
	 * @param array $form_data Submitted form data.
	 * @return array $form_data_sanitised Form data with cleaned values and errors.
	 */
	public function sanitise( $form_data ) {

		$sanitised_fields = [];
		$has_errors       = false;

		foreach ( $form_data['fields'] as $field => $data ) {

			$type = $data['type'];
			$old  = trim( $data['value'] );
			$new  = Sanitise::by_type( $type, $old );

			$form_data['fields'][ $field ]['value']    = $new;
			$form_data['fields'][ $field ]['errors'][] = ( $new !== $old ) ? __( 'Disallowed characters removed', 'bigup-forms' ) : '';
			if ( $new !== $old ) {
				$has_errors = true;
			}
		}

		$form_data['has_errors'] = $has_errors;

		return $form_data;
	}


	/**
	 * Validate user input.
	 *
	 * Performed AFTER sanitization.
	 * Note: Never modifies or returns values.
	 *
	 * **Input array structure**
	 *
	 * $form_data = [
	 *     'fields' => [
	 *         $name => [
	 *             'value'  => <sanitised field value>,
	 *             'type'   => <html input type or 'textarea'>,
	 *             'errors' => [ <Public friendly message indicating removed characters> ],
	 *         ],
	 *         ...
	 *     ]
	 *     ...
	 * ]
	 *
	 * **Output array structure**
	 *
	 * $form_data = [
	 *     'fields' => [
	 *         $name => [
	 *             'value'  => <sanitised field value>,
	 *             'type'   => <html input type or 'textarea'>,
	 *             'errors' => [
	 *                 <sanitisation error message>,
	 *                 <validation error message>,
	 *             ],
	 *         ],
	 *         ...
	 *     ]
	 *     ...
	 * ]
	 *
	 * @param array $form_data Sanitised form data.
	 * @return array $form_data_sanitised Sanitised form data including validation errors.
	 */
	public function validate( $form_data ) {

		foreach ( $form_data['fields'] as $field => $data ) {
			$type  = $data['type'];
			$value = $data['value'];
			$error = false;

			switch ( $type ) {

				case 'text':
					if ( 'name' === $field && ( strlen( $value ) < 2 || strlen( $value ) > 50 ) ) {
						$error = __( '2-50 characters allowed.', 'bigup-forms' );
					} elseif ( strlen( $value ) < 2 || strlen( $value ) > 100 ) {
						$error = __( '2-100 characters allowed.', 'bigup-forms' );
					}
					continue 2;

				case 'email':
					if ( ! PHPMailer::validateAddress( $value ) ) {
						$error = __( 'Invalid email address.', 'bigup-forms' );
					}
					continue 2;

				case 'textarea':
					if ( strlen( $value ) < 10 || strlen( $value ) > 3000 ) {
						$error = __( '10-3000 characters allowed.', 'bigup-forms' );
					}
					continue 2;
			}

			if ( $error ) {
				$form_data['fields'][ $field ]['errors'][] = $error;
				$form_data['has_errors']                   = true;
			}
		}

		return $form_data;
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
