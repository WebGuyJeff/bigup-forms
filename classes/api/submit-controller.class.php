<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Submission controller.
 *
 * Handle form submissions, response messaging and passing of data to the mailer.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
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

class Submit_Controller {

	/**
	 * Receive form submissions.
	 */
	public function bigup_forms_rest_api_submit_callback( WP_REST_Request $request ) {

		// Check header is multipart/form-data.
		if ( ! str_contains( $request->get_header( 'Content-Type' ), 'multipart/form-data' ) ) {
			$this->send_json_response( array( 405, 'Sending your message failed due to a malformed request from your browser' ) );

			// Request handlers should exit() when done.
			exit;
		}

		// Patch for classic (non-Gutenberg) forms.
		$classic_form_formats = array(
			'name'    => 'human_name',
			'email'   => 'email_non_rfc',
			'message' => 'message_text_legacy',
		);

		// Get and sort text data between fields and form.
		$body_params = $request->get_body_params();
		$fields      = array();
		$form        = array();
		foreach ( $body_params as $name => $json_data ) {
			$data = json_decode( $json_data, true );
			if ( 'formMeta' === $name ) {
				$form = array(
					'name' => $data['name'],
					'id'   => $data['id'],
				);
			} else {
				$fields[ $name ] = array(
					'value'  => $data['value'],
					'type'   => $data['type'],
					'format' => $classic_form_formats[ $name ],
				);
			}
		}

		// Get file data.
		$file_params = $request->get_file_params();
		$files       = array();
		if ( array_key_exists( 'files', $file_params ) ) {
			$number_of_files = count( $file_params['files']['name'] ) - 1;
			for ( $n = 0; $n <= $number_of_files; $n++ ) {
				$files[ $n ] = array(
					'name'     => $file_params['files']['name'][ $n ],
					'tmp_name' => $file_params['files']['tmp_name'][ $n ],
				);
			}
		}

		$form_data = array(
			'form'   => $form,
			'fields' => $fields,
			'files'  => $files,
		);

		/*
		 * Validate data.
		 *
		 * No modified values are returned to front end. Only errors are returned so the user can
		 * update their entries before resubmission. This functionality was chosen to ensure all
		 * submitted data is verified by the user.
		 */
		$Validate            = new Validate();
		$validated_form_data = $Validate->form_data( $form_data );
		if ( $validated_form_data['has_errors'] ) {
			$this->send_json_response( array( 400, __( 'Please correct your input and try again', 'bigup-forms' ) ), $validated_form_data );

			// Request handlers should exit() when done.
			exit;
		}

		// Mail the form entry to the site owner.
		$saved_settings   = get_option( 'bigup_forms_settings' );
		$use_local_mailer = ( ! empty( $saved_settings['use_local_mail_server'] ) && true === $saved_settings['use_local_mail_server'] );
		$mail_handler     = ( isset( $use_local_mailer ) && true === $use_local_mailer ) ? new Send_Local() : new Send_SMTP();
		$result           = $mail_handler->compose_and_send_email( $form_data );
		$this->send_json_response( $result );

		if ( 'test' !== $form_data['form']['name'] ) {
			// Save the form entry to the database.
			CPT_Form_Entry::log_form_entry( $form_data, $result );
		}

		// Request handlers should exit() when done.
		exit;
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
	private function send_json_response( $status, $form_data = array() ) {

		if ( ! is_array( $status ) ) {
			error_log( 'Bigup_Forms: send_json_response expects array but ' . gettype( $status ) . ' received.' );
			$status = array( 500, 'Sending your message failed due to an unexpected error.' );
		}

		// Ensure response headers haven't already sent to browser.
		if ( ! headers_sent() ) {
			header( 'Content-Type: application/json; charset=utf-8' );
			status_header( $status[0] );
		}

		// Create response body.
		$response['ok']       = ( $status[0] < 300 ) ? true : false;
		$response['output']   = $status[1];
		$response['formData'] = $form_data;

		// PHPMailer debug ($mail->SMTPDebug) gets dumped to output buffer
		// and breaks JSON response. Using ob_clean() before output prevents this.
		ob_clean();
		echo wp_json_encode( $response );
	}
}
