<?php

namespace BigupWeb\Forms\Tests\Integration;

use WP_UnitTestCase;
use BigupWeb\Forms\Settings;

/**
 * Tests covered:
 *  - Happy path: valid SMTP settings in DB
 *  - Empty option: {@see Settings::get()} returns []
 *  - Invalid values: {@see Settings::validate()} on stored or partial payloads
 *  - {@see Settings::ready()} for send readiness
 */
class GetSettingsTest extends WP_UnitTestCase {

	public function tearDown(): void {
		delete_option( 'bigup_forms_settings' );
		parent::tearDown();
	}

	public function test_smtp_returns_settings_when_all_valid() {
		$valid_settings = array(
			'username'              => 'testuser',
			'password'              => 'testpass123',
			'host'                  => 'smtp.gmail.com',
			'port'                  => 587,
			'auth'                  => true,
			'use_local_mail_server' => false,
			'from_email'            => 'sender@example.com',
			'to_email'              => 'recipient@example.com',
		);
		update_option( 'bigup_forms_settings', $valid_settings );

		$result = Settings::get();

		$this->assertIsArray( $result );
		$this->assertEquals( 'testuser', $result['username'] );
		$this->assertEquals( 'testpass123', $result['password'] );
		$this->assertEquals( 'smtp.gmail.com', $result['host'] );
		$this->assertEquals( 587, $result['port'] );
		$this->assertTrue( $result['auth'] );
		$this->assertFalse( $result['use_local_mail_server'] );
		$this->assertEquals( 'sender@example.com', $result['from_email'] );
		$this->assertEquals( 'recipient@example.com', $result['to_email'] );
	}

	public function test_smtp_returns_empty_array_when_no_settings_exist() {
		$result = Settings::get();

		$this->assertIsArray( $result );
		$this->assertSame( array(), $result );
	}

	public function test_validate_fails_with_invalid_from_email() {
		$invalid_settings = array(
			'username'              => 'testuser',
			'password'              => 'testpass123',
			'host'                  => 'smtp.gmail.com',
			'port'                  => 587,
			'auth'                  => true,
			'use_local_mail_server' => false,
			'from_email'            => 'not-an-email',
			'to_email'              => 'recipient@example.com',
		);
		update_option( 'bigup_forms_settings', $invalid_settings );

		$this->assertFalse( Settings::validate( Settings::get() ) );
	}

	public function test_validate_fails_with_invalid_to_email() {
		$invalid_settings = array(
			'username'              => 'testuser',
			'password'              => 'testpass123',
			'host'                  => 'smtp.gmail.com',
			'port'                  => 587,
			'auth'                  => true,
			'use_local_mail_server' => false,
			'from_email'            => 'sender@example.com',
			'to_email'              => 'invalid@email@domain.com',
		);
		update_option( 'bigup_forms_settings', $invalid_settings );

		$this->assertFalse( Settings::validate( Settings::get() ) );
	}

	public function test_validate_fails_with_invalid_port() {
		$invalid_settings = array(
			'username'              => 'testuser',
			'password'              => 'testpass123',
			'host'                  => 'smtp.gmail.com',
			'port'                  => 999,
			'auth'                  => true,
			'use_local_mail_server' => false,
			'from_email'            => 'sender@example.com',
			'to_email'              => 'recipient@example.com',
		);
		update_option( 'bigup_forms_settings', $invalid_settings );

		$this->assertFalse( Settings::validate( Settings::get() ) );
	}

	public function test_smtp_accepts_all_valid_ports() {
		$valid_ports = array( 25, 465, 587, 2525 );

		foreach ( $valid_ports as $port ) {
			$settings = array(
				'username'              => 'testuser',
				'password'              => 'testpass123',
				'host'                  => 'smtp.gmail.com',
				'port'                  => $port,
				'auth'                  => true,
				'use_local_mail_server' => false,
				'from_email'            => 'sender@example.com',
				'to_email'              => 'recipient@example.com',
			);
			update_option( 'bigup_forms_settings', $settings );

			$result = Settings::get();

			$this->assertIsArray( $result, "Port $port should be valid" );
			$this->assertEquals( $port, $result['port'] );
			$this->assertTrue( Settings::validate( $result ), "Port $port should validate" );
		}
	}

	public function test_validate_fails_with_invalid_host() {
		$invalid_settings = array(
			'username'              => 'testuser',
			'password'              => 'testpass123',
			'host'                  => 'bad..host',
			'port'                  => 587,
			'auth'                  => true,
			'use_local_mail_server' => false,
			'from_email'            => 'sender@example.com',
			'to_email'              => 'recipient@example.com',
		);
		update_option( 'bigup_forms_settings', $invalid_settings );

		$this->assertFalse( Settings::validate( Settings::get() ) );
	}

	public function test_validate_fails_with_non_string_username() {
		$invalid_settings = array(
			'username'              => 12345,
			'password'              => 'testpass123',
			'host'                  => 'smtp.gmail.com',
			'port'                  => 587,
			'auth'                  => true,
			'use_local_mail_server' => false,
			'from_email'            => 'sender@example.com',
			'to_email'              => 'recipient@example.com',
		);
		update_option( 'bigup_forms_settings', $invalid_settings );

		$this->assertFalse( Settings::validate( Settings::get() ) );
	}

	public function test_ready_fails_when_password_missing() {
		$invalid_settings = array(
			'username'              => 'testuser',
			'host'                  => 'smtp.gmail.com',
			'port'                  => 587,
			'auth'                  => true,
			'use_local_mail_server' => false,
			'from_email'            => 'sender@example.com',
			'to_email'              => 'recipient@example.com',
		);
		update_option( 'bigup_forms_settings', $invalid_settings );

		$this->assertFalse( Settings::ready( Settings::get() ) );
	}

	public function test_smtp_accepts_boolean_auth_values() {
		$settings = array(
			'username'              => 'testuser',
			'password'              => 'testpass123',
			'host'                  => 'smtp.gmail.com',
			'port'                  => 587,
			'auth'                  => true,
			'use_local_mail_server' => false,
			'from_email'            => 'sender@example.com',
			'to_email'              => 'recipient@example.com',
		);
		update_option( 'bigup_forms_settings', $settings );

		$result = Settings::get();
		$this->assertIsArray( $result );
		$this->assertTrue( $result['auth'] );

		$settings['auth'] = false;
		update_option( 'bigup_forms_settings', $settings );

		$result = Settings::get();
		$this->assertIsArray( $result );
		$this->assertFalse( $result['auth'] );
	}

	public function test_smtp_accepts_boolean_use_local_mail_server_values() {
		$settings = array(
			'username'              => 'testuser',
			'password'              => 'testpass123',
			'host'                  => 'smtp.gmail.com',
			'port'                  => 587,
			'auth'                  => true,
			'use_local_mail_server' => true,
			'from_email'            => 'sender@example.com',
			'to_email'              => 'recipient@example.com',
		);
		update_option( 'bigup_forms_settings', $settings );

		$result = Settings::get();
		$this->assertIsArray( $result );
		$this->assertTrue( $result['use_local_mail_server'] );

		$settings['use_local_mail_server'] = false;
		update_option( 'bigup_forms_settings', $settings );

		$result = Settings::get();
		$this->assertIsArray( $result );
		$this->assertFalse( $result['use_local_mail_server'] );
	}

	public function test_ready_fails_with_empty_password_for_non_oauth() {
		$invalid_settings = array(
			'username'              => 'testuser',
			'password'              => '',
			'host'                  => 'smtp.gmail.com',
			'port'                  => 587,
			'auth'                  => true,
			'use_local_mail_server' => false,
			'from_email'            => 'sender@example.com',
			'to_email'              => 'recipient@example.com',
		);
		update_option( 'bigup_forms_settings', $invalid_settings );

		$this->assertTrue( Settings::validate( Settings::get() ) );
		$this->assertFalse( Settings::ready( Settings::get() ) );
	}

	public function test_validate_rejects_various_invalid_email_formats() {
		$invalid_emails = array(
			'plaintext',
			'@example.com',
			'user@',
			'user @example.com',
			'user@example .com',
			'user@@example.com',
			'',
		);

		foreach ( $invalid_emails as $invalid_email ) {
			$this->assertFalse(
				Settings::validate( array( 'from_email' => $invalid_email ) ),
				"Email '$invalid_email' should be invalid"
			);
		}
	}

	public function test_validate_accepts_various_valid_email_formats() {
		$valid_emails = array(
			'user@example.com',
			'user.name@example.com',
			'user+tag@example.co.uk',
			'user_name@example-domain.com',
			'123@example.com',
		);

		foreach ( $valid_emails as $valid_email ) {
			$this->assertTrue(
				Settings::validate( array( 'from_email' => $valid_email ) ),
				"Email '$valid_email' should be valid"
			);
		}
	}
}
