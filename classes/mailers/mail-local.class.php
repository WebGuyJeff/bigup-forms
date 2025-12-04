<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - PHPMailer PHP Mail Handler.
 *
 * Handle construction of an email using values submitted via the form, and sends the email via
 * PHPMailer using mail() which must be installed on the host server. Package mail() is often
 * available on Windows and Linux, so this is a good backup when SMTP isn't an available.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader
require BIGUPFORMS_PATH . 'vendor/autoload.php';


class Mail_Local {

	/**
	 * Send an email.
	 */
	public function send(
		$to_email,
		$from_email,
		$from_name,
		$reply_name,
		$reply_email,
		$subject,
		$html_body,
		$plaintext_body,
		$attachments,
	) {

		// Check mail() exists (does not gaurantee an MTA is configured!).
		if ( ! function_exists( 'mail' ) ) {
			throw new Exception( 'mail() is not available on this server.' );
		}

		// Make sure PHP server script limit is higher than mailer timeout!
		set_time_limit( 60 );
		$mail = new PHPMailer( true );

		try {
			// Even though you're not using SMTP, PHPMailer still reports email creation errors.
			// 0 in production or 4 while debugging.
			$mail->SMTPDebug   = 0;
			$mail->Debugoutput = 'error_log';
			$mail->isMail(); // *May work on Linux and Windows servers.
			// *See https://www.php.net/manual/en/function.mail.php

			// Capture mail() errors using set_error_handler().
			$errors = array();
			set_error_handler( function ( $errno, $errstr ) use ( &$errors ) {
				$errors[] = "mail() error: $errstr";
			} );

			// Recipients.
			$mail->setFrom( $from_email, $from_name );
			$mail->addAddress( $to_email, );
			if ( isset( $reply_name ) && isset( $reply_email ) ) {
				$mail->addReplyTo( $reply_email, $reply_name );
			}

			// Content.
			$mail->isHTML( true );
			$mail->CharSet = 'UTF-8';
			$mail->Subject = $subject;
			$mail->Body    = $html_body;
			$mail->AltBody = $plaintext_body;

			// File attachments.
			if ( $attachments ) {
				foreach ( $attachments as $file ) {
					$mail->AddAttachment( $file['tmp_name'], $file['name'] );
				}
			}

			// Send mail.
			$sent = $mail->send();
			if ( $sent ) {
				return array( 200, 'Message received.' );
			} else {
				// Log errors caught using set_error_handler().
				restore_error_handler();
				if ( ! empty( $errors ) ) {
					log( implode( ' | ', $errors ) );
				}
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
