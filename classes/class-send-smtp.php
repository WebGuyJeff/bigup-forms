<?php
namespace Bigup\Forms;

/**
 * Bigup Forms - PHPMailer Handler.
 *
 * This template handles the construction of the email using values submitted
 * via the form, and sends the email via PHPMailer using the SMTP account
 * configured by the user.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader
require BIGUPFORMS_PATH . 'vendor/autoload.php';

// WordPress Dependencies
use function get_bloginfo;
use function wp_strip_all_tags;
use function plugin_dir_path;
use function get_site_url;


class Send_SMTP {

	/**
	 * Hold the SMTP account settings retrieved from the database.
	 */
	private $smtp_settings;


	/**
	 * Init the class by grabbing the saved options.
	 *
	 * Prepares SMTP settings and form data to pass to compose_email.
	 * Form data is passed by handler.
	 */
	public function __construct() {
		$this->smtp_settings = Get_Settings::smtp();
	}


	/**
	 * Compose and send an SMTP email.
	 */
	public function compose_and_send_email( $form_data ) {

		// Check settings are ready.
		if ( false === ! ! $this->smtp_settings || true === $this->smtp_settings['use_local_mail_server'] ) {
			error_log( 'Bigup_Forms: Invalid SMTP settings retrieved from database.' );
			return [ 500, 'Sending your message failed due to a bad local mailserver configuration.' ];
		}

		$fields = $form_data['fields'];

		$username              = $this->smtp_settings['username'];
		$password              = $this->smtp_settings['password'];
		$host                  = $this->smtp_settings['host'];
		$port                  = $this->smtp_settings['port'];
		$auth                  = $this->smtp_settings['auth'];
		$use_local_mail_server = $this->smtp_settings['use_local_mail_server'];
		$from_email            = $this->smtp_settings['from_email'];
		$to_email              = $this->smtp_settings['to_email'];

		$site_url  = html_entity_decode( get_bloginfo( 'url' ) );
		$domain    = parse_url( $site_url, PHP_URL_HOST );
		$site_name = html_entity_decode( get_bloginfo( 'name' ) );
		$from_name = $site_name ? $site_name : 'Bigup Forms';
		$subject   = 'New website message from ' . $domain;
		$name      = isset( $fields['fields']['name'] ) ? $fields['fields']['name'] : 'Anonymous user';
		$email     = isset( $fields['fields']['email'] ) ? $fields['fields']['email'] : null;

		// Build plaintext email body.
		$plaintext_fields_output = "\n\n";
		foreach ( $fields as $name => $data ) {
			$plaintext_fields_output .= ucfirst( $name ) . ': ' . $data['value'] . "\n";
		}
		$plaintext_fields_output .= "\n\n";
		$plaintext                = <<<PLAIN
			This message was sent via the contact form at $site_url.
			{$plaintext_fields_output}
			You are viewing the plaintext version of this email because you have
			disallowed HTML content in your email client. To view this and any future
			messages from this sender in complete HTML formatting, try adding the sender
			domain to your spam filter whitelist.
		PLAIN;
		$plaintext_cleaned        = wp_strip_all_tags( $plaintext );

		// Build html email body.
		$html_fields_output = "\n";
		foreach ( $fields as $name => $data ) {
			$html_fields_output .= '<tr><td><b>' . ucfirst( $name ) . ': </b></td><td>' . $data['value'] . "</td></tr>\n";
		}
		$html = <<<HTML
			<table>
				<tr>
					<td height="60px">
						<i>This message was sent via the contact form at $site_url</i>
					</td>
				</tr>
				<tr>
					<th>Form Field</th>
					<th>Entered Value</th>
				</tr>
				{$html_fields_output}
			</table>
		HTML;

		// Make sure PHP server script limit is higher than mailer timeout!
		set_time_limit( 60 );
		// Ensure PHP time zone is set as SMTP requires accurate times.
		date_default_timezone_set( 'UTC' );

		try {

			$mail = new PHPMailer( true );
			$mail->isSMTP();
			$port = (int) $port;
			// SMTPS/STARTTLS (ssl/tls).
			if ( $port !== 25 && $port !== 2525 ) {
				$mail->SMTPSecure = ( $port === 465 ) ? 'ssl' : 'tls';
			}
			$mail->SMTPDebug                    = SMTP::DEBUG_OFF; // Debug level: DEBUG_[OFF/SERVER/CONNECTION]
			$mail->Debugoutput                  = 'error_log';     // How to handle debug output
			$mail->Helo                         = get_site_url();  // Sender's FQDN to identify as
			$mail->Host                         = $host;           // SMTP server to send through
			$mail->SMTPAuth                     = (bool) $auth;    // Enable SMTP authentication
			$mail->Username                     = $username;       // SMTP username
			$mail->Password                     = $password;       // SMTP password
			$mail->Port                         = $port;           // TCP port
			$mail->Timeout                      = 6;               // Connection timeout (secs)
			$mail->getSMTPInstance()->Timelimit = 8;               // Time allowed for each SMTP command response

			// Recipients.
			$mail->setFrom( $from_email, $from_name ); // Use fixed and owned SMTP account address to pass SPF checks.
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
			if ( isset( $form_data['files'] ) ) {
				foreach ( $form_data['files'] as $file ) {
					$mail->AddAttachment( $file['tmp_name'], $file['name'] );
				}
			}

			// Send mail.
			$sent = $mail->send();
			if ( $sent ) {
				return array( 200, 'Message sent successfully.' );
			} else {
				throw new Exception( 'SMTP Error: ' . $mail->ErrorInfo );
			}
		} catch ( Exception $e ) {

			// PHPMailer exceptions are not public-safe - Send to logs.
			error_log( 'Bigup_Forms: ' . $mail->ErrorInfo );
			// Generic public error.
			return array( 500, 'Sending your message failed while connecting to the mail server.' );
		}
	}
}
