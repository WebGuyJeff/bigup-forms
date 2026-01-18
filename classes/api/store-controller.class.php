<?php
namespace BigupWeb\Forms;

/**
 * Bigup Forms - Store controller.
 *
 * Handle form saves and updates.
 *
 * @package bigup-forms
 * @author Jefferson Real <jeff@webguyjeff.com>
 * @copyright Copyright (c) 2026, Jefferson Real
 * @license GPL3+
 * @link https://webguyjeff.com
 */

// WordPress Dependencies.
use WP_REST_Request;
use get_option;

class Store_Controller {

	/**
	 * Receive form store API requests.
	 */
	public function bigup_forms_rest_api_store_callback( WP_REST_Request $request ) {

		// Check header is multipart/form-data.
		if ( ! str_contains( $request->get_header( 'Content-Type' ), 'multipart/form-data' ) ) {
			HTTP_Response::send_json( array( 405, 'Unexpected payload content-type' ) );
			exit; // Request handlers should exit() when done.
		}

		// Get REST data.
		$form_data  = $request->get_body_params();
		$post_id    = $form_data['id'];
		$post_title = $form_data['name'];
		$content    = $form_data['content'];
		$tags       = array_key_exists( 'tags', $form_data ) ? $form_data['tags'] : array();


		// ########## TEST START

		//error_log( '### TYPE 1' );
		//error_log( gettype( $content ) );
		//error_log( gettype( json_decode( $content ) ) );


		// Cast as array to convert object to array.
		$test  = (array) json_decode( $content );
		$test2 = $test['originalContent'];
		error_log( '##### START' );
		error_log( $test2 );
		error_log( '##### END' );

		//$post_content = $this->js_block_to_post_content( $test );


		//error_log( $content );
		//error_log( json_encode( $test ) );


		// ########## TEST END

		// Save the form.
		$result = CPT_Form::save(
			$post_id,
			$post_title,
			$test2,
			$tags
		);

		HTTP_Response::send_json( array( ( $result ) ? 200 : 500, $result ) );
		exit; // Request handlers should exit() when done.
	}


	/**
	 * Convert a Gutenberg JS block (from getSelectedBlock / getBlocks)
	 * into a parsed-block structure consumable by serialize_block().
	 *
	 * Important: we treat `originalContent` as the block's innerHTML and
	 * pack it into innerContent as a single string fragment.
	 */
	private function js_block_to_parsed_block( array $js_block ): array {

		error_log( '### TYPE 3: ' . gettype( $js_block ) );


		$inner_html      = isset( $js_block['originalContent'] ) ? $js_block['originalContent'] : '';
		$parsed_children = array();

		// If you really want to support nested blocks independently of originalContent,
		// you could recurse here; for a simple, robust approach we rely on originalContent
		// already containing the full rendered markup (including any inner blocks).
		if ( ! empty( $js_block['innerBlocks'] ) && is_array( $js_block['innerBlocks'] ) ) {
			foreach ( $js_block['innerBlocks'] as $child_js_block ) {
				$parsed_children[] = $this->js_block_to_parsed_block( (array) $child_js_block );
			}
		}


		return array(
			'blockName'   => isset( $js_block['name'] ) ? $js_block['name'] : null,
			'attrs'       => isset( $js_block['attributes'] ) && is_array( $js_block['attributes'] )
				? $js_block['attributes']
				: array(),
			'innerBlocks' => $parsed_children,
			// The "pure" inner HTML of this block (without comment delimiters).
			'innerHTML'   => $inner_html,
			// Minimal innerContent: one fragment with the full HTML. This is enough
			// for serialize_block() to wrap it in comment delimiters correctly.
			'innerContent'=> array( $inner_html ),
		);
	}


	/**
	 * Convert one JS block object (from getSelectedBlock()) into
	 * Gutenberg-ready post_content.
	 */
	private function js_block_to_post_content( array $js_block ): string {

		error_log( '### TYPE 2: ' . gettype( $js_block ) );


		$parsed_block = $this->js_block_to_parsed_block( $js_block );


		error_log( json_encode( $parsed_block ) );


		// serialize_block() returns the HTML + Gutenberg comment wrappers.
		return serialize_block( $parsed_block );
	}
}
