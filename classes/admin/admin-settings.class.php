<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Admin Settings.
 *
 * Registers the admin menu and renders the React SPA mount point.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */
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
	 * Init the class by hooking into the admin interface.
	 */
	public function __construct() {
		add_action( 'bigup_settings_dashboard_entry', array( &$this, 'echo_plugin_settings_link' ) );
		new Admin_Settings_Parent();
		add_action( 'admin_menu', array( &$this, 'register_admin_menu' ), 99 );
	}

	/**
	 * Add admin menu option to sidebar
	 */
	public function register_admin_menu() {

		add_submenu_page(
			Admin_Settings_Parent::$page_slug,
			$this->admin_label . ' Settings',
			$this->admin_label,
			'manage_options',
			$this->page_slug,
			array( &$this, 'create_settings_page' ),
			null,
		);
	}

	/**
	 * Echo a link to this plugin's settings page.
	 */
	public function echo_plugin_settings_link() {
		?>
		<a href="<?php echo esc_url( admin_url( 'admin.php?page=' . $this->page_slug ) ); ?>">
			<?php echo esc_html( $this->admin_label ); ?> settings
		</a>
		<?php
	}

	/**
	 * Create Plugin Settings Page (React SPA).
	 */
	public function create_settings_page() {

		wp_enqueue_script( 'bigup_forms_spa_js' );
		wp_enqueue_style( 'bigup_forms_spa_css' );
		?>
		<div id="bigupFormsAdmin"></div>
		<?php
	}
}
