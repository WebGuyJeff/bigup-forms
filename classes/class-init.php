<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Initialisation.
 *
 * Setup styles and helper functions for this plugin.
 *
 * @package bigup-forms
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright (c) 2024, Jefferson Real
 * @license GPL2+
 * @link https://jeffersonreal.uk
 */
class Init {

	// Store view (admin || notAdmin).
	private string $view;

	/**
	 * Setup the class.
	 */
	public function __construct() {
		$this->view = ( is_admin() ) ? 'admin' : 'notAdmin';
	}


	/**
	 * Setup the plugin.
	 */
	public function setup() {
		if ( $this->view === 'admin' ) {
			new Admin_Settings();
		}
		add_action( 'init', array( new Blocks(), 'register_all' ), 10, 0 );
		add_action( 'init', array( new Store_Submissions(), 'create_cpt' ), 10, 0 );
		add_action( 'init', array( new Store_Forms(), 'create_cpt' ), 10, 0 );
		add_action( 'rest_api_init', array( $this, 'register_rest_api_routes' ), 10, 0 );
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_scripts_and_styles' ), 10, 0 );
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts_and_styles' ), 10, 0 );
		add_shortcode( 'bigup_forms', array( new Shortcode(), 'display_shortcode' ), 10, 0 );
		add_action(
			'widgets_init',
			function () {
				return register_widget( new Widget() );
			},
			10,
			0
		);
	}


	/**
	 * Initialise scripts, styles and localize vars to pass to front end.
	 *
	 * wp_add_inline_script() passes variables to front end script by dumping global
	 * js vars inline with the front end html.
	 *
	 * WARNING - extensionless php may break form submission
	 * if api endpoint url is not adjusted to match.
	 */
	public function frontend_scripts_and_styles() {
		wp_register_style( 'bigup_forms_public_css', BIGUPFORMS_URL . 'build/css/bigup-forms-public.css', array(), filemtime( BIGUPFORMS_PATH . 'build/css/bigup-forms-public.css' ), 'all' );
		wp_register_script( 'bigup_forms_public_js', BIGUPFORMS_URL . 'build/js/bigup-forms-public.js', array(), filemtime( BIGUPFORMS_PATH . 'build/js/bigup-forms-public.js' ), false );
		wp_add_inline_script(
			'bigup_forms_public_js',
			Inline_Script::get_frontend_form_variables(),
			'before'
		);
	}


	/**
	 * Register admin scripts and styles.
	 */
	public function admin_scripts_and_styles() {
		wp_register_style( 'bigup_forms_admin_css', BIGUPFORMS_URL . 'build/css/bigup-forms-admin.css', array(), filemtime( BIGUPFORMS_PATH . 'build/css/bigup-forms-admin.css' ), 'all' );
		wp_register_script( 'bigup_forms_admin_js', BIGUPFORMS_URL . 'build/js/bigup-forms-admin.js', array(), filemtime( BIGUPFORMS_PATH . 'build/js/bigup-forms-admin.js' ), false );
		wp_add_inline_script(
			'bigup_forms_admin_js',
			Inline_Script::get_frontend_form_variables(),
			'before'
		);
		if ( ! wp_script_is( 'bigup_icons', 'registered' ) ) {
			wp_register_style( 'bigup_icons', BIGUPFORMS_URL . 'dashicons/css/bigup-icons.css', array(), filemtime( BIGUPFORMS_PATH . 'dashicons/css/bigup-icons.css' ), 'all' );
		}
		if ( ! wp_script_is( 'bigup_icons', 'enqueued' ) ) {
			wp_enqueue_style( 'bigup_icons' );
		}
	}

	/**
	 * Register rest api routes.
	 *
	 * @link https://developer.wordpress.org/reference/functions/register_rest_route/
	 */
	public function register_rest_api_routes() {
		register_rest_route(
			'bigup/contact-form/v1',
			'/submit',
			array(
				'methods'             => 'POST',
				'callback'            => array( new Form_Controller(), 'bigup_forms_rest_api_callback' ),
				'permission_callback' => '__return_true',
			)
		);
	}
}
