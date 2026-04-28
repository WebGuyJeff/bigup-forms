<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Initialisation.
 *
 * Setup styles and helper functions for this plugin.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */
class Init {

	/**
	 * Store if this is admin screen check.
	 *
	 * @var bool $is_admin
	 */
	private bool $is_admin;

	/**
	 * Setup the class.
	 */
	public function __construct() {
		$this->is_admin = is_admin() ? true : false;
	}


	/**
	 * Setup the plugin.
	 */
	public function setup() {
		if ( $this->is_admin ) {
			new Admin_Settings();
		}
		add_action( 'init', array( new Blocks(), 'register_all' ), 10, 0 );
		add_action( 'init', array( new CPT_Form_Entry(), 'register' ), 10, 0 );
		add_action( 'init', array( new CPT_Form(), 'register' ), 10, 0 );
		add_action( 'rest_api_init', array( $this, 'register_rest_api_routes' ), 10, 0 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts_and_styles' ), 10, 1 );
		add_action( 'enqueue_block_assets', array( $this, 'editor_scripts_and_styles' ), 10, 0 );
	}


	/**
	 * Register admin scripts and styles.
	 */
	public function admin_scripts_and_styles( $hook_suffix ) {

		$cpt_css_location = 'build/admin/bigup-forms-custom-post.css';
		wp_register_style(
			'bigup_forms_custom_post_css',
			BIGUPFORMS_URL . $cpt_css_location,
			array(),
			file_exists( BIGUPFORMS_PATH . $cpt_css_location ) ? filemtime( BIGUPFORMS_PATH . $cpt_css_location ) : '0',
			'all'
		);
		if ( 'post.php' === $hook_suffix || 'edit.php' === $hook_suffix ) {
			wp_enqueue_style( 'bigup_forms_custom_post_css', null );
		}

		$spa_css_location = 'build/admin/bigup-forms-spa.css';
		wp_register_style(
			'bigup_forms_spa_css',
			BIGUPFORMS_URL . $spa_css_location,
			array(),
			file_exists( BIGUPFORMS_PATH . $spa_css_location ) ? filemtime( BIGUPFORMS_PATH . $spa_css_location ) : '0',
			'all'
		);
		wp_style_add_data( 'bigup_forms_spa_css', 'rtl', 'replace' );

		$admin_js_asset = BIGUPFORMS_PATH . 'build/admin/bigup-forms-spa.asset.php';
		$admin_js       = file_exists( $admin_js_asset ) ? require $admin_js_asset : array( 'dependencies' => array(), 'version' => '' );
		$admin_js_deps  = isset( $admin_js['dependencies'] ) && is_array( $admin_js['dependencies'] ) ? $admin_js['dependencies'] : array();
		$admin_js_ver   = isset( $admin_js['version'] ) ? $admin_js['version'] : filemtime( BIGUPFORMS_PATH . 'build/admin/bigup-forms-spa.js' );

		wp_register_script(
			'bigup_forms_spa_js',
			BIGUPFORMS_URL . 'build/admin/bigup-forms-spa.js',
			$admin_js_deps,
			$admin_js_ver,
			false
		);
		if ( str_contains( $hook_suffix, 'bigup-web-forms' ) ) {
			wp_add_inline_script(
				'bigup_forms_spa_js',
				Inline_Script::get_frontend_form_variables() . "\n" . Inline_Script::get_admin_spa_variables(),
				'before'
			);
		}

		if ( ! wp_style_is( 'bigup_dashicons_css', 'registered' ) ) {
			$dashicons_css_location = 'dashicons/css/bigup-icons.css';
			wp_register_style(
				'bigup_dashicons_css',
				BIGUPFORMS_URL . $dashicons_css_location,
				array(),
				file_exists( BIGUPFORMS_PATH . $dashicons_css_location ) ? filemtime( BIGUPFORMS_PATH . $dashicons_css_location ) : '0',
				'all'
			);
		}
		if ( ! wp_style_is( 'bigup_dashicons_css', 'enqueued' ) ) {
			wp_enqueue_style( 'bigup_dashicons_css' );
		}
	}

	/**
	 * Register editor scripts and styles.
	 */
	public function editor_scripts_and_styles() {
		wp_add_inline_script(
			'bigup-forms-form', // name from block.json with a '-' instead of '/'.
			Inline_Script::get_frontend_form_variables(),
			'before'
		);
	}

	/**
	 * Register rest api routes.
	 *
	 * @link https://developer.wordpress.org/reference/functions/register_rest_route/
	 */
	public function register_rest_api_routes() {
		$admin_controller = new Action_Controller();

		register_rest_route(
			'bigup/forms-admin/v1',
			'/bootstrap',
			array(
				'methods'             => 'GET',
				'callback'            => array( $admin_controller, 'bootstrap' ),
				'permission_callback' => array( $admin_controller, 'can_manage_options' ),
			)
		);

		register_rest_route(
			'bigup/forms-admin/v1',
			'/settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( $admin_controller, 'update_setting' ),
				'permission_callback' => array( $admin_controller, 'can_manage_options' ),
			)
		);

		register_rest_route(
			'bigup/forms-admin/v1',
			'/email/test',
			array(
				'methods'             => 'POST',
				'callback'            => array( $admin_controller, 'test' ),
				'permission_callback' => array( $admin_controller, 'can_manage_options' ),
			)
		);

		register_rest_route(
			'bigup/forms-admin/v1',
			'/email/oauth-disconnect',
			array(
				'methods'             => 'POST',
				'callback'            => array( $admin_controller, 'oauth_disconnect' ),
				'permission_callback' => array( $admin_controller, 'can_manage_options' ),
			)
		);

		// Form submission endpoint.
		register_rest_route(
			'bigup/forms/v1',
			'/submit',
			array(
				'methods'             => 'POST',
				'callback'            => array( new Submit_Controller(), 'bigup_forms_rest_api_submit_callback' ),
				'permission_callback' => '__return_true',
			)
		);
		// Form editor save/update endpoint.
		register_rest_route(
			'bigup/forms/v1',
			'/store',
			array(
				'methods'             => 'POST',
				'callback'            => array( new Store_Controller(), 'bigup_forms_rest_api_store_callback' ),
				'permission_callback' => '__return_true',
			)
		);
	}
}
