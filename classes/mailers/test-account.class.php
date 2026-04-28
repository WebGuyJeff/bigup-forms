<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - PHPMailer SMTP Account Test Handler.
 *
 * This uses the SMTP class alone to check that a connection can be made to an SMTP server,
 * authenticate, then disconnect
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader
require BIGUPFORMS_PATH . 'vendor/autoload.php';


class Test_Account {

	/**
	 * Pretty log messages for test output.
	 *
	 * @var array Strings of log messages.
	 */
	private $pretty_log = array();

	/**
	 * Raw mailer log messages for test output.
	 *
	 * @var array Strings of log messages.
	 */
	private $debug_log = array();

	/**
	 * Test SMTP connection.
	 *
	 * @return array containing HTTP status code and a status message.
	 */
	public function smtp_connection( $host, $port, $username, $password, $use_auth = true ) {
		$this->pretty_log = array();
		$this->debug_log   = array();
		$smtp              = new SMTP();
		$data              = array();
		$timeout           = 10;

		$this->debug_log[] = "\n";
		$this->debug_log[] = '########## Raw debug log ##########';

		// DEBUG_OFF for production or DEBUG_SERVER while debugging.
		$smtp->do_debug    = SMTP::DEBUG_SERVER;
		$smtp->Debugoutput = function ( $message, $level ) {
			$levels      = array(
				1 => '[COMMAND] ',
				2 => '[RESPONSE] ',
				3 => '[CONNECT] ',
				4 => '[SOCKET] ',
			);
			$this->debug_log[] = $levels[ (int) $level ] . $message;
		};

		try {
			$this->pretty_log[] = 'Testing: ' . $host . ':' . $port;

			// Decide how to handle TLS based on the port.
			$use_starttls = false; // STARTTLS (upgrade after EHLO).
			$implicit_tls = false; // TLS from the first byte (port 465).
			$connect_host = $host; // May be wrapped with ssl:// for implicit TLS.

			switch ( (int) $port ) {
				case 465:
					// Implicit TLS (SMTPS) – connect via ssl:// and DO NOT call startTLS().
					$this->pretty_log[] = 'Choosing implicit TLS for port ' . $port;
					$implicit_tls = true;
					if ( stripos( $host, 'ssl://' ) !== 0 && stripos( $host, 'tls://' ) !== 0 ) {
						$connect_host = 'ssl://' . $host;
					}
					break;

				case 587:
				case 2525:
					// Submission ports – usually plain connect + STARTTLS.
					$this->pretty_log[] = 'Choosing opportunistic STARTTLS for port ' . $port;
					$use_starttls = true;
					break;

				case 25:
				default:
					// Port 25 often supports opportunistic STARTTLS.
					// You can set $use_starttls = false here if you want to skip it.
					$this->pretty_log[] = 'Choosing opportunistic STARTTLS for port ' . $port;
					$use_starttls = true;
					break;
			}

			// Connect to server with appropriate transport.
			if ( ! $smtp->connect( $connect_host, $port, $timeout ) ) {
				$this->pretty_log[] = 'Connect - FAIL';
				throw new Exception( 'Connect failed: ' . ( $smtp->getError()['error'] ?? 'Unknown error' ) );
			} else {
				$this->pretty_log[] = 'Connect - PASS';
			}

			// EHLO/HELO.
			if ( ! $smtp->hello( gethostname() ) ) {
				$this->pretty_log[] = 'EHLO - FAIL';
				throw new Exception( 'EHLO failed: ' . ( $smtp->getError()['error'] ?? 'Unknown error' ) );
			} else {
				$this->pretty_log[] = 'EHLO - PASS';
			}

			$services     = $smtp->getServerExtList();
			$this->pretty_log[] = 'Server supports: ' . implode( ', ', array_keys( $services ) );

			/**
			 * Try STARTTLS.
			 * Only try STARTTLS if:
			 *  - we decided to use it for this port, and
			 *  - the server advertises STARTTLS, and
			 *  - we are NOT already on implicit TLS (port 465).
			 */
			if ( $use_starttls && ! $implicit_tls && is_array( $services ) && array_key_exists( 'STARTTLS', $services ) ) {
				if ( ! $smtp->startTLS() ) {
					$this->pretty_log[] = 'Start encryption (STARTTLS) - FAIL';
					throw new Exception( 'Failed to start encryption: ' . ( $smtp->getError()['error'] ?? 'Unknown error' ) );
				} else {
					$this->pretty_log[] = 'Start encryption (STARTTLS) - PASS';
				}
				// Repeat EHLO after STARTTLS
				if ( ! $smtp->hello( gethostname() ) ) {
					$this->pretty_log[] = 'EHLO with STARTTLS - FAIL';
					throw new Exception( 'EHLO with STARTTLS failed: ' . ( $smtp->getError()['error'] ?? 'Unknown error' ) );
				} else {
					$this->pretty_log[] = 'EHLO with STARTTLS - PASS';
				}
				$services = $smtp->getServerExtList();
			} else {
				$this->pretty_log[] = 'STARTTLS not offered by ' . $connect_host;
			}

			// Authenticate if supported and requested.
			if ( $use_auth && is_array( $services ) && array_key_exists( 'AUTH', $services ) ) {
				if ( ! $smtp->authenticate( $username, $password ) ) {
					$this->pretty_log[] = 'Authentication - FAIL.';
					throw new Exception( 'Authentication failed: ' . ( $smtp->getError()['error'] ?? 'Unknown error' ) );
				} else {
					$this->pretty_log[] = 'Authentication - PASS.';
				}
			}

			$this->pretty_log[] = '🟢 All tests passed! SMTP configuration is valid.';
			return array( 200, $this->pretty_log );

		} catch ( Exception $e ) {
			$this->pretty_log[] = '🔴 SMTP test failed: ' . $e->getMessage();
			return array( 500, array_merge( $this->pretty_log, $this->debug_log ) );
		}

		// Whatever happened, close the connection.
		$smtp->quit();
	}

	/**
	 * Test SMTP using saved settings (password auth or Microsoft XOAUTH2).
	 *
	 * @return array{0:int,1:string|array} Status code and message(s).
	 */
	public function smtp_connection_from_settings( array $settings ) {
		$oauth_active = Mail_Sending_Config::TRANSPORT_MICROSOFT_OAUTH === Mail_Sending_Config::transport( $settings )
			&& OAuth_Manager::is_oauth_enabled()
			&& ! empty( $settings['oauth_microsoft_token']['refresh_token'] );

		if ( $oauth_active ) {
			return $this->smtp_oauth_phpmailer_test( $settings );
		}

		$eff = Mail_Sending_Config::effective_settings( $settings );

		return $this->smtp_connection(
			$eff['host'] ?? '',
			isset( $eff['port'] ) ? (int) $eff['port'] : 587,
			$eff['username'] ?? '',
			$eff['password'] ?? '',
			! empty( $eff['auth'] )
		);
	}

	/**
	 * Match Mail_SMTP TLS probing, then authenticate with XOAUTH2 via PHPMailer.
	 *
	 * @param array $settings Full option row including secrets (admin-only).
	 * @return array{0:int,1:string|array}
	 */
	private function smtp_oauth_phpmailer_test( array $settings ) {
		$this->pretty_log = array();
		$this->debug_log   = array();
		$eff                = Mail_Sending_Config::effective_settings( $settings );
		$this->pretty_log[] = 'Testing Microsoft OAuth (XOAUTH2) on ' . ( $eff['host'] ?? '' ) . ':' . (int) ( $eff['port'] ?? 587 );

		$this->debug_log[] = "\n";
		$this->debug_log[] = '########## Raw debug log (PHPMailer) ##########';

		$mail = new PHPMailer( true );

		try {
			$mail->SMTPDebug   = SMTP::DEBUG_SERVER;
			$mail->Debugoutput = function ( $message, $level ) {
				$levels = array(
					1 => '[COMMAND] ',
					2 => '[RESPONSE] ',
					3 => '[CONNECT] ',
					4 => '[SOCKET] ',
				);
				$this->debug_log[] = ( $levels[ (int) $level ] ?? '' ) . $message;
			};

			$provider = OAuth_Manager::get_provider();
			if ( ! $provider ) {
				throw new Exception( 'Microsoft OAuth provider is not available. Check app registration and connection.' );
			}

			$mail->AuthType = 'XOAUTH2';
			$mail->setOAuth(
				new \PHPMailer\PHPMailer\OAuth(
					array(
						'provider'     => $provider->get_provider_instance(),
						'clientId'     => $settings['oauth_client_id'],
						'clientSecret' => $settings['oauth_client_secret'],
						'refreshToken' => $settings['oauth_microsoft_token']['refresh_token'],
						'userName'     => $provider->get_email(),
					)
				)
			);

			$mail->isSMTP();
			$mail->Host       = $eff['host'];
			$mail->Port       = (int) $eff['port'];
			$mail->SMTPAuth   = ! empty( $eff['auth'] );
			$mail->Username   = $eff['username'] ?? '';
			$mail->CharSet    = 'UTF-8';
			$mail->Helo       = wp_parse_url( home_url(), PHP_URL_HOST ) ?: 'localhost';
			$mail->Timeout    = 10;
			$mail->SMTPAutoTLS = false;
			$mail->SMTPSecure  = '';

			$this->apply_phpmailer_tls_from_probe( $mail, $eff['host'], (int) $eff['port'] );

			if ( ! $mail->smtpConnect() ) {
				throw new Exception( $mail->ErrorInfo ?: 'SMTP connect failed.' );
			}

			$mail->smtpClose();
			$this->pretty_log[] = 'OAuth SMTP connect and authentication succeeded.';

			return array( 200, $this->pretty_log );

		} catch ( Exception $e ) {
			$this->pretty_log[] = 'OAuth SMTP test failed: ' . $e->getMessage();

			return array( 500, array_merge( $this->pretty_log, $this->debug_log ) );
		}
	}

	/**
	 * Probe STARTTLS / SMTPS the same way as Mail_SMTP::send().
	 */
	/**
	 * Send a single test message to the configured notification address (same transport as form mail).
	 *
	 * @param array<string,mixed> $settings Full settings row including secrets (admin-only).
	 * @return array{0:int,1:string} HTTP-style status and user-facing message.
	 */
	public function send_test_email_from_settings( array $settings ) {
		if ( ! Settings::ready( $settings ) ) {
			return array( 500, 'Email settings must be configured before performing this action.' );
		}

		$site_name   = get_bloginfo( 'name' );
		$domain      = wp_parse_url( html_entity_decode( get_bloginfo( 'url' ) ), PHP_URL_HOST );
		$domain      = is_string( $domain ) && '' !== $domain ? $domain : 'localhost';
		$subject     = '[' . $site_name . '] SMTP Test Email (Bigup Forms)';
		$from_name   = $site_name;
		$reply_name  = $from_name;
		$reply_email = $settings['from_email'];
		$html        = '<p>This is a test email sent from your WordPress <strong>Bigup Forms</strong> plugin.</p><p>If you received this message, your outbound mail configuration is working.</p>';
		$plaintext   = "This is a test email sent from your WordPress Bigup Forms plugin.\n\nIf you received this message, your outbound mail configuration is working.";

		$token = $settings['oauth_microsoft_token'] ?? array();
		if ( ! is_array( $token ) ) {
			$token = array();
		}

		$mailer = new Mail_SMTP();
		$conn   = Mail_Sending_Config::smtp_connection_args( $settings );
		$enc    = $settings['smtp_encryption'] ?? 'auto';

		$result = $mailer->send(
			$conn[0],
			$conn[1],
			$conn[2],
			$conn[3],
			$conn[4],
			$conn[5],
			$conn[6],
			$conn[7],
			$conn[8],
			$settings['to_email'],
			$settings['from_email'],
			$from_name,
			$reply_name,
			$reply_email,
			$subject,
			$html,
			$plaintext,
			false,
			$domain,
			is_string( $enc ) ? $enc : 'auto',
		);

		$code = isset( $result[0] ) ? (int) $result[0] : 500;
		if ( $code < 300 ) {
			return array( 200, 'Test email sent to ' . $settings['to_email'] );
		}

		$err = isset( $result[1] ) ? (string) $result[1] : 'Sending the test email failed.';

		return array( $code, $err );
	}

	private function apply_phpmailer_tls_from_probe( PHPMailer $mail, string $host, int $port ): void {
		$smtp    = new SMTP();
		$timeout = 10;

		$probe_host       = $host;
		$use_implicit_tls = ( 465 === $port );

		if ( $use_implicit_tls ) {
			if ( stripos( $host, 'ssl://' ) !== 0 && stripos( $host, 'tls://' ) !== 0 ) {
				$probe_host = 'ssl://' . $host;
			}
		}

		if ( ! $smtp->connect( $probe_host, $port, $timeout ) ) {
			$smtp->quit( true );
			throw new Exception( 'Capability probe connect failed: ' . ( $smtp->getError()['error'] ?? 'unknown' ) );
		}

		if ( ! $smtp->hello( gethostname() ?: 'localhost' ) ) {
			$smtp->quit( true );
			throw new Exception( 'Capability probe EHLO failed: ' . ( $smtp->getError()['error'] ?? 'unknown' ) );
		}

		$caps = $smtp->getServerExtList() ?: array();
		$smtp->quit( true );

		if ( $use_implicit_tls ) {
			$mail->SMTPSecure  = PHPMailer::ENCRYPTION_SMTPS;
			$mail->SMTPAutoTLS = false;
		} elseif ( isset( $caps['STARTTLS'] ) ) {
			$mail->SMTPSecure  = PHPMailer::ENCRYPTION_STARTTLS;
			$mail->SMTPAutoTLS = false;
		} else {
			$mail->SMTPSecure  = '';
			$mail->SMTPAutoTLS = true;
		}
	}
}
