<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - PHPMailer Handler.
 *
 * This template handles the construction of the email using values submitted
 * via the form, and sends the email via PHPMailer using mail() which must
 * be installed on the host server. Package mail() is often available on Windows
 * and Linux, so this is a good backup when SMTP isn't an available.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// WordPress Dependencies
use function get_bloginfo;
use function wp_strip_all_tags;
use function plugin_dir_path;
use function get_site_url;

// Load Composer's autoloader
require BIGUPFORMS_PATH . 'vendor/autoload.php';


class Send_Local {

	/**
	 * Hold the settings retrieved from the database.
	 */
	private $settings;

	/**
	 * A checkable boolean to indicate settings are valid and this class is ok to run.
	 */
	public $settings_ok;

	/**
	 * Init the class by grabbing the saved options.
	 *
	 * Prepares SMTP settings and form data to pass to compose_email.
	 * Form data is passed by handler.
	 */
	public function __construct() {

		$this->settings = Get_Settings::local_mail_server();
		if ( true === ! ! $this->settings ) {
			$this->settings_ok = true;
		}
	}


	/**
	 * Compose and send an email.
	 */
	public function compose_and_send_email( $form_data ) {

		// Check mail() exists (does not gaurantee an MTA is configured!).
		if ( ! function_exists( 'mail' ) ) {
			throw new Exception( 'Function "mail" is not available on this server.' );
		}

		$form   = $form_data['form'];
		$fields = $form_data['fields'];

		$use_local_mail_server = $this->settings['use_local_mail_server'];
		$from_email            = $this->settings['from_email'];
		$to_email              = $this->settings['to_email'];

		$form_name = strtolower( $form['name'] );
		$site_url  = html_entity_decode( get_bloginfo( 'url' ) );
		$domain    = wp_parse_url( $site_url, PHP_URL_HOST );
		$site_name = html_entity_decode( get_bloginfo( 'name' ) );
		$from_name = $site_name ? $site_name : 'Bigup Forms';
		$subject   = 'New ' . $form_name . ' form submission from ' . $domain;
		$name      = isset( $fields['fields']['name'] ) ? $fields['fields']['name']['value'] : 'Anonymous user';
		$email     = isset( $fields['fields']['email'] ) ? $fields['fields']['email']['value'] : null;

		// Build plain text email body.
		$plaintext_fields_output = "\n\n";
		foreach ( $fields as $name => $data ) {
			$plaintext_fields_output .= ucfirst( str_replace( '-', ' ', $name ) ) . ': ' . $data['value'] . "\n";
		}
		$plaintext_fields_output .= "\n\n";
		$plaintext                = <<<PLAIN
			This was submitted via the {$form_name} form at {$site_url}.
			{$plaintext_fields_output}
			You are viewing the plaintext version of this email because you have
			disallowed HTML content in your email client. To view this and any future
			messages from this sender in complete HTML formatting, try adding the sender
			domain to your spam filter whitelist.
		PLAIN;
		$plaintext_cleaned        = wp_strip_all_tags( $plaintext );

		// Build HTML email body.
		$html = Util::include_with_vars(
			BIGUPFORMS_PATH . 'parts/email.php',
			array(
				$form_name,
				$site_url,
				$fields,
			),
		);

		// Make sure PHP server script limit is higher than mailer timeout!
		set_time_limit( 60 );

		try {

			$mail              = new PHPMailer( true );
			$mail->Debugoutput = 'error_log'; // How to handle debug output
			// $mail->IsSendmail();           // Use the sendmail MTA.
			$mail->isMail();                  // *May work on Linux and Windows servers.

			// *See https://www.php.net/manual/en/function.mail.php

			// Recipients.
			$mail->setFrom( $from_email, $from_name ); // Use fixed and owned address to pass SPF checks.
			$mail->addAddress( $to_email, );
			if ( isset( $name ) && isset( $email ) ) {
				$mail->addReplyTo( $email, $name );
			}

			// Content.
			$mail->isHTML( true );
			$mail->CharSet = 'UTF-8';
			$mail->Subject = $subject;
			$mail->Body    = $html;
			$mail->AltBody = $plaintext_cleaned;

			// File attachments.
			if ( array_key_exists( 'files', $form_data ) ) {
				foreach ( $form_data['files'] as $file ) {
					$mail->AddAttachment( $file['tmp_name'], $file['name'] );
				}
			}

			// Send mail.
			$sent = $mail->send();
			if ( $sent ) {
				return array( 200, 'Message sent successfully.' );
			} else {
				throw new Exception( 'Local mail server send failed.' );
			}
		} catch ( Exception $e ) {

			// PHPMailer exceptions are not public-safe - Send to logs.
			error_log( 'Bigup_Forms: ' . $mail->ErrorInfo );
			// Generic public error.
			return array( 500, 'Sending your message failed due to a webserver configuration error.' );
		}
	}
}
