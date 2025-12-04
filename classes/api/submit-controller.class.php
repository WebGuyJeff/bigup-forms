<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Submission controller.
 *
 * Handle form submissions, response messaging and passing of data to the mailer.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// WordPress Dependencies.
use WP_REST_Request;
use function get_bloginfo;
use function wp_parse_url;

class Submit_Controller {

	/**
	 * Controller log.
	 */
	private $log = '';

	/**
	 * Receive form submissions.
	 */
	public function bigup_forms_rest_api_submit_callback( WP_REST_Request $request ) {

		// Check header is multipart/form-data.
		if ( ! str_contains( $request->get_header( 'Content-Type' ), 'multipart/form-data' ) ) {
			HTTP_Response::send_json( array( 405, 'Sending your message failed due to a malformed request from your browser' ) );

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
			HTTP_Response::send_json( array( 400, __( 'Please correct your input and try again', 'bigup-forms' ) ), $validated_form_data );

			// Request handlers should exit() when done.
			exit;
		}

		// Send the email.
		$result = $this->send_email( $form_data );

		// Respond to client.
		HTTP_Response::send_json( $result );

		// Save the form entry to the database.
		CPT_Form_Entry::log_form_entry( $form_data, $result, $this->log );

		// Request handlers should exit() when done.
		exit;
	}


	/**
	 * Send the email.
	 */
	public function send_email( $form_data ) {

		$smtp_settings  = Get_Settings::smtp();
		$local_settings = Get_Settings::local_mail_server();

		$this->log .= date("Y-m-d H:i:s") . ' SMTP settings ' . ( $smtp_settings ? 'OK.' . "\n" : 'Invalid.' . "\n" );
		$this->log .= date("Y-m-d H:i:s") . ' Local mailer settings ' . ( $local_settings ? 'OK.' . "\n" : 'Invalid.' . "\n" );

		if ( ! $smtp_settings && ! $local_settings ) {
			$this->log .= date("Y-m-d H:i:s") . ' ERROR: No mail service configured.' . "\n";
			return array( 503, 'Sending your message failed as no mail service has been configured' );
		}

		$fields  = $form_data['fields'];
		$compose = new Compose_Email_Body( $form_data );

		$domain         = wp_parse_url( html_entity_decode( get_bloginfo( 'url' ) ), PHP_URL_HOST );
		$from_name      = get_bloginfo( 'name' );
		$reply_name     = isset( $fields['name'] ) ? $fields['name']['value'] : $from_name;
		$reply_email    = isset( $fields['email'] ) ? $fields['email']['value'] : $this->smtp_settings['from_email'];
		$subject        = 'New ' . strtolower( $form_data['form']['name'] ) . ' form submission from ' . $domain;
		$html_body      = $compose->html();
		$plaintext_body = $compose->plaintext();
		$attachments    = isset( $form_data['files'] ) ? $form_data['files'] : false;

		// Try send using SMTP.
		if ( $smtp_settings ) {
			$this->log .= date("Y-m-d H:i:s") . ' Attempt SMTP mail.' . "\n";

			$mailer                    = new Mail_SMTP();
			$result                    = $mailer->send(
				$host                  = $smtp_settings['host'],
				$port                  = $smtp_settings['port'],
				$username              = $smtp_settings['username'],
				$password              = $smtp_settings['password'],
				$use_auth              = $smtp_settings['auth'],
				$use_local_mail_server = $smtp_settings['use_local_mail_server'],
				$to_email              = $smtp_settings['to_email'],
				$from_email            = $smtp_settings['from_email'],
				$from_name,
				$reply_name,
				$reply_email,
				$subject,
				$html_body,
				$plaintext_body,
				$attachments,
				$domain,
			);
			if ( 200 !== $result[0] ) {
				$this->log .= date("Y-m-d H:i:s") . ' SMTP mailer reported: "' . $result[1] . "\n";
				error_log( 'Bigup Forms: SMTP mailer reported: "' . $result[1] . '"' );
			}
		}

		// If SMTP fails and local mail is enabled, try send using PHP mail.
		if ( 200 !== $result[0] && $local_settings && $local_settings['use_local_mail_server'] && function_exists( 'mail' ) ) {
			$this->log .= date( "Y-m-d H:i:s" ) . ' Attempt local mail.' . "\n";

			$mailer         = new Mail_Local();
			$result         = $mailer->send(
				$to_email   = $local_settings['to_email'],
				$from_email = $local_settings['from_email'],
				$from_name,
				$reply_name,
				$reply_email,
				$subject,
				$html_body,
				$plaintext_body,
				$attachments,
			);
			if ( 200 !== $result[0] ) {
				$this->log .= date("Y-m-d H:i:s") . ' Local mailer reported: "' . $result[1] . "\n";
				error_log( 'Bigup Forms: Local mailer reported: "' . $result[1] . '"' );
			}
		}

		$this->log .= date("Y-m-d H:i:s") . ' send_email() result: "' . $result[1] . "\n";
		return $result;
	}
}
