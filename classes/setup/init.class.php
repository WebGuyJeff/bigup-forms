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
		wp_register_style( 'bigup_forms_admin_css', BIGUPFORMS_URL . 'build/admin/css/bigup-forms-admin.css', array(), filemtime( BIGUPFORMS_PATH . 'build/admin/css/bigup-forms-admin.css' ), 'all' );
		wp_register_script( 'bigup_forms_admin_js', BIGUPFORMS_URL . 'build/admin/js/bigup-forms-admin.js', array(), filemtime( BIGUPFORMS_PATH . 'build/admin/js/bigup-forms-admin.js' ), false );
		wp_add_inline_script( 'bigup_forms_admin_js', Inline_Script::get_frontend_form_variables(), 'before' );
		if ( ! wp_script_is( 'bigup_icons', 'registered' ) ) {
			wp_register_style( 'bigup_icons', BIGUPFORMS_URL . 'dashicons/css/bigup-icons.css', array(), filemtime( BIGUPFORMS_PATH . 'dashicons/css/bigup-icons.css' ), 'all' );
		}
		if ( ! wp_script_is( 'bigup_icons', 'enqueued' ) ) {
			wp_enqueue_style( 'bigup_icons' );
		}

		if ( 'post.php' === $hook_suffix || 'edit.php' === $hook_suffix ) {
			wp_enqueue_style( 'bigup_forms_admin_css', null );
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
		// SMTP account settings test endpoint.
		register_rest_route(
			'bigup/forms/v1',
			'/test',
			array(
				'methods'             => 'POST',
				'callback'            => array( new Test_Controller(), 'bigup_forms_rest_api_test_callback' ),
				'permission_callback' => '__return_true',
			)
		);
	}
}
