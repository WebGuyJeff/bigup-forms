<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Admin Settings.
 *
 * Hook into the WP admin area and add menu options and settings
 * pages.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// WordPress dependencies.
use function menu_page_url;


class Admin_Settings {

	/**
	 * Settings page slug to add with add_submenu_page().
	 */
	private $admin_label = 'Bigup Forms';

	/**
	 * Settings page slug to add with add_submenu_page().
	 */
	private $page_slug = 'bigup-web-contact-form';

	/**
	 * The plugin settings saved the wp_options table.
	 */
	private $settings;

	/**
	 * Settings group name called by settings_fields().
	 *
	 * To add multiple sections to the same settings page, all settings
	 * registered for that page MUST BE IN THE SAME 'OPTION GROUP'.
	 */
	private $group_name = 'group_contact_form_settings';


	/**
	 * Init the class by hooking into the admin interface.
	 */
	public function __construct() {
		$this->settings = get_option( 'bigup_forms_settings' );
		add_action( 'bigup_settings_dashboard_entry', array( &$this, 'echo_plugin_settings_link' ) );
		new Admin_Settings_Parent();
		add_action( 'admin_menu', array( &$this, 'register_admin_menu' ), 99 );
		add_action( 'admin_init', array( &$this, 'register_settings' ) );
	}


	/**
	 * Add admin menu option to sidebar
	 */
	public function register_admin_menu() {

		add_submenu_page(
			Admin_Settings_Parent::$page_slug,       // parent_slug
			$this->admin_label . ' Settings',        // page_title
			$this->admin_label,                      // menu_title
			'manage_options',                        // capability
			$this->page_slug,                        // menu_slug
			array( &$this, 'create_settings_page' ), // function
			null,                                    // position
		);
	}


	/**
	 * Echo a link to this plugin's settings page.
	 */
	public function echo_plugin_settings_link() {
		?>
		<a href="/wp-admin/admin.php?page=<?php echo $this->page_slug; ?>">
			<?php echo $this->admin_label; ?> settings
		</a>
		<?php
	}


	/**
	 * Create Contact Form Settings Page
	 */
	public function create_settings_page() {

		// Enqueue admin assets.
		wp_enqueue_script( 'bigup_forms_admin_js' );
		wp_enqueue_style( 'bigup_forms_admin_css' );
		?>

		<div class="wrap">

			<h1>
				<span class="dashicons-bigup-logo" style="font-size: 2em; margin-right: 0.2em;"></span>
				Bigup Web Contact Form Settings
			</h1>

			<?php settings_errors(); // Display the form save notices here. ?>

			<h2>
				Notice
			</h2>
			<p>
				Complete these settings before making any contact forms live. Test the settings
				using the button below, and test the form on your site once it is published to avoid
				missed submissions.
			</p>
			<p>
				It is recommended you complete the SMTP settings as well as allowing the local mail
				server as a redundancy in case of SMTP errors. This will further reduce the chance
				of missed submissions.
			</p>
			<p>
				All form entries that are recieved by this website are logged in the 'Form Entries'
				admin page, even when sending to your recipient email fails. It is however
				impossible to account for errors that occur on user devices.
			</p>
			<p>
				Thanks for using Bigup Forms!
			</p>

			<form method="post" action="options.php">

				<?php
					settings_fields( $this->group_name );
					do_settings_sections( $this->page_slug );
					submit_button( 'Save' );
				?>

			</form>

		</div>

		<?php
	}


	/**
	 * Register all settings fields and call their functions to build the page.
	 *
	 * add_settings_section( $id, $title, $callback, $page )
	 * add_settings_field( $id, $title, $callback, $page, $section, $args )
	 * register_setting( $option_group, $option_name, $sanitise_callback )
	 */
	public function register_settings() {

		$group = $this->group_name;
		$page  = $this->page_slug;

		// A single serialsed array holds all plugin settings.
		register_setting(
			$group,                        // option_group.
			'bigup_forms_settings',        // option_name.
			array( $this, 'sanitise' )     // sanitise_callback.
		);

		// SMTP Account.
		$section = 'section_smtp';
		add_settings_section( $section, 'SMTP Account', array( $this, 'smtp_test_markup_callback' ), $page );
			add_settings_field( 'username', 'Username', array( &$this, 'echo_field_username' ), $page, $section );
			add_settings_field( 'password', 'Password', array( &$this, 'echo_field_password' ), $page, $section );
			add_settings_field( 'host', 'Host', array( &$this, 'echo_field_host' ), $page, $section );
			add_settings_field( 'port', 'Port', array( &$this, 'echo_field_port' ), $page, $section );
			add_settings_field( 'auth', 'Authentication', array( &$this, 'echo_field_auth' ), $page, $section );

		// Message Header.
		$section = 'section_headers';
		add_settings_section( $section, 'Message Headers', array( &$this, 'echo_intro_section_headers' ), $page );
			add_settings_field( 'from_email', 'Sent-from Email Address', array( &$this, 'echo_field_from_email' ), $page, $section );
			add_settings_field( 'to_email', 'Send-to Email Address', array( &$this, 'echo_field_to_email' ), $page, $section );

		// Local mail server.
		$section = 'section_local_mail_server';
		add_settings_section( $section, 'Local Mail Server', array( &$this, 'echo_intro_section_local_mail_server' ), $page );
			add_settings_field( 'use_local_mail_server', 'Use Local Mail Server', array( &$this, 'echo_field_use_local_mail_server' ), $page, $section );

		// Developer.
		$section = 'section_developer';
		add_settings_section( $section, 'Developer', array( &$this, 'echo_intro_section_developer' ), $page );
			add_settings_field( 'debug', 'Enable debugging', array( &$this, 'echo_field_debug' ), $page, $section );
	}


	/**
	 * SMTP test markup.
	 *
	 * Output a button which will trigger an email send test.
	 */
	public function smtp_test_markup_callback() {
		// The SMTP test button is enabled by JS once vaild saved settings are detected.
		?>
			<div class="bigupForms__smtpTest_wrapper">
				<button class="button button-secondary bigupForms__submit bigupForms__smtpTest_button" type="submit" disabled>
					<span class="bigupForms__submitLabel-ready">
						<?php _e( 'Test Settings', 'bigup_forms' ); ?>
					</span>
					<span class="bigupForms__submitLabel-notReady">
						<?php _e( 'Test Settings [Check your configuration]', 'bigup_forms' ); ?>
					</span>
				</button>
				<div class='bigupForms__alertsContainer' style="display:none;">
					<div class='bigupForms__alerts'></div>
				</div>
			</div>
		<?php
	}


	/**
	 * Output Form Fields - SMTP Account Settings
	 */
	public function echo_field_username() {
		$setting = 'bigup_forms_settings[username]';
		printf(
			'<input class="regular-text" type="text" id="%s" name="%s" value="%s">',
			$setting,
			$setting,
			$this->settings['username'] ?? ''
		);
	}
	public function echo_field_password() {
		$setting = 'bigup_forms_settings[password]';
		printf(
			'<input class="regular-text" type="password" id="%s" name="%s" value="%s">',
			$setting,
			$setting,
			$this->settings['password'] ?? ''
		);
	}
	public function echo_field_host() {
		$setting = 'bigup_forms_settings[host]';
		printf(
			'<input class="regular-text" type="text" id="%s" name="%s" value="%s">',
			$setting,
			$setting,
			$this->settings['host'] ?? ''
		);
	}
	public function echo_field_port() {
		$setting = 'bigup_forms_settings[port]';
		printf(
			'<input class="regular-text" type="number" min="25" max="2525" step="1" id="%s" name="%s" value="%s">',
			$setting,
			$setting,
			$this->settings['port'] ?? ''
		);
	}
	public function echo_field_auth() {
		$setting = 'bigup_forms_settings[auth]';
		printf(
			'<input type="checkbox" value="1" id="%s" name="%s" %s><label for="%s">%s</label>',
			$setting,
			$setting,
			isset( $this->settings['auth'] ) ? checked( '1', $this->settings['auth'], false ) : '',
			$setting,
			'Tick if your SMTP provider requires authentication.'
		);
	}


	/**
	 * Output Form Fields - Message Header Settings
	 */
	public function echo_intro_section_headers() {
		echo '<p>To improve deliverability, the <code>sent from</code> email address should match your website domain, or at least the SMTP host domain.</p>';
		echo '<p>Mail providers (Gmail, Microsoft, Yahoo, etc) heavily use <strong>DMARC</strong>, <strong>SPF</strong>, and <strong>DKIM</strong> to verify that mail is legitimately coming from the domain it claims to come from. Ensure these DNS entries are set correctly to authenticate the <code>sent from</code> domain.</p>';
	}
	public function echo_field_from_email() {
		$setting = 'bigup_forms_settings[from_email]';
		printf(
			'<input class="regular-text" type="email" id="%s" name="%s" value="%s">',
			$setting,
			$setting,
			$this->settings['from_email'] ?? get_bloginfo( 'admin_email' )
		);
	}
	public function echo_field_to_email() {
		$setting = 'bigup_forms_settings[to_email]';
		printf(
			'<input class="regular-text" type="email" id="%s" name="%s" value="%s">',
			$setting,
			$setting,
			$this->settings['to_email'] ?? get_bloginfo( 'admin_email' )
		);
	}


	/**
	 * Output Form Fields - Local mail server Settings
	 */
	public function echo_intro_section_local_mail_server() {
		echo '<p>If present on the server, you can opt to try and use the local mail() package to send emails when using SMTP fails, or account settings are not configured.</p>';
		echo '<p><span style="font-weight:800;color:blue;">Please note: </span>Depending on the hosting config, this may return false positives making it look like mail has sent. Please test-send an email to yourself via the contact form. SMTP is highly recommended as it will always alert the user of send failure!</p>';
		if ( function_exists( 'mail' ) ) {
			echo '<p>Status: <span style="font-weight:800;color:green;">OK </span>- mail() package is present.</p>';
		} else {
			echo '<p>Status: <span style="font-weight:800;color:red;">Not found. </span>- mail() package not detected. Option unavailable.</p>';
		}
	}
	public function echo_field_use_local_mail_server() {
		$setting = 'bigup_forms_settings[use_local_mail_server]';
		printf(
			'<input type="checkbox" value="1" id="%s" name="%s" %s %s><label for="%s">%s</label>',
			$setting,
			$setting,
			isset( $this->settings['use_local_mail_server'] ) ? checked( '1', $this->settings['use_local_mail_server'], false ) : '',
			$disabled = function_exists( 'mail' ) ? '' : 'disabled',
			$setting,
			'Attempt sending with local mail when SMTP unavailable.',
		);
	}


	/**
	 * Output Form Fields - Developer Settings
	 */
	public function echo_intro_section_developer() {
		echo '<p>Settings for developers.</p>';
	}
	public function echo_field_debug() {
		$setting = 'bigup_forms_settings[debug]';
		printf(
			'<input type="checkbox" value="1" id="%s" name="%s" %s><label for="%s">%s</label>',
			$setting,
			$setting,
			isset( $this->settings['debug'] ) ? checked( '1', $this->settings['debug'], false ) : '',
			$setting,
			'Tick to enable debug logging.',
		);
	}


	public function sanitise( $input ) {

		$sanitised = array();

		if ( isset( $input['username'] ) ) {
			$sanitised['username'] = sanitize_text_field( $input['username'] );
		}

		if ( isset( $input['password'] ) ) {
			$sanitised['password'] = $this->sanitise_password( $input['password'] );
		}

		if ( isset( $input['host'] ) ) {
			$sanitised['host'] = $this->validate_domain( $input['host'] );
		}

		if ( isset( $input['port'] ) ) {
			$sanitised['port'] = $this->sanitise_smtp_port( $input['port'] );
		}

		if ( isset( $input['auth'] ) ) {
			$sanitised['auth'] = $this->sanitise_checkbox( $input['auth'] );
		}

		if ( isset( $input['use_local_mail_server'] ) ) {
			$sanitised['use_local_mail_server'] = $this->sanitise_checkbox( $input['use_local_mail_server'] );
		}

		if ( isset( $input['to_email'] ) ) {
			$sanitised['to_email'] = sanitize_email( $input['to_email'] );
		}

		if ( isset( $input['from_email'] ) ) {
			$sanitised['from_email'] = sanitize_email( $input['from_email'] );
		}

		if ( isset( $input['debug'] ) ) {
			$sanitised['debug'] = $this->sanitise_checkbox( $input['debug'] );
		}

		return $sanitised;
	}


	/**
	 * Validate a domain name.
	 */
	private function validate_domain( $domain ) {
		$ip = gethostbyname( $domain );
		$ip = filter_var( $ip, FILTER_VALIDATE_IP );
		if ( $domain == '' || $domain == null ) {
			return '';
		} elseif ( $ip ) {
			return $domain;
		} else {
			return 'INVALID DOMAIN';
		}
	}


	/**
	 * Sanitise an SMTP port number.
	 */
	private function sanitise_smtp_port( $port ) {
		$port_int    = intval( $port );
		$valid_ports = array( 25, 465, 587, 2525 );
		if ( in_array( $port_int, $valid_ports, true ) ) {
			return $port_int;
		} else {
			return '';
		}
	}


	/**
	 * Sanitise a checkbox.
	 */
	private function sanitise_checkbox( $checkbox ) {
		$bool_checkbox = (bool) $checkbox;
		return $bool_checkbox;
	}

	/**
	 * Sanitise a password.
	 */
	private function sanitise_password( $password ) {
		$trimmed_password = trim( $password );
		return $trimmed_password;
	}
}
