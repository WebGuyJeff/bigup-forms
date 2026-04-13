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
	private $page_slug = 'bigup-web-forms';

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
	private $group_default = 'group_bigup_forms_settings';

	/**
	 * Microsoft Connected Flag
	 *
	 * Will be true when a Microsoft account is connected.
	 */
	private $ms_connected;


	/**
	 * Init the class by hooking into the admin interface.
	 */
	public function __construct() {
		$this->settings = get_option( 'bigup_forms_settings' );
		add_action( 'bigup_settings_dashboard_entry', array( &$this, 'echo_plugin_settings_link' ) );
		new Admin_Settings_Parent();
		add_action( 'admin_menu', array( &$this, 'register_admin_menu' ), 99 );
		add_action( 'admin_init', array( &$this, 'register_settings' ) );
		$this->ms_connected = ! empty( $this->settings['oauth_microsoft_token']['refresh_token'] );
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

		<div class="wrap adminPage">
			<header class="adminHeader">
				<h1>
					<span class="dashicons-bigup-logo" style="font-size: 2em; margin-right: 0.2em;"></span>
					Bigup Web Forms Settings
				</h1>

				<?php settings_errors(); // Display the form save notices here. ?>

				<h2>
					Instructions
				</h2>
				<ul class="adminInstructionsList">
					<li>
						Complete all settings before making any forms live.
					</li>
					<li>
						Test the settings using the button at the bottom, and submit a form entry on your
						site to make sure it's working.
					</li>
					<li>
						See all form submissions in the
						<a target="_blank" href="/wp-admin/edit.php?post_type=bigup_form_entry">Form Entries</a>
						admin page.
					</li>
				</ul>
				<p>
					🥳 Thanks for using Bigup Forms!
				</p>
			</header>

			<div class="adminBody">

				<h2>Connect your SMTP account</h2>

				<table id="providerSelection" class="form-table" role="presentation">
					<tbody>
						<tr>
							<th scope="row">SMTP Provider</th>
							<td>
								<select id="smtpProvider">
									<option value="generic">Generic SMTP (traditional user/pass)</option>
									<option value="microsoft" <?php echo $this->ms_connected ? 'selected' : ''; ?>>Microsoft SMTP (OAuth)</option>
								</select>
							</td>
						</tr>
					</tbody>
				</table>

				<form id="microsoftAccountForm" style="display: none;" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<h2><?php esc_html_e( 'Microsoft OAuth Setup', 'bigup-forms' ); ?></h2>

					<div class="setupInstructions">
						<ol style="margin-left:20px;">

							<li>
								<strong><?php esc_html_e( 'Access App registrations in Azure', 'bigup-forms' ); ?></strong><br>
								<a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
								target="_blank">
									<?php esc_html_e( 'Open Azure App Registrations →', 'bigup-forms' ); ?>
								</a>
							</li>

							<li>
								<strong><?php esc_html_e( 'Click "New registration"', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Enter an application name', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Select Supported account type', 'bigup-forms' ); ?></strong><br>
								<?php esc_html_e( 'Choose: Accounts in this organizational directory only (Single tenant)', 'bigup-forms' ); ?>
							</li>

							<li>
								<strong><?php esc_html_e( 'Set Redirect URI', 'bigup-forms' ); ?></strong><br>
								<?php esc_html_e( 'Platform: Web', 'bigup-forms' ); ?><br>
								<code><?php echo esc_html( admin_url( 'admin-post.php?action=bigup_forms_oauth_callback' ) ); ?></code>
							</li>

							<li>
								<strong><?php esc_html_e( 'Click "Register"', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Open "API permissions"', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Remove the default "User.Read" permission', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Click "Add a permission"', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Select "Microsoft Graph"', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Choose "Delegated permissions"', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Add the following permissions:', 'bigup-forms' ); ?></strong><br>
								<code>email</code>, <code>offline_access</code>, <code>SMTP.Send</code>
								<p class="description">
									<?php esc_html_e( 'After adding permissions, you may need to click "Grant admin consent".', 'bigup-forms' ); ?>
								</p>
							</li>

							<li>
								<strong><?php esc_html_e( 'Click "Add permissions"', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Go to "Certificates & secrets"', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Click "New client secret"', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Enter a description and choose an expiry', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Copy the client secret value immediately', 'bigup-forms' ); ?></strong><br>
								<?php esc_html_e( 'It is only shown once.', 'bigup-forms' ); ?>
							</li>

							<li>
								<strong><?php esc_html_e( 'Copy the Application (client) ID into the fields below and save settings', 'bigup-forms' ); ?></strong>
							</li>

							<li>
								<strong><?php esc_html_e( 'Click the button to connect your Microsoft account', 'bigup-forms' ); ?></strong>
							</li>

						</ol>
					</div>

					<input type="hidden" name="action" value="bigup_forms_connect_microsoft" />

					<?php wp_nonce_field( 'bigup_forms_connect_microsoft_action', 'bigup_forms_connect_microsoft_nonce' ); ?>

					<div class="adminButtonRow">
						<div class="msConnectWrapper">
							<button id="connectMicrosoftAccount" class="button button-primary" type="submit">
								<img src="<?php echo BIGUPFORMS_URL . 'assets/images/provider_logos/microsoft_logo_64px.png'; ?>">
								Connect Microsoft Account
							</button>
							<span><?php echo $this->ms_connected ? '✅ Account connected' : '⚠️ Not connected'; ?></span>
						</div>
						<p class="description">
							<?php esc_html_e( 'This will open Microsoft login to authorize email sending.', 'bigup-forms' ); ?>
						</p>
					</div>

				</form>

				<form method="post" action="options.php">
					<?php
					settings_fields( $this->group_default );
					do_settings_sections( $this->page_slug );
					?>
					<div class="adminButtonRow">

						<?php submit_button( 'Save Settings' ); ?>

						<div class="bigupForms__smtpTest_wrapper">
							<button type="button" class="button button-secondary bigupForms__button-submit bigupForms__smtpTest_button" disabled>
								<span class="bigupForms__submitLabel-ready">
									<?php _e( 'Test Connection (Save first!)', 'bigup_forms' ); ?>
								</span>
								<span class="bigupForms__submitLabel-notReady">
									<?php _e( 'Test Connection [Check your configuration]', 'bigup_forms' ); ?>
								</span>
							</button>
							<div class='bigupForms__alertsContainer' style="display:none;">
								<div class='bigupForms__alerts'></div>
							</div>
						</div>

					</div>
				</form>
			</div>

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

		$group = $this->group_default;
		$page  = $this->page_slug;

		// A single serialsed array holds all plugin settings.
		register_setting(
			$group,                        // option_group.
			'bigup_forms_settings',        // option_name.
			array( $this, 'sanitise' )     // sanitise_callback.
		);

		$section = 'oauth_app_settings';
		add_settings_section( $section, 'OAuth App Settings', array(), $page );
			add_settings_field( 'oauth_client_id', 'OAuth Client ID', array( &$this, 'echo_field_oauth_client_id' ), $page, $section );
			add_settings_field( 'oauth_client_secret', 'OAuth Client Secret', array( &$this, 'echo_field_oauth_client_secret' ), $page, $section );

		$section = 'section_smtp_settings';
		add_settings_section( $section, 'SMTP Settings', array(), $page );
			add_settings_field( 'username', 'Username', array( &$this, 'echo_field_username' ), $page, $section );
			add_settings_field( 'oauth_required', 'Oauth Required', array( &$this, 'echo_field_oauth_required' ), $page, $section, array( 'class' => 'hidden' ) );
			add_settings_field( 'password', 'Password', array( &$this, 'echo_field_password' ), $page, $section );
			add_settings_field( 'host', 'Host', array( &$this, 'echo_field_host' ), $page, $section );
			add_settings_field( 'port', 'Port', array( &$this, 'echo_field_port' ), $page, $section );
			add_settings_field( 'auth', 'Authentication', array( &$this, 'echo_field_auth' ), $page, $section );

		$section = 'section_sending';
		add_settings_section( $section, 'Message Sending', array( &$this, 'echo_intro_section_sending' ), $page );
			add_settings_field( 'from_email', 'Sent-from email address', array( &$this, 'echo_field_from_email' ), $page, $section );
			add_settings_field( 'to_email', 'Email to send messages to', array( &$this, 'echo_field_to_email' ), $page, $section );

		$section = 'section_local_mail_server';
		add_settings_section( $section, 'Local Mail Server', array( &$this, 'echo_intro_section_local_mail_server' ), $page );
			add_settings_field( 'use_local_mail_server', 'Use Local Mail Server', array( &$this, 'echo_field_use_local_mail_server' ), $page, $section );

		$section = 'section_developer';
		add_settings_section( $section, 'Developer', array( &$this, 'echo_intro_section_developer' ), $page );
			add_settings_field( 'debug', 'Enable debugging', array( &$this, 'echo_field_debug' ), $page, $section );
	}


	/**
	 * Output Form Fields - OAuth App Settings
	 */
	public function echo_field_oauth_client_id() {
		$setting = 'bigup_forms_settings[oauth_client_id]';
		printf(
			'<input class="regular-text" type="text" id="%s" name="%s" value="%s">',
			$setting,
			$setting,
			$this->settings['oauth_client_id'] ?? ''
		);
	}
	public function echo_field_oauth_client_secret() {
		$setting = 'bigup_forms_settings[oauth_client_secret]';
		printf(
			'<input class="regular-text" type="password" id="%s" name="%s" value="%s">',
			$setting,
			$setting,
			$this->settings['oauth_client_secret'] ?? ''
		);
	}


	/**
	 * Output Form Fields - SMTP Settings
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
	public function echo_field_oauth_required() {
		$setting = 'bigup_forms_settings[oauth_required]';
		printf(
			'<input id="oauthToggle" type="checkbox" value="1" id="%s" name="%s" %s><label for="%s">%s</label>',
			$setting,
			$setting,
			isset( $this->settings['oauth_required'] ) ? checked( '1', $this->settings['oauth_required'], false ) : '',
			$setting,
			'Tick if your SMTP provider requires OAuth authentication.'
		);
	}
	public function echo_field_password() {
		$setting = 'bigup_forms_settings[password]';
		printf(
			'<input class="regular-text hideWhenOauthEnabled" type="password" id="%s" name="%s" value="%s">',
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
			'Tick if your SMTP provider requires password authentication.'
		);
	}


	/**
	 * Output Form Fields - Message Sending
	 */
	public function echo_intro_section_sending() {
		?>
			<ul class="adminInstructionsList">
				<li>
					The <code>sent from</code> email should match your website domain to improve
					deliverability.
				</li>
				<li>
					Ensure DNS is configured with <strong>DMARC</strong>, <strong>SPF</strong>, and
					<strong>DKIM</strong> so the <code>sent from</code> domain can be authenticated
					to improve deliverability.
				</li>
			</ul>
		<?php
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
	 * Output Form Fields - Local Mail Server
	 */
	public function echo_intro_section_local_mail_server() {
		?>
			<ul class="adminInstructionsList">
				<li>
					If present on the server, you can opt to try and use the local mail() package as
					a fallback in case of SMTP errors.
				</li>
				<li>
					Depending on the hosting config, this may return false positives making it look
					like mail has sent. SMTP is preferred as it will always alert the user of send
					failure.
				</li>
			</ul>
		<?php
		if ( function_exists( 'mail' ) ) {
			echo '<p>✅ mail() package is installed.</p>';
		} else {
			echo '<p>❌ mail() package not detected. Option unavailable.</p>';
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
	 * Output Form Fields - Developer
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

		if ( isset( $input['oauth_client_id'] ) ) {
			$sanitised['oauth_client_id'] = sanitize_text_field( $input['oauth_client_id'] );
		}

		if ( isset( $input['oauth_client_secret'] ) ) {
			$sanitised['oauth_client_secret'] = $this->sanitise_password( $input['oauth_client_secret'] );
		}

		if ( isset( $input['username'] ) ) {
			$sanitised['username'] = sanitize_text_field( $input['username'] );
		}

		if ( isset( $input['oauth_required'] ) ) {
			$sanitised['oauth_required'] = $this->sanitise_checkbox( $input['oauth_required'] );
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
