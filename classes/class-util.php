<?php
namespace BigupWeb\Forms;

/**
 * A library of helper functions for WordPress.
 *
 * @package lonewolf
 * @author Jefferson Real <me@jeffersonreal.uk>
 * @copyright Copyright 2023 Jefferson Real
 */


/**
 * Utility methods.
 */
class Util {


	/**
	 * Retrieve file contents the 'WordPress way'.
	 *
	 * @param string $path File system path.
	 */
	public static function get_contents( $path ) {
		include_once ABSPATH . 'wp-admin/includes/class-wp-filesystem-base.php';
		include_once ABSPATH . 'wp-admin/includes/class-wp-filesystem-direct.php';
		if ( ! class_exists( 'WP_Filesystem_Direct' ) ) {
			return false;
		}
		$wp_filesystem = new \WP_Filesystem_Direct( null );
		$string        = $wp_filesystem->get_contents( $path );
		return $string;
	}


	/**
	 * Test if we are in the Gutenberg editor.
	 *
	 * WP_Screen::is_block_editor() = WP built-in function since WordPress 5.0.
	 * is_gutenberg_page() = Guternberg plugin function.
	 */
	public static function is_gutenberg_editor() {
		if ( function_exists( 'is_gutenberg_page' ) && is_gutenberg_page() ) {
			return true;
		}

		$current_screen = get_current_screen();
		if ( method_exists( $current_screen, 'is_block_editor' ) && $current_screen->is_block_editor() ) {
			return true;
		}

		return false;
	}
}
