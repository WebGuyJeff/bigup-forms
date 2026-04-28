<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - PHPMailer SMTP Mail Handler.
 *
 * Handle the construction of an email using values submitted via the form, and sends the email via
 * PHPMailer using the SMTP account configured by the user.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// Import PHPMailer classes into the global namespace.
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader.
require BIGUPFORMS_PATH . 'vendor/autoload.php';

class Mail_SMTP {

	/**
	 * Send an email.
	 */
	public function send(
		$host,
		$port,
		$username,
		$password,
		$use_auth,
		$oauth_required,
		$oauth_client_id,
		$oauth_client_secret,
		$oauth_microsoft_token,
		$to_email,
		$from_email,
		$from_name,
		$reply_name,
		$reply_email,
		$subject,
		$html_body,
		$plaintext_body,
		$attachments,
		$domain,
		$smtp_encryption = 'auto'
	) {

		// Make sure PHP server script limit is higher than mailer timeout!
		set_time_limit( 60 );
		$mail = new PHPMailer( true );

		try {
			// SMTP::DEBUG_OFF in production or DEBUG_SERVER while debugging.
			$mail->SMTPDebug   = SMTP::DEBUG_OFF;
			$mail->Debugoutput = 'error_log';

			if ( $oauth_required && OAuth_Manager::is_oauth_enabled() ) {
				$provider = OAuth_Manager::get_provider();
				if ( ! is_array( $oauth_microsoft_token ) || empty( $oauth_microsoft_token['refresh_token'] ) ) {
					throw new Exception( 'Microsoft OAuth token is missing or invalid.' );
				}
				$mail->AuthType = 'XOAUTH2';
				$mail->setOAuth(
					new \PHPMailer\PHPMailer\OAuth(
						array(
							'provider'     => $provider->get_provider_instance(),
							'clientId'     => $oauth_client_id,
							'clientSecret' => $oauth_client_secret,
							'refreshToken' => $oauth_microsoft_token['refresh_token'],
							'userName'     => $provider->get_email(),
						)
					)
				);
			} else if ( ! empty( $password ) ) {
				$mail->Password = $password;
			} else {
				// No password provided and OAuth not in use → fail.
				throw new Exception( 'No authentication method available: either a password or OAuth credentials are required.' );
			}

			$mail->isSMTP();
			$mail->Host     = $host;
			$mail->Port     = (int) $port;
			$mail->SMTPAuth = (bool) $use_auth;
			$mail->Username = $username;
			$mail->CharSet  = 'UTF-8';
			$mail->Helo     = $domain;

			// Connection timeout (secs).
			$mail->Timeout = 6;

			// Time allowed for each SMTP command response.
			$mail->getSMTPInstance()->Timelimit = 8;

			// We'll decide the use of TLS manually after probing the server for capabilities.
			$mail->SMTPAutoTLS = false;
			$mail->SMTPSecure  = '';

			// ---------- Phase 1: probe server extensions ---------- //

			$smtp    = new SMTP();
			$timeout = 10;

			// For implicit SSL (port 465), we don't need to probe STARTTLS, but it doesn't hurt.
			$probe_host       = $host;
			$use_implicit_tls = ( 465 === $port );

			if ( $use_implicit_tls ) {
				// For the probe, connect with implicit TLS (like ssl://host:465).
				if ( stripos( $host, 'ssl://' ) !== 0 && stripos( $host, 'tls://' ) !== 0 ) {
					$probe_host = 'ssl://' . $host;
				}
			}

			if ( ! $smtp->connect( $probe_host, $port, $timeout ) ) {
				throw new Exception( 'Connect failed: ' . ( $smtp->getError()['error'] ?? 'Unknown error' ) );
			}

			if ( ! $smtp->hello( gethostname() ?: 'localhost' ) ) {
				$smtp->quit( true );
				throw new Exception( 'Capability probe EHLO failed: ' . $smtp->getError()['error'] );
			}

			$caps = $smtp->getServerExtList() ?: array();
			// Close the probe connection; PHPMailer will reconnect with our chosen settings.
			$smtp->quit( true );

			// ---------- Phase 2: decide TLS settings based on port + extensions ---------- //

			if ( $use_implicit_tls ) {
				// Port 465 → implicit TLS and no STARTTLS on top of SMTPS.
				$mail->SMTPSecure  = PHPMailer::ENCRYPTION_SMTPS;
				$mail->SMTPAutoTLS = false;
			} else {
				// Other ports ( 25/587/2525... ), use STARTTLS only if the server advertises it.
				if ( isset( $caps['STARTTLS'] ) ) {
					// Server offers STARTTLS → explicitly enable it. No auto control required.
					$mail->SMTPSecure  = PHPMailer::ENCRYPTION_STARTTLS;
					$mail->SMTPAutoTLS = false;
				} else {
					// No STARTTLS offered → allow opportunistic TLS just in case.
					$mail->SMTPSecure  = '';
					$mail->SMTPAutoTLS = true;
				}
			}

			$enc = is_string( $smtp_encryption ) ? strtolower( trim( $smtp_encryption ) ) : 'auto';
			if ( ! ( $oauth_required && OAuth_Manager::is_oauth_enabled() ) && 'auto' !== $enc ) {
				if ( 'none' === $enc ) {
					$mail->SMTPSecure   = '';
					$mail->SMTPAutoTLS = false;
				} elseif ( 'starttls' === $enc ) {
					$mail->SMTPSecure   = PHPMailer::ENCRYPTION_STARTTLS;
					$mail->SMTPAutoTLS = false;
				} elseif ( 'ssl' === $enc ) {
					$mail->SMTPSecure   = PHPMailer::ENCRYPTION_SMTPS;
					$mail->SMTPAutoTLS = false;
				}
			}

			// ---------- Content ---------- //

			$mail->setFrom( $from_email, $from_name );
			$mail->addAddress( $to_email, );
			if ( isset( $reply_name ) && isset( $reply_email ) ) {
				$mail->addReplyTo( $reply_email, $reply_name );
			}
			$mail->isHTML( true );
			$mail->Subject = $subject;
			$mail->Body    = $html_body;
			$mail->AltBody = $plaintext_body;

			// File attachments.
			if ( $attachments ) {
				foreach ( $attachments as $file ) {
					$mail->AddAttachment( $file['tmp_name'], $file['name'] );
				}
			}

			// ---------- Send ---------- //

			$sent = $mail->send();
			if ( $sent ) {
				return array( 200, 'Message sent successfully.' );
			} else {
				throw new Exception( $mail->ErrorInfo );
			}
		} catch ( Exception $e ) {

			// PHPMailer exceptions are not public-safe - Send to logs.
			error_log( 'Bigup_Forms: ' . $e );
			// Generic public error.
			return array( 500, 'Sending your message failed while connecting to the mail server. Please try again.' );
		}
	}
}
