<?php
namespace Bigup\Forms;

/**
 * Register Gutenberg blocks.
 *
 * @package bigup-forms
 */
class Blocks {

	// Blocks root relative path.
	const BIGUPFORMS_BLOCKS_PATH = BIGUPFORMS_PATH . 'build/blocks/';

	// Block directory names.
	private array $names = array();


	/**
	 * Setup the class.
	 */
	public function __construct() {
		$dir_children = is_dir( self::BIGUPFORMS_BLOCKS_PATH ) ? scandir( self::BIGUPFORMS_BLOCKS_PATH ) : array();
		$this->names  = array_filter( preg_replace( '/\..*/', '', $dir_children ) );
	}


	/**
	 * Register all blocks.
	 */
	public function register_all() {
		if ( count( $this->names ) === 0 ) {
			error_log( 'Bigup Forms ERROR: No child directories detected in block directory. Please check blocks exist in {self::BIGUPFORMS_BLOCKS_PATH}' );
			return;
		}
		foreach ( $this->names as $name ) {
			$result = register_block_type_from_metadata(
				self::BIGUPFORMS_BLOCKS_PATH . $name,
				array( 'render_callback' => 'render_block_serverside' )
			);

			if ( false === $result ) {
				error_log( "Bigup Forms ERROR: Block registration failed for '{$name}'" );

			} elseif ( 'form' === $name ) {
				// Enqueue script after register_block...() so script handle is valid.
				add_action( 'wp_enqueue_scripts', array( &$this, 'form_block_add_inline_script_frontend' ) );
				add_action( 'enqueue_block_editor_assets', array( &$this, 'form_block_add_inline_script_editor' ) );
			}
		}
	}


	/**
	 * Add inline script to frontend js for the form block.
	 */
	public function form_block_add_inline_script_frontend() {
		wp_add_inline_script(
			'bigup-forms-form-view-script', // Name from block.json with a '-' instead of '/'.
			Inline_Script::get_frontend_form_variables(),
			'before'
		);
	}


	/**
	 * dd inline script to block editor js for the form block.
	 */
	public function form_block_add_inline_script_editor() {
		wp_add_inline_script(
			'bigup-forms-form-script', // Name from block.json with a '-' instead of '/'.
			Inline_Script::get_frontend_form_variables(),
			'before'
		);
	}


	/**
	 * Renders a block on the server.
	 *
	 * @param string $content The saved content.
	 *
	 * @return string The content of the block being rendered.
	 */
	public function render_block_serverside( $attributes, $content ) {
		return $content;
	}
}
